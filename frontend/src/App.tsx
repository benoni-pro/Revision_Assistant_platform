import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import VerifyEmail from './components/auth/VerifyEmail';
import Dashboard from './components/dashboard/Dashboard';
import StudyGroupsPage from './components/study-groups/StudyGroupsPage';
import GroupRoom from './components/study-groups/GroupRoom';
import QuizzesPage from './components/quizzes/QuizzesPage';
import TakeQuizPage from './components/quizzes/TakeQuizPage';
import ProgressPage from './components/progress/ProgressPage';
import ResourcesPage from './components/resources/ResourcesPage';
import PrewritingPage from './components/writing/PrewritingPage';
import OutlinePage from './components/writing/OutlinePage';
import DraftPage from './components/writing/DraftPage';
import TeacherDashboard from './components/teacher/TeacherDashboard';
import RubricsPage from './components/teacher/RubricsPage';
import Settings from "./components/settings/Settings";
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
  <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
    {/* Navigation Bar */}
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-3xl">📚</span>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              LearnKids
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/login">
              <button className="px-6 py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors">
                Sign In
              </button>
            </Link>
            <Link to="/register">
              <button className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full hover:shadow-lg transition-all transform hover:scale-105 font-medium">
                Start Free Trial
              </button>
            </Link>
          </div>
        </div>
      </div>
    </nav>

    {/* Hero Section */}
    <div className="container mx-auto px-4 py-16">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
            🎯 Trusted by 10,000+ Parents
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Help Your Child
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Excel in Studies
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Empower your homeschooling journey with AI-powered tools designed for parents. 
            Track progress, create personalized lessons, and make learning fun for your children.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/register">
              <button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full text-lg font-semibold hover:shadow-xl transition-all transform hover:scale-105 flex items-center justify-center">
                <span>Start Learning Free</span>
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </Link>
            <button className="px-8 py-4 bg-white text-gray-700 rounded-full text-lg font-semibold border-2 border-gray-200 hover:border-blue-600 hover:text-blue-600 transition-all">
              Watch Demo
            </button>
          </div>
          <div className="mt-8 flex items-center space-x-6 text-sm text-gray-600">
            <div className="flex items-center">
              <span className="text-yellow-400 mr-1">★★★★★</span>
              <span>4.9/5 Rating</span>
            </div>
            <div>✓ No Credit Card Required</div>
            <div>✓ Free 14-Day Trial</div>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative"
        >
          <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl p-8 shadow-2xl">
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white text-xl">👧</div>
                <div>
                  <div className="font-semibold text-gray-900">Emma's Progress</div>
                  <div className="text-sm text-gray-500">Grade 4 Mathematics</div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Multiplication</span>
                  <span className="text-sm font-semibold text-green-600">95%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full" style={{width: '95%'}}></div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Reading Comprehension</span>
                  <span className="text-sm font-semibold text-blue-600">88%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full" style={{width: '88%'}}></div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                <div className="text-sm text-gray-600">Weekly Goal</div>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">🔥</span>
                  <span className="font-semibold text-gray-900">7 Days Streak!</span>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute -top-4 -right-4 w-20 h-20 bg-yellow-400 rounded-full flex items-center justify-center text-3xl animate-bounce-gentle">
            ⭐
          </div>
        </motion.div>
      </div>
    </div>
    
    {/* Features Section */}
    <motion.section
      className="py-20 bg-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.4 }}
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Everything Parents Need
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            All-in-one platform to manage your child's learning journey effectively
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon="📊"
            title="Progress Tracking"
            description="Monitor your child's learning progress with detailed analytics, strengths, and areas needing attention in real-time"
          />
          <FeatureCard
            icon="🎯"
            title="Personalized Lessons"
            description="AI-powered curriculum that adapts to your child's learning pace, style, and interests for maximum engagement"
          />
          <FeatureCard
            icon="🎮"
            title="Fun Learning Games"
            description="Educational games and quizzes that make learning enjoyable while reinforcing key concepts effectively"
          />
          <FeatureCard
            icon="📝"
            title="Custom Assignments"
            description="Create and schedule tailored assignments, homework, and revision tasks that match your teaching goals"
          />
          <FeatureCard
            icon="🤖"
            title="AI Study Assistant"
            description="24/7 AI tutor to help with homework, explain difficult concepts, and provide instant feedback"
          />
          <FeatureCard
            icon="👪"
            title="Parent Dashboard"
            description="Comprehensive overview of all your children's activities, achievements, and upcoming tasks in one place"
          />
        </div>
      </div>
    </motion.section>

    {/* Benefits Section */}
    <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Why Parents Love LearnKids
            </h2>
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">✓</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Save Time & Effort</h3>
                  <p className="text-gray-600">Pre-built lessons and automatic grading save hours of preparation time</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">✓</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Proven Results</h3>
                  <p className="text-gray-600">Children improve test scores by an average of 35% within 3 months</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">✓</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Engage Your Kids</h3>
                  <p className="text-gray-600">Gamified learning keeps children motivated and excited about studying</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-3xl p-8 shadow-xl">
            <div className="text-center mb-6">
              <div className="inline-block px-4 py-2 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium mb-4">
                ⭐ Parent Testimonial
              </div>
              <p className="text-lg text-gray-700 italic leading-relaxed">
                "LearnKids transformed our homeschooling experience. My daughter went from struggling with math to actually enjoying it! The progress tracking helps me identify exactly where she needs help."
              </p>
              <div className="mt-6 flex items-center justify-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full"></div>
                <div className="text-left">
                  <div className="font-semibold text-gray-900">Sarah Johnson</div>
                  <div className="text-sm text-gray-500">Mother of 2, Homeschooling 3 years</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* CTA Section */}
    <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-4xl sm:text-5xl font-bold mb-6">
          Start Your Free 14-Day Trial Today
        </h2>
        <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
          Join thousands of parents who are making homeschooling easier and more effective
        </p>
        <Link to="/register">
          <button className="px-10 py-4 bg-white text-blue-600 rounded-full text-lg font-bold hover:shadow-2xl transition-all transform hover:scale-105">
            Get Started Free - No Credit Card Required
          </button>
        </Link>
        <div className="mt-6 text-sm opacity-75">
          ✓ Cancel anytime  ✓ Full access to all features  ✓ Email support included
        </div>
      </div>
    </section>

    {/* Footer */}
    <footer className="bg-gray-900 text-gray-400 py-12">
      <div className="container mx-auto px-4 text-center">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <span className="text-3xl">📚</span>
          <span className="text-2xl font-bold text-white">LearnKids</span>
        </div>
        <p className="mb-4">Making homeschooling easier for parents, one child at a time.</p>
        <div className="text-sm">
          © 2024 LearnKids. All rights reserved.
        </div>
      </div>
    </footer>
  </div>
);

// Placeholder routes removed (Pages now exist in components directory)

// Helper components
interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => (
  <motion.div
    className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all p-8 text-center transform hover:-translate-y-2 duration-300"
    whileHover={{ scale: 1.02 }}
    transition={{ type: "spring", stiffness: 300, damping: 10 }}
  >
    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center text-3xl">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
    <p className="text-gray-600 leading-relaxed">{description}</p>
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
                  <Register />
                </PublicRoute>
              }
            />

            <Route
              path="/verify-email"
              element={
                <PublicRoute>
                  <VerifyEmail />
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
              <Route index element={<StudyGroupsPage />} />
              <Route path=":id" element={<GroupRoom />} />
            </Route>
            
            <Route
              path="/quizzes"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<QuizzesPage />} />
              <Route path=":id" element={<TakeQuizPage />} />
            </Route>
            
            <Route
              path="/progress"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<ProgressPage />} />
            </Route>
            
            <Route
              path="/resources"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<ResourcesPage />} />
            </Route>

            <Route
              path="/writing"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<PrewritingPage />} />
              <Route path="outline" element={<OutlinePage />} />
              <Route path="draft" element={<DraftPage />} />
            </Route>

            <Route
              path="/teacher"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<TeacherDashboard />} />
              <Route path="rubrics" element={<RubricsPage />} />
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
