'use client';

import { useState } from 'react';
import { Calendar, Clock, User, Search, Filter, Plus, ChevronLeft, ChevronRight } from 'lucide-react';

export default function BookingsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const bookings = [
    {
      id: 1,
      customer: 'John Doe',
      email: 'john@example.com',
      service: 'Consultation',
      date: '2024-01-15',
      time: '2:00 PM',
      duration: '60 min',
      status: 'Confirmed',
      phone: '+1 (555) 123-4567',
    },
    {
      id: 2,
      customer: 'Jane Smith',
      email: 'jane@example.com',
      service: 'Follow-up',
      date: '2024-01-15',
      time: '3:30 PM',
      duration: '30 min',
      status: 'Pending',
      phone: '+1 (555) 234-5678',
    },
    {
      id: 3,
      customer: 'Mike Johnson',
      email: 'mike@example.com',
      service: 'Initial Meeting',
      date: '2024-01-16',
      time: '10:00 AM',
      duration: '45 min',
      status: 'Confirmed',
      phone: '+1 (555) 345-6789',
    },
    {
      id: 4,
      customer: 'Sarah Williams',
      email: 'sarah@example.com',
      service: 'Consultation',
      date: '2024-01-16',
      time: '1:00 PM',
      duration: '60 min',
      status: 'Confirmed',
      phone: '+1 (555) 456-7890',
    },
    {
      id: 5,
      customer: 'David Brown',
      email: 'david@example.com',
      service: 'Review',
      date: '2024-01-17',
      time: '11:00 AM',
      duration: '30 min',
      status: 'Pending',
      phone: '+1 (555) 567-8901',
    },
    {
      id: 6,
      customer: 'Emily Davis',
      email: 'emily@example.com',
      service: 'Consultation',
      date: '2024-01-17',
      time: '2:30 PM',
      duration: '60 min',
      status: 'Confirmed',
      phone: '+1 (555) 678-9012',
    },
    {
      id: 7,
      customer: 'Robert Wilson',
      email: 'robert@example.com',
      service: 'Follow-up',
      date: '2024-01-18',
      time: '9:00 AM',
      duration: '30 min',
      status: 'Confirmed',
      phone: '+1 (555) 789-0123',
    },
    {
      id: 8,
      customer: 'Lisa Anderson',
      email: 'lisa@example.com',
      service: 'Initial Meeting',
      date: '2024-01-18',
      time: '4:00 PM',
      duration: '45 min',
      status: 'Pending',
      phone: '+1 (555) 890-1234',
    },
    {
      id: 9,
      customer: 'Michael Taylor',
      email: 'michael@example.com',
      service: 'Consultation',
      date: '2024-01-19',
      time: '10:30 AM',
      duration: '60 min',
      status: 'Confirmed',
      phone: '+1 (555) 901-2345',
    },
    {
      id: 10,
      customer: 'Jennifer Martinez',
      email: 'jennifer@example.com',
      service: 'Review',
      date: '2024-01-19',
      time: '3:00 PM',
      duration: '30 min',
      status: 'Confirmed',
      phone: '+1 (555) 012-3456',
    },
    {
      id: 11,
      customer: 'Christopher Lee',
      email: 'christopher@example.com',
      service: 'Follow-up',
      date: '2024-01-20',
      time: '11:00 AM',
      duration: '30 min',
      status: 'Pending',
      phone: '+1 (555) 123-4568',
    },
    {
      id: 12,
      customer: 'Amanda White',
      email: 'amanda@example.com',
      service: 'Consultation',
      date: '2024-01-20',
      time: '1:30 PM',
      duration: '60 min',
      status: 'Confirmed',
      phone: '+1 (555) 234-5679',
    },
    {
      id: 13,
      customer: 'Daniel Harris',
      email: 'daniel@example.com',
      service: 'Initial Meeting',
      date: '2024-01-21',
      time: '9:30 AM',
      duration: '45 min',
      status: 'Confirmed',
      phone: '+1 (555) 345-6780',
    },
    {
      id: 14,
      customer: 'Jessica Clark',
      email: 'jessica@example.com',
      service: 'Review',
      date: '2024-01-21',
      time: '2:00 PM',
      duration: '30 min',
      status: 'Pending',
      phone: '+1 (555) 456-7891',
    },
    {
      id: 15,
      customer: 'Matthew Lewis',
      email: 'matthew@example.com',
      service: 'Consultation',
      date: '2024-01-22',
      time: '10:00 AM',
      duration: '60 min',
      status: 'Confirmed',
      phone: '+1 (555) 567-8902',
    },
    {
      id: 16,
      customer: 'Ashley Walker',
      email: 'ashley@example.com',
      service: 'Follow-up',
      date: '2024-01-22',
      time: '3:30 PM',
      duration: '30 min',
      status: 'Confirmed',
      phone: '+1 (555) 678-9013',
    },
    {
      id: 17,
      customer: 'James Hall',
      email: 'james@example.com',
      service: 'Initial Meeting',
      date: '2024-01-23',
      time: '11:30 AM',
      duration: '45 min',
      status: 'Pending',
      phone: '+1 (555) 789-0124',
    },
    {
      id: 18,
      customer: 'Michelle Allen',
      email: 'michelle@example.com',
      service: 'Consultation',
      date: '2024-01-23',
      time: '1:00 PM',
      duration: '60 min',
      status: 'Confirmed',
      phone: '+1 (555) 890-1235',
    },
    {
      id: 19,
      customer: 'Andrew Young',
      email: 'andrew@example.com',
      service: 'Review',
      date: '2024-01-24',
      time: '9:00 AM',
      duration: '30 min',
      status: 'Confirmed',
      phone: '+1 (555) 901-2346',
    },
    {
      id: 20,
      customer: 'Stephanie King',
      email: 'stephanie@example.com',
      service: 'Follow-up',
      date: '2024-01-24',
      time: '4:00 PM',
      duration: '30 min',
      status: 'Pending',
      phone: '+1 (555) 012-3457',
    },
    {
      id: 21,
      customer: 'Ryan Wright',
      email: 'ryan@example.com',
      service: 'Consultation',
      date: '2024-01-25',
      time: '10:30 AM',
      duration: '60 min',
      status: 'Confirmed',
      phone: '+1 (555) 123-4569',
    },
    {
      id: 22,
      customer: 'Nicole Lopez',
      email: 'nicole@example.com',
      service: 'Initial Meeting',
      date: '2024-01-25',
      time: '2:30 PM',
      duration: '45 min',
      status: 'Confirmed',
      phone: '+1 (555) 234-5680',
    },
    {
      id: 23,
      customer: 'Kevin Hill',
      email: 'kevin@example.com',
      service: 'Review',
      date: '2024-01-26',
      time: '11:00 AM',
      duration: '30 min',
      status: 'Pending',
      phone: '+1 (555) 345-6781',
    },
    {
      id: 24,
      customer: 'Rachel Scott',
      email: 'rachel@example.com',
      service: 'Consultation',
      date: '2024-01-26',
      time: '1:30 PM',
      duration: '60 min',
      status: 'Confirmed',
      phone: '+1 (555) 456-7892',
    },
    {
      id: 25,
      customer: 'Brandon Green',
      email: 'brandon@example.com',
      service: 'Follow-up',
      date: '2024-01-27',
      time: '9:30 AM',
      duration: '30 min',
      status: 'Confirmed',
      phone: '+1 (555) 567-8903',
    },
    {
      id: 26,
      customer: 'Lauren Adams',
      email: 'lauren@example.com',
      service: 'Initial Meeting',
      date: '2024-01-27',
      time: '3:00 PM',
      duration: '45 min',
      status: 'Pending',
      phone: '+1 (555) 678-9014',
    },
    {
      id: 27,
      customer: 'Justin Baker',
      email: 'justin@example.com',
      service: 'Consultation',
      date: '2024-01-28',
      time: '10:00 AM',
      duration: '60 min',
      status: 'Confirmed',
      phone: '+1 (555) 789-0125',
    },
    {
      id: 28,
      customer: 'Samantha Nelson',
      email: 'samantha@example.com',
      service: 'Review',
      date: '2024-01-28',
      time: '2:00 PM',
      duration: '30 min',
      status: 'Confirmed',
      phone: '+1 (555) 890-1236',
    },
    {
      id: 29,
      customer: 'Tyler Carter',
      email: 'tyler@example.com',
      service: 'Follow-up',
      date: '2024-01-29',
      time: '11:30 AM',
      duration: '30 min',
      status: 'Pending',
      phone: '+1 (555) 901-2347',
    },
    {
      id: 30,
      customer: 'Megan Mitchell',
      email: 'megan@example.com',
      service: 'Consultation',
      date: '2024-01-29',
      time: '4:30 PM',
      duration: '60 min',
      status: 'Confirmed',
      phone: '+1 (555) 012-3458',
    },
    {
      id: 31,
      customer: 'Jordan Perez',
      email: 'jordan@example.com',
      service: 'Initial Meeting',
      date: '2024-01-30',
      time: '9:00 AM',
      duration: '45 min',
      status: 'Confirmed',
      phone: '+1 (555) 123-4570',
    },
    {
      id: 32,
      customer: 'Brittany Roberts',
      email: 'brittany@example.com',
      service: 'Review',
      date: '2024-01-30',
      time: '1:00 PM',
      duration: '30 min',
      status: 'Pending',
      phone: '+1 (555) 234-5681',
    },
  ];

  // Pagination calculations
  const totalPages = Math.ceil(bookings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentBookings = bookings.slice(startIndex, endIndex);

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
            placeholder="Search bookings..."
            className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 rounded-lg bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-sm sm:text-base"
          />
        </div>
        <button className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors text-sm sm:text-base font-medium">
          <Filter className="w-4 h-4" />
          <span>Filter</span>
        </button>
        <button className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg bg-gradient-to-br from-[#1E1E5F] to-[#7B4FFF] text-white font-semibold hover:opacity-90 transition-opacity text-sm sm:text-base">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Booking</span>
          <span className="sm:hidden">New</span>
        </button>
      </div>

      {/* Mobile List */}
      <div className="space-y-3 md:hidden my-2 sm:my-3 md:my-4">
        {currentBookings.map((booking) => (
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
        ))}
      </div>

      {/* Bookings Table - Desktop / Tablet */}
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
              {currentBookings.map((booking) => (
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
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-4 sm:px-6 md:px-8 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
              <span className="font-medium">{Math.min(endIndex, bookings.length)}</span> of{' '}
              <span className="font-medium">{bookings.length}</span> results
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

      {/* Pagination - Mobile (cards view) */}
      <div className="md:hidden mt-3 flex flex-col gap-3">
        <p className="text-xs text-gray-600 text-center">
          Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
          <span className="font-medium">{Math.min(endIndex, bookings.length)}</span> of{' '}
          <span className="font-medium">{bookings.length}</span> results
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
    </div>
  );
}
