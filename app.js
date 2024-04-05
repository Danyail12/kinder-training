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
// const bcrypt = require('bcrypt');
// const config = require('./config/config.env');
const dotenv = require('dotenv');
const { getEmailsOfCaregiversWithoutTraining } = require('./helper/getEmailsOfCaregiversWithoutTraining'); // Implement this function to query caregivers without training


dotenv.config({
    path: './config/config.env'
});

// Create a nodemailer transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'your_email@gmail.com',
        pass: 'your_password'
    }
});

// Define the cron job to run monthly
cron.schedule('0 0 1 * *', async () => {
    try {
        // Get emails of caregivers without training in over 6 months
        const caregiverEmails = await getEmailsOfCaregiversWithoutTraining();

        // Send email reminders to caregivers
        await Promise.all(caregiverEmails.map(async (email) => {
            await transporter.sendMail({
                from: 'your_email@gmail.com',
                to: email,
                subject: 'Monthly Training Reminder',
                text: 'This is a reminder that you have not had any recorded training in over 6 months. Please contact your supervisor for further instructions.'
            });
        }));

        console.log('Monthly training reminders sent successfully');
    } catch (error) {
        console.error('Error sending monthly training reminders:', error);
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
// Database connection
// mongoose.connect(process.env.MONGODB_URI,{
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// })
//   .then(() => {
//     console.log('Connected to MongoDB');
    // Start the server
    app.listen(process.env.PORT, () => console.log('Server running on port 3000'));
//   })
//   .catch(err => console.error('Failed to connect to MongoDB', err));
