'use client';

import { useEffect, useState } from 'react';

export default function SettingsPage() {
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/settings');
        const data = await res.json();
        setUserData((prev) => ({
          ...prev,
          firstName: data.user_firstname,
          lastName: data.user_lastname,
          email: data.user_email,
        }));
      } catch (err) {
        showToast('Failed to load settings', 'error');
      }
    };
    fetchData();
  }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
    setErrors({});
  };

  const validate = () => {
    const newErrors = {};
    if (userData.password && userData.password !== userData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          password: userData.password || null,
        }),
      });
      const result = await res.json();
      if (res.ok && result.success) {
        showToast('Settings saved!');
        setUserData((prev) => ({
          ...prev,
          password: '',
          confirmPassword: '',
        }));
      } else {
        showToast(result.error || 'Save failed', 'error');
      }
    } catch (err) {
      showToast('Network error', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-200 dark:bg-zinc-900 p-6 md:p-10 transition-colors relative">
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-900 shadow-lg rounded-xl p-8 border border-gray-200 dark:border-gray-700 transition-all">
        <h1 className="text-3xl font-bold text-[#4877c3] dark:text-white mb-6">Account Settings</h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid md:grid-cols-2 gap-6">
            <Input label="First Name" name="firstName" value={userData.firstName} onChange={handleChange} />
            <Input label="Last Name" name="lastName" value={userData.lastName} onChange={handleChange} />
          </div>
          <Input label="Email" name="email" type="email" value={userData.email} onChange={handleChange} />

          <hr className="border-gray-300 dark:border-gray-700 my-6" />

          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">Change Password</h2>
          <Input label="New Password" name="password" type="password" value={userData.password} onChange={handleChange} />
          <Input label="Confirm Password" name="confirmPassword" type="password" value={userData.confirmPassword} onChange={handleChange} error={errors.confirmPassword} />
          {errors.confirmPassword && <p className="text-sm text-red-500 mt-1">{errors.confirmPassword}</p>}

          <button type="submit" disabled={saving} className="w-full mt-4 px-6 py-2 rounded-md bg-[#4877c3] text-white font-semibold hover:bg-[#3a5fa1] transition disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      {toast && (
        <div className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-md shadow-md text-white transition-all duration-300 ${toast.type === 'error' ? 'bg-red-500' : 'bg-green-600'
          }`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}

function Input({ label, name, value, type = 'text', onChange, error }) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        className={`w-full px-4 py-2 rounded-md border ${error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
          } bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4877c3] transition-all`}
      />
    </div>
  );
}
