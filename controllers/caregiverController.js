const Caregiver = require('../models/caregiver');
const Farm = require('../models/farm');

async function createCaregiver(req, res) {
    const { name, phone, email } = req.body;
    // const farmId = req.params.farmId; // Assuming the farmId is passed in the request params
  
    if (!name || !phone || !email) {
      return res.status(400).json({ message: 'Please fill in all fields' });
    }
  
    // Check if req.file is present (image file uploaded)
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload an image file' });
    }
  
    // Access the file path in req.file
    // const photo = req.file.path;
  
    const newCaregiver = new Caregiver({
      name,
      phone,
      email,
      photo,
    });
  
    try {
      const savedCaregiver = await newCaregiver.save();
  
      // Update the farm document to include the caregiver's ObjectId
      const farm = await Farm.findById(req.params.farmId);
      if(!farm) {
        return res.status(404).json({ message: 'Farm not found' });
      }
      farm.caregivers.push({
        care:savedCaregiver
    });
    await farm.save();
  
      res.status(201).json({
        success: true,
        message: 'Caregiver created successfully',
        savedCaregiver
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


async function deleteCaregiver(req, res) {
  try {
    // Find the caregiver by ID
    const id = req.params.id;
    const caregiver = await Caregiver.findById(req.params.id);
    if (!caregiver) {
      return res.status(404).json({ message: 'Caregiver not found' });
    }

    console.log('Caregiver ID:', req.params.id);
    
    // Find the farm containing the caregiver
    const farm = await Farm.findOne({ 'caregivers.care': id });
    console.log('Farm:', farm);

    if (!farm) {
      return res.status(404).json({ message: 'Associated farm not found' });
    }

    // Remove the caregiver from the farm's list of caregivers
    farm.caregivers = farm.caregivers.filter(c => c.care._id.toString() !== req.params.id);
    await farm.save();

    // Delete the caregiver from the caregiver collection
    await Caregiver.findByIdAndDelete(req.params.id);

    res.json({ message: 'Caregiver deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = deleteCaregiver;

module.exports = { getAllCaregivers, createCaregiver, deleteCaregiver };
