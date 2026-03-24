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

  useEffect(() => {
    const fetchInterview = async () => {
      try {
        const { data } = await api.get(`/interview/${interviewId}`);
        if (data.interview.status === 'completed') {
          navigate(`/result/${interviewId}`, { replace: true });
          return;
        }
        setInterview(data.interview);

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
    try {
      const { data } = await api.get(`/interview/${interviewId}`);
      if (data.interview.status === 'completed') {
        navigate(`/result/${interviewId}`);
        return;
      }
      setInterview(data.interview);

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
      if (currentIdx < interview.questions.length - 1) {
        setCurrentIdx(currentIdx + 1);
      } else {
        navigate(`/result/${interviewId}`);
        return;
      }
    }

    setAnswer('');
    setResult(null);
    setFollowUpQuestion('');
    setFollowUpAnswer('');
    setFollowUpResult(null);
  };

  if (loading) return <Spinner text="Loading interview..." />;

  if (error && !interview) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl">{error}</div>
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
  const timerColor = timeLeft <= 30 ? 'text-red-400 font-bold' : 'text-brand';

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const scoreColor = (s) => s >= 7 ? 'text-green-400' : s >= 5 ? 'text-yellow-400' : 'text-red-400';

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-medium text-white tracking-tight">
            Question <span className="text-brand">{questionNumber}</span> of {totalQuestions}
          </h1>
          {question?.isFollowUp && (
            <span className="mt-2 inline-block text-xs font-medium text-amber-400 border border-amber-400/20 bg-amber-400/10 px-3 py-1 rounded-full">
              Follow-up Question
            </span>
          )}
        </div>
        <div className={`text-3xl font-mono tracking-wider ${timerColor} drop-shadow-[0_0_10px_rgba(198,244,50,0.3)]`}>
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-dark border border-white/5 rounded-full h-2 mb-10 overflow-hidden">
        <div
          className="bg-brand h-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(198,244,50,0.8)]"
          style={{ width: `${progressPct}%` }}
        ></div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl">
          {error}
        </div>
      )}

      {/* Question card */}
      <div className="bg-surface border border-white/10 rounded-2xl p-8 mb-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-3xl rounded-full pointer-events-none"></div>
        <div className="flex gap-4">
          <div className="w-8 h-8 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center shrink-0 mt-1">
             <span className="text-brand font-mono text-sm">Q</span>
          </div>
          <p className="text-white/90 text-xl leading-relaxed font-medium relative z-10">
            {question?.questionText}
          </p>
        </div>
      </div>

      {/* Answer area (not yet submitted) */}
      {!result && (
        <div className="space-y-6">
          <div className="relative">
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              rows={6}
              className="w-full bg-dark border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-white/20 focus:ring-2 focus:ring-brand/50 focus:border-brand/50 outline-none transition-all resize-none leading-relaxed"
              placeholder="Type your answer here. Be specific and structured..."
            />
            <div className={`absolute bottom-4 right-4 text-xs font-mono ${answer.length > 50 ? 'text-brand/70' : 'text-white/20'}`}>
              {answer.length} chars
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={!answer.trim() || submitting}
              className="w-full sm:w-auto bg-brand hover:brightness-110 text-darker font-medium px-10 py-3.5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(198,244,50,0.15)]"
            >
              {submitting ? 'Submitting...' : 'Submit Answer'}
            </button>
          </div>
        </div>
      )}

      {/* Result display */}
      {result && (
        <div className="space-y-8 animate-fade-in-up">
          {/* Main Score Card */}
          <div className="bg-surface border border-white/10 rounded-2xl p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-brand/5 blur-[80px] rounded-full pointer-events-none"></div>
            
            <div className="flex items-center justify-between border-b border-white/5 pb-6 mb-6">
              <span className="text-sm font-mono text-textSoft uppercase tracking-widest">Score Breakdown</span>
              <span className={`text-4xl font-semibold tracking-tight ${result.score !== null ? scoreColor(result.score) : 'text-textSoft'}`}>
                {result.score !== null ? `${result.score}` : 'N/A'}<span className="text-xl text-white/20">/10</span>
              </span>
            </div>

            {result.breakdown && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <ScoreBar label="Accuracy" score={result.breakdown.accuracy} />
                <ScoreBar label="Depth" score={result.breakdown.depth} />
                <ScoreBar label="Clarity" score={result.breakdown.clarity} />
                <ScoreBar label="Application" score={result.breakdown.application} />
                <ScoreBar label="Critical Thinking" score={result.breakdown.critical} />
              </div>
            )}

            {result.reason && (
              <div className="bg-dark/50 border border-white/5 rounded-xl p-5 mt-2">
                <p className="text-sm text-white/80 leading-relaxed">
                  <span className="font-semibold text-brand tracking-wide mr-2">AI Feedback:</span>
                  {result.reason}
                </p>
              </div>
            )}
          </div>

          {/* Follow-up question */}
          {followUpQuestion && !followUpResult && (
            <div className="bg-surface border border-amber-500/20 rounded-2xl p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-3xl rounded-full pointer-events-none"></div>
              
              <div className="flex gap-4 mb-6 relative z-10">
                <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 mt-1">
                   <span className="text-amber-400 font-mono text-sm">↳</span>
                </div>
                <div>
                   <h3 className="text-sm font-semibold text-amber-400 mb-2 mt-1 uppercase tracking-wider">Follow-up</h3>
                   <p className="text-white/90 text-lg leading-relaxed font-medium">{followUpQuestion}</p>
                </div>
              </div>

              <textarea
                value={followUpAnswer}
                onChange={(e) => setFollowUpAnswer(e.target.value)}
                rows={5}
                className="w-full bg-dark border border-amber-500/20 rounded-xl px-5 py-4 text-white placeholder-white/20 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 outline-none transition-all resize-none mb-4 relative z-10"
                placeholder="Type your follow-up answer..."
              />
              <div className="flex justify-end">
                <button
                  onClick={handleFollowUpSubmit}
                  disabled={!followUpAnswer.trim() || submittingFollowUp}
                  className="bg-amber-500 hover:brightness-110 text-darker font-medium px-8 py-3 rounded-xl transition-all disabled:opacity-50 relative z-10"
                >
                  {submittingFollowUp ? 'Submitting...' : 'Submit Follow-up'}
                </button>
              </div>
            </div>
          )}

          {/* Follow-up result */}
          {followUpResult && (
            <div className="bg-surface border border-white/10 rounded-2xl p-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-mono text-textSoft uppercase tracking-widest">Follow-up Score</h3>
                <span className={`text-3xl font-semibold tracking-tight ${followUpResult.score !== null ? scoreColor(followUpResult.score) : 'text-textSoft'}`}>
                  {followUpResult.score !== null ? `${followUpResult.score}` : 'N/A'}<span className="text-lg text-white/20">/10</span>
                </span>
              </div>
              {followUpResult.reason && (
                <p className="text-sm text-white/80 leading-relaxed bg-dark/50 border border-white/5 rounded-xl p-5">
                  <span className="font-semibold text-amber-400 tracking-wide mr-2">Feedback:</span>
                  {followUpResult.reason}
                </p>
              )}
            </div>
          )}

          {/* Next button */}
          <div className="flex justify-end pt-4">
            <button
              onClick={handleNext}
              className="w-full sm:w-auto bg-white text-darker hover:bg-white/90 font-medium px-10 py-3.5 rounded-xl transition-all"
            >
              {currentIdx < interview.questions.length - 1 || followUpQuestion
                ? 'Next Question →'
                : 'View Final Results →'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
