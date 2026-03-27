import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import Spinner from '../../components/Spinner';

const domainBadge = {
  webdev: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  data: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
  general: 'bg-white/5 text-white/70 border border-white/10',
};

const difficultyBadge = {
  easy: 'bg-green-500/10 text-green-400 border border-green-500/20',
  medium: 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20',
  hard: 'bg-red-500/10 text-red-400 border border-red-500/20',
};

export default function YourInterviews() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        const { data } = await api.get('/interview/my-interviews');
        setInterviews(data.interviews);
      } catch (err) {
        setError(err.response?.data?.message || t('yourInterviews.failedLoad'));
      } finally {
        setLoading(false);
      }
    };
    fetchInterviews();
  }, [t]);

  if (loading) return <Spinner text={t('yourInterviews.loading')} />;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 animate-fade-in-up">
      <div className="mb-10">
        <h1 className="text-3xl font-medium text-white tracking-tight">{t('yourInterviews.heading')}</h1>
        <p className="mt-2 text-textSoft text-lg">
          {t('yourInterviews.subtitle')}
        </p>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl">
          {error}
        </div>
      )}

      {interviews.length === 0 ? (
        <div className="text-center py-20 bg-surface border border-white/5 rounded-2xl">
          <svg className="mx-auto h-12 w-12 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <p className="mt-4 text-textSoft">{t('yourInterviews.noInterviews')}</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {interviews.map((iv) => (
            <div
              key={iv._id}
              className="bg-surface border border-white/5 rounded-2xl p-6 hover:border-brand/40 transition-colors group flex flex-col md:flex-row md:items-start justify-between gap-6"
            >
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <h2 className="text-xl font-medium text-white group-hover:text-brand transition-colors">
                    {iv.jobId?.title || t('common.unknownRole')}
                  </h2>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${domainBadge[iv.jobId?.domain] || domainBadge.general}`}>
                    {t(`createJob.domains.${iv.jobId?.domain}`) || iv.jobId?.domain || 'general'}
                  </span>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${difficultyBadge[iv.jobId?.difficulty] || difficultyBadge.medium}`}>
                    {t(`createJob.difficulties.${iv.jobId?.difficulty}`) || iv.jobId?.difficulty || 'medium'}
                  </span>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                    iv.status === 'completed'
                      ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                      : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                  }`}>
                    {iv.status === 'completed' ? t('yourInterviews.completed') : t('yourInterviews.inProgress')}
                  </span>
                </div>
                
                {iv.status === 'completed' && iv.totalScore !== null && (
                   <div className="flex items-center gap-2 text-sm text-white/60">
                     <span>{t('yourInterviews.totalScore')}</span>
                     <span className="text-lg font-bold text-white">{iv.totalScore}/10</span>
                   </div>
                )}
              </div>
              
              <button
                onClick={() => navigate(iv.status === 'completed' ? `/result/${iv._id}` : `/interview/${iv._id}`)}
                className={`shrink-0 w-full md:w-auto text-sm font-medium px-6 py-3 rounded-xl transition-all ${
                  iv.status === 'completed'
                    ? 'bg-transparent border border-white/10 hover:bg-white/5 text-white'
                    : 'bg-white/10 hover:bg-brand hover:text-darker text-white'
                }`}
              >
                {iv.status === 'completed' ? t('yourInterviews.viewResults') : t('yourInterviews.resumeInterview')}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
