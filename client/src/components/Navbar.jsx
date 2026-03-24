import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const roleLinks = {
  candidate: [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/jobs', label: 'Browse Jobs' },
  ],
  interviewer: [
    { to: '/interviewer/dashboard', label: 'Dashboard' },
    { to: '/interviewer/create-job', label: 'Post a Job' },
  ],
  admin: [{ to: '/admin', label: 'Admin Panel' }],
};

const roleBadgeColors = {
  candidate: 'bg-brand/10 text-brand border border-brand/20',
  interviewer: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
  admin: 'bg-red-500/10 text-red-400 border border-red-500/20',
};

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  if (!user) return null;

  const links = roleLinks[user.role] || [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-darker/80 backdrop-blur-md border-b border-white/5 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Left: Brand + Nav Links */}
          <div className="flex items-center gap-12">
            <Link
              to="/"
              className="text-xl font-medium tracking-tight text-white hover:text-brand transition-colors"
            >
              HireMind
            </Link>
            <div className="hidden sm:flex items-center gap-6">
              {links.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="px-3 py-2 text-sm font-medium text-textSoft hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Right: User info + Logout */}
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-white hidden sm:block">
              {user.name}
            </span>
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                roleBadgeColors[user.role]
              }`}
            >
              {user.role}
            </span>
            <button
              onClick={handleLogout}
              className="ml-2 px-4 py-2 text-sm font-medium text-textSoft hover:text-red-400 hover:bg-white/5 rounded-lg transition-colors border border-transparent hover:border-red-500/20"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Mobile nav links */}
      <div className="sm:hidden border-t border-white/5 px-4 pb-4 pt-2 flex flex-col gap-2 bg-dark">
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="px-3 py-2 rounded-lg text-sm font-medium text-textSoft hover:text-white hover:bg-white/5 transition-colors"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
