import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import Spinner from '../../components/Spinner';
import ScoreBar from '../../components/ScoreBar';

export default function InterviewResult() {
  const { interviewId } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedQ, setExpandedQ] = useState(null);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const { data } = await api.get(`/results/${interviewId}`);
        setResult(data);
      } catch (err) {
        setError(err.response?.data?.message || t('interviewResult.failedLoad'));
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, [interviewId, t]);

  if (loading) return <Spinner text={t('interviewResult.loading')} />;

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl">{error}</div>
      </div>
    );
  }

  if (!result) return null;

  const scoreColor = result.totalScore >= 7 ? 'text-green-400' : result.totalScore >= 5 ? 'text-yellow-400' : 'text-red-400';
  const scoreBg = result.totalScore >= 7 ? 'bg-green-500/5 border-green-500/20 shadow-[0_0_30px_rgba(74,222,128,0.1)]' 
               : result.totalScore >= 5 ? 'bg-yellow-500/5 border-yellow-500/20' 
               : 'bg-red-500/5 border-red-500/20';

  const performanceLabel =
    result.totalScore >= 8 ? t('interviewResult.performance.excellent')
      : result.totalScore >= 7 ? t('interviewResult.performance.good')
      : result.totalScore >= 5 ? t('interviewResult.performance.average')
      : result.totalScore >= 3 ? t('interviewResult.performance.belowAverage')
      : t('interviewResult.performance.needsImprovement');

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 animate-fade-in-up">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-medium text-white tracking-tight">{t('interviewResult.heading')}</h1>
        <p className="mt-2 text-textSoft text-lg">{result.jobTitle}</p>
      </div>

      {/* Total score card */}
      <div className={`border rounded-2xl p-10 mb-12 text-center transition-all ${scoreBg}`}>
        <p className="text-sm font-mono text-textSoft uppercase tracking-widest mb-4">
          {t('interviewResult.overallScore')}
        </p>
        <p className={`text-7xl font-semibold tracking-tight ${scoreColor}`}>
          {result.totalScore !== null ? result.totalScore : t('common.na')}
          <span className="text-3xl text-white/30 font-medium">/10</span>
        </p>
        <p className={`mt-4 text-xl font-medium ${scoreColor}`}>
          {result.totalScore !== null ? performanceLabel : t('interviewResult.pending')}
        </p>
        {result.status === 'in_progress' && (
          <p className="mt-4 text-sm font-medium px-4 py-2 bg-yellow-500/10 text-yellow-400 rounded-full inline-block">
            {t('interviewResult.inProgress')}
          </p>
        )}
      </div>

      {/* Per-question results */}
      <div className="space-y-6 mb-12">
        <h2 className="text-xl font-medium text-white mb-6">{t('interviewResult.questionBreakdown')}</h2>

        {result.questions.map((q, idx) => (
          <div
            key={q.questionId || idx}
            className="bg-surface border border-white/10 rounded-2xl overflow-hidden transition-all hover:border-white/20"
          >
            <button
              onClick={() => setExpandedQ(expandedQ === idx ? null : idx)}
              className="w-full text-left px-6 py-5 flex items-center justify-between hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-4">
                <span className="w-8 h-8 shrink-0 flex items-center justify-center bg-dark border border-white/10 rounded-full text-xs font-mono text-textSoft">
                  {q.isFollowUp ? '↳' : `Q${idx + 1}`}
                </span>
                <span className="text-base font-medium text-white line-clamp-1 flex-1">
                  {q.text}
                </span>
              </div>
              <div className="flex items-center gap-4 shrink-0 px-2">
                <span
                  className={`text-base font-semibold px-3 py-1 rounded-full bg-dark border border-white/5 ${
                    q.score !== null
                      ? q.score >= 7 ? 'text-green-400' : q.score >= 5 ? 'text-yellow-400' : 'text-red-400'
                      : 'text-textSoft'
                  }`}
                >
                  {q.score !== null ? `${q.score}/10` : t('common.na')}
                </span>
                <svg
                  className={`w-5 h-5 text-white/40 transition-transform ${
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
              <div className="px-6 pb-6 border-t border-white/5 pt-6 space-y-6">
                {/* User answer */}
                <div className="bg-dark/50 rounded-xl p-5 border border-white/5">
                  <p className="text-xs font-mono text-textSoft uppercase tracking-wider mb-3">
                    {t('interviewResult.yourAnswer')}
                  </p>
                  <p className="text-sm text-white/90 leading-relaxed whitespace-pre-wrap">
                    {q.answer || t('interviewResult.noAnswer')}
                  </p>
                </div>

                {/* Score breakdown */}
                {q.breakdown && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <ScoreBar label={t('interviewResult.breakdown.accuracy')} score={q.breakdown.accuracy} />
                    <ScoreBar label={t('interviewResult.breakdown.depth')} score={q.breakdown.depth} />
                    <ScoreBar label={t('interviewResult.breakdown.clarity')} score={q.breakdown.clarity} />
                    <ScoreBar label={t('interviewResult.breakdown.application')} score={q.breakdown.application} />
                    <ScoreBar label={t('interviewResult.breakdown.critical')} score={q.breakdown.critical} />
                  </div>
                )}

                {/* AI feedback */}
                {q.reason && (
                  <div className="bg-brand/5 border border-brand/10 rounded-xl p-5">
                    <p className="text-sm text-white/90 leading-relaxed">
                      <span className="font-semibold text-brand tracking-wide mr-2">{t('interviewResult.aiFeedback')}</span>
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
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <Link
          to="/jobs"
          className="bg-brand hover:brightness-110 text-darker font-medium px-8 py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(198,244,50,0.15)] text-center"
        >
          {t('interviewResult.browseMore')}
        </Link>
        <Link
          to="/dashboard"
          className="bg-surface hover:bg-white/5 text-white border border-white/10 font-medium px-8 py-3 rounded-xl transition-all text-center"
        >
          {t('interviewResult.goToDashboard')}
        </Link>
      </div>
    </div>
  );
}
