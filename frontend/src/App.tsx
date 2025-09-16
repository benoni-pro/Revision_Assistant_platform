import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import Login from './components/auth/Login';
import Dashboard from './components/dashboard/Dashboard';

// Protected Route component
interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

// Public Route component (redirect if authenticated)
interface PublicRouteProps {
  children: React.ReactNode;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return !isAuthenticated ? <>{children}</> : <Navigate to="/dashboard" replace />;
};

// Landing Page Component
const LandingPage = () => (
  <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
    <div className="flex items-center justify-center min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center px-4"
      >
        <motion.h1
          className="text-6xl font-bold text-gradient mb-6"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Revision Assistant
        </motion.h1>
        <motion.p
          className="text-xl text-secondary-700 mb-8 max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          Transform your learning experience with AI-powered personalization,
          collaborative study groups, and comprehensive progress tracking.
        </motion.p>
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <button className="btn-primary btn-lg">
                Get Started
              </button>
            </Link>
            <Link to="/login">
              <button className="btn-secondary btn-lg">
                Sign In
              </button>
            </Link>
          </div>
          <div className="text-sm text-secondary-500 mt-4">
            Join thousands of students already improving their learning
          </div>
        </motion.div>
      </motion.div>
    </div>
    
    {/* Features Section */}
    <motion.section
      className="py-20 bg-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.8 }}
    >
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center text-secondary-900 mb-12">
          Why Choose Revision Assistant?
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon="🤖"
            title="AI-Powered Learning"
            description="Get personalized study recommendations based on your learning style and progress"
          />
          <FeatureCard
            icon="👥"
            title="Collaborative Study Groups"
            description="Join study groups, share resources, and learn together with real-time collaboration"
          />
          <FeatureCard
            icon="📊"
            title="Progress Tracking"
            description="Monitor your learning journey with detailed analytics and achievement systems"
          />
        </div>
      </div>
    </motion.section>

    {/* Status Section */}
    <motion.section
      className="py-12 bg-secondary-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, delay: 1.0 }}
    >
      <div className="container mx-auto px-4 text-center">
        <h3 className="text-2xl font-semibold text-secondary-800 mb-4">
          🚀 Platform Features
        </h3>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
          <StatusCard title="Authentication" status="✅ Ready" color="success" />
          <StatusCard title="Dashboard" status="✅ Ready" color="success" />
          <StatusCard title="Study Groups" status="🔄 Coming Soon" color="warning" />
          <StatusCard title="AI Features" status="🔄 Coming Soon" color="warning" />
        </div>
        <p className="text-secondary-600 mt-6">
          Experience modern learning with our comprehensive platform!
        </p>
      </div>
    </motion.section>
  </div>
);

// Placeholder components for other routes
const StudyGroups = () => (
  <div className="text-center py-12">
    <h1 className="text-2xl font-bold text-gray-900 mb-4">Study Groups</h1>
    <p className="text-gray-600">Connect and collaborate with fellow learners</p>
    <div className="mt-8">
      <div className="bg-white rounded-lg shadow p-6 max-w-md mx-auto">
        <div className="text-4xl mb-4">👥</div>
        <h3 className="font-semibold mb-2">Coming Soon!</h3>
        <p className="text-sm text-gray-600">Study groups feature is under development</p>
      </div>
    </div>
  </div>
);

const Quizzes = () => (
  <div className="text-center py-12">
    <h1 className="text-2xl font-bold text-gray-900 mb-4">Quizzes</h1>
    <p className="text-gray-600">Test your knowledge with adaptive quizzes</p>
    <div className="mt-8">
      <div className="bg-white rounded-lg shadow p-6 max-w-md mx-auto">
        <div className="text-4xl mb-4">🧠</div>
        <h3 className="font-semibold mb-2">Coming Soon!</h3>
        <p className="text-sm text-gray-600">Interactive quiz system is being built</p>
      </div>
    </div>
  </div>
);

const Progress = () => (
  <div className="text-center py-12">
    <h1 className="text-2xl font-bold text-gray-900 mb-4">Progress Tracking</h1>
    <p className="text-gray-600">Monitor your learning journey and achievements</p>
    <div className="mt-8">
      <div className="bg-white rounded-lg shadow p-6 max-w-md mx-auto">
        <div className="text-4xl mb-4">📊</div>
        <h3 className="font-semibold mb-2">Coming Soon!</h3>
        <p className="text-sm text-gray-600">Advanced analytics and progress tracking</p>
      </div>
    </div>
  </div>
);

const Settings = () => (
  <div className="text-center py-12">
    <h1 className="text-2xl font-bold text-gray-900 mb-4">Settings</h1>
    <p className="text-gray-600">Customize your learning experience</p>
    <div className="mt-8">
      <div className="bg-white rounded-lg shadow p-6 max-w-md mx-auto">
        <div className="text-4xl mb-4">⚙️</div>
        <h3 className="font-semibold mb-2">Coming Soon!</h3>
        <p className="text-sm text-gray-600">User preferences and settings</p>
      </div>
    </div>
  </div>
);

// Helper components
interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => (
  <motion.div
    className="card-hover text-center p-6"
    whileHover={{ scale: 1.05 }}
    transition={{ type: "spring", stiffness: 300, damping: 10 }}
  >
    <div className="text-4xl mb-4">{icon}</div>
    <h3 className="text-xl font-semibold text-secondary-800 mb-2">{title}</h3>
    <p className="text-secondary-600">{description}</p>
  </motion.div>
);

interface StatusCardProps {
  title: string;
  status: string;
  color: 'success' | 'warning' | 'danger' | 'info';
}

const StatusCard: React.FC<StatusCardProps> = ({ title, status, color }) => (
  <div className="card p-4">
    <h4 className="font-medium text-secondary-800 mb-1">{title}</h4>
    <span className={`badge badge-${color}`}>{status}</span>
  </div>
);

// Main App Component
function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <div className="p-8 text-center">Register Page - Coming Soon!</div>
                </PublicRoute>
              }
            />
            
            {/* Protected routes with layout */}
            <Route
              path="/app"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
            </Route>
            
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
            </Route>
            
            <Route
              path="/study-groups/*"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<StudyGroups />} />
            </Route>
            
            <Route
              path="/quizzes"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Quizzes />} />
            </Route>
            
            <Route
              path="/progress"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Progress />} />
            </Route>
            
            <Route
              path="/resources"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<div className="p-8 text-center">Resources - Coming Soon!</div>} />
            </Route>
            
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Settings />} />
            </Route>
            
            <Route
              path="/help"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<div className="p-8 text-center">Help & Support - Coming Soon!</div>} />
            </Route>
            
            {/* Catch all - 404 */}
            <Route path="*" element={<div className="p-8 text-center">404 - Page Not Found</div>} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
