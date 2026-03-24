import { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import api from '../services/api';
import useAuthStore from '../store/authStore';

const dashboardByRole = {
  candidate: '/dashboard',
  interviewer: '/interviewer/dashboard',
  admin: '/admin',
};

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'candidate' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, user } = useAuthStore();

  if (user) {
    return <Navigate to={dashboardByRole[user.role] || '/dashboard'} replace />;
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await api.post('/auth/register', form);
      login(data.user, data.token);
      navigate(dashboardByRole[data.user.role] || '/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { value: 'candidate', label: 'Candidate', desc: 'Looking for jobs & interviews' },
    { value: 'interviewer', label: 'Interviewer', desc: 'Hiring & evaluating talent' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-darker px-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-brand/5 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/3 left-1/4 w-[300px] h-[300px] bg-brand/8 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-10">
          <Link to="/" className="inline-block">
            <h1 className="text-3xl font-semibold text-white tracking-tight">
              HireMind
            </h1>
          </Link>
          <p className="mt-3 text-textSoft">Create your account</p>
        </div>

        {/* Card */}
        <div className="bg-surface border border-white/10 rounded-2xl p-8 shadow-2xl backdrop-blur-sm">
          {error && (
            <div className="mb-5 p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="reg-name" className="block text-sm font-medium text-textSoft mb-2">
                Full Name
              </label>
              <input
                id="reg-name"
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full bg-dark border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:ring-2 focus:ring-brand/50 focus:border-brand/50 outline-none transition-all"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label htmlFor="reg-email" className="block text-sm font-medium text-textSoft mb-2">
                Email
              </label>
              <input
                id="reg-email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full bg-dark border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:ring-2 focus:ring-brand/50 focus:border-brand/50 outline-none transition-all"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="reg-password" className="block text-sm font-medium text-textSoft mb-2">
                Password
              </label>
              <input
                id="reg-password"
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                minLength={6}
                className="w-full bg-dark border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:ring-2 focus:ring-brand/50 focus:border-brand/50 outline-none transition-all"
                placeholder="At least 6 characters"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-textSoft mb-3">
                I am a
              </label>
              <div className="grid grid-cols-2 gap-3">
                {roles.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setForm({ ...form, role: r.value })}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      form.role === r.value
                        ? 'border-brand bg-brand/10 text-white'
                        : 'border-white/10 bg-dark text-textSoft hover:border-white/20'
                    }`}
                  >
                    <span className="block text-sm font-medium">{r.label}</span>
                    <span className="block text-xs mt-1 opacity-60">{r.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand hover:brightness-110 text-darker font-semibold py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Creating account...
                </span>
              ) : 'Create Account'}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-textSoft">
            Already have an account?{' '}
            <Link to="/login" className="text-brand font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
