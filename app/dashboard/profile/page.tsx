'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Check, Loader2 } from 'lucide-react';

const businessTypes = [
  'Healthcare & Medical',
  'Beauty & Wellness',
  'Legal Services',
  'Real Estate',
  'Automotive',
  'Home Services',
  'Education & Training',
  'Financial Services',
  'Restaurant & Food',
  'Fitness & Gym',
  'Technology Services',
  'Retail',
  'Other',
];

const serviceHoursOptions = [
  '9 AM - 5 PM (Standard Business Hours)',
  '8 AM - 6 PM (Extended Hours)',
  '24/7 (Always Open)',
  'Weekends Only',
  'Evenings Only (5 PM - 10 PM)',
  'Custom Service Hours',
];

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();

  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [customBusinessType, setCustomBusinessType] = useState('');
  const [serviceHours, setServiceHours] = useState('');
  const [customServiceHours, setCustomServiceHours] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!user) return;

    setName(user.name ?? '');
    setBusinessName(user.business_name ?? '');
    setPhoneNumber(user.phone_number ?? '');

    const type = user.business_type ?? '';
    if (type && !businessTypes.includes(type)) {
      setBusinessType('Other');
      setCustomBusinessType(type);
    } else {
      setBusinessType(type);
      setCustomBusinessType('');
    }

    const hours = user.service_hours ?? '';
    if (hours && !serviceHoursOptions.includes(hours)) {
      setServiceHours('Custom Service Hours');
      setCustomServiceHours(user.custom_service_hours ?? hours);
    } else {
      setServiceHours(hours);
      setCustomServiceHours(user.custom_service_hours ?? '');
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      await updateProfile({
        name: name || undefined,
        business_name: businessName || undefined,
        phone_number: phoneNumber || undefined,
        business_type:
          businessType === 'Other'
            ? customBusinessType || undefined
            : businessType || undefined,
        service_hours:
          serviceHours === 'Custom Service Hours'
            ? customServiceHours || undefined
            : serviceHours || undefined,
        custom_service_hours:
          serviceHours === 'Custom Service Hours'
            ? customServiceHours || undefined
            : undefined,
      });
      setSuccessMessage('Profile updated successfully.');
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-5 md:space-y-6 lg:space-y-8">
      <div className="mb-4 sm:mb-5 md:mb-6">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 sm:mb-3">
          Profile
        </h1>
        <p className="text-sm sm:text-base md:text-lg text-gray-600">
          Manage your account and business details.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-xl bg-white border border-gray-200 shadow-sm p-4 sm:p-6 md:p-8 space-y-6"
      >
        {/* Account section */}
        <div className="space-y-4">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
            Account
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email (login)
              </label>
              <input
                value={user?.email ?? ''}
                disabled
                className="w-full px-4 py-2.5 rounded-lg bg-gray-100 border border-gray-200 text-gray-500 text-sm sm:text-base cursor-not-allowed"
              />
              <p className="mt-1 text-xs text-gray-400">
                Email is your login identifier and cannot be changed here.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full px-4 py-2.5 rounded-lg bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-sm sm:text-base"
              />
            </div>
          </div>
        </div>

        {/* Business section */}
        <div className="space-y-4">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
            Business details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business name
              </label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Your business name"
                className="w-full px-4 py-2.5 rounded-lg bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-sm sm:text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone number
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+1 (555) 123-4567"
                className="w-full px-4 py-2.5 rounded-lg bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-sm sm:text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business type
              </label>
              <select
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-white border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-sm sm:text-base"
              >
                <option value="">Select business type</option>
                {businessTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            {businessType === 'Other' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom business type
                </label>
                <input
                  type="text"
                  value={customBusinessType}
                  onChange={(e) => setCustomBusinessType(e.target.value)}
                  placeholder="Describe your business"
                  className="w-full px-4 py-2.5 rounded-lg bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-sm sm:text-base"
                />
              </div>
            )}
          </div>
        </div>

        {/* Service hours section */}
        <div className="space-y-4">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
            Service hours
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Typical service hours
              </label>
              <select
                value={serviceHours}
                onChange={(e) => setServiceHours(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-white border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-sm sm:text-base"
              >
                <option value="">Select service hours</option>
                {serviceHoursOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            {serviceHours === 'Custom Service Hours' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom service hours
                </label>
                <input
                  type="text"
                  value={customServiceHours}
                  onChange={(e) => setCustomServiceHours(e.target.value)}
                  placeholder="e.g., Mon–Fri 10 AM–8 PM, Sat 9 AM–5 PM"
                  className="w-full px-4 py-2.5 rounded-lg bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-sm sm:text-base"
                />
              </div>
            )}
          </div>
        </div>

        {/* Status messages */}
        {(successMessage || errorMessage) && (
          <div className="space-y-2">
            {successMessage && (
              <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                <Check className="w-4 h-4" />
                <span>{successMessage}</span>
              </div>
            )}
            {errorMessage && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {errorMessage}
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg bg-gradient-to-br from-[#1E1E5F] to-[#7B4FFF] text-white font-semibold hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed text-sm sm:text-base"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save changes'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

