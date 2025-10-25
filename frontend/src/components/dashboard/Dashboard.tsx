import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ClockIcon,
  FireIcon,
  TrophyIcon,
  UserGroupIcon,
  BookOpenIcon,
  AcademicCapIcon,
  ChartBarIcon,
  PlusIcon,
  ArrowRightIcon,
  CpuChipIcon,
  SparklesIcon,
  LightBulbIcon,
  ClipboardDocumentListIcon,
  ChatBubbleLeftRightIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import AIGeneratedQuiz from '../quizzes/AIGeneratedQuiz';
import StudyAssistant from '../ai/StudyAssistant';
import OllamaService from '../../services/ollamaService';
import DashboardService, { DashboardStats } from '../../services/dashboardService';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [showAIQuiz, setShowAIQuiz] = useState(false);
  const [showStudyAssistant, setShowStudyAssistant] = useState(false);
  const [aiConnectionStatus, setAiConnectionStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiFeatures, setAiFeatures] = useState({
    personalizedRecommendations: [],
    studyInsights: null,
    motivationalMessage: null
  });

  useEffect(() => {
    checkAIConnection();
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const dashboardStats = await DashboardService.getStats();
      setStats(dashboardStats);
      loadAIFeatures();
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkAIConnection = async () => {
    try {
      const isConnected = await OllamaService.checkConnection();
      setAiConnectionStatus(isConnected ? 'connected' : 'disconnected');
    } catch (error) {
      setAiConnectionStatus('disconnected');
    }
  };

  const loadAIFeatures = async () => {
    if (aiConnectionStatus === 'connected' && stats) {
      try {
        const recommendations = await OllamaService.generateMotivationalMessage(
          `Completed ${stats.completedQuizzes} quizzes with ${stats.averageScore}% average`,
          user?.subjects?.[0]?.name || 'General'
        );
        setAiFeatures(prev => ({
          ...prev,
          motivationalMessage: recommendations
        }));
      } catch (error) {
        console.error('Failed to load AI features:', error);
      }
    }
  };

  const handleQuizGenerated = (quiz: any) => {
    console.log('Generated quiz:', quiz);
    // Here you would typically save the quiz to your backend
    // and redirect to the quiz taking page
  };

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ComponentType<any>;
    color: string;
    trend?: string;
  }> = ({ title, value, icon: Icon, color, trend }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend && <p className="text-sm text-green-600">{trend}</p>}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </motion.div>
  );

  const ActivityItem: React.FC<{
    activity: any;
  }> = ({ activity }) => (
    <div className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg">
      <div className={`p-2 rounded-full ${
        activity.type === 'quiz' ? 'bg-blue-100' :
        activity.type === 'study' ? 'bg-green-100' :
        activity.type === 'group' ? 'bg-purple-100' :
        'bg-yellow-100'
      }`}>
        {activity.type === 'quiz' && <AcademicCapIcon className="h-4 w-4 text-blue-600" />}
        {activity.type === 'study' && <BookOpenIcon className="h-4 w-4 text-green-600" />}
        {activity.type === 'group' && <UserGroupIcon className="h-4 w-4 text-purple-600" />}
        {activity.type === 'achievement' && <TrophyIcon className="h-4 w-4 text-yellow-600" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{activity.title}</p>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          {activity.score && <span>Score: {activity.score}%</span>}
          {activity.duration && <span>Duration: {activity.duration} min</span>}
          <span>{activity.time}</span>
        </div>
      </div>
    </div>
  );

  const TaskItem: React.FC<{
    task: any;
  }> = ({ task }) => (
    <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
      <div className="flex items-center space-x-3">
        <div className={`w-3 h-3 rounded-full ${
          task.priority === 'high' ? 'bg-red-500' :
          task.priority === 'medium' ? 'bg-yellow-500' :
          'bg-green-500'
        }`} />
        <div>
          <p className="text-sm font-medium text-gray-900">{task.title}</p>
          <p className="text-sm text-gray-500">Due: {task.due}</p>
        </div>
      </div>
      <ArrowRightIcon className="h-4 w-4 text-gray-400" />
    </div>
  );

  const RecommendationItem: React.FC<{
    recommendation: any;
  }> = ({ recommendation }) => (
    <div className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="text-sm font-medium text-gray-900">{recommendation.title}</h4>
          <div className="flex items-center space-x-2 mt-1">
            {recommendation.difficulty && (
              <span className={`text-xs px-2 py-1 rounded-full ${
                recommendation.difficulty === 'Hard' ? 'bg-red-100 text-red-800' :
                recommendation.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
                {recommendation.difficulty}
              </span>
            )}
            {recommendation.estimated && (
              <span className="text-xs text-gray-500">{recommendation.estimated}</span>
            )}
            {recommendation.members && (
              <span className="text-xs text-gray-500">{recommendation.members} members</span>
            )}
            {recommendation.category && (
              <span className="text-xs text-gray-500">{recommendation.category}</span>
            )}
          </div>
        </div>
        <button className="text-blue-600 hover:text-blue-800">
          <ArrowRightIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Failed to load dashboard data</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.firstName || 'Student'}! 👋
          </h1>
          <p className="text-gray-600 mt-1">
            Ready to continue your learning journey?
          </p>
        </div>
        <div className="flex space-x-3">
          {aiConnectionStatus === 'connected' && (
            <>
              <Button
                onClick={() => setShowAIQuiz(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 flex items-center"
              >
                <SparklesIcon className="h-4 w-4 mr-2" />
                AI Quiz Generator
              </Button>
              <Button
                onClick={() => setShowStudyAssistant(true)}
                className="bg-gradient-to-r from-green-600 to-teal-600 text-white hover:from-green-700 hover:to-teal-700 flex items-center"
              >
                <CpuChipIcon className="h-4 w-4 mr-2" />
                AI Study Assistant
              </Button>
            </>
          )}
        </div>
      </div>

      {/* AI Status Banner */}
      {aiConnectionStatus === 'connected' && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4"
        >
          <div className="flex items-center">
            <CpuChipIcon className="h-6 w-6 text-blue-600 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-blue-900">AI Assistant Active</h3>
              <p className="text-sm text-blue-700">
                Your AI study assistant is ready to help with personalized quizzes, study guides, and explanations.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Today's Study Time"
          value={`${stats.todayStudyTime} min`}
          icon={ClockIcon}
          color="bg-blue-500"
        />
        <StatCard
          title="Current Streak"
          value={`${stats.currentStreak} days`}
          icon={FireIcon}
          color="bg-orange-500"
          trend={stats.currentStreak > 0 ? "Keep it up!" : undefined}
        />
        <StatCard
          title="Average Score"
          value={`${stats.averageScore}%`}
          icon={TrophyIcon}
          color="bg-yellow-500"
        />
        <StatCard
          title="Study Groups"
          value={stats.studyGroups}
          icon={UserGroupIcon}
          color="bg-purple-500"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
            </div>
            <div className="p-6">
              <div className="space-y-1">
                {stats.recentActivity.length > 0 ? (
                  stats.recentActivity.map((activity) => (
                    <ActivityItem key={activity.id} activity={activity} />
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-4">No recent activity</p>
                )}
              </div>
              <div className="mt-4">
                <Link
                  to="/progress"
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                >
                  View all activity
                  <ArrowRightIcon className="h-4 w-4 ml-1" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Tasks */}
        <div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Upcoming Tasks</h2>
            </div>
            <div className="p-6">
              <div className="space-y-1">
                {stats.upcomingTasks.length > 0 ? (
                  stats.upcomingTasks.map((task) => (
                    <TaskItem key={task.id} task={task} />
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-4">No upcoming tasks</p>
                )}
              </div>
              <div className="mt-4">
                <Link
                  to="/quizzes"
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                >
                  View all tasks
                  <ArrowRightIcon className="h-4 w-4 ml-1" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI-Powered Recommendations */}
      {aiConnectionStatus === 'connected' && aiFeatures.motivationalMessage && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center">
              <SparklesIcon className="h-5 w-5 text-purple-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">AI Insights</h2>
            </div>
          </div>
          <div className="p-6">
            <p className="text-gray-700">{aiFeatures.motivationalMessage}</p>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          to="/quizzes"
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow text-center"
        >
          <AcademicCapIcon className="h-8 w-8 text-blue-600 mx-auto mb-3" />
          <h3 className="font-medium text-gray-900">Take a Quiz</h3>
          <p className="text-sm text-gray-500 mt-1">Test your knowledge</p>
        </Link>
        
        <Link
          to="/study-groups"
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow text-center"
        >
          <UserGroupIcon className="h-8 w-8 text-purple-600 mx-auto mb-3" />
          <h3 className="font-medium text-gray-900">Join Study Group</h3>
          <p className="text-sm text-gray-500 mt-1">Learn with others</p>
        </Link>
        
        <Link
          to="/progress"
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow text-center"
        >
          <ChartBarIcon className="h-8 w-8 text-green-600 mx-auto mb-3" />
          <h3 className="font-medium text-gray-900">View Progress</h3>
          <p className="text-sm text-gray-500 mt-1">Track your growth</p>
        </Link>
        
        <Link
          to="/resources"
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow text-center"
        >
          <BookOpenIcon className="h-8 w-8 text-orange-600 mx-auto mb-3" />
          <h3 className="font-medium text-gray-900">Browse Resources</h3>
          <p className="text-sm text-gray-500 mt-1">Find study materials</p>
        </Link>
      </div>

      {/* AI Modals */}
      {showAIQuiz && (
        <AIGeneratedQuiz
          onQuizGenerated={handleQuizGenerated}
          onClose={() => setShowAIQuiz(false)}
        />
      )}

      {showStudyAssistant && (
        <StudyAssistant
          onClose={() => setShowStudyAssistant(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;
