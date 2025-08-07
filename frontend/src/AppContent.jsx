import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import OTPVerification from './pages/OTPVerification';
import TestEmail from './pages/TestEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Dictionary from './pages/Dictionary';
import Forum from './pages/Forum';
import Quiz from './pages/Quiz';
import AccessibilitySettings from './pages/AccessibilitySettings';
import GoogleAuthSuccess from './pages/GoogleAuthSuccess';

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
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dictionary" element={<Dictionary />} />
          <Route path="/forum" element={<Forum />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/accessibility" element={<AccessibilitySettings />} />
          <Route path="/auth/google/success" element={<GoogleAuthSuccess />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default AppContent; 