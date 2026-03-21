import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Spinner from '../../components/Spinner';

const domainBadge = {
  webdev: 'bg-blue-100 text-blue-700',
  data: 'bg-purple-100 text-purple-700',
  general: 'bg-gray-100 text-gray-700',
};

const difficultyBadge = {
  easy: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  hard: 'bg-red-100 text-red-700',
};

export default function JobList() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [starting, setStarting] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const { data } = await api.get('/jobs');
        setJobs(data.jobs);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load jobs');
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const handleStartInterview = async (jobId) => {
    setStarting(jobId);
    try {
      const { data } = await api.post('/interview/start', { jobId });
      navigate(`/interview/${data.interviewId}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to start interview');
      setStarting(null);
    }
  };

  if (loading) return <Spinner text="Loading jobs..." />;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Open Positions</h1>
        <p className="mt-1 text-gray-500">
          Browse available roles and start an AI-powered interview.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
          {error}
        </div>
      )}

      {jobs.length === 0 ? (
        <div className="text-center py-16 bg-white border border-gray-200 rounded-xl">
          <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <p className="mt-4 text-gray-500">No open positions available right now.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {jobs.map((job) => (
            <div
              key={job._id}
              className="bg-white border border-gray-200 rounded-xl p-6 hover:border-indigo-200 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h2 className="text-lg font-semibold text-gray-900">{job.title}</h2>
                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${domainBadge[job.domain]}`}>
                      {job.domain}
                    </span>
                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${difficultyBadge[job.difficulty]}`}>
                      {job.difficulty}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{job.description}</p>
                  <p className="text-xs text-gray-400">
                    Posted by {job.createdBy?.name || 'Unknown'}
                  </p>
                </div>
                <button
                  onClick={() => handleStartInterview(job._id)}
                  disabled={starting === job._id}
                  className="shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                >
                  {starting === job._id ? 'Starting...' : 'Start Interview'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
