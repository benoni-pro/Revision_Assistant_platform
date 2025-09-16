import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HomeIcon,
  AcademicCapIcon,
  UserGroupIcon,
  ChartBarIcon,
  BookOpenIcon,
  Cog6ToothIcon,
  QuestionMarkCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';

interface MobileMenuProps {
  onClose: () => void;
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Study Groups', href: '/study-groups', icon: UserGroupIcon, badge: '3' },
  { name: 'Quizzes', href: '/quizzes', icon: AcademicCapIcon },
  { name: 'Progress', href: '/progress', icon: ChartBarIcon },
  { name: 'Resources', href: '/resources', icon: BookOpenIcon },
  { name: 'Help', href: '/help', icon: QuestionMarkCircleIcon },
  { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
];

export const MobileMenu: React.FC<MobileMenuProps> = ({ onClose }) => {
  const { user } = useAuth();

  return (
    <motion.div
      initial={{ x: '-100%' }}
      animate={{ x: 0 }}
      exit={{ x: '-100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="relative flex w-full max-w-xs flex-col bg-white shadow-xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0 w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">RA</span>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Revision Assistant</h1>
            <p className="text-xs text-gray-500">AI Learning Platform</p>
          </div>
        </div>
        
        <button
          onClick={onClose}
          className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>
      </div>

      {/* User profile */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0 w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.fullName}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <span className="text-primary-600 font-semibold text-sm">
                {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.fullName}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user?.email}
            </p>
            <div className="flex items-center mt-1">
              <div className={`w-2 h-2 rounded-full mr-2 ${user?.isVerified ? 'bg-green-400' : 'bg-yellow-400'}`} />
              <span className="text-xs text-gray-500">
                {user?.isVerified ? 'Verified' : 'Pending verification'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center px-3 py-3 text-base font-medium rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <item.icon className="flex-shrink-0 w-6 h-6 mr-3" />
            {item.name}
            {item.badge && (
              <span className="ml-auto bg-primary-100 text-primary-600 text-xs font-medium px-2 py-0.5 rounded-full">
                {item.badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Study streak */}
      <div className="p-4 border-t border-gray-200">
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Study Streak</span>
            <span className="text-lg">🔥</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full"
                style={{ width: `${Math.min((user?.statistics?.studyStreak?.current || 0) * 10, 100)}%` }}
              />
            </div>
            <span className="text-sm font-semibold text-gray-700">
              {user?.statistics?.studyStreak?.current || 0} days
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Best: {user?.statistics?.studyStreak?.longest || 0} days
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default MobileMenu;
