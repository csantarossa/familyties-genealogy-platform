'use client';

import { useEffect, useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSafeToast } from '../lib/toast';
import { useUser } from '../contexts/UserContext'; // Import context

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
  const router = useRouter();
  const toast = useSafeToast();
  const { user } = useUser(); // Get current user

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user?.id }), // Send user ID
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to fetch');

        setUserData((prev) => ({
          ...prev,
          firstName: data.user_firstname,
          lastName: data.user_lastname,
          email: data.user_email,
        }));
      } catch (err) {
        toast.error('Failed to load settings');
      }
    };

    if (user?.id) {
      fetchData();
    }
  }, [user]);

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
          userId: user?.id, // Pass current user's ID
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          password: userData.password || null,
        }),
      });
      const result = await res.json();
      if (res.ok && result.success) {
        toast.success('Settings saved!');
        setUserData((prev) => ({
          ...prev,
          password: '',
          confirmPassword: '',
        }));
      } else {
        toast.error(result.error || 'Save failed');
      }
    } catch (err) {
      toast.error('Network error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-200 dark:bg-zinc-900 p-6 sm:p-10 transition-colors duration-300 relative">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="absolute top-6 left-6 z-50 bg-white dark:bg-zinc-800 text-black dark:text-white p-2 px-[10px] rounded-md shadow-xl hover:bg-gray-100 dark:hover:bg-zinc-700 transition"
      >
        <ChevronLeft size={18} />
      </button>

      <div className="max-w-2xl mx-auto bg-white dark:bg-black shadow-2xl rounded-2xl p-8 border border-gray-200 dark:border-gray-700 transition-all animate-fade-in-up">
        <h1 className="text-3xl font-extrabold text-[#4877c3] dark:text-white mb-6">
          Account Settings
        </h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4">Profile</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Input label="First Name" name="firstName" value={userData.firstName} onChange={handleChange} />
              <Input label="Last Name" name="lastName" value={userData.lastName} onChange={handleChange} />
            </div>
            <Input label="Email" name="email" type="email" value={userData.email} onChange={handleChange} />
          </section>

          <hr className="border-gray-300 dark:border-gray-700" />

          <section>
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4">Change Password</h2>
            <Input label="New Password" name="password" type="password" value={userData.password} onChange={handleChange} />
            <Input
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              value={userData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
            />
            {errors.confirmPassword && <p className="text-sm text-red-500 mt-1">{errors.confirmPassword}</p>}
          </section>

          <button
            type="submit"
            disabled={saving}
            className="w-full mt-4 px-6 py-3 rounded-lg bg-[#4877c3] text-white font-semibold hover:bg-[#3a5fa1] transition disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      <style jsx global>{`
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

function Input({ label, name, value, type = 'text', onChange, error }) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        className={`w-full px-4 py-2 rounded-md border ${error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4877c3] transition-all`}
      />
    </div>
  );
}