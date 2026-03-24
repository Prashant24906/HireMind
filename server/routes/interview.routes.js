const express = require('express');
const router = express.Router();
const { protect, allow } = require('../middleware/auth.middleware');
const {
  startInterview,
  submitAnswer,
  getInterview,
  getCandidateInterviews,
} = require('../controllers/interview.controller');

router.post('/start', protect, allow('candidate'), startInterview);
router.post('/answer', protect, allow('candidate'), submitAnswer);
router.get('/my-interviews', protect, allow('candidate'), getCandidateInterviews);
router.get('/:interviewId', protect, getInterview);

module.exports = router;
