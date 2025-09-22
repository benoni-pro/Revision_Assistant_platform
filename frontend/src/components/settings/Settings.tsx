import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  UserIcon, 
  Cog6ToothIcon, 
  AcademicCapIcon, 
  BellIcon, 
  ShieldCheckIcon,
  PaintBrushIcon,
  CpuChipIcon,
  GlobeAltIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import OllamaService from '../../services/ollamaService';

interface SettingsSection {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  description: string;
}

const settingsSections: SettingsSection[] = [
  {
    id: 'profile',
    title: 'Profile & Account',
    icon: UserIcon,
    description: 'Manage your personal information and account settings'
  },
  {
    id: 'preferences',
    title: 'Learning Preferences',
    icon: AcademicCapIcon,
    description: 'Customize your learning experience and study habits'
  },
  {
    id: 'notifications',
    title: 'Notifications',
    icon: BellIcon,
    description: 'Control how and when you receive notifications'
  },
  {
    id: 'privacy',
    title: 'Privacy & Security',
    icon: ShieldCheckIcon,
    description: 'Manage your privacy settings and security preferences'
  },
  {
    id: 'appearance',
    title: 'Appearance',
    icon: PaintBrushIcon,
    description: 'Customize the look and feel of your interface'
  },
  {
    id: 'ai',
    title: 'AI Assistant',
    icon: CpuChipIcon,
    description: 'Configure AI features and Ollama integration'
  },
  {
    id: 'accessibility',
    title: 'Accessibility',
    icon: EyeIcon,
    description: 'Make the platform more accessible for your needs'
  }
];

const Settings: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [activeSection, setActiveSection] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [aiConnectionStatus, setAiConnectionStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState('llama3.2:latest');

  // Profile settings
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    bio: user?.bio || '',
    phone: user?.phone || '',
    location: {
      country: user?.location?.country || '',
      city: user?.location?.city || ''
    }
  });

  // Learning preferences
  const [learningPrefs, setLearningPrefs] = useState({
    academicLevel: user?.academicLevel || 'undergraduate',
    subjects: user?.subjects || [],
    learningStyle: user?.learningStyle || {
      visual: 25,
      auditory: 25,
      kinesthetic: 25,
      readingWriting: 25
    },
    preferredStudyTime: user?.preferredStudyTime || {
      morning: false,
      afternoon: true,
      evening: true,
      night: false
    },
    studyEnvironment: user?.studyEnvironment || {
      noise_level: 'quiet',
      lighting: 'bright',
      temperature: 'moderate'
    }
  });

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    email: {
      studyReminders: true,
      quizResults: true,
      groupUpdates: true,
      achievements: true,
      weeklyReports: true
    },
    push: {
      studyReminders: true,
      quizResults: false,
      groupUpdates: true,
      achievements: true
    },
    inApp: {
      studyReminders: true,
      quizResults: true,
      groupUpdates: true,
      achievements: true,
      systemUpdates: true
    }
  });

  // Privacy settings
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'friends', // public, friends, private
    showProgress: true,
    showAchievements: true,
    allowDataCollection: true,
    shareAnalytics: false
  });

  // Appearance settings
  const [appearanceSettings, setAppearanceSettings] = useState({
    theme: 'light', // light, dark, auto
    fontSize: 'medium', // small, medium, large
    colorScheme: 'blue', // blue, green, purple, orange
    sidebarCollapsed: false,
    animations: true
  });

  // AI settings
  const [aiSettings, setAiSettings] = useState({
    enabled: true,
    model: 'llama3.2:latest',
    temperature: 0.7,
    maxTokens: 2000,
    autoGenerateQuizzes: false,
    personalizedStudyPlans: true,
    smartRecommendations: true
  });

  // Accessibility settings
  const [accessibilitySettings, setAccessibilitySettings] = useState({
    highContrast: false,
    reducedMotion: false,
    screenReader: false,
    keyboardNavigation: true,
    focusIndicators: true
  });

  useEffect(() => {
    checkAiConnection();
  }, []);

  const checkAiConnection = async () => {
    try {
      const isConnected = await OllamaService.checkConnection();
      setAiConnectionStatus(isConnected ? 'connected' : 'disconnected');
      
      if (isConnected) {
        const models = await OllamaService.getAvailableModels();
        setAvailableModels(models);
      }
    } catch (error) {
      setAiConnectionStatus('disconnected');
    }
  };

  const handleSave = async (section: string) => {
    setIsLoading(true);
    try {
      // Here you would typically save to backend
      console.log(`Saving ${section} settings:`, {
        profile: profileData,
        learning: learningPrefs,
        notifications: notificationSettings,
        privacy: privacySettings,
        appearance: appearanceSettings,
        ai: aiSettings,
        accessibility: accessibilitySettings
      });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update user context
      updateUser({
        ...profileData,
        academicLevel: learningPrefs.academicLevel,
        subjects: learningPrefs.subjects,
        learningStyle: learningPrefs.learningStyle,
        preferredStudyTime: learningPrefs.preferredStudyTime,
        studyEnvironment: learningPrefs.studyEnvironment
      });
      
      alert(`${section} settings saved successfully!`);
    } catch (error) {
      alert('Failed to save settings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderProfileSection = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
          <input
            type="text"
            value={profileData.firstName}
            onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
          <input
            type="text"
            value={profileData.lastName}
            onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
        <input
          type="email"
          value={profileData.email}
          disabled
          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
        />
        <p className="text-sm text-gray-500 mt-1">Email cannot be changed</p>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
        <textarea
          value={profileData.bio}
          onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Tell us about yourself..."
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
          <input
            type="tel"
            value={profileData.phone}
            onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
          <input
            type="text"
            value={profileData.location.country}
            onChange={(e) => setProfileData({
              ...profileData, 
              location: {...profileData.location, country: e.target.value}
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );

  const renderLearningSection = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Academic Level</label>
        <select
          value={learningPrefs.academicLevel}
          onChange={(e) => setLearningPrefs({...learningPrefs, academicLevel: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="high_school">High School</option>
          <option value="undergraduate">Undergraduate</option>
          <option value="graduate">Graduate</option>
          <option value="professional">Professional</option>
          <option value="other">Other</option>
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Learning Style Preferences</label>
        <div className="space-y-4">
          {Object.entries(learningPrefs.learningStyle).map(([style, value]) => (
            <div key={style}>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700 capitalize">
                  {style.replace(/([A-Z])/g, ' $1').trim()}
                </span>
                <span className="text-sm text-gray-500">{value}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={value}
                onChange={(e) => setLearningPrefs({
                  ...learningPrefs,
                  learningStyle: {...learningPrefs.learningStyle, [style]: parseInt(e.target.value)}
                })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          ))}
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Study Times</label>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(learningPrefs.preferredStudyTime).map(([time, enabled]) => (
            <label key={time} className="flex items-center">
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => setLearningPrefs({
                  ...learningPrefs,
                  preferredStudyTime: {...learningPrefs.preferredStudyTime, [time]: e.target.checked}
                })}
                className="mr-2"
              />
              <span className="text-sm text-gray-700 capitalize">{time}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAiSection = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div>
          <h3 className="text-lg font-medium text-gray-900">AI Connection Status</h3>
          <p className="text-sm text-gray-500">Ollama AI Service</p>
        </div>
        <div className="flex items-center">
          {aiConnectionStatus === 'checking' && (
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          )}
          {aiConnectionStatus === 'connected' && (
            <div className="flex items-center text-green-600">
              <CheckIcon className="h-5 w-5 mr-1" />
              <span className="text-sm font-medium">Connected</span>
            </div>
          )}
          {aiConnectionStatus === 'disconnected' && (
            <div className="flex items-center text-red-600">
              <XMarkIcon className="h-5 w-5 mr-1" />
              <span className="text-sm font-medium">Disconnected</span>
            </div>
          )}
        </div>
      </div>
      
      {aiConnectionStatus === 'connected' && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">AI Model</label>
            <select
              value={selectedModel}
              onChange={(e) => {
                setSelectedModel(e.target.value);
                OllamaService.setModel(e.target.value);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {availableModels.map(model => (
                <option key={model} value={model}>{model}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">AI Features</label>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={aiSettings.autoGenerateQuizzes}
                  onChange={(e) => setAiSettings({...aiSettings, autoGenerateQuizzes: e.target.checked})}
                  className="mr-3"
                />
                <span className="text-sm text-gray-700">Auto-generate quizzes from study materials</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={aiSettings.personalizedStudyPlans}
                  onChange={(e) => setAiSettings({...aiSettings, personalizedStudyPlans: e.target.checked})}
                  className="mr-3"
                />
                <span className="text-sm text-gray-700">Personalized study plans</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={aiSettings.smartRecommendations}
                  onChange={(e) => setAiSettings({...aiSettings, smartRecommendations: e.target.checked})}
                  className="mr-3"
                />
                <span className="text-sm text-gray-700">Smart content recommendations</span>
              </label>
            </div>
          </div>
        </>
      )}
      
      {aiConnectionStatus === 'disconnected' && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            To use AI features, please ensure Ollama is running on your system at http://localhost:11434
          </p>
          <button
            onClick={checkAiConnection}
            className="mt-2 px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
          >
            Retry Connection
          </button>
        </div>
      )}
    </div>
  );

  const renderSection = () => {
    switch (activeSection) {
      case 'profile':
        return renderProfileSection();
      case 'preferences':
        return renderLearningSection();
      case 'ai':
        return renderAiSection();
      default:
        return <div>Section coming soon...</div>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="mt-2 text-gray-600">Manage your account settings and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <nav className="space-y-2">
            {settingsSections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                    activeSection === section.id
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  <div>
                    <div className="font-medium">{section.title}</div>
                    <div className="text-sm text-gray-500">{section.description}</div>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main content */}
        <div className="lg:col-span-3">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {settingsSections.find(s => s.id === activeSection)?.title}
              </h2>
              <button
                onClick={() => handleSave(activeSection)}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
            
            {renderSection()}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
