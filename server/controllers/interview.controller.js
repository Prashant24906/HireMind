const { body, validationResult } = require('express-validator');
const axios = require('axios');
const Interview = require('../models/Interview.model');
const Job = require('../models/Job.model');

// ─── Question Bank ────────────────────────────────────────────
const QUESTION_BANK = {
  webdev: [
    'Explain the difference between authentication and authorization. How would you implement both in a web application?',
    'How does the JavaScript event loop work? Explain with examples of microtasks and macrotasks.',
    'What are the core principles of REST? How would you design a RESTful API for an e-commerce platform?',
    'Compare SQL and NoSQL databases. When would you choose one over the other?',
    'What is CORS and why does it exist? How do you handle CORS issues in a full-stack application?',
    'What is database indexing and how does it improve query performance? What are the trade-offs?',
    'Explain JavaScript closures with a practical example. How are they used in real-world applications?',
  ],
  data: [
    'What is the difference between supervised and unsupervised learning? Give examples of each.',
    'How do you prevent overfitting in a machine learning model? Discuss at least three techniques.',
    'Explain what a confusion matrix is and how to interpret precision, recall, and F1-score from it.',
    'What is the bias-variance tradeoff? How does it affect model selection?',
    'Explain the difference between precision and recall. When would you prioritize one over the other?',
    'How does gradient descent work? What are the differences between batch, stochastic, and mini-batch gradient descent?',
    'What is feature engineering? Describe techniques you would use to improve model performance.',
  ],
  general: [
    'Tell me about a challenging project you worked on. What made it challenging and how did you overcome the difficulties?',
    'How do you prioritize tasks when working under tight deadlines with multiple deliverables?',
    'Describe a situation where you had a disagreement with a team member. How did you resolve it?',
    'How do you keep your technical skills updated? What resources do you use for continuous learning?',
    'Walk me through how you would debug a critical production issue that is affecting users.',
    'What does code quality mean to you? How do you ensure your code meets high standards?',
    'Describe your process for learning a new technology or framework quickly.',
  ],
};

// Shuffle array and pick first `count` items
function pickQuestions(domain, count = 5) {
  // Safe fallback if domain doesn't exist in the hardcoded bank (e.g. for new domains)
  const sourceBank = QUESTION_BANK[domain] || QUESTION_BANK.general;
  const pool = [...sourceBank];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count);
}

// Generate a simple unique id (avoid installing uuid just for this)
function simpleId() {
  return (
    Date.now().toString(36) +
    '-' +
    Math.random().toString(36).substring(2, 10)
  );
}

// @desc    Start a new interview
// @route   POST /api/interview/start
const startInterview = [
  body('jobId').notEmpty().withMessage('jobId is required'),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    try {
      const { jobId } = req.body;

      // Verify job exists
      const job = await Job.findById(jobId);
      if (!job) {
        return res.status(404).json({ message: 'Job not found' });
      }

      // Check for existing in-progress interview for this candidate + job
      const existing = await Interview.findOne({
        candidateId: req.user._id,
        jobId,
        status: 'in_progress',
      });

      if (existing) {
        const questions = existing.questions.map((q) => ({
          _id: q.questionId,
          text: q.questionText,
          type: q.type,
          options: q.options,
        }));
        return res.json({ interviewId: existing._id, questions });
      }

      // ATTEMPT AI QUESTION GENERATION — pass full job context for role-specific questions
      let picked = [];
      try {
        const aiResponse = await axios.post(
          `${process.env.AI_SERVICE_URL}/generate-questions`,
          {
            job_title: job.title,
            domain: job.domain || 'general',
            skills: [],               // future: extract from job.description
            description: job.description || '',
            difficulty: job.difficulty || 'medium',
          },
          { timeout: 20000 }
        );
        
        // Extract full question objects returned (MCQ + Theory)
        if (aiResponse.data.questions && aiResponse.data.questions.length > 0) {
          picked = aiResponse.data.questions;
          console.log(`[Interview] AI generated ${picked.length} questions for "${job.title}" (${job.domain})`);
        }
      } catch (aiError) {
        console.warn('[Interview] AI question generation failed, falling back to bank:', aiError.message);
      }

      // Fallback to internal bank if AI fails or returns empty
      if (picked.length === 0) {
        const fallbackRaw = pickQuestions(job.domain, 5);
        picked = fallbackRaw.map(text => ({
          type: 'theory',
          question: text,
          options: [],
          correct_answer: null
        }));
      }

      const questionsForDB = picked.map((qObj) => ({
        questionId: simpleId(),
        questionText: qObj.question,
        type: qObj.type || 'theory',
        options: qObj.options || [],
        correctAnswer: qObj.correct_answer || null,
        answerText: '',
        score: null,
        breakdown: null,
        reason: '',
        isFollowUp: false,
        parentId: null,
      }));

      const interview = await Interview.create({
        candidateId: req.user._id,
        jobId,
        questions: questionsForDB,
      });

      const questions = interview.questions.map((q) => ({
        _id: q.questionId,
        text: q.questionText,
        type: q.type,
        options: q.options,
      }));

      res.status(201).json({ interviewId: interview._id, questions });
    } catch (error) {
      console.error('startInterview error:', error);
      res.status(500).json({ message: 'Server error starting interview' });
    }
  },
];

// @desc    Submit an answer for a question
// @route   POST /api/interview/answer
const submitAnswer = [
  body('interviewId').notEmpty().withMessage('interviewId is required'),
  body('questionId').notEmpty().withMessage('questionId is required'),
  body('answerText').notEmpty().withMessage('answerText is required'),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    try {
      const { interviewId, questionId, answerText } = req.body;

      const interview = await Interview.findById(interviewId);
      if (!interview) {
        return res.status(404).json({ message: 'Interview not found' });
      }

      // Check ownership
      if (interview.candidateId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized' });
      }

      if (interview.status === 'completed') {
        return res
          .status(400)
          .json({ message: 'Interview is already completed' });
      }

      // Find the question
      const question = interview.questions.find(
        (q) => q.questionId === questionId
      );
      if (!question) {
        return res.status(404).json({ message: 'Question not found' });
      }

      // Get the job for domain/difficulty info
      const job = await Job.findById(interview.jobId);

      // Call ML scoring service or score locally if MCQ
      let score = null;
      let breakdown = null;
      let reason = 'Scoring service unavailable';

      if (question.type === 'mcq') {
        const isCorrect = answerText.trim().toUpperCase() === (question.correctAnswer || '').toUpperCase();
        score = isCorrect ? 10 : 0;
        breakdown = {
          accuracy: isCorrect ? 10 : 0,
          depth: isCorrect ? 10 : 0,
          clarity: isCorrect ? 10 : 0,
          application: isCorrect ? 10 : 0,
          critical: isCorrect ? 10 : 0,
        };
        reason = isCorrect 
          ? 'Correct answer selected. Great job!' 
          : `Incorrect answer. The correct option was ${question.correctAnswer || 'not provided'}.`;
      } else {
        try {
          const mlResponse = await axios.post(
            `${process.env.AI_SERVICE_URL}/score`,
            {
              question: question.questionText,
              answer: answerText,
              domain: job ? job.domain : 'general',
              difficulty: job ? job.difficulty : 'medium',
            },
            { timeout: 15000 }
          );

          score = mlResponse.data.score;
          breakdown = mlResponse.data.breakdown;
          reason = mlResponse.data.reason;
        } catch (mlError) {
          console.warn('ML scoring service unavailable:', mlError.message);
          // Continue gracefully with null score
        }
      }

      // Save answer
      question.answerText = answerText;
      question.score = score;
      question.breakdown = breakdown;
      question.reason = reason;

      // Check if all questions are answered
      const allAnswered = interview.questions.every(
        (q) => q.answerText && q.answerText.length > 0
      );

      if (allAnswered) {
        // Compute average score from scored questions
        const scoredQuestions = interview.questions.filter(
          (q) => q.score !== null
        );
        if (scoredQuestions.length > 0) {
          const total = scoredQuestions.reduce((sum, q) => sum + q.score, 0);
          interview.totalScore = Math.round((total / scoredQuestions.length) * 10) / 10;
        }
        interview.status = 'completed';
      }

      await interview.save();

      // If score < 5, try to get follow-up question (only for theory)
      let followUp = null;
      if (question.type !== 'mcq' && score !== null && score < 5) {
        try {
          const fuResponse = await axios.post(
            `${process.env.AI_SERVICE_URL}/followup`,
            {
              question: question.questionText,
              answer: answerText,
              score,
            },
            { timeout: 10000 }
          );
          followUp = fuResponse.data.followUp;

          // Add follow-up question to interview
          if (followUp) {
            interview.questions.push({
              questionId: simpleId(),
              questionText: followUp,
              answerText: '',
              score: null,
              breakdown: null,
              reason: '',
              isFollowUp: true,
              parentId: questionId,
            });
            // Un-complete if we added a follow-up
            interview.status = 'in_progress';
            interview.totalScore = null;
            await interview.save();
          }
        } catch (fuError) {
          console.warn('Follow-up service unavailable:', fuError.message);
          // Continue without follow-up
        }
      }

      res.json({ score, breakdown, reason, followUp });
    } catch (error) {
      console.error('submitAnswer error:', error);
      res.status(500).json({ message: 'Server error submitting answer' });
    }
  },
];

// @desc    Get interview by ID
// @route   GET /api/interview/:interviewId
const getInterview = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.interviewId)
      .populate('candidateId', 'name email')
      .populate('jobId', 'title domain difficulty');

    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    // Only the candidate or staff (interviewer/admin) can view
    const isOwner =
      interview.candidateId._id.toString() === req.user._id.toString();
    const isStaff = ['interviewer', 'admin'].includes(req.user.role);

    if (!isOwner && !isStaff) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json({ interview });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching interview' });
  }
};

// @desc    Get all interviews for current candidate
// @route   GET /api/interview/my-interviews
const getCandidateInterviews = async (req, res) => {
  try {
    const interviews = await Interview.find({ candidateId: req.user._id })
      .populate('jobId', 'title domain difficulty')
      .sort('-createdAt');
    res.json({ interviews });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching your interviews' });
  }
};

module.exports = { startInterview, submitAnswer, getInterview, getCandidateInterviews };
