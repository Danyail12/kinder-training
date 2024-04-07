const mongoose = require('mongoose');

const caregiverSchema = new mongoose.Schema({
  name: {
    type: String,
    // required: true
  },
  phone: {
    type: String,
    // required: true
  },
  email: {
    type: String,
    // required: true
  },
  photo: {
    type: String,
    // required: true
  },
  trainingRecords: [{
    type:Object
  }]
});

const Caregiver = mongoose.model('Caregiver', caregiverSchema);

module.exports = Caregiver;
