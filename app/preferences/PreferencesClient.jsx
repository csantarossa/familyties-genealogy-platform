"use client";

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { useUser } from '@/app/contexts/UserContext';
import { useSafeToast } from '../lib/toast';

export default function PreferencesClient({ treeId }) {
  const [theme, setTheme] = useState(null);
  const [savedTheme, setSavedTheme] = useState(null);
  const [prefs, setPrefs] = useState(null);
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const { notificationsEnabled, setNotificationsEnabled } = useUser();
  const toast = useSafeToast();
  const router = useRouter();

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') || 'light';
    setTheme(storedTheme);
    setSavedTheme(storedTheme);

    const fetchPreferences = async () => {
      await new Promise((r) => setTimeout(r, 100));
      setPrefs({
        language: 'english',
      });
    };

    fetchPreferences();
  }, []);

  useEffect(() => {
    // Wait until client-side mount before modifying the DOM
    if (theme !== null) {
      const root = document.documentElement;
      root.classList.remove('dark', 'light'); // clear any old class
      root.classList.add(theme);
    }
  }, [theme]);

  if (!prefs || theme === null) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === 'theme') {
      setTheme(value);
    } else if (name === 'notifications') {
      setNotificationsEnabled(checked);
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

    localStorage.setItem('theme', theme);
    setSavedTheme(theme);
    setSaving(false);
    setIsDirty(false);

    if (notificationsEnabled) {
      toast.success('Preferences updated successfully!');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-200 dark:bg-zinc-900 p-6 sm:p-10 transition-colors duration-300 relative">
      <button
        onClick={() => router.push(`/trees/${treeId || ''}`)}
        className="absolute top-6 left-6 z-50 bg-white dark:bg-zinc-800 text-black dark:text-white p-2 px-[10px] rounded-md shadow-xl hover:bg-gray-100 dark:hover:bg-zinc-700 transition"
      >
        <ChevronLeft size={18} />
      </button>

      <div className="max-w-2xl mx-auto bg-white dark:bg-black shadow-2xl rounded-2xl p-8 border border-gray-200 dark:border-gray-700 transition-all animate-fade-in-up">
        <h1 className="text-3xl font-extrabold text-[#4877c3] dark:text-white mb-6">
          Preferences
        </h1>

        <form onSubmit={handleSubmit} className="space-y-8">
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

          <section>
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4">Notifications</h2>
            <Toggle
              label="Enable Notifications"
              name="notifications"
              checked={notificationsEnabled}
              onChange={handleChange}
            />
          </section>

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

      <style jsx global>{`
        input[type='checkbox'] {
          accent-color: black !important;
        }
        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out both;
        }
      `}</style>
    </div>
  );
}

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
        className="w-full rounded-md bg-white dark:bg-black border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-200 px-4 py-2 pr-10"
        style={{ backgroundPosition: 'calc(100% - 1.25rem) center' }}
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
        className="w-5 h-5"
      />
    </div>
  );
}
