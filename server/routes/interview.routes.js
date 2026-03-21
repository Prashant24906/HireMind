const express = require('express');
const router = express.Router();
const { protect, allow } = require('../middleware/auth.middleware');
const {
  startInterview,
  submitAnswer,
  getInterview,
} = require('../controllers/interview.controller');

router.post('/start', protect, allow('candidate'), startInterview);
router.post('/answer', protect, allow('candidate'), submitAnswer);
router.get('/:interviewId', protect, getInterview);

module.exports = router;
