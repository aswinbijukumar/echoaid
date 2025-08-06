import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Dictionary from './pages/Dictionary';
import Forum from './pages/Forum';
import Quiz from './pages/Quiz';
import AccessibilitySettings from './pages/AccessibilitySettings';

function AppContent() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dictionary" element={<Dictionary />} />
          <Route path="/forum" element={<Forum />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/accessibility" element={<AccessibilitySettings />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default AppContent; 