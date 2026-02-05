'use client';

import { useEffect, useState } from 'react';
import { User, Phone, Calendar, Search, Plus, ChevronLeft, ChevronRight, X, Clock, Trash2, Edit2, Loader2 } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

interface BookingDetail {
  id: number;
  date: string;
  time: string;
  service: string;
  duration: string;
  status: string;
}

interface Customer {
  id: number;
  name: string;
  phone: string;
  email?: string;
  bookings: number;
  lastBooking: string;
  status: string;
  avatar: string;
  bookingDetails: BookingDetail[];
  notes?: string;
  tags?: string;
  created_at?: string;
}

export default function CustomersPage() {
  const toast = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedPhone, setEditedPhone] = useState('');
  const [editedNotes, setEditedNotes] = useState('');
  const [editedTags, setEditedTags] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [newCustomerNotes, setNewCustomerNotes] = useState('');
  const [newCustomerTags, setNewCustomerTags] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingId, setSavingId] = useState<number | null>(null);
  const itemsPerPage = 12;

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

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  useEffect(() => {
    const fetchCustomers = async () => {
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
        const res = await fetch(`${API_BASE_URL}/api/v1/clients/`, {
          headers: getHeaders(),
        });

        if (!res.ok) {
          throw new Error('Failed to load customers');
        }

        const data = await res.json();
        const formattedCustomers: Customer[] = await Promise.all(
          data.map(async (c: any) => {
            // Fetch bookings for this client
            const bookingsRes = await fetch(
              `${API_BASE_URL}/api/v1/bookings/?client=${c.id}`,
              { headers: getHeaders() }
            );
            const bookingsData = bookingsRes.ok ? await bookingsRes.json() : [];
            const bookingDetails: BookingDetail[] = bookingsData.map((b: any) => ({
              id: b.id,
              date: formatDate(b.starts_at),
              time: new Date(b.starts_at).toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
              }),
              service: b.service_name || 'N/A',
              duration: `${Math.round(
                (new Date(b.ends_at).getTime() - new Date(b.starts_at).getTime()) / 60000
              )} min`,
              status: b.status.charAt(0).toUpperCase() + b.status.slice(1),
            }));

            const initials = c.name
              .split(' ')
              .map((n: string) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2);

            return {
              id: c.id,
              name: c.name,
              phone: c.phone_number || '',
              email: c.email || '',
              bookings: c.bookings_count || bookingsData.length,
              lastBooking:
                bookingsData.length > 0
                  ? formatDate(bookingsData[0].starts_at)
                  : 'N/A',
              status: bookingsData.length > 0 ? 'Active' : 'Inactive',
              avatar: initials,
              bookingDetails,
              notes: c.notes || '',
              tags: c.tags || '',
              created_at: c.created_at,
            };
          })
        );

        setCustomers(formattedCustomers);
      } catch (err: any) {
        setError(err?.message || 'Failed to load customers');
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  const handleSaveEdit = async () => {
    if (!selectedCustomer) return;

    setSavingId(selectedCustomer.id);
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/v1/clients/${selectedCustomer.id}/`,
        {
          method: 'PATCH',
          headers: getHeaders(),
          body: JSON.stringify({
            name: editedName,
            phone_number: editedPhone,
            notes: editedNotes,
            tags: editedTags,
          }),
        }
      );

      if (!res.ok) {
        throw new Error('Failed to update customer');
      }

      const updated = await res.json();
      const initials = updated.name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

      const updatedCustomer: Customer = {
        ...selectedCustomer,
        name: updated.name,
        phone: updated.phone_number || '',
        avatar: initials,
        notes: updated.notes || '',
        tags: updated.tags || '',
      };

      setCustomers(
        customers.map((c) => (c.id === selectedCustomer.id ? updatedCustomer : c))
      );
      setSelectedCustomer(updatedCustomer);
      setIsEditing(false);
      toast.success('Customer updated');
    } catch (err: any) {
      const msg = err?.message || 'Failed to update customer';
      setError(msg);
      toast.error(msg);
    } finally {
      setSavingId(null);
    }
  };

  const handleDeleteCustomer = async () => {
    if (!selectedCustomer) return;

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/v1/clients/${selectedCustomer.id}/`,
        {
          method: 'DELETE',
          headers: getHeaders(),
        }
      );

      if (!res.ok) {
        throw new Error('Failed to delete customer');
      }

      setCustomers(customers.filter((c) => c.id !== selectedCustomer.id));
      setSelectedCustomer(null);
      setShowDeleteConfirm(false);
      toast.success('Customer deleted');
      const newTotalPages = Math.ceil((customers.length - 1) / itemsPerPage);
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages);
      }
    } catch (err: any) {
      const msg = err?.message || 'Failed to delete customer';
      setError(msg);
      toast.error(msg);
    }
  };

  const handleAddCustomer = async () => {
    if (!newCustomerName.trim() || !newCustomerPhone.trim()) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/clients/`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          name: newCustomerName.trim(),
          phone_number: newCustomerPhone.trim(),
          notes: newCustomerNotes.trim(),
          tags: newCustomerTags.trim(),
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to create customer');
      }

      const newClient = await res.json();
      const initials = newClient.name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

      const newCustomer: Customer = {
        id: newClient.id,
        name: newClient.name,
        phone: newClient.phone_number || '',
        email: newClient.email || '',
        bookings: 0,
        lastBooking: 'N/A',
        status: 'Active',
        avatar: initials,
        bookingDetails: [],
        notes: newClient.notes || '',
        tags: newClient.tags || '',
      };

      setCustomers([...customers, newCustomer]);
      setNewCustomerName('');
      setNewCustomerPhone('');
      setNewCustomerNotes('');
      setNewCustomerTags('');
      setShowAddModal(false);
      toast.success('Customer added');
    } catch (err: any) {
      const msg = err?.message || 'Failed to create customer';
      setError(msg);
      toast.error(msg);
    }
  };

  const normalizedSearch = search.trim().toLowerCase();

  const filteredCustomers = customers.filter((customer) => {
    if (!normalizedSearch) return true;
    return (
      customer.name.toLowerCase().includes(normalizedSearch) ||
      customer.phone.toLowerCase().includes(normalizedSearch)
    );
  });

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(filteredCustomers.length / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCustomers = filteredCustomers.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const totalBookings = filteredCustomers.reduce((sum, c) => sum + c.bookings, 0);

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const newThisMonth = filteredCustomers.filter((c) => {
    if (!c.created_at) return false;
    const created = new Date(c.created_at);
    return created >= startOfMonth;
  }).length;

  return (
    <>
      <div className="space-y-4 sm:space-y-5 md:space-y-6 lg:space-y-8">
        {/* Header */}
        <div className="mb-4 sm:mb-5 md:mb-6">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 sm:mb-3">
            Customers
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-gray-600">
            Manage your customer database and relationships
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 my-2 sm:my-3 md:my-4">
          <div className="p-4 sm:p-6 md:p-8 rounded-xl bg-white border border-gray-200 shadow-sm text-center">
            <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <User className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Total Customers</h3>
            </div>
            <p className="text-3xl sm:text-4xl font-bold text-gray-900">{customers.length}</p>
          </div>
          <div className="p-4 sm:p-6 md:p-8 rounded-xl bg-white border border-gray-200 shadow-sm text-center">
            <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Total Bookings</h3>
            </div>
            <p className="text-3xl sm:text-4xl font-bold text-gray-900">{totalBookings}</p>
          </div>
          <div className="p-4 sm:p-6 md:p-8 rounded-xl bg-white border border-gray-200 shadow-sm text-center">
            <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <User className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" />
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">New This Month</h3>
            </div>
            <p className="text-3xl sm:text-4xl font-bold text-gray-900">{newThisMonth}</p>
          </div>
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
            <span className="ml-3 text-gray-600">Loading customers...</span>
          </div>
        )}

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
              placeholder="Search by name or phone..."
              className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 rounded-lg bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-sm sm:text-base"
            />
          </div>
          <button
            onClick={() => {
              setShowAddModal(true);
              setNewCustomerName('');
              setNewCustomerPhone('');
            }}
            className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg bg-gradient-to-br from-[#1E1E5F] to-[#7B4FFF] text-white font-semibold hover:opacity-90 transition-opacity text-sm sm:text-base"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Customer</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>

        {/* Customers Grid */}
        {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
          {currentCustomers.map((customer) => (
            <div
              key={customer.id}
              className="p-4 sm:p-6 md:p-8 rounded-xl bg-white border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all shadow-sm"
            >
              <div className="flex flex-col items-center mb-4 sm:mb-6">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-[#1E1E5F] to-[#7B4FFF] flex items-center justify-center mb-3 sm:mb-4 shadow-sm">
                  <span className="text-white font-semibold text-base sm:text-lg">{customer.avatar}</span>
                </div>
                <h3 className="font-semibold text-gray-900 text-base sm:text-lg">
                  {customer.name}
                </h3>
              </div>

              <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-gray-600">
                  <Phone className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span>{customer.phone || 'No phone'}</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-gray-600">
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span>{customer.bookings} bookings</span>
                </div>
              </div>

              <div className="flex gap-2 sm:gap-3">
              <button
                onClick={() => {
                  setSelectedCustomer(customer);
                  setIsEditing(false);
                  setEditedName(customer.name);
                  setEditedPhone(customer.phone);
                  setEditedNotes(customer.notes || '');
                  setEditedTags(customer.tags || '');
                }}
                className="flex-1 px-3 sm:px-4 py-2 sm:py-3 rounded-lg bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors text-xs sm:text-sm font-medium"
              >
                View Details
              </button>
                <button className="px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors">
                  <Phone className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
        )}

        {/* Pagination */}
        {!loading && (
        <div className="rounded-xl bg-white border border-gray-200 shadow-sm px-4 sm:px-6 md:px-8 py-4 my-2 sm:my-3 md:my-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                <span className="font-medium">{Math.min(endIndex, filteredCustomers.length)}</span> of{' '}
                <span className="font-medium">{filteredCustomers.length}</span> customers
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

      {/* Customer Details Modal */}
      {selectedCustomer && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 sm:p-6"
          onClick={() => setSelectedCustomer(null)}
        >
          {/* Backdrop with blur */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
          
          {/* Modal Content */}
          <div
            className="relative bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl max-w-4xl w-full max-h-[85vh] sm:max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header - Mobile Optimized */}
            <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-white">
              <div className="flex items-start justify-between gap-3 mb-3 sm:mb-0">
                <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                  <div className="hidden sm:flex w-16 h-16 rounded-full bg-gradient-to-br from-[#1E1E5F] to-[#7B4FFF] items-center justify-center shadow-md flex-shrink-0">
                    <span className="text-white font-semibold text-xl">{selectedCustomer.avatar}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    {isEditing ? (
                      <div className="space-y-2 sm:space-y-3">
                        <input
                          type="text"
                          value={editedName}
                          onChange={(e) => setEditedName(e.target.value)}
                          className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-base sm:text-lg font-semibold"
                          placeholder="Customer Name"
                        />
                        <input
                          type="text"
                          value={editedPhone}
                          onChange={(e) => setEditedPhone(e.target.value)}
                          className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                          placeholder="Phone Number"
                        />
                      </div>
                    ) : (
                      <>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 break-words">{selectedCustomer.name}</h2>
                        <div className="flex items-center gap-2 mt-1">
                          <Phone className="w-4 h-4 text-gray-500 flex-shrink-0" />
                          <span className="text-sm text-gray-600 break-all">{selectedCustomer.phone || 'No phone'}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                  {isEditing ? (
                    <>
                      <button
                        onClick={handleSaveEdit}
                        disabled={savingId === selectedCustomer.id}
                        className="px-3 sm:px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {savingId === selectedCustomer.id ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          setEditedName(selectedCustomer.name);
                          setEditedPhone(selectedCustomer.phone);
                        }}
                        className="px-3 sm:px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors text-sm font-medium"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => setIsEditing(true)}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        aria-label="Edit customer"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                        aria-label="Delete customer"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => {
                      setSelectedCustomer(null);
                      setIsEditing(false);
                    }}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    aria-label="Close modal"
                  >
                    <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6">
              {/* Customer Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="p-3 sm:p-4 rounded-xl bg-purple-50 border border-purple-100">
                  <p className="text-xs sm:text-sm text-purple-600 font-medium mb-1">Total Bookings</p>
                  <p className="text-2xl sm:text-3xl font-bold text-purple-900">{selectedCustomer.bookings}</p>
                </div>
                <div className="p-3 sm:p-4 rounded-xl bg-blue-50 border border-blue-100">
                  <p className="text-xs sm:text-sm text-blue-600 font-medium mb-1">Last Booking</p>
                  <p className="text-base sm:text-lg font-semibold text-blue-900">{selectedCustomer.lastBooking}</p>
                </div>
              </div>

              {/* Booking History */}
              <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
                    Booking History ({selectedCustomer.bookings} bookings)
                  </h3>
                  <div className="space-y-2 sm:space-y-3">
                    {selectedCustomer.bookingDetails.map((booking) => (
                      <div
                        key={booking.id}
                        className="p-3 sm:p-4 rounded-xl border border-gray-200 hover:border-purple-300 hover:shadow-sm transition-all bg-white"
                      >
                        <div className="flex flex-col gap-2 sm:gap-3">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <div className="flex items-center gap-2 sm:gap-3 flex-1 flex-wrap">
                              <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                              <span className="font-medium text-gray-900 text-sm sm:text-base">
                                {booking.date}
                              </span>
                              <span className="text-gray-400 hidden sm:inline">•</span>
                              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                              <span className="text-gray-600 text-sm sm:text-base">
                                {booking.time}
                              </span>
                            </div>
                            <span className="self-start sm:self-auto px-2 sm:px-3 py-1 rounded-full bg-green-100 text-green-700 text-[10px] sm:text-xs font-medium flex-shrink-0">
                              {booking.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 ml-5 sm:ml-7">
                            <span className="font-medium">{booking.service}</span>
                            <span className="text-gray-400">•</span>
                            <span>{booking.duration}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedCustomer && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
          <div
            className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Customer</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <span className="font-semibold">{selectedCustomer.name}</span>? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCustomer}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors text-sm font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Customer Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setShowAddModal(false)}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
          <div
            className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-purple-50 to-white">
              <h2 className="text-2xl font-bold text-gray-900">Add New Customer</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Name
                </label>
                <input
                  type="text"
                  value={newCustomerName}
                  onChange={(e) => setNewCustomerName(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-base"
                  placeholder="Enter customer name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={newCustomerPhone}
                  onChange={(e) => setNewCustomerPhone(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-base"
                  placeholder="Enter phone number"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewCustomerName('');
                  setNewCustomerPhone('');
                }}
                className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCustomer}
                disabled={!newCustomerName.trim() || !newCustomerPhone.trim()}
                className="px-4 py-2 rounded-lg bg-gradient-to-br from-[#1E1E5F] to-[#7B4FFF] text-white hover:opacity-90 transition-opacity text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Customer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
