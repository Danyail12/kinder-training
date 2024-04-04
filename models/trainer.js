
const mongoose = require('mongoose');

const trainerSchema = new mongoose.Schema({
    name: String,
    // Add other trainer details as needed
  });

  const Trainer = mongoose.model('Trainer', trainerSchema);
  module.exports = Trainer;