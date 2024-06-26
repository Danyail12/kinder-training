
const mongoose = require('mongoose');



const farmSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
 Address: {
   type: String,
 },
 city: {
   type: String,
 },
 country:{
   type: String,
 },
 caregivers: [{

     type: Object
 }],
 trainers: [{
   type: Object
 }],


 trainingRecords: [{
    type: Object
  }]
});

const Farm = mongoose.model('Farm', farmSchema);
module.exports = Farm