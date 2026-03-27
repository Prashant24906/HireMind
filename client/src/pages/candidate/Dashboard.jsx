import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useAuthStore from '../../store/authStore';

export default function CandidateDashboard() {
  const { user } = useAuthStore();
  const { t } = useTranslation();

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 animate-fade-in-up">
      <div className="mb-10">
        <h1 className="text-3xl font-medium text-white tracking-tight">
          {t('candidateDashboard.welcome', { name: user?.name })}
        </h1>
        <p className="mt-2 text-textSoft text-lg">
          {t('candidateDashboard.subtitle')}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-12">
        {/* Browse Jobs Card */}
        <Link
          to="/jobs"
          className="group bg-surface border border-white/10 rounded-2xl p-8 hover:border-brand/40 transition-all block relative overflow-hidden"
        >
          {/* Subtle glow effect */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 blur-3xl group-hover:bg-brand/10 transition-colors"></div>
          
          <div className="w-14 h-14 bg-dark border border-white/10 rounded-xl flex items-center justify-center mb-6 group-hover:border-brand/30 transition-colors">
            <svg className="w-6 h-6 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-xl font-medium text-white mb-2 relative z-10">{t('candidateDashboard.browseRoles')}</h2>
          <p className="text-sm text-textSoft relative z-10">
            {t('candidateDashboard.browseRolesDesc')}
          </p>
        </Link>

        {/* Interviews Card */}
        <Link
          to="/YourInterviews"
          className="group bg-surface border border-white/10 rounded-2xl p-8 hover:border-brand/40 transition-all block relative overflow-hidden"
          >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-3xl"></div>
          <div className="w-14 h-14 bg-dark border border-white/10 rounded-xl flex items-center justify-center mb-6">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-medium text-white mb-2 relative z-10">{t('candidateDashboard.yourInterviews')}</h2>
          <p className="text-sm text-textSoft relative z-10">
            {t('candidateDashboard.yourInterviewsDesc')}
          </p>
          </Link>
      </div>

      {/* Tips Section */}
      <div className="bg-dark/50 border border-white/5 rounded-2xl p-8">
        <h3 className="text-sm font-mono text-brand mb-4 uppercase tracking-wider">{t('candidateDashboard.tips.heading')}</h3>
        <ul className="space-y-4">
          <li className="flex items-start gap-4 text-textSoft">
            <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-brand mt-2"></span>
            <span>{t('candidateDashboard.tips.tip1')}</span>
          </li>
          <li className="flex items-start gap-4 text-textSoft">
            <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-brand mt-2"></span>
            <span>{t('candidateDashboard.tips.tip2')}</span>
          </li>
          <li className="flex items-start gap-4 text-textSoft">
            <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-brand mt-2"></span>
            <span>{t('candidateDashboard.tips.tip3')}</span>
          </li>
          <li className="flex items-start gap-4 text-textSoft">
            <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-brand mt-2"></span>
            <span>{t('candidateDashboard.tips.tip4')}</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
