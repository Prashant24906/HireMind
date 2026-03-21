const express = require('express');
const router = express.Router();
const { protect, allow } = require('../middleware/auth.middleware');
const { getResult, getJobResults } = require('../controllers/results.controller');

// Job results must come before :interviewId to avoid route collision
router.get('/job/:jobId', protect, allow('interviewer', 'admin'), getJobResults);
router.get('/:interviewId', protect, getResult);

module.exports = router;
