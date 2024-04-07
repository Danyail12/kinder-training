const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');
const trainerRoutes = require('./routes/trainerRoutes');
const caregiverRoutes = require('./routes/caregiverRoutes');
const trainingRecordRoutes = require('./routes/trainingRecordRoutes');
const cron = require('node-cron');
const nodemailer = require('nodemailer');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const TrainingRecord = require('./models/trainingRecord');
const Farm = require('./models/farm');
const Caregiver = require('./models/caregiver');
// const bcrypt = require('bcrypt');
// const config = require('./config/config.env');
const dotenv = require('dotenv');
const { getEmailsOfCaregiversWithoutTraining } = require('./helper/getEmailsOfCaregiversWithoutTraining'); // Implement this function to query caregivers without training


dotenv.config({
    path: './config/config.env'
});

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

cron.schedule('0 0 1 * *', async () => {
    try {
      // Get date 12 months ago
      const twelveMonthsAgo = new Date();
      twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
  
      // Query training records for the previous 12 months
      const trainingRecords = await TrainingRecord.find({ date: { $gte: twelveMonthsAgo } }).populate('farmName');
  
      // Group training records by farm
      const trainingRecordsByFarm = {};
      trainingRecords.forEach(record => {
        if (!trainingRecordsByFarm[record.farmName.name]) {
          trainingRecordsByFarm[record.farmName.name] = [];
        }
        trainingRecordsByFarm[record.farmName.name].push(record);
      });
  
      // Send email to each farm with their training records
      for (const farmName in trainingRecordsByFarm) {
        const records = trainingRecordsByFarm[farmName];
        const emailContent = `Monthly Training Report for Farm ${farmName}:\n\n${JSON.stringify(records)}`;
        await transporter.sendMail({
          to: records[0].farmName.email,
          subject: 'Monthly Training Report',
          text: emailContent
        });
      }
  
      console.log('Monthly training report emails sent successfully.');
    } catch (error) {
      console.error('Error sending monthly training report emails:', error);
    }
  });
  
  // Reminder job to notify farms and caregivers if a caregiver hasn't had any recorded training in >6 months
  cron.schedule('0 0 * * *', async () => {
    try {
      // Get date 6 months ago
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  
      // Query caregivers who haven't had any recorded training in the last 6 months
      const inactiveCaregivers = await TrainingRecord.distinct('caregivers', { date: { $lt: sixMonthsAgo } });
  
      // Notify farms and caregivers
      inactiveCaregivers.forEach(async (caregiverId) => {
        // Find farm and caregiver based on caregiverId
        const farm = await Farm.findOne({ 'caregivers.savedCaregiver': caregiverId });
        const caregiver = await TrainingRecord.findOne({ caregivers: caregiverId });
  
        // Send email or text reminder to farm
        await transporter.sendMail({
          to: farm.email,
          subject: 'Reminder: Inactive Caregiver',
          text: `Reminder: Caregiver with ID ${caregiverId} from Farm ${farm.name} has not had any recorded training in over 6 months.`
        });
  
        // Send email or text reminder to caregiver
        await transporter.sendMail({
          to: caregiver.caregiverSignature, // Assuming caregiverSignature contains caregiver's email
          subject: 'Reminder: Inactive Training',
          text: 'Reminder: You have not had any recorded training in over 6 months.'
        });
      });
  
      console.log('Inactive caregivers reminder sent successfully.');
    } catch (error) {
      console.error('Error sending inactive caregivers reminder:', error);
    }
  });
  const corsOptions = {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH','HEAD'],
    credentials: true,
}

const app = express();
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors(corsOptions))

// Middleware
app.use(bodyParser.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/trainers', trainerRoutes);
app.use('/api/caregivers', caregiverRoutes);
app.use('/api/training-records', trainingRecordRoutes);
app.get('/', (req, res) => {
    res.send('server is up!');
})

 const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB connected: ${conn.connection.host}`)
    } catch (error) {
        console.log(error)
        process.exit(1)
    }
}
connectDB();

//     // Manually export training records based on time frame or specific caregivers
//   app.get('/exportTrainingRecords', async (req, res) => {
//     try {
//       // Parse parameters
//       const { start_date, end_date, caregivers } = req.query;
  
//       // Build query filter
//       const filter = {};
//       if (start_date && end_date) {
//         filter.date = { $gte: new Date(start_date), $lte: new Date(end_date) };
//       }
//       if (caregivers) {
//         filter.caregivers = { $in: Array.isArray(caregivers) ? caregivers : [caregivers] };
//       }
  
//       // Query training records based on filter
//       const trainingRecords = await TrainingRecord.find(filter).populate('farmName');
  
//       res.status(200).json({
//         success: true,
//         message: 'Training records exported successfully',
//         trainingRecords: trainingRecords
//     });
//     } catch (error) {
//       console.error('Error exporting training records:', error);
//       res.status(500).json({ message: 'Internal server error' });
//     }
//   });
app.get('/exportTrainingRecords', async (req, res) => {
    try {
        // Parse parameters
        const { timeFrame, caregiverId } = req.query;

        console.log('Time Frame:', timeFrame);
        console.log('Caregiver ID:', caregiverId);

        // Define time frames
        const timeFrames = {
            '1month': { $gte: new Date(new Date().setMonth(new Date().getMonth() - 1)), $lte: new Date() },
            '6month': { $gte: new Date(new Date().setMonth(new Date().getMonth() - 6)), $lte: new Date() },
            '12month': { $gte: new Date(new Date().setMonth(new Date().getMonth() - 12)), $lte: new Date() },
            '24month': { $gte: new Date(new Date().setMonth(new Date().getMonth() - 24)), $lte: new Date() }
        };

        let filter = {};

        // Find caregiver by ID
        const caregiver = await Caregiver.findById(caregiverId);

        if (!caregiver) {
            return res.status(404).json({ success: false, message: 'Caregiver not found' });
        }

        // Check if a valid time frame is provided
        if (!timeFrames.hasOwnProperty(timeFrame)) {
            return res.status(400).json({ success: false, message: 'Invalid time frame provided' });
        }

        console.log('Time Frame Object:', timeFrames[timeFrame]);

        const trainingRecords = caregiver.trainingRecords.filter(record => {
            const recordDate = new Date(record.savedTrainingRecord.date);
        
            // Extract the start and end dates of the time frame object
            const startDate = new Date(timeFrames[timeFrame].$gte);
            const endDate = new Date(timeFrames[timeFrame].$lte);
        
            // Check if the record date falls within the time frame
            return recordDate.getTime() >= startDate.getTime() && recordDate.getTime() <= endDate.getTime();
        });
        // Send response with training records
        res.status(200).json({
            success: true,
            message: 'Training records exported successfully',
            trainingRecords: trainingRecords
        });
    } catch (error) {
        console.error('Error exporting training records:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

    
    app.listen(process.env.PORT, () => console.log('Server running on port 3000'));

