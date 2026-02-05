'use client';

import { useEffect, useState, useMemo } from 'react';
import { Plus, Trash2, Edit2, Check, X, Loader2, Tag } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  GBP: '£',
  AED: 'د.إ',
  SAR: '﷼',
  PKR: '₨',
};

type Service = {
  id: number;
  name: string;
  category?: string;
  price: string;
  currency: string;
  is_active: boolean;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

export default function ServicesPage() {
  const { user } = useAuth();
  const toast = useToast();

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | 'new' | null>(null);

  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');
   const [newCategory, setNewCategory] = useState('');

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editCategory, setEditCategory] = useState('');

  const [selectedServices, setSelectedServices] = useState<number[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [userCurrency, setUserCurrency] = useState(() => (user?.currency && CURRENCY_SYMBOLS[user.currency] != null ? user.currency : 'USD'));

  const [error, setError] = useState('');

  const accessToken =
    typeof window !== 'undefined'
      ? localStorage.getItem('elara_access_token')
      : null;

  const getHeaders = (): HeadersInit => {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }
    return headers;
  };

  // Sync currency from auth context (e.g. after saving in Account settings)
  useEffect(() => {
    if (user?.currency && CURRENCY_SYMBOLS[user.currency] != null) {
      setUserCurrency(user.currency);
    }
  }, [user?.currency]);

  // Fetch user currency from account settings so Price uses correct symbol
  useEffect(() => {
    if (!accessToken) return;
    const fetchUser = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/accounts/me/`, {
          headers: getHeaders(),
        });
        if (res.ok) {
          const data = await res.json();
          const currency = data.currency || 'USD';
          if (CURRENCY_SYMBOLS[currency] != null) {
            setUserCurrency(currency);
          }
        }
      } catch (err) {
        console.error('Failed to fetch user currency:', err);
      }
    };
    fetchUser();
  }, [accessToken]);

  const fetchServices = async () => {
    if (!accessToken) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/bookings/services/`, {
        headers: getHeaders(),
      });
      if (!res.ok) {
        throw new Error('Failed to load services');
      }
      const data = await res.json();
      setServices(
        data.map((s: any) => ({
          id: s.id,
          name: s.name,
          category: s.category || '',
          price: String(s.price),
          currency: s.currency,
          is_active: s.is_active,
        })),
      );
    } catch (err: any) {
      setError(err?.message || 'Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const toggleSelectService = (id: number) => {
    setSelectedServices((prev) =>
      prev.includes(id) ? prev.filter((sId) => sId !== id) : [...prev, id],
    );
  };

  const toggleSelectAll = () => {
    if (selectedServices.length === filteredServices.length) {
      setSelectedServices([]);
    } else {
      setSelectedServices(filteredServices.map((s) => s.id));
    }
  };

  const handleBulkUpdateActive = async (isActive: boolean) => {
    if (!accessToken || selectedServices.length === 0) return;
    setSavingId(0); // indicate bulk
    setError('');
    try {
      await Promise.all(
        selectedServices.map((id) =>
          fetch(`${API_BASE_URL}/api/v1/bookings/services/${id}/`, {
            method: 'PATCH',
            headers: getHeaders(),
            body: JSON.stringify({ is_active: isActive }),
          }),
        ),
      );
      setSelectedServices([]);
      await fetchServices();
      toast.success('Services updated');
    } catch (err: any) {
      const msg = err?.message || 'Failed to update services';
      setError(msg);
      toast.error(msg);
    } finally {
      setSavingId(null);
    }
  };

  const handleBulkDelete = async () => {
    if (!accessToken || selectedServices.length === 0) return;
    if (!window.confirm(`Delete ${selectedServices.length} service(s)? This cannot be undone.`)) {
      return;
    }
    setSavingId(0); // indicate bulk
    setError('');
    try {
      await Promise.all(
        selectedServices.map((id) =>
          fetch(`${API_BASE_URL}/api/v1/bookings/services/${id}/`, {
            method: 'DELETE',
            headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
          }),
        ),
      );
      setSelectedServices([]);
      await fetchServices();
      toast.success(`${selectedServices.length} service(s) deleted`);
    } catch (err: any) {
      const msg = err?.message || 'Failed to delete services';
      setError(msg);
      toast.error(msg);
    } finally {
      setSavingId(null);
    }
  };

  const categoryOptions = useMemo(() => {
    const set = new Set<string>();
    services.forEach((s) => {
      if (s.category && s.category.trim()) {
        set.add(s.category.trim());
      }
    });
    return Array.from(set).sort();
  }, [services]);

  const filteredServices = useMemo(
    () =>
      services.filter((service) =>
        filterCategory === 'all'
          ? true
          : (service.category || '').trim().toLowerCase() ===
            filterCategory.trim().toLowerCase(),
      ),
    [services, filterCategory],
  );

  useEffect(() => {
    fetchServices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPrice.trim()) return;
    if (!accessToken) return;

    setSavingId('new');
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/bookings/services/`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          name: newName.trim(),
          category: newCategory.trim() || undefined,
          price: newPrice.trim(),
          currency: userCurrency,
          is_active: true,
        }),
      });
      if (!res.ok) {
        throw new Error('Failed to add service');
      }
      setNewName('');
      setNewPrice('');
      setNewCategory('');
      await fetchServices();
      toast.success('Service added');
    } catch (err: any) {
      const msg = err?.message || 'Failed to add service';
      setError(msg);
      toast.error(msg);
    } finally {
      setSavingId(null);
    }
  };

  const startEdit = (service: Service) => {
    setEditingId(service.id);
    setEditName(service.name);
    setEditPrice(service.price);
    setEditCategory(service.category || '');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditPrice('');
  };

  const handleUpdate = async (id: number) => {
    const service = services.find((s) => s.id === id);
    if (!service || !accessToken) return;

    setSavingId(id);
    setError('');
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/v1/bookings/services/${id}/`,
        {
          method: 'PATCH',
          headers: getHeaders(),
          body: JSON.stringify({
            name: editName.trim(),
            price: editPrice.trim(),
            category: editCategory.trim() || undefined,
          }),
        },
      );
      if (!res.ok) {
        throw new Error('Failed to update service');
      }
      cancelEdit();
      await fetchServices();
      toast.success('Service updated');
    } catch (err: any) {
      const msg = err?.message || 'Failed to update service';
      setError(msg);
      toast.error(msg);
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (!accessToken) return;
    setSavingId(id);
    setError('');
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/v1/bookings/services/${id}/`,
        {
          method: 'DELETE',
          headers: accessToken
            ? { Authorization: `Bearer ${accessToken}` }
            : {},
        },
      );
      if (!res.ok && res.status !== 204) {
        throw new Error('Failed to delete service');
      }
      await fetchServices();
      toast.success('Service deleted');
    } catch (err: any) {
      const msg = err?.message || 'Failed to delete service';
      setError(msg);
      toast.error(msg);
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-5 md:space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="mb-4 sm:mb-5 md:mb-6">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 sm:mb-3">
          Services
        </h1>
        <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-2xl">
          Define the services your AI agent can offer callers, including pricing and categories.
        </p>
      </div>

      {/* New service form */}
      <form
        onSubmit={handleCreate}
        className="rounded-xl bg-white border border-gray-200 shadow-sm p-4 sm:p-5 md:p-6 space-y-3 sm:space-y-4"
      >
        <div className="flex items-center justify-between gap-2 sm:gap-4 mb-1">
          <p className="font-semibold text-gray-900 text-sm sm:text-base">
            Add service
          </p>
          {user && (
            <p className="text-xs text-gray-400">
              For: <span className="font-medium">{user.business_name || user.email}</span>
            </p>
          )}
        </div>
        <div className="flex flex-col md:flex-row gap-3 sm:gap-4">
          <div className="flex-1">
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
              Service name
            </label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Haircut"
              className="w-full px-3 sm:px-4 py-2.5 rounded-lg bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-sm"
            />
          </div>
          <div className="w-full md:w-40">
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
              Price
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                {CURRENCY_SYMBOLS[userCurrency] ?? userCurrency}
              </span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                placeholder="20"
                className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-sm"
              />
            </div>
          </div>
          <div className="w-full md:w-56">
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
              Category
            </label>
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="e.g. Hair, Skin, Consultation"
              className="w-full px-3 sm:px-4 py-2.5 rounded-lg bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-sm"
            />
          </div>
          <div className="md:self-end">
            <button
              type="submit"
              disabled={!newName.trim() || !newPrice.trim() || savingId === 'new'}
              className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-lg bg-gradient-to-br from-[#1E1E5F] to-[#7B4FFF] text-white text-sm font-semibold hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {savingId === 'new' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Add
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Error */}
      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      {/* List */}
      <div className="rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-4 sm:px-5 md:px-6 py-3 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-sm font-medium text-gray-800">
            Services ({filteredServices.length}
            {filterCategory !== 'all' ? ` in "${filterCategory}"` : ''})
          </p>
          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
            <div className="flex items-center gap-2">
              <label className="text-xs sm:text-sm text-gray-600">
                Category:
              </label>
              <select
                value={filterCategory}
                onChange={(e) => {
                  setFilterCategory(e.target.value);
                  setSelectedServices([]);
                }}
                className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs sm:text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              >
                <option value="all">All</option>
                {categoryOptions.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            {selectedServices.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleBulkUpdateActive(true)}
                  disabled={savingId === 0}
                  className="px-3 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 text-xs font-medium hover:bg-emerald-100 disabled:opacity-50"
                >
                  Activate ({selectedServices.length})
                </button>
                <button
                  type="button"
                  onClick={() => handleBulkUpdateActive(false)}
                  disabled={savingId === 0}
                  className="px-3 py-1.5 rounded-lg border border-yellow-200 bg-yellow-50 text-yellow-700 text-xs font-medium hover:bg-yellow-100 disabled:opacity-50"
                >
                  Deactivate
                </button>
                <button
                  type="button"
                  onClick={handleBulkDelete}
                  disabled={savingId === 0}
                  className="px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 text-red-700 text-xs font-medium hover:bg-red-100 disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div className="px-4 sm:px-5 md:px-6 py-6 flex items-center justify-center text-gray-500 text-sm">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Loading services…
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="px-4 sm:px-5 md:px-6 py-6 text-center text-sm text-gray-500">
            No services yet. Add your first service above to let the agent offer
            it on calls.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredServices.map((service) => {
              const isEditing = editingId === service.id;
              const isSaving = savingId === service.id;
              return (
                <div
                  key={service.id}
                  className="px-4 sm:px-5 md:px-6 py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <input
                      type="checkbox"
                      checked={selectedServices.includes(service.id)}
                      onChange={() => toggleSelectService(service.id)}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    {isEditing ? (
                      <div className="flex flex-col md:flex-row gap-3 md:gap-4 flex-1">
                        <div className="flex-1">
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-white border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                          />
                        </div>
                        <div className="w-full md:w-40">
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                              {CURRENCY_SYMBOLS[userCurrency] ?? userCurrency}
                            </span>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={editPrice}
                              onChange={(e) => setEditPrice(e.target.value)}
                              className="w-full pl-9 pr-3 py-2 rounded-lg bg-white border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                            />
                          </div>
                        </div>
                        <div className="w-full md:w-56">
                          <input
                            type="text"
                            value={editCategory}
                            onChange={(e) => setEditCategory(e.target.value)}
                            placeholder="Category"
                            className="w-full px-3 py-2 rounded-lg bg-white border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900 text-sm sm:text-base truncate">
                            {service.name}
                          </p>
                          {service.category && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 text-[10px] sm:text-xs font-medium flex-shrink-0">
                              <Tag className="w-3 h-3" />
                              {service.category}
                            </span>
                          )}
                        </div>
                        <p className="text-xs sm:text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                          <span>{CURRENCY_SYMBOLS[service.currency] ?? service.currency}</span>
                          {service.price}
                          {!service.is_active && (
                            <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500 text-[10px] font-medium">
                              Inactive
                            </span>
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    {isEditing ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleUpdate(service.id)}
                          disabled={isSaving}
                          className="inline-flex items-center justify-center rounded-lg border border-emerald-500 text-emerald-600 hover:bg-emerald-50 px-2.5 py-1.5 text-xs font-medium disabled:opacity-60"
                        >
                          {isSaving ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Check className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={cancelEdit}
                          disabled={isSaving}
                          className="inline-flex items-center justify-center rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 px-2.5 py-1.5 text-xs font-medium disabled:opacity-60"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => startEdit(service)}
                          className="inline-flex items-center justify-center rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 px-2.5 py-1.5 text-xs font-medium"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(service.id)}
                          disabled={isSaving}
                          className="inline-flex items-center justify-center rounded-lg border border-red-200 text-red-600 hover:bg-red-50 px-2.5 py-1.5 text-xs font-medium disabled:opacity-60"
                        >
                          {isSaving ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

