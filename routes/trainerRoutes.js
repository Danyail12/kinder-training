const express = require('express');
const router = express.Router();
// const auth = require('../middlewares/auth');
const isAuthenticated = require('../middlewares/auth');
const { createTrainer, getAllTrainers, deleteTrainer ,specificTrainer} = require('../controllers/trainerController');

// POST request to create a new trainer
// Endpoint: /api/trainers
router.post('/createTrainer/:farmId',isAuthenticated ,createTrainer);

// GET request to fetch all trainers for a specific farm
// Endpoint: /api/trainers/:farmId
router.get('/:farmId',isAuthenticated, getAllTrainers);

// DELETE request to delete a trainer
// Endpoint: /api/trainers/:id
router.delete('/:id',isAuthenticated, deleteTrainer);
router.get('/specificTrainer/:id',isAuthenticated, specificTrainer);
module.exports = router;
