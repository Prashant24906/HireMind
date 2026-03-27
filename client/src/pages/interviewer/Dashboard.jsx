import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import Spinner from '../../components/Spinner';

export default function InterviewerDashboard() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { t } = useTranslation();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const { data } = await api.get('/jobs');
        setJobs(data.jobs);
      } catch (err) {
        setError(err.response?.data?.message || t('interviewerDashboard.failedLoad'));
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, [t]);

  const handleDelete = async (jobId) => {
    if (!window.confirm(t('interviewerDashboard.deleteConfirm'))) {
      return;
    }

    try {
      await api.delete(`/jobs/${jobId}`);
      setJobs(jobs.filter(j => j._id !== jobId));
    } catch (err) {
      alert(err.response?.data?.message || t('interviewerDashboard.failedDelete'));
    }
  };

  if (loading) return <Spinner text={t('interviewerDashboard.loading')} />;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-medium text-white tracking-tight">{t('interviewerDashboard.heading')}</h1>
          <p className="mt-2 text-textSoft text-lg">
            {t('interviewerDashboard.subtitle')}
          </p>
        </div>
        <Link
          to="/interviewer/create-job"
          className="bg-brand hover:brightness-110 text-darker font-medium px-6 py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(198,244,50,0.2)] hover:shadow-[0_0_25px_rgba(198,244,50,0.4)]"
        >
          {t('interviewerDashboard.postJob')}
        </Link>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl">
          {error}
        </div>
      )}

      {jobs.length === 0 ? (
        <div className="text-center py-24 bg-surface border border-white/5 rounded-2xl relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-brand/5 blur-3xl rounded-full"></div>
          <svg className="mx-auto h-12 w-12 text-white/20 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="mt-4 text-textSoft mb-6 relative z-10">{t('interviewerDashboard.noJobs')}</p>
          <Link
            to="/interviewer/create-job"
            className="inline-block bg-white/10 hover:bg-brand hover:text-darker text-white font-medium px-8 py-3 rounded-xl transition-all relative z-10 border border-white/10 hover:border-transparent"
          >
            {t('interviewerDashboard.createFirst')}
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {jobs.map((job) => (
            <div
              key={job._id}
              className="bg-surface border border-white/5 rounded-2xl p-6 hover:border-brand/40 transition-colors flex flex-col md:flex-row md:items-start justify-between gap-6 group"
            >
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h2 className="text-xl font-medium text-white group-hover:text-brand transition-colors">
                    {job.title}
                  </h2>
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    {t(`createJob.domains.${job.domain}`) || job.domain}
                  </span>
                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-full border ${
                      job.isOpen
                        ? 'bg-green-500/10 text-green-400 border-green-500/20'
                        : 'bg-white/5 text-white/40 border-white/10'
                    }`}
                  >
                    {job.isOpen ? t('common.open') : t('common.closed')}
                  </span>
                </div>
                <p className="text-sm text-textSoft line-clamp-2 leading-relaxed mt-3">
                  {job.description}
                </p>
              </div>
              <div className="shrink-0 flex items-center gap-3">
                <Link
                  to={`/interviewer/job/${job._id}/results`}
                  className="text-sm font-medium text-white/70 hover:text-brand bg-white/5 hover:bg-brand/10 px-5 py-2.5 rounded-xl transition-all whitespace-nowrap"
                >
                  {t('interviewerDashboard.viewResults')}
                </Link>
                <button
                  onClick={() => handleDelete(job._id)}
                  className="p-2.5 text-white/30 hover:text-red-400 bg-white/5 hover:bg-red-500/10 rounded-xl transition-all"
                  title={t('common.delete')}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
