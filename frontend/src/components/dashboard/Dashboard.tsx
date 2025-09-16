import React from 'react';
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
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';

// Mock data - replace with real data from API
const mockStats = {
  todayStudyTime: 45,
  weeklyGoal: 300,
  currentStreak: 7,
  longestStreak: 21,
  completedQuizzes: 23,
  averageScore: 87,
  studyGroups: 3,
  achievements: 12,
};

const mockRecentActivity = [
  { id: 1, type: 'quiz', title: 'JavaScript Fundamentals Quiz', score: 92, time: '2 hours ago' },
  { id: 2, type: 'study', title: 'React Hooks Study Session', duration: 45, time: '4 hours ago' },
  { id: 3, type: 'group', title: 'Joined "Web Development Bootcamp"', time: '1 day ago' },
  { id: 4, type: 'achievement', title: 'Earned "Consistent Learner" badge', time: '2 days ago' },
];

const mockUpcomingTasks = [
  { id: 1, title: 'Complete Node.js Quiz', due: 'Today', priority: 'high' },
  { id: 2, title: 'Review Database Concepts', due: 'Tomorrow', priority: 'medium' },
  { id: 3, title: 'Study Group Meeting - React', due: 'Friday', priority: 'medium' },
  { id: 4, title: 'Submit Final Project', due: 'Next Week', priority: 'low' },
];

const mockRecommendations = [
  { id: 1, type: 'quiz', title: 'Advanced React Patterns', difficulty: 'Hard', estimated: '20 min' },
  { id: 2, type: 'group', title: 'JavaScript Masters Study Group', members: 24 },
  { id: 3, type: 'resource', title: 'Async JavaScript Deep Dive', category: 'Video Course' },
];

export const Dashboard: React.FC = () => {
  const { user } = useAuth();

  const statCards = [
    {
      title: 'Study Time Today',
      value: `${mockStats.todayStudyTime} min`,
      target: `Goal: ${mockStats.weeklyGoal/7} min/day`,
      icon: ClockIcon,
      color: 'blue',
      progress: (mockStats.todayStudyTime / (mockStats.weeklyGoal/7)) * 100,
    },
    {
      title: 'Current Streak',
      value: `${mockStats.currentStreak} days`,
      target: `Best: ${mockStats.longestStreak} days`,
      icon: FireIcon,
      color: 'orange',
      progress: (mockStats.currentStreak / mockStats.longestStreak) * 100,
    },
    {
      title: 'Quiz Average',
      value: `${mockStats.averageScore}%`,
      target: `${mockStats.completedQuizzes} completed`,
      icon: TrophyIcon,
      color: 'green',
      progress: mockStats.averageScore,
    },
    {
      title: 'Study Groups',
      value: mockStats.studyGroups.toString(),
      target: `${mockStats.achievements} achievements`,
      icon: UserGroupIcon,
      color: 'purple',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl font-bold text-gray-900"
          >
            Welcome back, {user?.firstName}! 👋
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-600 mt-1"
          >
            Ready to continue your learning journey?
          </motion.p>
        </div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="flex space-x-3"
        >
          <Link to="/study-groups/new">
            <Button leftIcon={<PlusIcon className="h-4 w-4" />}>
              Start Study Session
            </Button>
          </Link>
          <Link to="/quizzes">
            <Button variant="outline" leftIcon={<AcademicCapIcon className="h-4 w-4" />}>
              Take Quiz
            </Button>
          </Link>
        </motion.div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-1">{stat.target}</p>
              </div>
              <div className={`p-3 rounded-lg bg-${stat.color}-50`}>
                <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
              </div>
            </div>
            {stat.progress !== undefined && (
              <div className="mt-4">
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Progress</span>
                  <span>{Math.round(stat.progress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`bg-${stat.color}-600 h-2 rounded-full transition-all duration-300`}
                    style={{ width: `${Math.min(stat.progress, 100)}%` }}
                  />
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200"
        >
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
              <Link to="/progress" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                View All
              </Link>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {mockRecentActivity.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className={`p-2 rounded-lg ${
                    activity.type === 'quiz' ? 'bg-blue-50 text-blue-600' :
                    activity.type === 'study' ? 'bg-green-50 text-green-600' :
                    activity.type === 'group' ? 'bg-purple-50 text-purple-600' :
                    'bg-yellow-50 text-yellow-600'
                  }`}>
                    {activity.type === 'quiz' && <AcademicCapIcon className="h-4 w-4" />}
                    {activity.type === 'study' && <BookOpenIcon className="h-4 w-4" />}
                    {activity.type === 'group' && <UserGroupIcon className="h-4 w-4" />}
                    {activity.type === 'achievement' && <TrophyIcon className="h-4 w-4" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{activity.title}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>{activity.time}</span>
                      {activity.score && <span>Score: {activity.score}%</span>}
                      {activity.duration && <span>Duration: {activity.duration} min</span>}
                    </div>
                  </div>
                  <ArrowRightIcon className="h-4 w-4 text-gray-400" />
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Upcoming Tasks */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200"
        >
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Upcoming Tasks</h3>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {mockUpcomingTasks.map((task, index) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-sm">{task.title}</p>
                    <p className="text-xs text-gray-500">Due: {task.due}</p>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    task.priority === 'high' ? 'bg-red-100 text-red-800' :
                    task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {task.priority}
                  </div>
                </motion.div>
              ))}
            </div>
            <Link to="/tasks">
              <Button variant="ghost" size="sm" className="w-full mt-4">
                View All Tasks
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* AI Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-xl border border-primary-200"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">🤖 AI Recommendations</h3>
              <p className="text-sm text-gray-600">Personalized suggestions based on your learning pattern</p>
            </div>
            <Button variant="outline" size="sm">
              Refresh
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {mockRecommendations.map((rec, index) => (
              <motion.div
                key={rec.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.9 + index * 0.1 }}
                className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mb-3 ${
                  rec.type === 'quiz' ? 'bg-blue-100 text-blue-800' :
                  rec.type === 'group' ? 'bg-purple-100 text-purple-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {rec.type === 'quiz' && 'Quiz'}
                  {rec.type === 'group' && 'Study Group'}
                  {rec.type === 'resource' && 'Resource'}
                </div>
                <h4 className="font-medium text-gray-900 mb-2">{rec.title}</h4>
                <div className="text-sm text-gray-500">
                  {rec.difficulty && <span>Difficulty: {rec.difficulty}</span>}
                  {rec.estimated && <span> • {rec.estimated}</span>}
                  {rec.members && <span>{rec.members} members</span>}
                  {'category' in rec && <span>{rec.category}</span>}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Study Progress Chart Placeholder */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200"
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Study Progress This Week</h3>
            <Link to="/progress" className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center">
              View Details <ChartBarIcon className="h-4 w-4 ml-1" />
            </Link>
          </div>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-center h-32 bg-gray-50 rounded-lg">
            <div className="text-center">
              <ChartBarIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Interactive charts coming soon!</p>
              <p className="text-xs text-gray-500">Your study analytics will be displayed here</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
