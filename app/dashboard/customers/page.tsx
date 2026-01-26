'use client';

import { useState } from 'react';
import { User, Phone, Calendar, Search, Filter, Plus, ChevronLeft, ChevronRight, X, Clock, Trash2, Edit2 } from 'lucide-react';

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
  bookings: number;
  lastBooking: string;
  status: string;
  avatar: string;
  bookingDetails: BookingDetail[];
}

export default function CustomersPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedPhone, setEditedPhone] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const itemsPerPage = 12;

  const [customers, setCustomers] = useState<Customer[]>([
    {
      id: 1,
      name: 'John Doe',
      phone: '+1 (555) 123-4567',
      bookings: 12,
      lastBooking: '2024-01-10',
      status: 'Active',
      avatar: 'JD',
      bookingDetails: [
        { id: 1, date: '2024-01-10', time: '2:00 PM', service: 'Consultation', duration: '60 min', status: 'Completed' },
        { id: 2, date: '2024-01-05', time: '10:30 AM', service: 'Follow-up', duration: '30 min', status: 'Completed' },
        { id: 3, date: '2023-12-28', time: '3:00 PM', service: 'Review', duration: '45 min', status: 'Completed' },
        { id: 4, date: '2023-12-20', time: '11:00 AM', service: 'Consultation', duration: '60 min', status: 'Completed' },
        { id: 5, date: '2023-12-15', time: '2:30 PM', service: 'Follow-up', duration: '30 min', status: 'Completed' },
        { id: 6, date: '2023-12-10', time: '9:00 AM', service: 'Initial Meeting', duration: '45 min', status: 'Completed' },
        { id: 7, date: '2023-12-05', time: '1:00 PM', service: 'Consultation', duration: '60 min', status: 'Completed' },
        { id: 8, date: '2023-11-28', time: '3:30 PM', service: 'Review', duration: '30 min', status: 'Completed' },
        { id: 9, date: '2023-11-20', time: '10:00 AM', service: 'Follow-up', duration: '30 min', status: 'Completed' },
        { id: 10, date: '2023-11-15', time: '2:00 PM', service: 'Consultation', duration: '60 min', status: 'Completed' },
        { id: 11, date: '2023-11-10', time: '11:30 AM', service: 'Initial Meeting', duration: '45 min', status: 'Completed' },
        { id: 12, date: '2023-11-05', time: '4:00 PM', service: 'Review', duration: '30 min', status: 'Completed' },
      ],
    },
    {
      id: 2,
      name: 'Jane Smith',
      phone: '+1 (555) 234-5678',
      bookings: 8,
      lastBooking: '2024-01-08',
      status: 'Active',
      avatar: 'JS',
      bookingDetails: [
        { id: 1, date: '2024-01-08', time: '3:30 PM', service: 'Follow-up', duration: '30 min', status: 'Completed' },
        { id: 2, date: '2024-01-02', time: '2:00 PM', service: 'Consultation', duration: '60 min', status: 'Completed' },
        { id: 3, date: '2023-12-25', time: '10:00 AM', service: 'Initial Meeting', duration: '45 min', status: 'Completed' },
        { id: 4, date: '2023-12-18', time: '1:30 PM', service: 'Review', duration: '30 min', status: 'Completed' },
        { id: 5, date: '2023-12-12', time: '3:00 PM', service: 'Follow-up', duration: '30 min', status: 'Completed' },
        { id: 6, date: '2023-12-05', time: '10:30 AM', service: 'Consultation', duration: '60 min', status: 'Completed' },
        { id: 7, date: '2023-11-28', time: '2:30 PM', service: 'Initial Meeting', duration: '45 min', status: 'Completed' },
        { id: 8, date: '2023-11-20', time: '11:00 AM', service: 'Review', duration: '30 min', status: 'Completed' },
      ],
    },
    {
      id: 3,
      name: 'Mike Johnson',
      phone: '+1 (555) 345-6789',
      bookings: 5,
      lastBooking: '2024-01-05',
      status: 'Active',
      avatar: 'MJ',
      bookingDetails: [
        { id: 1, date: '2024-01-05', time: '10:00 AM', service: 'Initial Meeting', duration: '45 min', status: 'Completed' },
        { id: 2, date: '2023-12-22', time: '1:30 PM', service: 'Consultation', duration: '60 min', status: 'Completed' },
      ],
    },
    {
      id: 4,
      name: 'Sarah Williams',
      phone: '+1 (555) 456-7890',
      bookings: 15,
      lastBooking: '2024-01-12',
      status: 'Active',
      avatar: 'SW',
      bookingDetails: [
        { id: 1, date: '2024-01-12', time: '1:00 PM', service: 'Consultation', duration: '60 min', status: 'Completed' },
        { id: 2, date: '2024-01-05', time: '4:00 PM', service: 'Follow-up', duration: '30 min', status: 'Completed' },
        { id: 3, date: '2023-12-29', time: '11:30 AM', service: 'Review', duration: '45 min', status: 'Completed' },
        { id: 4, date: '2023-12-20', time: '2:30 PM', service: 'Consultation', duration: '60 min', status: 'Completed' },
        { id: 5, date: '2023-12-15', time: '10:00 AM', service: 'Follow-up', duration: '30 min', status: 'Completed' },
        { id: 6, date: '2023-12-10', time: '3:00 PM', service: 'Initial Meeting', duration: '45 min', status: 'Completed' },
        { id: 7, date: '2023-12-05', time: '1:30 PM', service: 'Consultation', duration: '60 min', status: 'Completed' },
        { id: 8, date: '2023-11-28', time: '11:00 AM', service: 'Review', duration: '30 min', status: 'Completed' },
        { id: 9, date: '2023-11-20', time: '2:00 PM', service: 'Follow-up', duration: '30 min', status: 'Completed' },
        { id: 10, date: '2023-11-15', time: '4:30 PM', service: 'Consultation', duration: '60 min', status: 'Completed' },
        { id: 11, date: '2023-11-10', time: '9:30 AM', service: 'Initial Meeting', duration: '45 min', status: 'Completed' },
        { id: 12, date: '2023-11-05', time: '1:00 PM', service: 'Review', duration: '30 min', status: 'Completed' },
        { id: 13, date: '2023-10-28', time: '3:30 PM', service: 'Consultation', duration: '60 min', status: 'Completed' },
        { id: 14, date: '2023-10-20', time: '10:30 AM', service: 'Follow-up', duration: '30 min', status: 'Completed' },
        { id: 15, date: '2023-10-15', time: '2:00 PM', service: 'Review', duration: '30 min', status: 'Completed' },
      ],
    },
    {
      id: 5,
      name: 'David Brown',
      phone: '+1 (555) 567-8901',
      bookings: 3,
      lastBooking: '2023-12-20',
      status: 'Inactive',
      avatar: 'DB',
      bookingDetails: [
        { id: 1, date: '2023-12-20', time: '11:00 AM', service: 'Review', duration: '30 min', status: 'Completed' },
        { id: 2, date: '2023-11-15', time: '3:00 PM', service: 'Consultation', duration: '60 min', status: 'Completed' },
      ],
    },
    {
      id: 6,
      name: 'Emily Davis',
      phone: '+1 (555) 678-9012',
      bookings: 20,
      lastBooking: '2024-01-14',
      status: 'Active',
      avatar: 'ED',
      bookingDetails: [
        { id: 1, date: '2024-01-14', time: '2:30 PM', service: 'Consultation', duration: '60 min', status: 'Completed' },
        { id: 2, date: '2024-01-08', time: '10:00 AM', service: 'Follow-up', duration: '30 min', status: 'Completed' },
        { id: 3, date: '2024-01-02', time: '1:30 PM', service: 'Review', duration: '45 min', status: 'Completed' },
        { id: 4, date: '2023-12-26', time: '3:30 PM', service: 'Consultation', duration: '60 min', status: 'Completed' },
      ],
    },
    {
      id: 7,
      name: 'Robert Wilson',
      phone: '+1 (555) 789-0123',
      bookings: 9,
      lastBooking: '2024-01-11',
      status: 'Active',
      avatar: 'RW',
      bookingDetails: [
        { id: 1, date: '2024-01-11', time: '9:00 AM', service: 'Follow-up', duration: '30 min', status: 'Completed' },
        { id: 2, date: '2024-01-04', time: '2:00 PM', service: 'Consultation', duration: '60 min', status: 'Completed' },
      ],
    },
    {
      id: 8,
      name: 'Lisa Anderson',
      phone: '+1 (555) 890-1234',
      bookings: 14,
      lastBooking: '2024-01-09',
      status: 'Active',
      avatar: 'LA',
      bookingDetails: [
        { id: 1, date: '2024-01-09', time: '4:00 PM', service: 'Initial Meeting', duration: '45 min', status: 'Completed' },
        { id: 2, date: '2024-01-03', time: '11:00 AM', service: 'Consultation', duration: '60 min', status: 'Completed' },
      ],
    },
    {
      id: 9,
      name: 'Michael Taylor',
      phone: '+1 (555) 901-2345',
      bookings: 7,
      lastBooking: '2024-01-07',
      status: 'Active',
      avatar: 'MT',
      bookingDetails: [
        { id: 1, date: '2024-01-07', time: '10:30 AM', service: 'Consultation', duration: '60 min', status: 'Completed' },
      ],
    },
    {
      id: 10,
      name: 'Jennifer Martinez',
      phone: '+1 (555) 012-3456',
      bookings: 18,
      lastBooking: '2024-01-13',
      status: 'Active',
      avatar: 'JM',
      bookingDetails: [
        { id: 1, date: '2024-01-13', time: '3:00 PM', service: 'Review', duration: '30 min', status: 'Completed' },
        { id: 2, date: '2024-01-06', time: '1:00 PM', service: 'Consultation', duration: '60 min', status: 'Completed' },
      ],
    },
    {
      id: 11,
      name: 'Christopher Lee',
      phone: '+1 (555) 123-4568',
      bookings: 6,
      lastBooking: '2024-01-06',
      status: 'Active',
      avatar: 'CL',
      bookingDetails: [
        { id: 1, date: '2024-01-06', time: '11:00 AM', service: 'Follow-up', duration: '30 min', status: 'Completed' },
      ],
    },
    {
      id: 12,
      name: 'Amanda White',
      phone: '+1 (555) 234-5679',
      bookings: 11,
      lastBooking: '2024-01-10',
      status: 'Active',
      avatar: 'AW',
      bookingDetails: [
        { id: 1, date: '2024-01-10', time: '1:30 PM', service: 'Consultation', duration: '60 min', status: 'Completed' },
      ],
    },
    {
      id: 13,
      name: 'Daniel Harris',
      phone: '+1 (555) 345-6780',
      bookings: 4,
      lastBooking: '2023-12-28',
      status: 'Inactive',
      avatar: 'DH',
      bookingDetails: [
        { id: 1, date: '2023-12-28', time: '9:30 AM', service: 'Initial Meeting', duration: '45 min', status: 'Completed' },
      ],
    },
    {
      id: 14,
      name: 'Jessica Clark',
      phone: '+1 (555) 456-7891',
      bookings: 16,
      lastBooking: '2024-01-12',
      status: 'Active',
      avatar: 'JC',
      bookingDetails: [
        { id: 1, date: '2024-01-12', time: '2:00 PM', service: 'Review', duration: '30 min', status: 'Completed' },
      ],
    },
    {
      id: 15,
      name: 'Matthew Lewis',
      phone: '+1 (555) 567-8902',
      bookings: 10,
      lastBooking: '2024-01-08',
      status: 'Active',
      avatar: 'ML',
      bookingDetails: [
        { id: 1, date: '2024-01-08', time: '10:00 AM', service: 'Consultation', duration: '60 min', status: 'Completed' },
      ],
    },
    {
      id: 16,
      name: 'Ashley Walker',
      phone: '+1 (555) 678-9013',
      bookings: 13,
      lastBooking: '2024-01-11',
      status: 'Active',
      avatar: 'AW',
      bookingDetails: [
        { id: 1, date: '2024-01-11', time: '3:30 PM', service: 'Follow-up', duration: '30 min', status: 'Completed' },
      ],
    },
    {
      id: 17,
      name: 'James Hall',
      phone: '+1 (555) 789-0124',
      bookings: 8,
      lastBooking: '2024-01-09',
      status: 'Active',
      avatar: 'JH',
      bookingDetails: [
        { id: 1, date: '2024-01-09', time: '11:30 AM', service: 'Initial Meeting', duration: '45 min', status: 'Completed' },
      ],
    },
    {
      id: 18,
      name: 'Michelle Allen',
      phone: '+1 (555) 890-1235',
      bookings: 19,
      lastBooking: '2024-01-14',
      status: 'Active',
      avatar: 'MA',
      bookingDetails: [
        { id: 1, date: '2024-01-14', time: '1:00 PM', service: 'Consultation', duration: '60 min', status: 'Completed' },
      ],
    },
    {
      id: 19,
      name: 'Andrew Young',
      phone: '+1 (555) 901-2346',
      bookings: 5,
      lastBooking: '2023-12-15',
      status: 'Inactive',
      avatar: 'AY',
      bookingDetails: [
        { id: 1, date: '2023-12-15', time: '9:00 AM', service: 'Review', duration: '30 min', status: 'Completed' },
      ],
    },
    {
      id: 20,
      name: 'Stephanie King',
      phone: '+1 (555) 012-3457',
      bookings: 22,
      lastBooking: '2024-01-15',
      status: 'Active',
      avatar: 'SK',
      bookingDetails: [
        { id: 1, date: '2024-01-15', time: '4:00 PM', service: 'Follow-up', duration: '30 min', status: 'Completed' },
      ],
    },
    {
      id: 21,
      name: 'Ryan Wright',
      phone: '+1 (555) 123-4569',
      bookings: 7,
      lastBooking: '2024-01-07',
      status: 'Active',
      avatar: 'RW',
      bookingDetails: [
        { id: 1, date: '2024-01-07', time: '10:30 AM', service: 'Consultation', duration: '60 min', status: 'Completed' },
      ],
    },
    {
      id: 22,
      name: 'Nicole Lopez',
      phone: '+1 (555) 234-5680',
      bookings: 12,
      lastBooking: '2024-01-10',
      status: 'Active',
      avatar: 'NL',
      bookingDetails: [
        { id: 1, date: '2024-01-10', time: '2:30 PM', service: 'Initial Meeting', duration: '45 min', status: 'Completed' },
      ],
    },
    {
      id: 23,
      name: 'Kevin Hill',
      phone: '+1 (555) 345-6781',
      bookings: 9,
      lastBooking: '2024-01-08',
      status: 'Active',
      avatar: 'KH',
      bookingDetails: [
        { id: 1, date: '2024-01-08', time: '11:00 AM', service: 'Review', duration: '30 min', status: 'Completed' },
      ],
    },
    {
      id: 24,
      name: 'Rachel Scott',
      phone: '+1 (555) 456-7892',
      bookings: 14,
      lastBooking: '2024-01-12',
      status: 'Active',
      avatar: 'RS',
      bookingDetails: [
        { id: 1, date: '2024-01-12', time: '1:30 PM', service: 'Consultation', duration: '60 min', status: 'Completed' },
      ],
    },
    {
      id: 25,
      name: 'Brandon Green',
      phone: '+1 (555) 567-8903',
      bookings: 6,
      lastBooking: '2023-11-20',
      status: 'Inactive',
      avatar: 'BG',
      bookingDetails: [
        { id: 1, date: '2023-11-20', time: '9:30 AM', service: 'Follow-up', duration: '30 min', status: 'Completed' },
      ],
    },
    {
      id: 26,
      name: 'Lauren Adams',
      phone: '+1 (555) 678-9014',
      bookings: 17,
      lastBooking: '2024-01-13',
      status: 'Active',
      avatar: 'LA',
      bookingDetails: [
        { id: 1, date: '2024-01-13', time: '3:00 PM', service: 'Consultation', duration: '60 min', status: 'Completed' },
      ],
    },
    {
      id: 27,
      name: 'Justin Baker',
      phone: '+1 (555) 789-0125',
      bookings: 11,
      lastBooking: '2024-01-09',
      status: 'Active',
      avatar: 'JB',
      bookingDetails: [
        { id: 1, date: '2024-01-09', time: '2:00 PM', service: 'Review', duration: '30 min', status: 'Completed' },
      ],
    },
    {
      id: 28,
      name: 'Samantha Nelson',
      phone: '+1 (555) 890-1236',
      bookings: 15,
      lastBooking: '2024-01-11',
      status: 'Active',
      avatar: 'SN',
      bookingDetails: [
        { id: 1, date: '2024-01-11', time: '4:00 PM', service: 'Follow-up', duration: '30 min', status: 'Completed' },
      ],
    },
    {
      id: 29,
      name: 'Tyler Carter',
      phone: '+1 (555) 901-2347',
      bookings: 8,
      lastBooking: '2024-01-06',
      status: 'Active',
      avatar: 'TC',
      bookingDetails: [
        { id: 1, date: '2024-01-06', time: '11:30 AM', service: 'Initial Meeting', duration: '45 min', status: 'Completed' },
      ],
    },
    {
      id: 30,
      name: 'Megan Mitchell',
      phone: '+1 (555) 012-3458',
      bookings: 21,
      lastBooking: '2024-01-14',
      status: 'Active',
      avatar: 'MM',
      bookingDetails: [
        { id: 1, date: '2024-01-14', time: '4:30 PM', service: 'Consultation', duration: '60 min', status: 'Completed' },
      ],
    },
    {
      id: 31,
      name: 'Jordan Perez',
      phone: '+1 (555) 123-4570',
      bookings: 4,
      lastBooking: '2023-12-10',
      status: 'Inactive',
      avatar: 'JP',
      bookingDetails: [
        { id: 1, date: '2023-12-10', time: '9:00 AM', service: 'Review', duration: '30 min', status: 'Completed' },
      ],
    },
    {
      id: 32,
      name: 'Brittany Roberts',
      phone: '+1 (555) 234-5681',
      bookings: 13,
      lastBooking: '2024-01-10',
      status: 'Active',
      avatar: 'BR',
      bookingDetails: [
        { id: 1, date: '2024-01-10', time: '1:00 PM', service: 'Consultation', duration: '60 min', status: 'Completed' },
      ],
    },
  ]);

  // Pagination calculations
  const totalPages = Math.ceil(customers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCustomers = customers.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const totalBookings = customers.reduce((sum, c) => sum + c.bookings, 0);

  const handleSaveEdit = () => {
    if (selectedCustomer) {
      setCustomers(customers.map(c => 
        c.id === selectedCustomer.id 
          ? { ...c, name: editedName, phone: editedPhone, avatar: editedName.split(' ').map(n => n[0]).join('').toUpperCase() }
          : c
      ));
      setSelectedCustomer({ ...selectedCustomer, name: editedName, phone: editedPhone, avatar: editedName.split(' ').map(n => n[0]).join('').toUpperCase() });
      setIsEditing(false);
    }
  };

  const handleDeleteCustomer = () => {
    if (selectedCustomer) {
      setCustomers(customers.filter(c => c.id !== selectedCustomer.id));
      setSelectedCustomer(null);
      setShowDeleteConfirm(false);
      // Reset to first page if current page becomes empty
      const newTotalPages = Math.ceil((customers.length - 1) / itemsPerPage);
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages);
      }
    }
  };

  const handleAddCustomer = () => {
    if (newCustomerName.trim() && newCustomerPhone.trim()) {
      const newId = Math.max(...customers.map(c => c.id), 0) + 1;
      const newAvatar = newCustomerName.split(' ').map(n => n[0]).join('').toUpperCase();
      const newCustomer: Customer = {
        id: newId,
        name: newCustomerName.trim(),
        phone: newCustomerPhone.trim(),
        bookings: 0,
        lastBooking: 'N/A',
        status: 'Active',
        avatar: newAvatar,
        bookingDetails: [],
      };
      setCustomers([...customers, newCustomer]);
      setNewCustomerName('');
      setNewCustomerPhone('');
      setShowAddModal(false);
    }
  };

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
            <p className="text-3xl sm:text-4xl font-bold text-gray-900">12</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 my-2 sm:my-3 md:my-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search customers..."
              className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 rounded-lg bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-sm sm:text-base"
            />
          </div>
          <button className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors text-sm sm:text-base font-medium">
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </button>
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
                  <span>{customer.phone}</span>
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

        {/* Pagination */}
        <div className="rounded-xl bg-white border border-gray-200 shadow-sm px-4 sm:px-6 md:px-8 py-4 my-2 sm:my-3 md:my-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                <span className="font-medium">{Math.min(endIndex, customers.length)}</span> of{' '}
                <span className="font-medium">{customers.length}</span> customers
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
      </div>

      {/* Customer Details Modal */}
      {selectedCustomer && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedCustomer(null)}
        >
          {/* Backdrop with blur */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
          
          {/* Modal Content */}
          <div
            className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-purple-50 to-white">
              <div className="flex items-center gap-4 flex-1">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#1E1E5F] to-[#7B4FFF] flex items-center justify-center shadow-md flex-shrink-0">
                  <span className="text-white font-semibold text-xl">{selectedCustomer.avatar}</span>
                </div>
                <div className="flex-1">
                  {isEditing ? (
                    <div className="space-y-3 pr-4">
                      <input
                        type="text"
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-lg font-semibold"
                        placeholder="Customer Name"
                      />
                      <input
                        type="text"
                        value={editedPhone}
                        onChange={(e) => setEditedPhone(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                        placeholder="Phone Number"
                      />
                    </div>
                  ) : (
                    <>
                      <h2 className="text-2xl font-bold text-gray-900">{selectedCustomer.name}</h2>
                      <div className="flex items-center gap-2 mt-1">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">{selectedCustomer.phone}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleSaveEdit}
                      className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors text-sm font-medium"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setEditedName(selectedCustomer.name);
                        setEditedPhone(selectedCustomer.phone);
                      }}
                      className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors text-sm font-medium"
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
                      <Edit2 className="w-5 h-5 text-gray-500" />
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                      aria-label="Delete customer"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5 text-red-500" />
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
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              {/* Customer Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="p-4 rounded-xl bg-purple-50 border border-purple-100">
                  <p className="text-sm text-purple-600 font-medium mb-1">Total Bookings</p>
                  <p className="text-3xl font-bold text-purple-900">{selectedCustomer.bookings}</p>
                </div>
                <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
                  <p className="text-sm text-blue-600 font-medium mb-1">Last Booking</p>
                  <p className="text-lg font-semibold text-blue-900">{selectedCustomer.lastBooking}</p>
                </div>
              </div>

              {/* Bookings List */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Booking History ({selectedCustomer.bookings} bookings)
                </h3>
                <div className="space-y-3">
                  {selectedCustomer.bookingDetails.map((booking) => (
                    <div
                      key={booking.id}
                      className="p-4 rounded-xl border border-gray-200 hover:border-purple-300 hover:shadow-sm transition-all bg-white"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="font-medium text-gray-900">{booking.date}</span>
                            <span className="text-gray-400">•</span>
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">{booking.time}</span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600 ml-7">
                            <span className="font-medium">{booking.service}</span>
                            <span className="text-gray-400">•</span>
                            <span>{booking.duration}</span>
                          </div>
                        </div>
                        <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                          {booking.status}
                        </span>
                      </div>
                    </div>
                  ))}
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
