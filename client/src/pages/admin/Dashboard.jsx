import { useState, useEffect } from 'react';
import api from '../../services/api';
import Spinner from '../../components/Spinner';

const roleBadge = {
  candidate: 'bg-blue-100 text-blue-700',
  interviewer: 'bg-purple-100 text-purple-700',
  admin: 'bg-red-100 text-red-700',
};

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, usersRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/users'),
        ]);
        setStats(statsRes.data);
        setUsers(usersRes.data.users);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load admin data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <Spinner text="Loading admin dashboard..." />;

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">{error}</div>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Interviews',
      value: stats?.totalInterviews ?? 0,
      icon: '📋',
      color: 'bg-blue-50 border-blue-200',
    },
    {
      label: 'Completed',
      value: stats?.completedInterviews ?? 0,
      icon: '✅',
      color: 'bg-green-50 border-green-200',
    },
    {
      label: 'Avg Score',
      value: stats?.avgScore !== null ? `${stats?.avgScore}/10` : 'N/A',
      icon: '⭐',
      color: 'bg-yellow-50 border-yellow-200',
    },
    {
      label: 'Completion Rate',
      value: `${stats?.completionRate ?? 0}%`,
      icon: '📊',
      color: 'bg-purple-50 border-purple-200',
    },
    {
      label: 'Total Users',
      value: stats?.totalUsers ?? 0,
      icon: '👥',
      color: 'bg-indigo-50 border-indigo-200',
    },
    {
      label: 'Total Jobs',
      value: stats?.totalJobs ?? 0,
      icon: '💼',
      color: 'bg-teal-50 border-teal-200',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-1 text-gray-500">
          Platform overview and user management.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
        {statCards.map((card) => (
          <div
            key={card.label}
            className={`border rounded-xl p-5 ${card.color}`}
          >
            <div className="text-2xl mb-2">{card.icon}</div>
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            <p className="text-sm text-gray-500 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Users table */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900">All Users</h2>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Joined
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((u) => (
              <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {u.name}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {u.email}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                      roleBadge[u.role]
                    }`}
                  >
                    {u.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
