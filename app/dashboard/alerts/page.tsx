'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Info, XCircle, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { authenticatedFetch } from '@/utils/api';
import { useToast } from '@/contexts/ToastContext';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

interface Alert {
  id: number;
  type: 'success' | 'warning' | 'info' | 'error';
  title: string;
  message: string;
  is_read: boolean;
  time_ago: string;
  created_at: string;
  related_booking_id?: number;
  related_client_id?: number;
}

export default function AlertsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [markingRead, setMarkingRead] = useState<number | null>(null);
  const [markingAllRead, setMarkingAllRead] = useState(false);
  const itemsPerPage = 10;
  const toast = useToast();

  const fetchAlerts = async (showLoader = true) => {
    if (showLoader) {
      setLoading(true);
    }
    setError('');
    try {
      let url = `${API_BASE_URL}/api/v1/alerts/`;
      if (filter === 'unread') {
        url += '?is_read=false';
      } else if (filter === 'read') {
        url += '?is_read=true';
      }

      const res = await authenticatedFetch(url);
      if (!res.ok) {
        throw new Error('Failed to load alerts');
      }

      const data = await res.json();
      setAlerts(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load alerts');
    } finally {
      if (showLoader) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [filter]);

  // Real-time: Server-Sent Events for new alerts
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('elara_access_token');
    if (!token) return;

    const url = `${API_BASE_URL}/api/v1/alerts/stream/?access_token=${encodeURIComponent(token)}`;
    const es = new EventSource(url);

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data && typeof data.id === 'number') {
          setAlerts((prev) => [data, ...prev.filter((a) => a.id !== data.id)]);
          toast.info(data.title || 'New alert');
        }
      } catch {
        // ignore parse errors
      }
    };

    es.onerror = () => {
      es.close();
    };

    return () => {
      es.close();
    };
  }, [toast]);

  const handleMarkAsRead = async (alertId: number) => {
    setMarkingRead(alertId);
    try {
      const res = await authenticatedFetch(
        `${API_BASE_URL}/api/v1/alerts/${alertId}/mark_read/`,
        { method: 'POST' }
      );

      if (res.ok) {
        setAlerts(alerts.map(alert =>
          alert.id === alertId ? { ...alert, is_read: true } : alert
        ));
        toast.success('Alert marked as read');
      } else {
        toast.error('Failed to mark alert as read');
      }
    } catch (err) {
      toast.error('Failed to mark alert as read');
    } finally {
      setMarkingRead(null);
    }
  };

  const handleMarkAllAsRead = async () => {
    setMarkingAllRead(true);
    try {
      const res = await authenticatedFetch(
        `${API_BASE_URL}/api/v1/alerts/mark_all_read/`,
        { method: 'POST' }
      );

      if (res.ok) {
        await fetchAlerts();
        toast.success('All alerts marked as read');
      } else {
        toast.error('Failed to mark all as read');
      }
    } catch (err) {
      toast.error('Failed to mark all as read');
    } finally {
      setMarkingAllRead(false);
    }
  };

  const unreadAlerts = alerts.filter((a) => !a.is_read);
  const totalPages = Math.max(1, Math.ceil(alerts.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAlerts = alerts.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return CheckCircle;
      case 'warning':
        return AlertCircle;
      case 'error':
        return XCircle;
      default:
        return Info;
    }
  };

  const getColorClasses = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 text-green-600 border-green-200';
      case 'warning':
        return 'bg-yellow-50 text-yellow-600 border-yellow-200';
      case 'error':
        return 'bg-red-50 text-red-600 border-red-200';
      default:
        return 'bg-blue-50 text-blue-600 border-blue-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        <span className="ml-3 text-gray-600">Loading alerts...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-5 md:space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="mb-4 sm:mb-5 md:mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 sm:mb-3">
              Alerts
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-gray-600">
              Stay informed about important events and updates
            </p>
          </div>
          {unreadAlerts.length > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              disabled={markingAllRead}
              className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg bg-gradient-to-br from-[#1E1E5F] to-[#7B4FFF] text-white font-semibold hover:opacity-90 transition-opacity text-sm sm:text-base shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {markingAllRead ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                  Marking...
                </>
              ) : (
                `Mark all as read (${unreadAlerts.length})`
              )}
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <button
          onClick={() => {
            setFilter('all');
            setCurrentPage(1);
          }}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'all'
              ? 'bg-purple-600 text-white'
              : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          All ({alerts.length})
        </button>
        <button
          onClick={() => {
            setFilter('unread');
            setCurrentPage(1);
          }}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'unread'
              ? 'bg-purple-600 text-white'
              : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          Unread ({unreadAlerts.length})
        </button>
        <button
          onClick={() => {
            setFilter('read');
            setCurrentPage(1);
          }}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'read'
              ? 'bg-purple-600 text-white'
              : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          Read ({alerts.length - unreadAlerts.length})
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Alerts List */}
      {alerts.length === 0 ? (
        <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-12 text-center">
          <Info className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No alerts</h3>
          <p className="text-gray-500">You're all caught up! No alerts to display.</p>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {currentAlerts.map((alert) => {
            const Icon = getIcon(alert.type);
            return (
              <div
                key={alert.id}
                className={`group rounded-xl border transition-all duration-200 cursor-pointer ${
                  alert.is_read
                    ? 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
                    : 'bg-gradient-to-r from-purple-50/50 to-white border-purple-200 shadow-sm hover:shadow-md hover:border-purple-300'
                }`}
                onClick={() => !alert.is_read && handleMarkAsRead(alert.id)}
              >
                <div className="p-4 sm:p-5 md:p-6">
                  <div className="flex items-start gap-4 sm:gap-5">
                    <div
                      className={`p-2.5 sm:p-3 rounded-xl border flex-shrink-0 transition-transform group-hover:scale-105 ${getColorClasses(alert.type)}`}
                    >
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 sm:gap-3 mb-1.5">
                            <h3 className="font-semibold text-gray-900 text-base sm:text-lg">
                              {alert.title}
                            </h3>
                            {!alert.is_read && (
                              <span className="px-2 py-0.5 rounded-full bg-purple-600 text-white text-xs font-medium whitespace-nowrap">
                                New
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600 mb-2 leading-relaxed text-sm sm:text-base">
                            {alert.message}
                          </p>
                        </div>
                        {!alert.is_read && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkAsRead(alert.id);
                            }}
                            disabled={markingRead === alert.id}
                            className="px-3 py-1.5 text-xs font-medium text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors disabled:opacity-50"
                          >
                            {markingRead === alert.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              'Mark read'
                            )}
                          </button>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                        <p className="text-xs sm:text-sm text-gray-500 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                          {alert.time_ago}
                        </p>
                        {alert.is_read && (
                          <span className="text-xs text-gray-400 font-medium">Read</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {alerts.length > 0 && (
        <div className="rounded-xl bg-white border border-gray-200 shadow-sm px-4 sm:px-6 md:px-8 py-4 my-2 sm:my-3 md:my-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                <span className="font-medium">{Math.min(endIndex, alerts.length)}</span> of{' '}
                <span className="font-medium">{alerts.length}</span> alerts
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => goToPage(page)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          currentPage === page
                            ? 'bg-purple-600 text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  } else if (page === currentPage - 2 || page === currentPage + 2) {
                    return <span key={page} className="px-2 text-gray-500">...</span>;
                  }
                  return null;
                })}
              </div>
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
