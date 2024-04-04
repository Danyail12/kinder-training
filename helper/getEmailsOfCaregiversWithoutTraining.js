const Caregiver = require('./../models/caregiver');
const TrainingRecord = require('./../models/trainingRecord');

async function getEmailsOfCaregiversWithoutTraining() {
    try {
        // Get the date 6 months ago
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        // Find caregivers who have not had any recorded training in over 6 months
        const caregiversWithoutTraining = await Caregiver.aggregate([
            {
                $lookup: {
                    from: 'trainingrecords',
                    localField: '_id',
                    foreignField: 'caregivers',
                    as: 'trainingRecords'
                }
            },
            {
                $match: {
                    'trainingRecords.date': { $lt: sixMonthsAgo }
                }
            },
            {
                $project: {
                    email: 1
                }
            }
        ]);

        // Extract emails from the result
        const emails = caregiversWithoutTraining.map(caregiver => caregiver.email);
        return emails;
    } catch (error) {
        throw new Error('Error fetching caregivers without training:', error);
    }
}

module.exports = { getEmailsOfCaregiversWithoutTraining };
