import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import Spinner from '../../components/Spinner';
import ScoreBar from '../../components/ScoreBar';

export default function InterviewResult() {
  const { interviewId } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedQ, setExpandedQ] = useState(null);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const { data } = await api.get(`/results/${interviewId}`);
        setResult(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load results');
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, [interviewId]);

  if (loading) return <Spinner text="Loading results..." />;

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">{error}</div>
      </div>
    );
  }

  if (!result) return null;

  const scoreColor =
    result.totalScore >= 7
      ? 'text-green-600'
      : result.totalScore >= 5
      ? 'text-yellow-600'
      : 'text-red-500';

  const scoreBg =
    result.totalScore >= 7
      ? 'bg-green-50 border-green-200'
      : result.totalScore >= 5
      ? 'bg-yellow-50 border-yellow-200'
      : 'bg-red-50 border-red-200';

  const performanceLabel =
    result.totalScore >= 8
      ? 'Excellent'
      : result.totalScore >= 7
      ? 'Good'
      : result.totalScore >= 5
      ? 'Average'
      : result.totalScore >= 3
      ? 'Below Average'
      : 'Needs Improvement';

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Interview Results</h1>
        <p className="mt-1 text-gray-500">{result.jobTitle}</p>
      </div>

      {/* Total score card */}
      <div className={`border rounded-xl p-8 mb-8 text-center ${scoreBg}`}>
        <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
          Overall Score
        </p>
        <p className={`text-6xl font-bold ${scoreColor}`}>
          {result.totalScore !== null ? result.totalScore : 'N/A'}
          <span className="text-2xl text-gray-400">/10</span>
        </p>
        <p className={`mt-2 text-lg font-semibold ${scoreColor}`}>
          {result.totalScore !== null ? performanceLabel : 'Pending'}
        </p>
        {result.status === 'in_progress' && (
          <p className="mt-2 text-sm text-amber-600">
            This interview is still in progress.
          </p>
        )}
      </div>

      {/* Per-question results */}
      <div className="space-y-4 mb-8">
        <h2 className="text-lg font-semibold text-gray-900">Question Breakdown</h2>

        {result.questions.map((q, idx) => (
          <div
            key={q.questionId || idx}
            className="bg-white border border-gray-200 rounded-xl overflow-hidden"
          >
            <button
              onClick={() => setExpandedQ(expandedQ === idx ? null : idx)}
              className="w-full text-left px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-500">
                  {q.isFollowUp ? '↳ Follow-up' : `Q${idx + 1}`}
                </span>
                <span className="text-sm text-gray-800 line-clamp-1 flex-1">
                  {q.text}
                </span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span
                  className={`text-sm font-bold ${
                    q.score !== null
                      ? q.score >= 7
                        ? 'text-green-600'
                        : q.score >= 5
                        ? 'text-yellow-600'
                        : 'text-red-500'
                      : 'text-gray-400'
                  }`}
                >
                  {q.score !== null ? `${q.score}/10` : 'N/A'}
                </span>
                <svg
                  className={`w-5 h-5 text-gray-400 transition-transform ${
                    expandedQ === idx ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>

            {expandedQ === idx && (
              <div className="px-6 pb-6 border-t border-gray-100 pt-4 space-y-4">
                {/* User answer */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs font-medium text-gray-400 uppercase mb-1">
                    Your Answer
                  </p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {q.answer || 'No answer provided'}
                  </p>
                </div>

                {/* Score breakdown */}
                {q.breakdown && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <ScoreBar label="Accuracy" score={q.breakdown.accuracy} />
                    <ScoreBar label="Depth" score={q.breakdown.depth} />
                    <ScoreBar label="Clarity" score={q.breakdown.clarity} />
                    <ScoreBar label="Application" score={q.breakdown.application} />
                    <ScoreBar label="Critical Thinking" score={q.breakdown.critical} />
                  </div>
                )}

                {/* AI feedback */}
                {q.reason && (
                  <div className="bg-indigo-50 rounded-lg p-4">
                    <p className="text-sm text-indigo-700">
                      <span className="font-semibold">AI Feedback: </span>
                      {q.reason}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          to="/jobs"
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors text-center"
        >
          Browse More Jobs
        </Link>
        <Link
          to="/dashboard"
          className="bg-white hover:bg-gray-50 text-gray-700 font-semibold px-6 py-2.5 rounded-lg border border-gray-300 transition-colors text-center"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
