'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Check, Loader2, Save, DollarSign } from 'lucide-react';
import { authenticatedFetch } from '@/utils/api';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

const CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' },
  { code: 'SAR', name: 'Saudi Riyal', symbol: '﷼' },
  { code: 'PKR', name: 'Pakistani Rupee', symbol: '₨' },
];

export default function AccountSettingsPage() {
  const { user, updateProfile } = useAuth();
  const [currency, setCurrency] = useState('USD');
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      const token =
        typeof window !== 'undefined'
          ? localStorage.getItem('elara_access_token')
          : null;
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await authenticatedFetch(`${API_BASE_URL}/api/v1/accounts/me/`);

        if (res.ok) {
          const data = await res.json();
          setCurrency(data.currency || 'USD');
        } else if (res.status === 401) {
          // Token refresh failed, user will be redirected to login
          setLoading(false);
          return;
        }
      } catch (err) {
        console.error('Failed to fetch user data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleSave = async () => {
    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem('elara_access_token')
        : null;
    if (!token) return;

    setIsSaving(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const res = await authenticatedFetch(`${API_BASE_URL}/api/v1/accounts/me/`, {
        method: 'PATCH',
        body: JSON.stringify({ currency }),
      });

      if (!res.ok) {
        if (res.status === 401) {
          // Token refresh failed, user will be redirected to login
          return;
        }
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to update settings');
      }

      const updatedData = await res.json();
      setCurrency(updatedData.currency);
      
      // Update user data in AuthContext and localStorage
      if (updateProfile) {
        await updateProfile({ currency: updatedData.currency });
      }
      
      // Update localStorage user data
      const storedUser = localStorage.getItem('elara_user');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        userData.currency = updatedData.currency;
        localStorage.setItem('elara_user', JSON.stringify(userData));
      }
      
      setSuccessMessage('Settings saved successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        <span className="ml-3 text-gray-600">Loading settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-5 md:space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="mb-4 sm:mb-5 md:mb-6">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 sm:mb-3">
          Account Settings
        </h1>
        <p className="text-sm sm:text-base md:text-lg text-gray-600">
          Manage your account preferences and settings.
        </p>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      {/* Settings Form */}
      <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-4 sm:p-6 md:p-8">
        {/* Currency Selection */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-purple-50">
              <DollarSign className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                Currency Preference
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Select your preferred currency for displaying prices and revenue.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {CURRENCIES.map((curr) => (
              <button
                key={curr.code}
                type="button"
                onClick={() => setCurrency(curr.code)}
                className={`relative p-4 rounded-xl border-2 transition-all text-left ${
                  currency === curr.code
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg font-semibold text-gray-900">
                        {curr.symbol}
                      </span>
                      <span className="text-base font-medium text-gray-900">
                        {curr.code}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">{curr.name}</p>
                  </div>
                  {currency === curr.code && (
                    <div className="flex-shrink-0">
                      <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-6 sm:mt-8 pt-6 border-t border-gray-200 flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 sm:py-3 rounded-lg bg-gradient-to-br from-[#1E1E5F] to-[#7B4FFF] text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Settings</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Additional Settings Section (for future expansion) */}
      <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-4 sm:p-6 md:p-8">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
          Additional Settings
        </h2>
        <p className="text-sm text-gray-500">
          More settings and preferences will be available here in the future.
        </p>
      </div>
    </div>
  );
}
