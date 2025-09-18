import React from 'react';
import { SunIcon, MoonIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../../contexts/ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme, toggle, isDark } = useTheme();

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        aria-label="Toggle theme"
        onClick={toggle}
        className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 dark:hover:bg-secondary-800 dark:text-gray-200"
        title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {isDark ? <MoonIcon className="h-5 w-5" /> : <SunIcon className="h-5 w-5" />}
      </button>
      <div className="hidden md:flex items-center gap-1">
        <button
          type="button"
          onClick={() => setTheme('light')}
          className={`p-1 rounded ${theme === 'light' ? 'bg-gray-200 dark:bg-secondary-700' : ''}`}
          title="Light"
        >
          <SunIcon className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => setTheme('dark')}
          className={`p-1 rounded ${theme === 'dark' ? 'bg-gray-200 dark:bg-secondary-700' : ''}`}
          title="Dark"
        >
          <MoonIcon className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => setTheme('system')}
          className={`p-1 rounded ${theme === 'system' ? 'bg-gray-200 dark:bg-secondary-700' : ''}`}
          title="System"
        >
          <ComputerDesktopIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default ThemeToggle;

