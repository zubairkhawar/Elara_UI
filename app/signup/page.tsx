'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowRight, ArrowLeft, Check } from 'lucide-react';
import Link from 'next/link';

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
  'Other'
];

const serviceHoursOptions = [
  '9 AM - 5 PM (Standard Business Hours)',
  '8 AM - 6 PM (Extended Hours)',
  '24/7 (Always Open)',
  'Weekends Only',
  'Evenings Only (5 PM - 10 PM)',
  'Custom Service Hours'
];

export default function SignupPage() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const { signup, loginWithGoogle, loginWithApple } = useAuth();

  // Step 1: Account Info
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Step 2: Business Info
  const [businessName, setBusinessName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [customBusinessType, setCustomBusinessType] = useState('');

  // Step 3: Service Hours
  const [serviceHours, setServiceHours] = useState('');
  const [customServiceHours, setCustomServiceHours] = useState('');

  const handleNext = () => {
    if (step === 1) {
      if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
      }
      if (password.length < 8) {
        alert('Password must be at least 8 characters');
        return;
      }
    }
    if (step === 2) {
      if (!businessName || !phoneNumber || !businessType) {
        alert('Please fill in all fields');
        return;
      }
      if (businessType === 'Other' && !customBusinessType) {
        alert('Please specify your business type');
        return;
      }
    }
    if (step === 3) {
      if (!serviceHours) {
        alert('Please select service hours');
        return;
      }
      if (serviceHours === 'Custom Service Hours' && !customServiceHours) {
        alert('Please specify your custom service hours');
        return;
      }
    }
    setStep(step + 1);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      await signup({
        email,
        password,
        businessName,
        phoneNumber,
        businessType: businessType === 'Other' ? customBusinessType : businessType,
        serviceHours: serviceHours === 'Custom Service Hours' ? customServiceHours : serviceHours,
        customServiceHours: serviceHours === 'Custom Service Hours' ? customServiceHours : undefined,
      });
    } catch (error) {
      console.error('Signup failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setIsLoading(true);
    try {
      await loginWithGoogle();
    } catch (error) {
      console.error('Google signup failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppleSignup = async () => {
    setIsLoading(true);
    try {
      await loginWithApple();
    } catch (error) {
      console.error('Apple signup failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Half - Hero Section Style */}
      <div 
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center"
        style={{
          background: 'linear-gradient(135deg, rgba(30, 30, 95, 0.1) 0%, rgba(123, 79, 255, 0.1) 100%)'
        }}
      >
        {/* Background gradient */}
        <div 
          className="absolute inset-0 opacity-50"
          style={{
            background: 'linear-gradient(135deg, rgba(30, 30, 95, 0.1) 0%, rgba(123, 79, 255, 0.1) 100%)'
          }}
        ></div>
        
        {/* Animated background elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 text-center px-12">
          <h2 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-white to-purple-300 bg-clip-text text-transparent">
            Elara AI
          </h2>
          <h1 className="text-3xl md:text-4xl font-bold mb-6 leading-tight bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent">
            Let Elara Handle Your Calls
          </h1>
          <p className="text-xl md:text-2xl text-[var(--text-secondary)] max-w-lg mx-auto leading-relaxed">
            AI-powered voice booking platform that manages your appointments, 
            schedules meetings, and handles customer inquiries 24/7
          </p>
        </div>
      </div>

      {/* Right Half - Signup Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-[var(--scaffold-color)] p-8 overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              {[1, 2, 3, 4].map((s) => (
                <div key={s} className="flex items-center flex-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                      step >= s
                        ? 'bg-purple-500 text-white'
                        : 'bg-white/10 text-[var(--text-secondary)]'
                    }`}
                  >
                    {step > s ? <Check className="w-5 h-5" /> : s}
                  </div>
                  {s < 4 && (
                    <div
                      className={`flex-1 h-1 mx-2 transition-colors ${
                        step > s ? 'bg-purple-500' : 'bg-white/10'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step 1: Create Account */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Create your account</h2>
                <p className="text-[var(--text-secondary)]">Let's start with your basic information</p>
              </div>

              <div className="space-y-5">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Work email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@company.com"
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Create a strong password"
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Confirm your password"
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  />
                </div>
              </div>

              <div className="pt-4">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-[var(--scaffold-color)] text-[var(--text-secondary)]">Or continue with</span>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={handleGoogleSignup}
                    disabled={isLoading}
                    className="flex items-center justify-center gap-3 px-4 py-3 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span className="text-white text-sm font-medium">Google</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleAppleSignup}
                    disabled={isLoading}
                    className="flex items-center justify-center gap-3 px-4 py-3 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.33 2.58-2.73 4.5-3.74 4.25z"/>
                    </svg>
                    <span className="text-white text-sm font-medium">Apple</span>
                  </button>
                </div>
              </div>

              <button
                onClick={handleNext}
                className="w-full py-3 rounded-lg text-white font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                style={{
                  background: 'linear-gradient(135deg, #1E1E5F 0%, #7B4FFF 100%)',
                  letterSpacing: '-0.05em'
                }}
              >
                Continue
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Step 2: Business Info */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Tell us about your business</h2>
                <p className="text-[var(--text-secondary)]">Help us personalize your experience</p>
              </div>

              <div className="space-y-5">
                <div>
                  <label htmlFor="businessName" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Business Name
                  </label>
                  <input
                    id="businessName"
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    required
                    placeholder="Your business name"
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Phone Number
                  </label>
                  <input
                    id="phoneNumber"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                    placeholder="+1 (555) 123-4567"
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="businessType" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Business Type
                  </label>
                  <select
                    id="businessType"
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  >
                    <option value="">Select business type</option>
                    {businessTypes.map((type) => (
                      <option key={type} value={type} className="bg-[var(--card-color)]">
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                {businessType === 'Other' && (
                  <div>
                    <label htmlFor="customBusinessType" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                      Specify Business Type
                    </label>
                    <input
                      id="customBusinessType"
                      type="text"
                      value={customBusinessType}
                      onChange={(e) => setCustomBusinessType(e.target.value)}
                      required
                      placeholder="Enter your business type"
                      className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => setStep(step - 1)}
                  className="flex-1 py-3 rounded-lg border border-white/10 bg-white/5 text-white font-semibold hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Back
                </button>
                <button
                  onClick={handleNext}
                  className="flex-1 py-3 rounded-lg text-white font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                  style={{
                    background: 'linear-gradient(135deg, #1E1E5F 0%, #7B4FFF 100%)',
                    letterSpacing: '-0.05em'
                  }}
                >
                  Continue
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Service Hours */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Service hours</h2>
                <p className="text-[var(--text-secondary)]">When do you typically serve customers?</p>
              </div>

              <div className="space-y-5">
                <div>
                  <label htmlFor="serviceHours" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Service Hours
                  </label>
                  <select
                    id="serviceHours"
                    value={serviceHours}
                    onChange={(e) => setServiceHours(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  >
                    <option value="">Select service hours</option>
                    {serviceHoursOptions.map((option) => (
                      <option key={option} value={option} className="bg-[var(--card-color)]">
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                {serviceHours === 'Custom Service Hours' && (
                  <div>
                    <label htmlFor="customServiceHours" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                      Specify Custom Service Hours
                    </label>
                    <input
                      id="customServiceHours"
                      type="text"
                      value={customServiceHours}
                      onChange={(e) => setCustomServiceHours(e.target.value)}
                      required
                      placeholder="e.g., Monday-Friday 10 AM - 8 PM, Saturday 9 AM - 5 PM"
                      className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                    />
                  </div>
                )}

                <div className="bg-white/5 border border-white/10 rounded-lg p-6 space-y-4">
                  <h3 className="text-lg font-semibold text-white">What to expect:</h3>
                  <ul className="space-y-2 text-[var(--text-secondary)]">
                    <li className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                      <span>Our team will review your information</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                      <span>Setup takes 24-48 hours</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                      <span>You'll receive a confirmation email</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => setStep(step - 1)}
                  className="flex-1 py-3 rounded-lg border border-white/10 bg-white/5 text-white font-semibold hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Back
                </button>
                <button
                  onClick={handleNext}
                  className="flex-1 py-3 rounded-lg text-white font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                  style={{
                    background: 'linear-gradient(135deg, #1E1E5F 0%, #7B4FFF 100%)',
                    letterSpacing: '-0.05em'
                  }}
                >
                  Continue
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Confirmation */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-6">
                  <Check className="w-8 h-8 text-purple-400" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">You're all set!</h2>
                <p className="text-[var(--text-secondary)]">
                  We've received your information. Our team will set up your Elara account within 24-48 hours.
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-lg p-6 space-y-4">
                <h3 className="text-lg font-semibold text-white">What happens next?</h3>
                <ul className="space-y-3 text-[var(--text-secondary)]">
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-purple-400 mt-2 flex-shrink-0"></div>
                    <span>You'll receive a confirmation email shortly</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-purple-400 mt-2 flex-shrink-0"></div>
                    <span>Our team will configure your AI voice assistant</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-purple-400 mt-2 flex-shrink-0"></div>
                    <span>We'll notify you when everything is ready</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="w-full py-3 rounded-lg text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{
                  background: 'linear-gradient(135deg, #1E1E5F 0%, #7B4FFF 100%)',
                  letterSpacing: '-0.05em'
                }}
              >
                {isLoading ? 'Completing signup...' : 'Complete Signup'}
                {!isLoading && <ArrowRight className="w-5 h-5" />}
              </button>
            </div>
          )}

          <p className="mt-8 text-center text-sm text-[var(--text-secondary)]">
            Already have an account?{' '}
            <Link href="/login" className="text-purple-400 hover:text-purple-300 font-semibold transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
