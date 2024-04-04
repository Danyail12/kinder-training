
const mongoose = require('mongoose');


const trainingRecordSchema = new mongoose.Schema({
  farmName: {
    type: String
  },
  trainers: {
    type: String
  },
  caregivers: {
    type: String
  },
  primaryTopic: {
    type: String,
    required: true
  },
  secondaryTopic: {
    type: String
  },
  deliveryMethod: {
    type: String,
    enum: ['Hands-on', 'Classroom'],
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  trainerSignature: {
    type: String,
    required: true
  },
  caregiverSignature: {
    type: String,
    required: true
  }
});

const TrainingRecord = mongoose.model('TrainingRecord', trainingRecordSchema);
  module.exports = TrainingRecord