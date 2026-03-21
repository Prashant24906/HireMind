const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema(
  {
    questionId: { type: String },
    questionText: { type: String },
    answerText: { type: String, default: '' },
    score: { type: Number, default: null },
    breakdown: { type: Object, default: null },
    reason: { type: String, default: '' },
    isFollowUp: { type: Boolean, default: false },
    parentId: { type: String, default: null },
  },
  { _id: false }
);

const interviewSchema = new mongoose.Schema(
  {
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    status: {
      type: String,
      enum: ['in_progress', 'completed'],
      default: 'in_progress',
    },
    questions: [answerSchema],
    totalScore: {
      type: Number,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Interview', interviewSchema);
