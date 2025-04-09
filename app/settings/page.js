'use client';

import { useState } from 'react';

export default function SettingsPage() {
  const [saving, setSaving] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      alert('Changes saved!');
    }, 1000); // Simulate save
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#111827] p-6 md:p-10 transition-colors">
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-900 shadow-lg rounded-xl p-8 border border-gray-200 dark:border-gray-700 transition-all">
        <h1 className="text-3xl font-semibold text-[#4877c3] dark:text-white mb-6 transition-all">
          Account Settings
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Username
            </label>
            <input
              type="text"
              placeholder="john_doe"
              className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-900 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4877c3] transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email
            </label>
            <input
              type="email"
              placeholder="john@example.com"
              className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-900 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4877c3] transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              New Password
            </label>
            <input
              type="password"
              className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-900 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4877c3] transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 rounded-md bg-[#4877c3] text-white font-semibold hover:bg-[#3a5fa1] transition disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
