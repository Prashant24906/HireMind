const { body, validationResult } = require('express-validator');
const Job = require('../models/Job.model');

// @desc    Create a job
// @route   POST /api/jobs
const createJob = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('domain')
    .isIn([
      'webdev', 'data', 'general', 'mlai', 'devops', 'cloud', 
      'frontend', 'backend', 'fullstack', 'mobile', 'security', 
      'database', 'blockchain', 'iot', 'gamedev', 'qa'
    ])
    .withMessage('Invalid domain selected'),
  body('difficulty')
    .optional()
    .isIn(['easy', 'medium', 'hard'])
    .withMessage('Difficulty must be easy, medium, or hard'),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    try {
      const { title, description, domain, difficulty } = req.body;

      const job = await Job.create({
        title,
        description,
        domain,
        difficulty: difficulty || 'medium',
        createdBy: req.user._id,
      });

      res.status(201).json({ job });
    } catch (error) {
      res.status(500).json({ message: 'Server error creating job' });
    }
  },
];

// @desc    Get all jobs
// @route   GET /api/jobs
const getJobs = async (req, res) => {
  try {
    let filter = {};

    // Interviewers see only their own jobs
    if (req.user.role === 'interviewer') {
      filter.createdBy = req.user._id;
    } else {
      // Candidates and admins see all open jobs
      filter.isOpen = true;
    }

    const jobs = await Job.find(filter)
      .populate('createdBy', 'name email')
      .sort('-createdAt');

    res.json({ jobs });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching jobs' });
  }
};

// @desc    Get single job
// @route   GET /api/jobs/:id
const getJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate(
      'createdBy',
      'name email'
    );

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.json({ job });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching job' });
  }
};

// @desc    Delete a job
// @route   DELETE /api/jobs/:id
const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check ownership (only creator or admin can delete)
    if (job.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this job' });
    }

    await job.deleteOne();
    res.json({ message: 'Job removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting job' });
  }
};

module.exports = { createJob, getJobs, getJob, deleteJob };
