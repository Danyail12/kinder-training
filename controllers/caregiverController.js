const Caregiver = require('../models/caregiver');
const Farm = require('../models/farm');

async function createCaregiver(req, res) {
    const { name, phone, email } = req.body;
    // const farmId = req.params.farmId; // Assuming the farmId is passed in the request params
  
    // if (!name || !phone || !email) {
    //   return res.status(400).json({ message: 'Please fill in all fields' });
    // }
  
    // // Check if req.file is present (image file uploaded)
    // if (!req.file) {
    //   return res.status(400).json({ message: 'Please upload an image file' });
    // }
  
    // Access the file path in req.file
    // const photo = req.file.path;
  
    const newCaregiver = new Caregiver({
      name,
      phone,
      email,
      // photo,
    });
  
    try {
      const savedCaregiver = await newCaregiver.save();
  
      // Update the farm document to include the caregiver's ObjectId
      const farm = await Farm.findById(req.params.farmId);
      if(!farm) {
        return res.status(404).json({ message: 'Farm not found' });
      }
      farm.caregivers.push({
        savedCaregiver
    });
    await farm.save();
  
      res.status(201).json({
        success: true,
        message: 'Caregiver created successfully',
        savedCaregiver: savedCaregiver
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
  
async function getAllCaregivers(req, res) {
  try {
    // const caregivers = await Caregiver.find();
    const farm = await Farm.findById(req.params.farmId);
    if (!farm) {
      return res.status(404).json({ message: 'Farm not found' });
    }
res.status(200).json({
  success: true,
  message: 'Caregivers retrieved successfully',
  caregivers: farm.caregrivers
});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
// const mongoose = require('mongoose');

// const mongoose = require('mongoose');

const deleteCaregiver = async (req, res) => {
  try {
    // Get the farm ID and caregiver ID from the request parameters
    const { farmId, caregiverId } = req.params;
    console.log(farmId, caregiverId);

    // Find the farm by ID
    const farm = await Farm.findById(farmId);

    if (!farm) {
      return res.status(404).json({ message: 'Farm not found' });
    }
    console.log(farm);

    // Check if the caregiver exists in the farm's list of caregivers
    const caregiverIndex = farm.caregivers.findIndex(caregiverObj => {
      return caregiverObj.savedCaregiver && caregiverObj.savedCaregiver._id.toString() === caregiverId;
    });
    console.log(caregiverIndex);
    
    if (caregiverIndex === -1) {
      return res.status(404).json({ message: 'Caregiver not found in the farm' });
    }

    // Remove the caregiver from the farm's list of caregivers
    farm.caregivers.splice(caregiverIndex, 1);
    await farm.save();

    // Delete the caregiver from the caregivers model
    const deletedCaregiver = await Caregiver.findByIdAndDelete(caregiverId);

    if (!deletedCaregiver) {
      return res.status(404).json({ message: 'Caregiver not found' });
    }

    res.json({ message: 'Caregiver deleted successfully from the farm and caregiver table' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const specificCaregiversTrainingRecord = async (req, res) => {
  const id = req.params.id;
  const caregiver = await Caregiver.findById(id);
  if (!caregiver) {
    return res.status(404).json({ message: 'Caregiver not found' });
  }

  res.status(200).json({
    success: true,
    message: 'Caregiver retrieved successfully',
    trainingRecord: caregiver.trainingRecords
  })
  
}

// module.exports = deleteCaregiver;

module.exports = { getAllCaregivers, createCaregiver, deleteCaregiver,specificCaregiversTrainingRecord };
