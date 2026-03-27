import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import Spinner from '../../components/Spinner';

const domainBadge = {
  webdev: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  data: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
  general: 'bg-white/5 text-white/70 border border-white/10',
  mlai: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  devops: 'bg-orange-500/10 text-orange-400 border border-orange-500/20',
  cloud: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20',
  frontend: 'bg-pink-500/10 text-pink-400 border border-pink-500/20',
  backend: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
  fullstack: 'bg-violet-500/10 text-violet-400 border border-violet-500/20',
  mobile: 'bg-teal-500/10 text-teal-400 border border-teal-500/20',
  security: 'bg-red-500/10 text-red-500 border border-red-500/20',
  database: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  blockchain: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
  iot: 'bg-lime-500/10 text-lime-400 border border-lime-500/20',
  gamedev: 'bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20',
  qa: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
};

const difficultyBadge = {
  easy: 'bg-green-500/10 text-green-400 border border-green-500/20',
  medium: 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20',
  hard: 'bg-red-500/10 text-red-400 border border-red-500/20',
};

export default function JobList() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [starting, setStarting] = useState(null);
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const { data } = await api.get('/jobs');
        setJobs(data.jobs);
      } catch (err) {
        setError(err.response?.data?.message || t('jobList.failedLoad'));
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, [t]);

  const handleStartInterview = async (jobId) => {
    setStarting(jobId);
    try {
      const { data } = await api.post('/interview/start', { jobId });
      navigate(`/interview/${data.interviewId}`);
    } catch (err) {
      setError(err.response?.data?.message || t('jobList.failedStart'));
      setStarting(null);
    }
  };

  if (loading) return <Spinner text={t('jobList.loading')} />;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 animate-fade-in-up">
      <div className="mb-10">
        <h1 className="text-3xl font-medium text-white tracking-tight">{t('jobList.heading')}</h1>
        <p className="mt-2 text-textSoft text-lg">
          {t('jobList.subtitle')}
        </p>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl">
          {error}
        </div>
      )}

      {jobs.length === 0 ? (
        <div className="text-center py-20 bg-surface border border-white/5 rounded-2xl">
          <svg className="mx-auto h-12 w-12 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <p className="mt-4 text-textSoft">{t('jobList.noJobs')}</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {jobs.map((job) => (
            <div
              key={job._id}
              className="bg-surface border border-white/5 rounded-2xl p-6 hover:border-brand/40 transition-colors group flex flex-col md:flex-row md:items-start justify-between gap-6"
            >
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <h2 className="text-xl font-medium text-white group-hover:text-brand transition-colors">{job.title}</h2>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${domainBadge[job.domain]}`}>
                    {t(`createJob.domains.${job.domain}`) || job.domain}
                  </span>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${difficultyBadge[job.difficulty]}`}>
                    {t(`createJob.difficulties.${job.difficulty}`) || job.difficulty}
                  </span>
                </div>
                <p className="text-sm text-textSoft mb-4 line-clamp-2 leading-relaxed">{job.description}</p>
                <div className="flex items-center gap-2 text-xs text-white/40">
                  <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center">
                    {(job.createdBy?.name || t('common.unknown')).charAt(0)}
                  </div>
                  <span>{t('common.postedBy')} {job.createdBy?.name || t('common.unknown')}</span>
                </div>
              </div>
              <button
                onClick={() => handleStartInterview(job._id)}
                disabled={starting === job._id}
                className="shrink-0 w-full md:w-auto bg-white/10 hover:bg-brand hover:text-darker text-white text-sm font-medium px-6 py-3 rounded-xl transition-all disabled:opacity-50"
              >
                {starting === job._id ? t('jobList.starting') : t('jobList.startInterview')}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
