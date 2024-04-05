const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const { createTrainer, getAllTrainers, deleteTrainer ,specificTrainer} = require('../controllers/trainerController');

// POST request to create a new trainer
// Endpoint: /api/trainers
router.post('/createTrainer/:farmId',auth ,createTrainer);

// GET request to fetch all trainers for a specific farm
// Endpoint: /api/trainers/:farmId
router.get('/:farmId',auth, getAllTrainers);

// DELETE request to delete a trainer
// Endpoint: /api/trainers/:id
router.delete('/:id',auth, deleteTrainer);
router.get('/specificTrainer/:id',auth, specificTrainer);
module.exports = router;
