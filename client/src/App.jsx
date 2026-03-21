import { Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Auth pages
import Login from './pages/Login';
import Register from './pages/Register';

// Candidate pages
import CandidateDashboard from './pages/candidate/Dashboard';
import JobList from './pages/candidate/JobList';
import InterviewSession from './pages/candidate/InterviewSession';
import InterviewResult from './pages/candidate/InterviewResult';

// Interviewer pages
import InterviewerDashboard from './pages/interviewer/Dashboard';
import CreateJob from './pages/interviewer/CreateJob';
import JobResults from './pages/interviewer/JobResults';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';

const dashboardByRole = {
  candidate: '/dashboard',
  interviewer: '/interviewer/dashboard',
  admin: '/admin',
};

function RoleRedirect() {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={dashboardByRole[user.role] || '/dashboard'} replace />;
}

export default function App() {
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen bg-gray-50">
      {user && <Navbar />}

      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Candidate routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={['candidate']}>
              <CandidateDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/jobs"
          element={
            <ProtectedRoute allowedRoles={['candidate']}>
              <JobList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/interview/:interviewId"
          element={
            <ProtectedRoute allowedRoles={['candidate']}>
              <InterviewSession />
            </ProtectedRoute>
          }
        />
        <Route
          path="/result/:interviewId"
          element={
            <ProtectedRoute allowedRoles={['candidate', 'interviewer', 'admin']}>
              <InterviewResult />
            </ProtectedRoute>
          }
        />

        {/* Interviewer routes */}
        <Route
          path="/interviewer/dashboard"
          element={
            <ProtectedRoute allowedRoles={['interviewer']}>
              <InterviewerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/interviewer/create-job"
          element={
            <ProtectedRoute allowedRoles={['interviewer']}>
              <CreateJob />
            </ProtectedRoute>
          }
        />
        <Route
          path="/interviewer/job/:jobId/results"
          element={
            <ProtectedRoute allowedRoles={['interviewer', 'admin']}>
              <JobResults />
            </ProtectedRoute>
          }
        />

        {/* Admin routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Root redirect */}
        <Route path="/" element={<RoleRedirect />} />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
