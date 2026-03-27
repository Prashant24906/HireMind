import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';

export default function CreateJob() {
  const [form, setForm] = useState({
    title: '',
    description: '',
    domain: 'webdev',
    difficulty: 'medium',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/jobs', form);
      navigate('/interviewer/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || t('createJob.failedCreate'));
    } finally {
      setLoading(false);
    }
  };

  const domainKeys = [
    'webdev', 'data', 'general', 'mlai', 'devops', 'cloud', 
    'frontend', 'backend', 'fullstack', 'mobile', 'security', 
    'database', 'blockchain', 'iot', 'gamedev', 'qa'
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 animate-fade-in-up">
      <div className="mb-10">
        <h1 className="text-3xl font-medium text-white tracking-tight">{t('createJob.heading')}</h1>
        <p className="mt-2 text-textSoft text-lg">
          {t('createJob.subtitle')}
        </p>
      </div>

      <div className="bg-surface border border-white/5 rounded-2xl p-8 relative overflow-hidden">
        {/* Subtle glow effect */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 blur-3xl rounded-full"></div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <div>
            <label htmlFor="job-title" className="block text-sm font-medium text-textSoft mb-2">
              {t('createJob.titleLabel')}
            </label>
            <input
              id="job-title"
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              className="w-full bg-dark border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:ring-2 focus:ring-brand/50 focus:border-brand/50 outline-none transition-all"
              placeholder={t('createJob.titlePlaceholder')}
            />
          </div>

          <div>
            <label htmlFor="job-description" className="block text-sm font-medium text-textSoft mb-2">
              {t('createJob.descLabel')}
            </label>
            <textarea
              id="job-description"
              name="description"
              value={form.description}
              onChange={handleChange}
              required
              rows={4}
              className="w-full bg-dark border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:ring-2 focus:ring-brand/50 focus:border-brand/50 outline-none transition-all resize-none"
              placeholder={t('createJob.descPlaceholder')}
            />
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div>
              <label htmlFor="job-domain" className="block text-sm font-medium text-textSoft mb-2">
                {t('createJob.domainLabel')}
              </label>
              <select
                id="job-domain"
                name="domain"
                value={form.domain}
                onChange={handleChange}
                className="w-full bg-dark border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-brand/50 focus:border-brand/50 outline-none transition-all appearance-none"
              >
                {domainKeys.map(k => (
                   <option key={k} value={k}>{t(`createJob.domains.${k}`)}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="job-difficulty" className="block text-sm font-medium text-textSoft mb-2">
                {t('createJob.difficultyLabel')}
              </label>
              <select
                id="job-difficulty"
                name="difficulty"
                value={form.difficulty}
                onChange={handleChange}
                className="w-full bg-dark border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-brand/50 focus:border-brand/50 outline-none transition-all appearance-none"
              >
                <option value="easy">{t('createJob.difficulties.easy')}</option>
                <option value="medium">{t('createJob.difficulties.medium')}</option>
                <option value="hard">{t('createJob.difficulties.hard')}</option>
              </select>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-brand hover:brightness-110 text-darker font-medium px-8 py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(198,244,50,0.2)] hover:shadow-[0_0_25px_rgba(198,244,50,0.4)]"
            >
              {loading ? t('createJob.creating') : t('createJob.createBtn')}
            </button>
            <Link
              to="/interviewer/dashboard"
              className="bg-white/5 hover:bg-white/10 text-white font-medium px-8 py-3 rounded-xl border border-white/10 transition-all hover:border-white/20"
            >
              {t('common.cancel')}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
