import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LearningProvider } from './context/LearningContext';
import { GamificationProvider } from './context/GamificationContext';
import RoleBasedRoute from './components/RoleBasedRoute';
import ModernSessionTimeout from './components/ModernSessionTimeout';
import SessionManager from './components/SessionManager';
import StarFieldBackground from './components/StarFieldBackground';
import RoleBasedProfile from './components/RoleBasedProfile';

// Lazy Load Pages for Performance
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const SignUp = lazy(() => import('./pages/SignUp'));
const OTPVerification = lazy(() => import('./pages/OTPVerification'));
const TestEmail = lazy(() => import('./pages/TestEmail'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const Dictionary = lazy(() => import('./pages/Dictionary'));
const Quiz = lazy(() => import('./pages/Quiz'));
const AccessibilitySettings = lazy(() => import('./pages/AccessibilitySettings'));
const GoogleAuthSuccess = lazy(() => import('./pages/GoogleAuthSuccess'));
const Practice = lazy(() => import('./pages/Practice'));
const AdminQuizPage = lazy(() => import('./pages/AdminQuizPage'));
const Learn = lazy(() => import('./pages/Learn'));
const Subscription = lazy(() => import('./pages/Subscription'));
const Support = lazy(() => import('./pages/Support'));
const UserMessages = lazy(() => import('./pages/UserMessages'));
const AdminMessages = lazy(() => import('./pages/AdminMessages'));
const SimpleTerms = lazy(() => import('./pages/SimpleTerms'));
const SimplePrivacy = lazy(() => import('./pages/SimplePrivacy'));
const TechShowcase = lazy(() => import('./pages/TechShowcase'));
const About = lazy(() => import('./pages/About'));
const Enterprise = lazy(() => import('./pages/Enterprise'));
const Translator = lazy(() => import('./pages/Translator'));
const Leaderboard = lazy(() => import('./pages/Leaderboard'));
const EchoArena = lazy(() => import('./pages/EchoArena'));
const CertificatesPage = lazy(() => import('./pages/Certificates'));

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
    <div className="flex flex-col items-center space-y-4">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-gray-400 font-medium">Loading EchoAid...</p>
    </div>
  </div>
);

function AppContent() {
  return (
    <AuthProvider>
      <LearningProvider>
        <GamificationProvider>
          <StarFieldBackground />
          <SessionManager />
          <Router>
            <Suspense fallback={<LoadingFallback />}>
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
                <Route path="/learn" element={
                  <RoleBasedRoute>
                    <Learn />
                  </RoleBasedRoute>
                } />
                <Route path="/admin" element={
                  <RoleBasedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </RoleBasedRoute>
                } />
                <Route path="/profile" element={<RoleBasedProfile />} />
                <Route path="/dictionary" element={<Dictionary />} />
                <Route path="/quiz" element={
                  <RoleBasedRoute>
                    <Quiz />
                  </RoleBasedRoute>
                } />
                <Route path="/quiz/:quizId" element={
                  <RoleBasedRoute>
                    <Quiz />
                  </RoleBasedRoute>
                } />
                <Route path="/admin/quiz" element={
                  <RoleBasedRoute allowedRoles={['admin']}>
                    <AdminQuizPage />
                  </RoleBasedRoute>
                } />
                <Route path="/practice" element={
                  <RoleBasedRoute>
                    <Practice />
                  </RoleBasedRoute>
                } />
                <Route path="/subscription" element={
                  <RoleBasedRoute>
                    <Subscription />
                  </RoleBasedRoute>
                } />
                <Route path="/support" element={
                  <RoleBasedRoute>
                    <Support />
                  </RoleBasedRoute>
                } />
                <Route path="/messages" element={
                  <RoleBasedRoute>
                    <UserMessages />
                  </RoleBasedRoute>
                } />
                <Route path="/admin/messages" element={
                  <RoleBasedRoute allowedRoles={['admin']}>
                    <AdminMessages />
                  </RoleBasedRoute>
                } />
                <Route path="/accessibility" element={<AccessibilitySettings />} />
                <Route path="/auth/google/success" element={<GoogleAuthSuccess />} />
                <Route path="/terms" element={<SimpleTerms />} />
                <Route path="/technology" element={<TechShowcase />} />
                <Route path="/enterprise" element={<Enterprise />} />
                <Route path="/translator" element={<Translator />} />
                <Route path="/leaderboard" element={
                  <RoleBasedRoute>
                    <Leaderboard />
                  </RoleBasedRoute>
                } />
                <Route path="/arena" element={
                  <RoleBasedRoute>
                    <EchoArena />
                  </RoleBasedRoute>
                } />

                <Route path="/certificates" element={
                  <RoleBasedRoute>
                    <CertificatesPage />
                  </RoleBasedRoute>
                } />
                <Route path="/privacy" element={<SimplePrivacy />} />
                <Route path="/about" element={<About />} />
              </Routes>
            </Suspense>
            <ModernSessionTimeout />
          </Router>
        </GamificationProvider>
      </LearningProvider>
    </AuthProvider>
  );
}

export default AppContent; 
