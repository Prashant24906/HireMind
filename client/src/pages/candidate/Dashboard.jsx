import { Link } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

export default function CandidateDashboard() {
  const { user } = useAuthStore();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.name} 👋
        </h1>
        <p className="mt-1 text-gray-500">
          Ready to ace your next interview? Browse open roles and start practicing.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Browse Jobs Card */}
        <Link
          to="/jobs"
          className="group bg-white border border-gray-200 rounded-xl p-6 hover:border-indigo-300 hover:shadow-md transition-all"
        >
          <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-indigo-200 transition-colors">
            <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Browse Open Roles</h2>
          <p className="text-sm text-gray-500">
            Explore available positions and start AI-powered interviews.
          </p>
        </Link>

        {/* Interviews Card */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Your Interviews</h2>
          <p className="text-sm text-gray-500">
            Track your interview progress and review past results.
          </p>
        </div>
      </div>

      {/* Tips Section */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-amber-800 mb-3">💡 Interview Tips</h3>
        <ul className="space-y-2">
          <li className="flex items-start gap-2 text-sm text-amber-700">
            <span className="font-bold mt-0.5">•</span>
            <span>Read each question carefully and structure your answer before typing.</span>
          </li>
          <li className="flex items-start gap-2 text-sm text-amber-700">
            <span className="font-bold mt-0.5">•</span>
            <span>Provide specific examples and real-world applications when possible.</span>
          </li>
          <li className="flex items-start gap-2 text-sm text-amber-700">
            <span className="font-bold mt-0.5">•</span>
            <span>Be concise but thorough — the AI evaluates depth, clarity, and accuracy.</span>
          </li>
          <li className="flex items-start gap-2 text-sm text-amber-700">
            <span className="font-bold mt-0.5">•</span>
            <span>Don't worry about follow-up questions — they're opportunities to improve your score.</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
