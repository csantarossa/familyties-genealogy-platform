'use client';

import { useState } from 'react';

export default function PreferencesPage() {
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('en');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#111827] p-6 md:p-10 transition-colors">
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-900 shadow-lg rounded-xl p-8 border border-gray-200 dark:border-gray-700 transition-all">
        <h1 className="text-3xl font-semibold text-[#4877c3] dark:text-white mb-6 transition-all">
          Preferences
        </h1>

        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <label className="text-gray-700 dark:text-gray-300">Enable Dark Mode</label>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`w-12 h-6 rounded-full relative transition ${
                darkMode ? 'bg-[#4877c3]' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute left-1 top-1 w-4 h-4 rounded-full bg-white shadow-md transition transform ${
                  darkMode ? 'translate-x-6' : ''
                }`}
              ></span>
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-900 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4877c3] transition-all"
            >
              <option value="en">English</option>
              <option value="fr">French</option>
              <option value="es">Spanish</option>
            </select>
          </div>

          <button
            className="mt-4 px-6 py-2 rounded-md bg-[#4877c3] text-white font-semibold hover:bg-[#3a5fa1] transition"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
}
