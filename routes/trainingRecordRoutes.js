const express = require('express');
const { getAllTrainingRecords, createTrainingRecord, deleteTrainingRecord,specificTrainingRecord } = require('../controllers/trainingRecordController');
const auth = require('../middlewares/auth');
const router = express.Router();

router.get('/:farmId',auth, getAllTrainingRecords);
router.post('/:farmId',auth, createTrainingRecord);
router.delete('/:id',auth, deleteTrainingRecord);
router.get('/specificTrainingRecord/:id',auth, specificTrainingRecord);

module.exports = router;
 