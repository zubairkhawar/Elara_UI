'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Bell, User, Settings, LogOut, Search, X, Menu } from 'lucide-react';
import { mainNavItems, supportNavItems, NavItem } from './navConfig';
import { useAuth } from '@/contexts/AuthContext';
import { authenticatedFetch } from '@/utils/api';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

interface Notification {
  id: number;
  title: string;
  message: string;
  time: string;
  unread: boolean;
}

interface MenuItem {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  action?: () => void;
}

export default function TopBar() {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const notificationsRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const mobileNavRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const initials =
    user?.name?.trim()
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase() ||
    user?.email
      ?.split('@')[0]
      .slice(0, 2)
      .toUpperCase() ||
    'EL';

  // Load initial alerts for notification dropdown
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const loadAlerts = async () => {
      try {
        const res = await authenticatedFetch(
          `${API_BASE_URL}/api/v1/alerts/?is_read=false`,
        );
        if (!res.ok) return;
        const data = (await res.json()) as Array<{
          id: number;
          title: string;
          message: string;
          time_ago: string;
          is_read: boolean;
        }>;
        const mapped: Notification[] = data.map((a) => ({
          id: a.id,
          title: a.title,
          message: a.message,
          time: a.time_ago || '',
          unread: !a.is_read,
        }));
        setNotifications(mapped);
      } catch (err) {
        console.error('Failed to load alerts for notifications:', err);
      }
    };
    loadAlerts();
  }, []);

  // Live alerts via Server-Sent Events (SSE)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('elara_access_token');
    if (!token) return;

    const encoded = encodeURIComponent(token);
    const url = `${API_BASE_URL}/api/v1/alerts/stream/?access_token=${encoded}`;
    const es = new EventSource(url);

    es.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data) as {
          id: number;
          title: string;
          message: string;
          time_ago?: string;
          is_read: boolean;
        };
        const notif: Notification = {
          id: payload.id,
          title: payload.title,
          message: payload.message,
          time: payload.time_ago || 'Just now',
          unread: !payload.is_read,
        };
        setNotifications((prev) => {
          const existingIndex = prev.findIndex((n) => n.id === notif.id);
          if (existingIndex !== -1) {
            const copy = [...prev];
            copy[existingIndex] = notif;
            return copy;
          }
          return [notif, ...prev].slice(0, 20);
        });
      } catch (err) {
        console.error('Failed to parse alert event:', err);
      }
    };

    es.onerror = (err) => {
      console.error('Alerts stream error:', err);
    };

    return () => {
      es.close();
    };
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target as Node)
      ) {
        setNotificationsOpen(false);
      }
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setUserMenuOpen(false);
      }
      if (
        mobileNavRef.current &&
        !mobileNavRef.current.contains(event.target as Node)
      ) {
        setMobileNavOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const searchTargets = useMemo(
    () => [
      {
        href: '/dashboard',
        keywords: ['home', 'overview', 'dashboard'],
      },
      {
        href: '/dashboard/bookings',
        keywords: ['booking', 'bookings', 'appointments', 'schedule'],
      },
      {
        href: '/dashboard/customers',
        keywords: ['customers', 'clients', 'people'],
      },
      {
        href: '/dashboard/call-summaries',
        keywords: ['calls', 'call summaries', 'summary', 'vapi'],
      },
      {
        href: '/dashboard/services',
        keywords: ['services', 'offerings', 'prices', 'pricing'],
      },
      {
        href: '/dashboard/support',
        keywords: ['support', 'help', 'contact'],
      },
      {
        href: '/dashboard/profile',
        keywords: ['profile', 'account', 'settings', 'business'],
      },
    ],
    [],
  );

  const handleSearchSubmit = () => {
    const term = searchQuery.trim().toLowerCase();
    if (!term) return;

    const match = searchTargets.find((target) =>
      target.keywords.some((keyword) => term.includes(keyword)),
    );

    if (match) {
      router.push(match.href);
      setSearchQuery('');
    }
  };

  return (
    <header className="h-16 bg-[#101024] border-b border-white/10 flex items-center justify-between sticky top-0 z-30">
      <div className="w-full mx-auto px-4 sm:px-5 md:px-6 lg:px-8 xl:px-10 2xl:px-12 py-3 sm:py-3.5 md:py-4 flex items-center justify-between gap-3 sm:gap-4">
        <div className="max-w-[1200px] md:max-w-[1320px] xl:max-w-[1400px] 2xl:max-w-[1600px] w-full mx-auto flex items-center justify-between gap-3 sm:gap-4">
          {/* Left Section: Mobile Menu + Search */}
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-white/5 text-white/80 flex-shrink-0"
              onClick={() => setMobileNavOpen((open) => !open)}
            >
              <Menu className="w-5 h-5" />
            </button>
            {/* Search Bar */}
            <div className="flex items-center gap-2 sm:gap-3 flex-1 max-w-xs sm:max-w-sm md:max-w-md">
              <Search className="w-4 h-4 sm:w-5 sm:h-5 text-white/70 flex-shrink-0" />
              <input
                type="text"
                placeholder="Jump to bookings, customers, services..."
                className="w-full bg-transparent outline-none text-white placeholder-white/50 text-sm sm:text-base"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSearchSubmit();
                  }
                }}
              />
            </div>
          </div>
          {/* End Left Section */}

          {/* Right Section: Actions */}
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-shrink-0">
          {/* Notifications */}
          <div className="relative" ref={notificationsRef}>
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-1.5 sm:p-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-white/70" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full border-2 border-white"></span>
              )}
            </button>

            {notificationsOpen && (
              <>
                {/* Mobile: full-width sheet under top bar */}
                <div className="md:hidden fixed inset-x-0 top-16 px-3 sm:px-4 z-40">
                  <div className="mx-auto w-full max-w-md bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden">
                    <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">Notification</h3>
                      <button
                        onClick={() => setNotificationsOpen(false)}
                        className="p-1 rounded hover:bg-gray-100"
                      >
                        <X className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                    <div className="max-h-[70vh] overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-sm text-gray-500 text-center">
                          No notifications yet.
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer ${
                              notification.unread ? 'bg-gray-50' : ''
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1E1E5F] to-[#7B4FFF] flex items-center justify-center flex-shrink-0">
                                <span className="text-white font-semibold text-xs">
                                  {notification.title.charAt(0)}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-900 text-sm">
                                  {notification.title}
                                </p>
                                <p className="text-gray-600 text-sm mt-1">
                                  {notification.message}
                                </p>
                                <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                                  <span>{notification.time}</span>
                                </div>
                              </div>
                              {notification.unread && (
                                <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0 mt-2"></div>
                              )}
                            </div>
                          </div>
                        )))}
                    </div>
                    <div className="p-3 border-t border-gray-200 text-center">
                      <button className="text-sm text-purple-600 hover:underline font-medium w-full">
                        View All Notifications
                      </button>
                    </div>
                  </div>
                </div>

                {/* Desktop: original dropdown anchored to bell */}
                <div className="hidden md:block">
                  <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden z-50">
                    <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">Notification</h3>
                      <button
                        onClick={() => setNotificationsOpen(false)}
                        className="p-1 rounded hover:bg-gray-100"
                      >
                        <X className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-sm text-gray-500 text-center">
                          No notifications yet.
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer ${
                              notification.unread ? 'bg-gray-50' : ''
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1E1E5F] to-[#7B4FFF] flex items-center justify-center flex-shrink-0">
                                <span className="text-white font-semibold text-xs">
                                  {notification.title.charAt(0)}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-900 text-sm">
                                  {notification.title}
                                </p>
                                <p className="text-gray-600 text-sm mt-1">
                                  {notification.message}
                                </p>
                                <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                                  <span>{notification.time}</span>
                                  {notification.unread && (
                                    <span className="inline-flex items-center gap-1 text-emerald-600">
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                      New
                                    </span>
                                  )}
                                </div>
                              </div>
                              {notification.unread && (
                                <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0 mt-2"></div>
                              )}
                            </div>
                          </div>
                        )))}
                    </div>
                    <div className="p-3 border-t border-gray-200 text-center">
                      <button className="text-sm text-purple-600 hover:underline font-medium">
                        View All Notifications
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* User Menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-1.5 sm:gap-2 cursor-pointer"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-[#1E1E5F] to-[#7B4FFF] flex items-center justify-center flex-shrink-0">
                <span className="text-white font-semibold text-xs sm:text-sm">
                  {initials}
                </span>
              </div>
              <span className="font-medium text-white text-sm sm:text-base hidden sm:inline">
                {user?.name || user?.email || 'Account'}
              </span>
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 sm:w-56 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden z-50">
                <div className="p-4 border-b border-gray-200">
                  <p className="font-semibold text-gray-900">
                    {user?.name || 'Signed in'}
                  </p>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {user?.email || '—'}
                  </p>
                </div>
                <div className="py-2">
                  <Link
                    href="/dashboard/profile"
                    onClick={() => setUserMenuOpen(false)}
                    className="w-full flex items-center gap-3 px-4 py-2 text-left text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    <span className="text-sm">Edit profile</span>
                  </Link>
                  <Link
                    href="/dashboard/account-settings"
                    onClick={() => setUserMenuOpen(false)}
                    className="w-full flex items-center gap-3 px-4 py-2 text-left text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    <span className="text-sm">Account settings</span>
                  </Link>
                  <button className="w-full flex items-center gap-3 px-4 py-2 text-left text-gray-700 hover:bg-gray-50 transition-colors">
                    <Bell className="w-4 h-4" />
                    <span className="text-sm">Support</span>
                  </button>
                  <div className="border-t border-gray-200 my-2"></div>
                  <button
                    className="w-full flex items-center gap-3 px-4 py-2 text-left text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => {
                      setUserMenuOpen(false);
                      logout();
                    }}
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm">Sign out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
          </div>
          {/* End Right Section */}
        </div>
      </div>

      {/* Mobile Nav (Sidebar links) */}
      {mobileNavOpen && (
        <div
          ref={mobileNavRef}
          className="md:hidden fixed inset-x-0 top-16 bottom-0 bg-[#101024] border-t border-white/10 z-20 overflow-y-auto"
        >
          <nav className="px-4 py-3 space-y-4">
            {/* Mobile nav header with close button */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-lg font-bold bg-gradient-to-r from-white to-purple-300 bg-clip-text text-transparent">
                Elara AI
              </p>
              <button
                onClick={() => setMobileNavOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/5 text-white/70"
                aria-label="Close navigation"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold text-white/60 uppercase tracking-wider">
                Menu
              </p>
              <div className="flex flex-col gap-1">
                {mainNavItems.map((item: NavItem) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileNavOpen(false)}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                        isActive
                          ? 'bg-gradient-to-br from-[#1E1E5F] to-[#7B4FFF] text-white'
                          : 'text-white/70 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-white/60 uppercase tracking-wider">
                Support
              </p>
              <div className="flex flex-col gap-1">
                {supportNavItems.map((item: NavItem) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileNavOpen(false)}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                        isActive
                          ? 'bg-gradient-to-br from-[#1E1E5F] to-[#7B4FFF] text-white'
                          : 'text-white/70 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
