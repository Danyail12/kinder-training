const TrainingRecord = require('../models/trainingRecord');
const Farm = require('../models/farm');
const Trainer = require('../models/trainer');
const Caregiver = require('../models/caregiver');

async function getAllTrainingRecords(req, res) {
  try {
    const farm = await Farm.findById(req.params.farmId);
    if(!farm) {
      return res.status(404).json({ message: 'Farm not found' });
    }
    res.status(200).json({
      success: true,
      message: 'Training records retrieved successfully',
      trainingRecords: farm.trainingRecords
    })
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function createTrainingRecord(req, res) {

  const trainer = await Trainer.findById(req.body.trainerId);
  console.log(trainer)
  const caregiverId= req.body.caregiverId
  console.log(caregiverId)
  const caregiver = await Caregiver.findById(caregiverId);
  console.log(caregiver)
    const { farmName, trainers, caregivers, primaryTopic, secondaryTopic, deliveryMethod, trainerSignature, caregiverSignature } = req.body;
    const farm = await Farm.findById(req.params.farmId);
    console.log(farm)


  if(!farm) {
    return res.status(404).json({ message: 'Farm not found' });
  }
    const newTrainingRecord = new TrainingRecord({
      farmName,
      trainers, 
      caregivers,
      primaryTopic,
      secondaryTopic,
      deliveryMethod,
      trainerSignature,
      caregiverSignature
    });
    console.log(newTrainingRecord)
  
    try {
      const savedTrainingRecord = await newTrainingRecord.save();
      farm.trainingRecords.push({
        // savedTrainingRecord: savedTrainingRecord._id,
        savedTrainingRecord
      })
      await farm.save();

      trainer.trainingRecords.push({
      savedTrainingRecord
      })
      await trainer.save();

      caregiver.trainingRecords.push({
        savedTrainingRecord
      })
      await caregiver.save();
      res.status(201).json({
        success: true,
        message: 'Training record created successfully',
        trainingRecord: savedTrainingRecord
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

const specificTrainingRecord = async (req, res) => {
  try {
    const trainingRecord = await TrainingRecord.findById(req.params.id);
    if (!trainingRecord) {
      return res.status(404).json({ message: 'Training record not found' });
    }
    res.status(200).json({
      success: true,
      message: 'Training record retrieved successfully',
      trainingRecord: trainingRecord
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function deleteTrainingRecord(req, res) {
  try {
    await TrainingRecord.findByIdAndDelete(req.params.id);
    res.json({ message: 'Training record deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = { getAllTrainingRecords, createTrainingRecord, deleteTrainingRecord,specificTrainingRecord };
