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
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { usePresence } from '../../contexts/PresenceContext';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Study Groups', href: '/study-groups', icon: UserGroupIcon, badge: '3' },
  { name: 'Quizzes', href: '/quizzes', icon: AcademicCapIcon },
  { name: 'Progress', href: '/progress', icon: ChartBarIcon },
  { name: 'Resources', href: '/resources', icon: BookOpenIcon },
  { name: 'Writing', href: '/writing', icon: BookOpenIcon },
  { name: 'Help', href: '/help', icon: QuestionMarkCircleIcon },
  { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
];

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggleCollapse }) => {
  const { user } = useAuth();
  const { onlineUsers } = usePresence();

  return (
    <motion.div
      animate={{ width: collapsed ? '4rem' : '16rem' }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="flex flex-col bg-white shadow-lg border-r border-gray-200 h-screen"
    >
      {/* Logo and collapse button */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <motion.div
          animate={{ opacity: collapsed ? 0 : 1 }}
          transition={{ duration: 0.2 }}
          className="flex items-center space-x-3"
        >
          <div className="flex-shrink-0 w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">RA</span>
          </div>
          {!collapsed && (
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Revision Assistant</h1>
              <p className="text-xs text-gray-500">AI Learning Platform</p>
            </div>
          )}
        </motion.div>
        
        <button
          onClick={onToggleCollapse}
          className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        >
          {collapsed ? (
            <ChevronRightIcon className="w-5 h-5" />
          ) : (
            <ChevronLeftIcon className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* User profile */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="relative flex-shrink-0 w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
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
            {user && onlineUsers[user.id] && (
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 ring-2 ring-white" />
            )}
          </div>
          <motion.div
            animate={{ opacity: collapsed ? 0 : 1 }}
            transition={{ duration: 0.2 }}
            className="flex-1 min-w-0"
          >
            {!collapsed && (
              <div>
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
            )}
          </motion.div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
        {navigation
          .filter(item => {
            if (item.href.startsWith('/teacher')) {
              return ['teacher','manager','admin'].includes(user?.role || 'student');
            }
            return true;
          })
          .map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              `flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            {() => (
              <>
                <item.icon className={`flex-shrink-0 w-5 h-5 ${collapsed ? 'mr-0' : 'mr-3'}`} />
                <motion.span
                  animate={{ opacity: collapsed ? 0 : 1, width: collapsed ? 0 : 'auto' }}
                  transition={{ duration: 0.2 }}
                  className="truncate"
                >
                  {!collapsed && item.name}
                </motion.span>
                {!collapsed && item.badge && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="ml-auto bg-primary-100 text-primary-600 text-xs font-medium px-2 py-0.5 rounded-full"
                  >
                    {item.badge}
                  </motion.span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Study streak */}
      <motion.div
        animate={{ opacity: collapsed ? 0 : 1 }}
        transition={{ duration: 0.2 }}
        className="p-4 border-t border-gray-200"
      >
        {!collapsed && (
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
        )}
      </motion.div>
    </motion.div>
  );
};

export default Sidebar;
