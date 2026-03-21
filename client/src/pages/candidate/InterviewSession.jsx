import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Spinner from '../../components/Spinner';
import ScoreBar from '../../components/ScoreBar';

export default function InterviewSession() {
  const { interviewId } = useParams();
  const navigate = useNavigate();

  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Current question tracking
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  // Follow-up handling
  const [followUpQuestion, setFollowUpQuestion] = useState('');
  const [followUpAnswer, setFollowUpAnswer] = useState('');
  const [submittingFollowUp, setSubmittingFollowUp] = useState(false);
  const [followUpResult, setFollowUpResult] = useState(null);

  // Timer (120s per question)
  const [timeLeft, setTimeLeft] = useState(120);
  const timerRef = useRef(null);

  // Fetch interview data
  useEffect(() => {
    const fetchInterview = async () => {
      try {
        const { data } = await api.get(`/interview/${interviewId}`);
        if (data.interview.status === 'completed') {
          navigate(`/result/${interviewId}`, { replace: true });
          return;
        }
        setInterview(data.interview);

        // Find first unanswered question
        const firstUnanswered = data.interview.questions.findIndex(
          (q) => !q.answerText
        );
        setCurrentIdx(firstUnanswered >= 0 ? firstUnanswered : 0);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load interview');
      } finally {
        setLoading(false);
      }
    };
    fetchInterview();
  }, [interviewId, navigate]);

  // Timer logic
  const handleAutoSubmit = useCallback(() => {
    if (!submitting && answer.trim()) {
      handleSubmit();
    }
  }, [answer, submitting]);

  useEffect(() => {
    setTimeLeft(120);
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIdx]);

  // Auto-submit when timer reaches 0
  useEffect(() => {
    if (timeLeft === 0 && !result) {
      handleAutoSubmit();
    }
  }, [timeLeft, result, handleAutoSubmit]);

  const handleSubmit = async () => {
    if (!answer.trim() || submitting) return;

    setSubmitting(true);
    setError('');

    try {
      const question = interview.questions[currentIdx];
      const { data } = await api.post('/interview/answer', {
        interviewId,
        questionId: question.questionId,
        answerText: answer.trim(),
      });

      setResult(data);
      if (timerRef.current) clearInterval(timerRef.current);

      // Handle follow-up
      if (data.followUp) {
        setFollowUpQuestion(data.followUp);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit answer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFollowUpSubmit = async () => {
    if (!followUpAnswer.trim() || submittingFollowUp) return;
    setSubmittingFollowUp(true);

    try {
      // Re-fetch interview to get the follow-up question's ID
      const { data: ivData } = await api.get(`/interview/${interviewId}`);
      const fuQ = ivData.interview.questions.find(
        (q) => q.isFollowUp && !q.answerText
      );

      if (fuQ) {
        const { data } = await api.post('/interview/answer', {
          interviewId,
          questionId: fuQ.questionId,
          answerText: followUpAnswer.trim(),
        });
        setFollowUpResult(data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit follow-up');
    } finally {
      setSubmittingFollowUp(false);
    }
  };

  const handleNext = async () => {
    // Re-fetch the interview to get latest state (including any added follow-ups)
    try {
      const { data } = await api.get(`/interview/${interviewId}`);
      if (data.interview.status === 'completed') {
        navigate(`/result/${interviewId}`);
        return;
      }
      setInterview(data.interview);

      // Find next unanswered
      const nextUnanswered = data.interview.questions.findIndex(
        (q) => !q.answerText
      );
      if (nextUnanswered >= 0) {
        setCurrentIdx(nextUnanswered);
      } else {
        navigate(`/result/${interviewId}`);
        return;
      }
    } catch (err) {
      // If we can't refetch, just advance locally
      if (currentIdx < interview.questions.length - 1) {
        setCurrentIdx(currentIdx + 1);
      } else {
        navigate(`/result/${interviewId}`);
        return;
      }
    }

    // Reset state
    setAnswer('');
    setResult(null);
    setFollowUpQuestion('');
    setFollowUpAnswer('');
    setFollowUpResult(null);
  };

  if (loading) return <Spinner text="Loading interview..." />;

  if (error && !interview) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">{error}</div>
      </div>
    );
  }

  if (!interview) return null;

  const question = interview.questions[currentIdx];
  const totalQuestions = interview.questions.filter((q) => !q.isFollowUp).length;
  const questionNumber = interview.questions
    .slice(0, currentIdx + 1)
    .filter((q) => !q.isFollowUp).length;

  const progressPct = (questionNumber / totalQuestions) * 100;
  const timerColor = timeLeft <= 30 ? 'text-red-500' : 'text-gray-600';

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const scoreColor = (s) =>
    s >= 7 ? 'text-green-600' : s >= 5 ? 'text-yellow-600' : 'text-red-500';

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            Question {questionNumber} of {totalQuestions}
          </h1>
          {question?.isFollowUp && (
            <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
              Follow-up Question
            </span>
          )}
        </div>
        <div className={`text-2xl font-mono font-bold ${timerColor}`}>
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-8">
        <div
          className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progressPct}%` }}
        ></div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
          {error}
        </div>
      )}

      {/* Question card */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
        <p className="text-gray-800 text-lg leading-relaxed">
          {question?.questionText}
        </p>
      </div>

      {/* Answer area (not yet submitted) */}
      {!result && (
        <div className="space-y-4">
          <div className="relative">
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              rows={6}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition resize-none"
              placeholder="Type your answer here..."
            />
            <div className="absolute bottom-3 right-3 text-xs text-gray-400">
              {answer.length} characters
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!answer.trim() || submitting}
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Submitting...' : 'Submit Answer'}
          </button>
        </div>
      )}

      {/* Result display */}
      {result && (
        <div className="space-y-6">
          {/* Score */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-sm font-medium text-gray-500">Score:</span>
              <span className={`text-3xl font-bold ${result.score !== null ? scoreColor(result.score) : 'text-gray-400'}`}>
                {result.score !== null ? `${result.score}/10` : 'N/A'}
              </span>
            </div>

            {/* Breakdown grid */}
            {result.breakdown && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                <ScoreBar label="Accuracy" score={result.breakdown.accuracy} />
                <ScoreBar label="Depth" score={result.breakdown.depth} />
                <ScoreBar label="Clarity" score={result.breakdown.clarity} />
                <ScoreBar label="Application" score={result.breakdown.application} />
                <ScoreBar label="Critical Thinking" score={result.breakdown.critical} />
              </div>
            )}

            {/* AI Feedback */}
            {result.reason && (
              <div className="bg-gray-50 rounded-lg p-4 mt-4">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-700">AI Feedback: </span>
                  {result.reason}
                </p>
              </div>
            )}
          </div>

          {/* Follow-up question */}
          {followUpQuestion && !followUpResult && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
              <h3 className="text-sm font-semibold text-amber-800 mb-2">
                Follow-up Question
              </h3>
              <p className="text-gray-800 mb-4">{followUpQuestion}</p>
              <textarea
                value={followUpAnswer}
                onChange={(e) => setFollowUpAnswer(e.target.value)}
                rows={4}
                className="w-full border border-amber-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition resize-none mb-3"
                placeholder="Type your follow-up answer..."
              />
              <button
                onClick={handleFollowUpSubmit}
                disabled={!followUpAnswer.trim() || submittingFollowUp}
                className="bg-amber-600 hover:bg-amber-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                {submittingFollowUp ? 'Submitting...' : 'Submit Follow-up'}
              </button>
            </div>
          )}

          {/* Follow-up result */}
          {followUpResult && (
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                Follow-up Score
              </h3>
              <span className={`text-2xl font-bold ${followUpResult.score !== null ? scoreColor(followUpResult.score) : 'text-gray-400'}`}>
                {followUpResult.score !== null ? `${followUpResult.score}/10` : 'N/A'}
              </span>
              {followUpResult.reason && (
                <p className="mt-2 text-sm text-gray-600">{followUpResult.reason}</p>
              )}
            </div>
          )}

          {/* Next button */}
          <button
            onClick={handleNext}
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-2.5 rounded-lg transition-colors"
          >
            {currentIdx < interview.questions.length - 1 || followUpQuestion
              ? 'Next Question →'
              : 'View Results →'}
          </button>
        </div>
      )}
    </div>
  );
}
