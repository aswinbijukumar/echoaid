import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import RoleBasedRoute from './components/RoleBasedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import OTPVerification from './pages/OTPVerification';
import TestEmail from './pages/TestEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';
import Dictionary from './pages/Dictionary';
import Quiz from './pages/Quiz';
import AccessibilitySettings from './pages/AccessibilitySettings';
import GoogleAuthSuccess from './pages/GoogleAuthSuccess';
import Practice from './pages/Practice';
import AdminQuizPage from './pages/AdminQuizPage';

function AppContent() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/verify-email" element={<OTPVerification />} />
          <Route path="/test-email" element={<TestEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:resetToken" element={<ResetPassword />} />
          <Route path="/dashboard" element={
            <RoleBasedRoute>
              <Dashboard />
            </RoleBasedRoute>
          } />
          <Route path="/admin" element={
            <RoleBasedRoute allowedRoles={['admin', 'super_admin']}>
              <AdminDashboard />
            </RoleBasedRoute>
          } />
          <Route path="/super-admin" element={
            <RoleBasedRoute allowedRoles={['super_admin']}>
              <SuperAdminDashboard />
            </RoleBasedRoute>
          } />
          <Route path="/profile" element={<Profile />} />
          <Route path="/dictionary" element={<Dictionary />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/admin/quiz" element={
            <RoleBasedRoute allowedRoles={['admin', 'super_admin']}>
              <AdminQuizPage />
            </RoleBasedRoute>
          } />
          <Route path="/practice" element={
            <RoleBasedRoute>
              <Practice />
            </RoleBasedRoute>
          } />
          <Route path="/accessibility" element={<AccessibilitySettings />} />
          <Route path="/auth/google/success" element={<GoogleAuthSuccess />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default AppContent; 