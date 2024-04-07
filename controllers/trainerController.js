const Trainer = require('../models/trainer');
const Farm = require('../models/farm');

const getAllTrainers = async (req, res) => {
  try {
    // Get the farm ID from the request parameters or body
    // const { farmId } = req.params;

    // Fetch the farm from the database
    // const farm = await Farm.findById(farmId).populate('trainers');
    const farm = await Farm.findById(req.params.farmId);

    if (!farm) {
      return res.status(404).json({ message: 'Farm not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Trainers retrieved successfully',
      trainers: farm.trainers
    })
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAllTrainers };

// Controller to create a new trainer
const createTrainer = async (req, res) => {
  const { name } = req.body;
  const farm = await Farm.findById(req.params.farmId);
  if(!farm) {
    return res.status(404).json({ message: 'Farm not found' });
  }
  const newTrainer = new Trainer({ name });
  try {
      const savedTrainer = await newTrainer.save();
      farm.trainers.push({
        newTrainer
      });
      await farm.save();
    res.status(201).json({
      success: true,
      message: 'Trainer created successfully',
      trainer: savedTrainer
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const specificTrainer = async (req, res) => {
  try {
    const trainer = await Trainer.findById(req.params.id);
    if (!trainer) {
      return res.status(404).json({ message: 'Trainer not found' });
    }
    res.status(200).json({
      success: true,
      message: 'Trainer retrieved successfully',
      trainer: trainer
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Controller to delete a trainer
const deleteTrainer = async (req, res) => {
  try {
      // Get the farm ID and trainer ID from the request parameters
      const { farmId, trainerId } = req.params;

      // Find the farm by ID
      const farm = await Farm.findById(farmId);
      console.log(farm);

      if (!farm) {
          return res.status(404).json({ message: 'Farm not found' });
      }

      // Check if the trainer exists in the farm's list of trainers
      const trainerIndex = farm.trainers.findIndex(trainerObj => trainerObj.newTrainer._id.toString() === trainerId);
      console.log(trainerIndex);

      if (trainerIndex === -1) {
          return res.status(404).json({ message: 'Trainer not found in the farm' });
      }

      // Remove the trainer from the farm's list of trainers
      farm.trainers.splice(trainerIndex, 1);
      await farm.save();

      // Delete the trainer from the trainers model
      const trainer = await Trainer.findByIdAndDelete(trainerId);
      if (!trainer) {
          return res.status(404).json({ message: 'Trainer not found' });
      }

      res.json({ message: 'Trainer deleted successfully from the farm' });
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
};

  module.exports = { deleteTrainer };

module.exports = { getAllTrainers, createTrainer, deleteTrainer,specificTrainer };
