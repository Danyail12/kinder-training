
const mongoose = require('mongoose');

const trainerSchema = new mongoose.Schema({
    name: String,
    // Add other trainer details as needed
    trainingRecords: [{
      type:Object
    }]
  });

  const Trainer = mongoose.model('Trainer', trainerSchema);
  module.exports = Trainer;