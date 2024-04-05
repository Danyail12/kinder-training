const express = require('express');
const { getAllTrainingRecords, createTrainingRecord, deleteTrainingRecord,specificTrainingRecord } = require('../controllers/trainingRecordController');
// const auth = require('../middlewares/auth');
const isAuthenticated = require('../middlewares/auth');
const router = express.Router();

router.get('/:farmId',isAuthenticated, getAllTrainingRecords);
router.post('/:farmId',isAuthenticated, createTrainingRecord);
router.delete('/:id',isAuthenticated, deleteTrainingRecord);
router.get('/specificTrainingRecord/:id',isAuthenticated, specificTrainingRecord);

module.exports = router;
 