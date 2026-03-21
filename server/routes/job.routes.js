const express = require('express');
const router = express.Router();
const { protect, allow } = require('../middleware/auth.middleware');
const { createJob, getJobs, getJob } = require('../controllers/job.controller');

router.post('/', protect, allow('interviewer', 'admin'), createJob);
router.get('/', protect, getJobs);
router.get('/:id', protect, getJob);

module.exports = router;
