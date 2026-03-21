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
  candidate: 'bg-blue-100 text-blue-700',
  interviewer: 'bg-purple-100 text-purple-700',
  admin: 'bg-red-100 text-red-700',
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
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Brand + Nav Links */}
          <div className="flex items-center gap-8">
            <Link
              to="/"
              className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
            >
              RecruitAI
            </Link>
            <div className="hidden sm:flex items-center gap-1">
              {links.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Right: User info + Logout */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700 hidden sm:block">
              {user.name}
            </span>
            <span
              className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                roleBadgeColors[user.role]
              }`}
            >
              {user.role}
            </span>
            <button
              onClick={handleLogout}
              className="ml-2 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Mobile nav links */}
      <div className="sm:hidden border-t border-gray-100 px-4 pb-2 flex gap-1">
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
