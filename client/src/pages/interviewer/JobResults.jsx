import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import Spinner from '../../components/Spinner';

export default function JobResults() {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { t } = useTranslation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobRes, resultsRes] = await Promise.all([
          api.get(`/jobs/${jobId}`),
          api.get(`/results/job/${jobId}`),
        ]);
        setJob(jobRes.data.job);
        setCandidates(resultsRes.data.candidates);
      } catch (err) {
        setError(err.response?.data?.message || t('jobResults.failedLoad'));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [jobId, t]);

  if (loading) return <Spinner text={t('jobResults.loading')} />;

  const scoreColor = (s) =>
    s >= 7 ? 'text-green-400' : s >= 5 ? 'text-yellow-400' : 'text-red-400';

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 animate-fade-in-up">
      <div className="mb-10">
        <Link
          to="/interviewer/dashboard"
          className="text-sm text-brand hover:brightness-110 font-medium inline-flex items-center gap-2 transition-all group"
        >
          <span className="group-hover:-translate-x-1 transition-transform">←</span> {t('jobResults.backToDashboard')}
        </Link>
        <h1 className="text-3xl font-medium text-white tracking-tight mt-6">
          {job?.title} — {t('jobResults.heading')}
        </h1>
        <p className="mt-2 text-textSoft text-lg">
          {candidates.length === 1 
            ? t('jobResults.completedInterviews_one', { count: candidates.length })
            : t('jobResults.completedInterviews_other', { count: candidates.length })
          }
        </p>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl">
          {error}
        </div>
      )}

      {candidates.length === 0 ? (
        <div className="text-center py-24 bg-surface border border-white/5 rounded-2xl relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-brand/5 blur-3xl rounded-full"></div>
          <svg className="mx-auto h-12 w-12 text-white/20 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p className="mt-4 text-textSoft relative z-10">
            {t('jobResults.noCandidates')}
          </p>
        </div>
      ) : (
        <div className="bg-surface border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative z-10">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10 bg-darker/50 backdrop-blur-sm">
                  <th className="px-6 py-4 text-xs font-semibold text-textSoft uppercase tracking-wider">
                    {t('jobResults.rank')}
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-textSoft uppercase tracking-wider">
                    {t('jobResults.name')}
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-textSoft uppercase tracking-wider">
                    {t('jobResults.email')}
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-textSoft uppercase tracking-wider">
                    {t('jobResults.score')}
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-textSoft uppercase tracking-wider text-right">
                    {t('jobResults.action')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {candidates.map((c, idx) => (
                  <tr key={c.interviewId} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-5 text-sm font-medium text-textSoft">
                      <span className="w-6 h-6 inline-flex items-center justify-center rounded-full bg-dark border border-white/10 text-white text-xs">
                        {idx + 1}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-sm font-medium text-white">
                      {c.candidateName}
                    </td>
                    <td className="px-6 py-5 text-sm text-textSoft">
                      {c.candidateEmail}
                    </td>
                    <td className="px-6 py-5">
                      <span className={`text-sm font-bold px-2.5 py-1 rounded-full bg-dark border border-white/5 ${scoreColor(c.totalScore)}`}>
                        {c.totalScore !== null ? `${c.totalScore}/10` : t('common.na')}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <Link
                        to={`/result/${c.interviewId}`}
                        className="text-sm text-brand hover:brightness-110 font-medium px-4 py-2 rounded-lg bg-brand/10 hover:bg-brand/20 transition-all"
                      >
                        {t('jobResults.viewDetails')}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
