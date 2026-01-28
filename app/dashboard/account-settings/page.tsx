'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Check, 
  Loader2, 
  Save, 
  DollarSign, 
  Bell, 
  Lock, 
  Download, 
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react';
import { authenticatedFetch } from '@/utils/api';
import { useRouter } from 'next/navigation';
import jsPDF from 'jspdf';

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
  const { user, updateProfile, logout } = useAuth();
  const router = useRouter();
  
  // Settings state
  const [currency, setCurrency] = useState('USD');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  
  // Password change state
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // UI state
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

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
          setEmailNotifications(data.email_notifications !== false);
          setSmsNotifications(data.sms_notifications === true);
        } else if (res.status === 401) {
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
        body: JSON.stringify({
          currency,
          email_notifications: emailNotifications,
          sms_notifications: smsNotifications,
        }),
      });

      if (!res.ok) {
        if (res.status === 401) {
          return;
        }
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to update settings');
      }

      const updatedData = await res.json();
      setCurrency(updatedData.currency);
      setEmailNotifications(updatedData.email_notifications);
      setSmsNotifications(updatedData.sms_notifications);
      
      // Update user data in AuthContext and localStorage
      if (updateProfile) {
        await updateProfile({
          currency: updatedData.currency,
          email_notifications: updatedData.email_notifications,
          sms_notifications: updatedData.sms_notifications,
        } as any);
      }
      
      setSuccessMessage('Settings saved successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      setErrorMessage('New passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setErrorMessage('Password must be at least 8 characters long');
      return;
    }

    setIsChangingPassword(true);
    setErrorMessage('');

    try {
      const res = await authenticatedFetch(`${API_BASE_URL}/api/v1/accounts/me/password/`, {
        method: 'POST',
        body: JSON.stringify({
          old_password: oldPassword,
          new_password: newPassword,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.old_password?.[0] || errorData.detail || 'Failed to change password');
      }

      setSuccessMessage('Password changed successfully!');
      setShowPasswordChange(false);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleExportData = async (format: 'json' | 'pdf') => {
    try {
      const res = await authenticatedFetch(`${API_BASE_URL}/api/v1/accounts/me/`);
      if (!res.ok) {
        throw new Error('Failed to fetch account data');
      }

      const data = await res.json();
      const dateStr = new Date().toISOString().split('T')[0];

      if (format === 'json') {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `elara-account-data-${dateStr}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else if (format === 'pdf') {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 20;
        let yPos = margin;

        // Title
        doc.setFontSize(20);
        doc.setTextColor(30, 30, 95); // Deep blue
        doc.text('Account Data Export', pageWidth / 2, yPos, { align: 'center' });
        yPos += 15;

        // Date
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Exported on: ${new Date().toLocaleDateString()}`, pageWidth / 2, yPos, { align: 'center' });
        yPos += 15;

        // Account Information
        doc.setFontSize(14);
        doc.setTextColor(30, 30, 95);
        doc.text('Account Information', margin, yPos);
        yPos += 10;

        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        const accountFields = [
          ['Email', data.email || 'N/A'],
          ['Name', data.name || 'N/A'],
          ['Business Name', data.business_name || 'N/A'],
          ['Phone Number', data.phone_number || 'N/A'],
          ['Business Type', data.business_type || 'N/A'],
          ['Service Hours', data.service_hours || 'N/A'],
        ];

        accountFields.forEach(([label, value]) => {
          if (yPos > doc.internal.pageSize.getHeight() - 20) {
            doc.addPage();
            yPos = margin;
          }
          doc.setFont('helvetica', 'bold');
          doc.text(`${label}:`, margin, yPos);
          doc.setFont('helvetica', 'normal');
          const textWidth = doc.getTextWidth(value);
          if (textWidth > pageWidth - margin * 2 - 60) {
            const lines = doc.splitTextToSize(value, pageWidth - margin * 2 - 60);
            doc.text(lines, margin + 60, yPos);
            yPos += lines.length * 5;
          } else {
            doc.text(value, margin + 60, yPos);
            yPos += 7;
          }
        });

        yPos += 5;

        // Settings
        doc.setFontSize(14);
        doc.setTextColor(30, 30, 95);
        if (yPos > doc.internal.pageSize.getHeight() - 20) {
          doc.addPage();
          yPos = margin;
        }
        doc.text('Settings', margin, yPos);
        yPos += 10;

        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        const settingsFields = [
          ['Currency', data.currency || 'USD'],
          ['Email Notifications', data.email_notifications ? 'Enabled' : 'Disabled'],
          ['SMS Notifications', data.sms_notifications ? 'Enabled' : 'Disabled'],
        ];

        settingsFields.forEach(([label, value]) => {
          if (yPos > doc.internal.pageSize.getHeight() - 20) {
            doc.addPage();
            yPos = margin;
          }
          doc.setFont('helvetica', 'bold');
          doc.text(`${label}:`, margin, yPos);
          doc.setFont('helvetica', 'normal');
          doc.text(value, margin + 60, yPos);
          yPos += 7;
        });

        // Footer
        const totalPages = doc.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
          doc.setPage(i);
          doc.setFontSize(8);
          doc.setTextColor(150, 150, 150);
          doc.text(
            `Page ${i} of ${totalPages}`,
            pageWidth / 2,
            doc.internal.pageSize.getHeight() - 10,
            { align: 'center' }
          );
        }

        doc.save(`elara-account-data-${dateStr}.pdf`);
      }

      setSuccessMessage(`Account data exported as ${format.toUpperCase()} successfully!`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setErrorMessage('Failed to export data');
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

      {/* Currency Preference */}
      <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-4 sm:p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
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

      {/* Notification Preferences */}
      <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-4 sm:p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-orange-50">
            <Bell className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              Notification Preferences
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Choose how you want to receive notifications about bookings and updates.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <label className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer">
            <div>
              <p className="font-medium text-gray-900">Email Notifications</p>
              <p className="text-sm text-gray-500 mt-0.5">
                Receive booking confirmations and updates via email
              </p>
            </div>
            <button
              type="button"
              onClick={() => setEmailNotifications(!emailNotifications)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                emailNotifications ? 'bg-purple-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  emailNotifications ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </label>

          <label className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer">
            <div>
              <p className="font-medium text-gray-900">SMS Notifications</p>
              <p className="text-sm text-gray-500 mt-0.5">
                Receive booking reminders via text message
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSmsNotifications(!smsNotifications)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                smsNotifications ? 'bg-purple-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  smsNotifications ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </label>
        </div>
      </div>

      {/* Password Change */}
      <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-4 sm:p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-50">
              <Lock className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                Security
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Change your account password
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setShowPasswordChange(!showPasswordChange);
              setErrorMessage('');
            }}
            className="px-4 py-2 text-sm font-medium text-purple-600 hover:text-purple-700"
          >
            {showPasswordChange ? 'Cancel' : 'Change Password'}
          </button>
        </div>

        {showPasswordChange && (
          <div className="space-y-4 pt-4 border-t border-gray-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showOldPassword ? 'text' : 'password'}
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full px-4 py-2.5 pr-10 rounded-lg bg-white border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-sm sm:text-base"
                />
                <button
                  type="button"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showOldPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2.5 pr-10 rounded-lg bg-white border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-sm sm:text-base"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-400">Must be at least 8 characters</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2.5 pr-10 rounded-lg bg-white border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-sm sm:text-base"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={handlePasswordChange}
              disabled={isChangingPassword || !oldPassword || !newPassword || !confirmPassword}
              className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-gradient-to-br from-[#1E1E5F] to-[#7B4FFF] text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              {isChangingPassword ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                  Changing Password...
                </>
              ) : (
                'Change Password'
              )}
            </button>
          </div>
        )}
      </div>

      {/* Data Management */}
      <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-4 sm:p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-gray-50">
            <Download className="w-5 h-5 text-gray-600" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              Data Management
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Export your account data or delete your account
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200">
            <div>
              <p className="font-medium text-gray-900">Export Account Data</p>
              <p className="text-sm text-gray-500 mt-0.5">
                Download a copy of your account data in JSON or PDF format
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleExportData('json')}
                className="px-4 py-2 text-sm font-medium text-purple-600 hover:text-purple-700 border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors"
              >
                <Download className="w-4 h-4 inline mr-2" />
                JSON
              </button>
              <button
                type="button"
                onClick={() => handleExportData('pdf')}
                className="px-4 py-2 text-sm font-medium text-purple-600 hover:text-purple-700 border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors"
              >
                <Download className="w-4 h-4 inline mr-2" />
                PDF
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg border border-red-200 bg-red-50/30">
            <div>
              <p className="font-medium text-red-900">Delete Account</p>
              <p className="text-sm text-red-700 mt-0.5">
                Permanently delete your account and all associated data
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4 inline mr-2" />
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
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

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-red-900 mb-2">Delete Account</h3>
            <p className="text-gray-600 mb-4">
              This action cannot be undone. This will permanently delete your account and all associated data including bookings, customers, and settings.
            </p>
            <p className="text-sm font-medium text-gray-900 mb-2">
              Type <span className="font-mono bg-red-50 text-red-700 px-2 py-1 rounded">DELETE</span> to confirm:
            </p>
            <input
              type="text"
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              placeholder="Type DELETE to confirm"
              className="w-full px-4 py-2.5 mb-4 rounded-lg bg-white border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-sm sm:text-base"
            />
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteConfirmation('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (deleteConfirmation !== 'DELETE') {
                    setErrorMessage('Please type DELETE (all caps) to confirm account deletion.');
                    return;
                  }

                  setIsDeleting(true);
                  setErrorMessage('');

                  try {
                    const res = await authenticatedFetch(`${API_BASE_URL}/api/v1/accounts/me/delete/`, {
                      method: 'POST',
                      body: JSON.stringify({ confirmation: 'DELETE' }),
                    });

                    if (!res.ok) {
                      const errorData = await res.json().catch(() => ({}));
                      throw new Error(errorData.confirmation?.[0] || errorData.detail || 'Failed to delete account');
                    }

                    // Account deleted successfully, logout and redirect
                    if (logout) {
                      logout();
                    }
                    router.push('/login');
                  } catch (err: any) {
                    setErrorMessage(err?.message || 'Failed to delete account');
                    setIsDeleting(false);
                  }
                }}
                disabled={isDeleting || deleteConfirmation !== 'DELETE'}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                    Deleting...
                  </>
                ) : (
                  'Delete Account'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
