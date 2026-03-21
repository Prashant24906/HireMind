const Interview = require('../models/Interview.model');

// @desc    Get result for a single interview
// @route   GET /api/results/:interviewId
const getResult = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.interviewId)
      .populate('candidateId', 'name email')
      .populate('jobId', 'title domain difficulty');

    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    // Check ownership — candidate can view their own, staff can view all
    const isOwner =
      interview.candidateId._id.toString() === req.user._id.toString();
    const isStaff = ['interviewer', 'admin'].includes(req.user.role);

    if (!isOwner && !isStaff) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json({
      candidateName: interview.candidateId.name,
      candidateEmail: interview.candidateId.email,
      jobTitle: interview.jobId.title,
      totalScore: interview.totalScore,
      status: interview.status,
      questions: interview.questions.map((q) => ({
        questionId: q.questionId,
        text: q.questionText,
        answer: q.answerText,
        score: q.score,
        breakdown: q.breakdown,
        reason: q.reason,
        isFollowUp: q.isFollowUp,
      })),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching result' });
  }
};

// @desc    Get all results for a job (ranked)
// @route   GET /api/results/job/:jobId
const getJobResults = async (req, res) => {
  try {
    const interviews = await Interview.find({
      jobId: req.params.jobId,
      status: 'completed',
    })
      .populate('candidateId', 'name email')
      .sort('-totalScore');

    const candidates = interviews.map((iv) => ({
      interviewId: iv._id,
      candidateName: iv.candidateId.name,
      candidateEmail: iv.candidateId.email,
      totalScore: iv.totalScore,
      completedAt: iv.updatedAt,
    }));

    res.json({ candidates });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching job results' });
  }
};

module.exports = { getResult, getJobResults };
