'use client';

import { useEffect, useState } from 'react';

export default function PreferencesPage() {
  const [theme, setTheme] = useState(null);
  const [prefs, setPrefs] = useState(null);
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Apply theme as soon as it's known
  useEffect(() => {
    if (theme) {
      const root = document.documentElement;
      if (theme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
      localStorage.setItem('theme', theme);
    }
  }, [theme]);

  // Load preferences (simulate API) and theme from localStorage
  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') || 'light';
    setTheme(storedTheme);

    const fetchPreferences = async () => {
      await new Promise((r) => setTimeout(r, 100));
      setPrefs({
        notifications: true,
        language: 'english',
      });
    };

    fetchPreferences();
  }, []);

  if (!prefs || !theme) return null; // Wait until both are loaded

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === 'theme') {
      setTheme(value);
    } else {
      setPrefs((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }));
    }

    setIsDirty(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await new Promise((r) => setTimeout(r, 1000));
    setSaving(false);
    setIsDirty(false);
    alert('Preferences updated successfully!');
  };

  return (
    <div className="min-h-screen bg-zinc-200 dark:bg-zinc-900 p-6 sm:p-10 transition-colors duration-300">
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-900 shadow-lg rounded-2xl p-8 border border-gray-200 dark:border-gray-700 transition-all">
        <h1 className="text-3xl font-extrabold text-[#4877c3] dark:text-white mb-6">
          Preferences
        </h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Theme Selector */}
          <section>
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4">Appearance</h2>
            <Select
              label="Theme"
              name="theme"
              value={theme}
              options={[
                { label: 'Light', value: 'light' },
                { label: 'Dark', value: 'dark' },
              ]}
              onChange={handleChange}
            />
          </section>

          {/* Notifications */}
          <section>
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4">Notifications</h2>
            <Toggle
              label="Enable Notifications"
              name="notifications"
              checked={prefs.notifications}
              onChange={handleChange}
            />
          </section>

          {/* Language */}
          <section>
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4">Language</h2>
            <Select
              label="Preferred Language"
              name="language"
              value={prefs.language}
              options={[
                { label: 'English', value: 'english' },
                { label: 'Spanish', value: 'spanish' },
                { label: 'French', value: 'french' },
              ]}
              onChange={handleChange}
            />
          </section>

          <button
            type="submit"
            disabled={saving || !isDirty}
            className="w-full mt-4 px-6 py-3 rounded-lg bg-[#4877c3] text-white font-semibold hover:bg-[#3a5fa1] transition disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>
        </form>
      </div>
    </div>
  );
}

// Reusable Select Component
function Select({ label, name, value, options, onChange }) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label}
      </label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full rounded-md bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white px-4 py-2"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function Toggle({ label, name, checked, onChange }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
        className="w-5 h-5 accent-[#4877c3]"
      />
    </div>
  );
}