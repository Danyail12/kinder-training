const express = require('express');
const { getAllCaregivers, createCaregiver, deleteCaregiver,specificCaregiversTrainingRecord } = require('../controllers/caregiverController');
// const auth = require('../middlewares/auth');
const isAuthenticated = require('../middlewares/auth');
// const multer = require('multer');
const router = express.Router();
// const fs = require('fs');
// const path = require('path');

// // Create the uploads directory if it doesn't exist
// const uploadsDir = path.join(__dirname, '../uploads');
// if (!fs.existsSync(uploadsDir)) {
//   fs.mkdirSync(uploadsDir);
// }

// // Create the caregiver directory inside uploads if it doesn't exist
// const caregiverDir = path.join(uploadsDir, 'caregiver');
// if (!fs.existsSync(caregiverDir)) {
//   fs.mkdirSync(caregiverDir);
// }

// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//       cb(null, caregiverDir); // Specify the destination directory
//     },
//     filename: function (req, file, cb) {
//       cb(null, Date.now() + '-' + file.originalname); // Define the file name
//     }
// });

// // Define the file filter to accept only images
// const fileFilter = (req, file, cb) => {
//   if (file.mimetype.startsWith('image/')) {
//     cb(null, true);
//   } else {
//     cb(new Error('Only image files are allowed!'), false);
//   }
// };

// Configure Multer
// const upload = multer({ storage: storage, fileFilter: fileFilter });  
router.get('/:farmId', isAuthenticated, getAllCaregivers);
router.post('/createCaregiver/:farmId',isAuthenticated, createCaregiver);
router.delete('/farms/:farmId/caregivers/:caregiverId',isAuthenticated, deleteCaregiver);
router.get('/specificCaregiverTrainingRecord/:id',isAuthenticated, specificCaregiversTrainingRecord);

module.exports = router;
