'use client';

import { useEffect, useState } from 'react';
import { Calendar, Clock, User, Search, Plus, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

interface Booking {
  id: number;
  customer: string;
  email: string;
  service: string;
  date: string;
  time: string;
  duration: string;
  status: string;
  phone: string;
}

export default function BookingsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const itemsPerPage = 10;

  const getHeaders = (): HeadersInit => {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem('elara_access_token')
        : null;
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    return headers;
  };

  const formatDuration = (startsAt: string, endsAt: string): string => {
    const start = new Date(startsAt);
    const end = new Date(endsAt);
    const diffMs = end.getTime() - start.getTime();
    const diffMins = Math.round(diffMs / 60000);
    return `${diffMins} min`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  useEffect(() => {
    const fetchBookings = async () => {
      const token =
        typeof window !== 'undefined'
          ? localStorage.getItem('elara_access_token')
          : null;
      if (!token) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/bookings/`, {
          headers: getHeaders(),
        });

        if (!res.ok) {
          throw new Error('Failed to load bookings');
        }

        const data = await res.json();
        const formattedBookings: Booking[] = data.map((b: any) => ({
          id: b.id,
          customer: b.client_name || 'Unknown',
          email: b.client_email || '',
          service: b.service_name || 'N/A',
          date: formatDate(b.starts_at),
          time: formatTime(b.starts_at),
          duration: formatDuration(b.starts_at, b.ends_at),
          status: b.status.charAt(0).toUpperCase() + b.status.slice(1),
          phone: b.client_phone || '',
        }));

        setBookings(formattedBookings);
      } catch (err: any) {
        setError(err?.message || 'Failed to load bookings');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const normalizedSearch = search.trim().toLowerCase();

  const filteredBookings = bookings.filter((booking) => {
    if (!normalizedSearch) return true;
    return (
      booking.customer.toLowerCase().includes(normalizedSearch) ||
      booking.email.toLowerCase().includes(normalizedSearch) ||
      booking.service.toLowerCase().includes(normalizedSearch) ||
      booking.phone.toLowerCase().includes(normalizedSearch) ||
      booking.date.toLowerCase().includes(normalizedSearch) ||
      booking.time.toLowerCase().includes(normalizedSearch)
    );
  });

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(filteredBookings.length / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentBookings = filteredBookings.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  return (
    <div className="space-y-4 sm:space-y-5 md:space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="mb-4 sm:mb-5 md:mb-6">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 sm:mb-3">
          Bookings
        </h1>
        <p className="text-sm sm:text-base md:text-lg text-gray-600">
          Manage and view all your appointments
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 my-2 sm:my-3 md:my-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by customer, email, phone, service, or date..."
            className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 rounded-lg bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-sm sm:text-base"
          />
        </div>
        <button className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg bg-gradient-to-br from-[#1E1E5F] to-[#7B4FFF] text-white font-semibold hover:opacity-90 transition-opacity text-sm sm:text-base">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Booking</span>
          <span className="sm:hidden">New</span>
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
          <span className="ml-3 text-gray-600">Loading bookings...</span>
        </div>
      )}

      {/* Mobile List */}
      {!loading && (
        <div className="space-y-3 md:hidden my-2 sm:my-3 md:my-4">
          {currentBookings.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>No bookings found</p>
            </div>
          ) : (
            currentBookings.map((booking) => (
          <div
            key={booking.id}
            className="rounded-xl bg-white border border-gray-200 shadow-sm p-4 flex flex-col gap-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-gray-900 text-base">{booking.customer}</p>
                <p className="text-xs text-gray-500 mt-1">{booking.email}</p>
                <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1.5">
                  <User className="w-3 h-3 text-gray-400" />
                  <span>{booking.phone}</span>
                </p>
              </div>
              <span
                className={`inline-flex px-2 py-1 rounded-full text-[11px] font-medium ${
                  booking.status === 'Confirmed'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}
              >
                {booking.status}
              </span>
            </div>

            <div className="flex items-center justify-between gap-3">
              <div className="flex flex-col gap-1 text-xs text-gray-700">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3 h-3 text-gray-400" />
                  <span>{booking.date}</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-500">
                  <Clock className="w-3 h-3 text-gray-400" />
                  <span>{booking.time}</span>
                </div>
              </div>
              <button className="text-xs font-medium text-purple-600 hover:text-purple-700 hover:underline">
                View details
              </button>
            </div>
          </div>
            ))
          )}
        </div>
      )}

      {/* Bookings Table - Desktop / Tablet */}
      {!loading && (
        <div className="hidden md:block rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden my-2 sm:my-3 md:my-4">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 sm:px-6 md:px-8 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-4 sm:px-6 md:px-8 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden sm:table-cell">
                    Service
                  </th>
                  <th className="px-4 sm:px-6 md:px-8 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-4 sm:px-6 md:px-8 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden md:table-cell">
                    Duration
                  </th>
                  <th className="px-4 sm:px-6 md:px-8 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 sm:px-6 md:px-8 py-3 sm:py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentBookings.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 sm:px-6 md:px-8 py-12 text-center text-gray-500">
                      No bookings found
                    </td>
                  </tr>
                ) : (
                  currentBookings.map((booking) => (
                <tr
                  key={booking.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 sm:px-6 md:px-8 py-4 sm:py-5">
                    <div>
                      <p className="font-medium text-gray-900 text-sm sm:text-base">{booking.customer}</p>
                      <p className="text-xs sm:text-sm text-gray-500 mt-1">{booking.email}</p>
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 md:px-8 py-4 sm:py-5 hidden sm:table-cell">
                    <span className="text-sm sm:text-base text-gray-700">{booking.service}</span>
                  </td>
                  <td className="px-4 sm:px-6 md:px-8 py-4 sm:py-5">
                    <div className="flex items-center gap-2 text-gray-700 text-xs sm:text-sm">
                      <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span>{booking.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500 mt-1.5 text-xs sm:text-sm">
                      <Clock className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span>{booking.time}</span>
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 md:px-8 py-4 sm:py-5 hidden md:table-cell">
                    <span className="text-sm sm:text-base text-gray-700">{booking.duration}</span>
                  </td>
                  <td className="px-4 sm:px-6 md:px-8 py-4 sm:py-5">
                    <span
                      className={`inline-flex px-2.5 sm:px-3 py-1 rounded-full text-xs font-medium ${
                        booking.status === 'Confirmed'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 md:px-8 py-4 sm:py-5 text-right">
                    <button className="text-purple-600 hover:text-purple-700 hover:underline text-xs sm:text-sm font-medium transition-colors">
                      View
                    </button>
                  </td>
                </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
        <div className="px-4 sm:px-6 md:px-8 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{filteredBookings.length === 0 ? 0 : startIndex + 1}</span> to{' '}
              <span className="font-medium">{Math.min(endIndex, filteredBookings.length)}</span> of{' '}
              <span className="font-medium">{filteredBookings.length}</span> results
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
                // Show first page, last page, current page, and pages around current
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

      {/* Pagination - Mobile (cards view) */}
      {!loading && (
        <div className="md:hidden mt-3 flex flex-col gap-3">
        <p className="text-xs text-gray-600 text-center">
          Showing <span className="font-medium">{filteredBookings.length === 0 ? 0 : startIndex + 1}</span> to{' '}
          <span className="font-medium">{Math.min(endIndex, filteredBookings.length)}</span> of{' '}
          <span className="font-medium">{filteredBookings.length}</span> results
        </p>
        <div className="flex items-center justify-center gap-2">
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
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      currentPage === page
                        ? 'bg-purple-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {page}
                  </button>
                );
              } else if (page === currentPage - 2 || page === currentPage + 2) {
                return (
                  <span key={page} className="px-1 text-gray-500 text-xs">
                    ...
                  </span>
                );
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
      )}
    </div>
  );
}
