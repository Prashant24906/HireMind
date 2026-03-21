const Interview = require('../models/Interview.model');
const User = require('../models/User.model');
const Job = require('../models/Job.model');

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
const getStats = async (req, res) => {
  try {
    const [totalInterviews, completedInterviews, totalUsers, totalJobs] =
      await Promise.all([
        Interview.countDocuments(),
        Interview.countDocuments({ status: 'completed' }),
        User.countDocuments(),
        Job.countDocuments(),
      ]);

    // Compute average score from completed interviews
    let avgScore = 0;
    if (completedInterviews > 0) {
      const result = await Interview.aggregate([
        { $match: { status: 'completed', totalScore: { $ne: null } } },
        { $group: { _id: null, avg: { $avg: '$totalScore' } } },
      ]);
      avgScore = result.length > 0 ? Math.round(result[0].avg * 10) / 10 : 0;
    }

    const completionRate =
      totalInterviews > 0
        ? Math.round((completedInterviews / totalInterviews) * 100)
        : 0;

    res.json({
      totalInterviews,
      completedInterviews,
      avgScore,
      completionRate,
      totalUsers,
      totalJobs,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching stats' });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort('-createdAt');
    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching users' });
  }
};

module.exports = { getStats, getUsers };
