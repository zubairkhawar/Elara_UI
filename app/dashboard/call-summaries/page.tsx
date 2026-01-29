'use client';

import { useCallback, useEffect, useState } from 'react';
import { Search, Filter, PhoneCall, Clock, User, ChevronLeft, ChevronRight, FileText, X } from 'lucide-react';
import { authenticatedFetch } from '@/utils/api';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

const DEBOUNCE_MS = 300;

type CallSummaryRow = {
  id: number;
  callerName: string;
  callerNumber: string;
  service: string;
  price: number | null;
  currency: string;
  createdAt: string;
  durationMinutes: number | null;
  outcome: string;
  summary: string;
  transcript: string;
};

function formatCallDate(iso: string | null): string {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export default function CallSummariesPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedService, setSelectedService] = useState<string | 'all'>('all');
  const [serviceOptions, setServiceOptions] = useState<string[]>([]);
  const [calls, setCalls] = useState<CallSummaryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [transcriptModal, setTranscriptModal] = useState<CallSummaryRow | null>(null);
  const pageSize = 10;

  // Debounce search input (300ms)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const t = window.setTimeout(() => setDebouncedSearch(search), DEBOUNCE_MS);
    return () => window.clearTimeout(t);
  }, [search]);

  const fetchCallSummaries = useCallback(async () => {
    if (typeof window === 'undefined') return;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch.trim()) params.set('search', debouncedSearch.trim());
      if (selectedService !== 'all') params.set('service', selectedService);
      const res = await authenticatedFetch(
        `${API_BASE_URL}/api/v1/call-summaries/?${params.toString()}`
      );
      if (!res.ok) {
        if (res.status === 401) return;
        throw new Error('Failed to load call summaries');
      }
      const data = (await res.json()) as Array<{
        id: number;
        caller_name: string;
        caller_number: string;
        service_name: string;
        price: string | null;
        currency: string;
        created_at: string;
        duration_minutes: number | null;
        outcome: string;
        summary: string;
        transcript: string;
      }>;
      setCalls(
        data.map((c) => ({
          id: c.id,
          callerName: c.caller_name || '—',
          callerNumber: c.caller_number || '—',
          service: c.service_name || '—',
          price: c.price != null ? Number(c.price) : null,
          currency: c.currency || 'USD',
          createdAt: formatCallDate(c.created_at),
          durationMinutes: c.duration_minutes ?? null,
          outcome: c.outcome || '—',
          summary: c.summary || '—',
          transcript: c.transcript || '',
        }))
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
      setCalls([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, selectedService]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    fetchCallSummaries();
  }, [fetchCallSummaries]);

  // Load services for filter chips
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const loadServices = async () => {
      try {
        const res = await authenticatedFetch(`${API_BASE_URL}/api/v1/bookings/services/`);
        if (!res.ok) return;
        const data = await res.json();
        const names = (data as { name?: string }[])
          .map((s) => s.name as string)
          .filter(Boolean);
        setServiceOptions(Array.from(new Set(names)));
      } catch {
        // Fail silently
      }
    };

    loadServices();
  }, []);

  const totalPages = Math.max(1, Math.ceil(calls.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const current = calls.slice(startIndex, startIndex + pageSize);

  const goToPage = (p: number) => {
    setPage(Math.max(1, Math.min(p, totalPages)));
  };

  return (
    <div className="space-y-4 sm:space-y-5 md:space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="mb-4 sm:mb-5 md:mb-6">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 sm:mb-3">
          Call Summaries
        </h1>
        <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-2xl">
          Review AI call outcomes, bookings, and customer intents. Summaries are
          retained for the last 2 months to keep things fast and focused.
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3 sm:gap-4 my-2 sm:my-3 md:my-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by caller, number, or summary..."
            className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 rounded-lg bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-sm sm:text-base"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => {
              setSelectedService('all');
              setSearch('');
              setPage(1);
            }}
            className={`flex-1 inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border text-xs sm:text-sm font-medium transition-colors ${
              selectedService === 'all'
                ? 'bg-purple-600 text-white border-purple-600'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-4 h-4" />
            All services
          </button>
          {serviceOptions.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => {
                setSelectedService(name);
                setPage(1);
              }}
              className={`hidden sm:inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                selectedService === name
                  ? 'bg-purple-600 text-white border-purple-600'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile list */}
      <div className="space-y-3 md:hidden my-2 sm:my-3 md:my-4">
        {loading ? (
          <p className="text-sm text-gray-500 py-4">Loading call summaries…</p>
        ) : current.length === 0 ? (
          <p className="text-sm text-gray-500 py-4">No call summaries yet. They will appear here when Vapi sends end-of-call reports to your webhook.</p>
        ) : current.map((call) => (
          <div
            key={call.id}
            className="rounded-xl bg-white border border-gray-200 shadow-sm p-4 flex flex-col gap-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-gray-900 text-sm">
                  {call.callerName}
                </p>
                <p className="text-xs text-gray-500">{call.callerNumber}</p>
              </div>
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-purple-50 text-purple-700 text-[11px] font-medium">
                <PhoneCall className="w-3 h-3" />
                {call.service}
              </span>
            </div>
            <p className="text-xs text-gray-500 flex items-center gap-1.5">
              <Clock className="w-3 h-3" />
              <span>{call.createdAt}</span>
              <span className="text-gray-400">•</span>
              <span>{call.durationMinutes} min</span>
            </p>
            <p className="text-xs text-gray-500 flex items-center gap-1.5">
              <User className="w-3 h-3" />
              <span>
                {call.service}
                {call.price != null && ` — ${call.price}${call.currency === 'USD' ? '$' : ` ${call.currency}`}`}
              </span>
            </p>
            <p className="text-sm text-gray-700 mt-1">{call.summary}</p>
            <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-2 py-1 mt-1 inline-flex max-w-fit">
              {call.outcome}
            </p>
            <button
              type="button"
              onClick={() => setTranscriptModal(call)}
              className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-medium"
            >
              <FileText className="w-3.5 h-3.5" />
              View transcript
            </button>
          </div>
        ))}
      </div>

      {/* Desktop / tablet table */}
      <div className="hidden md:block rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden my-2 sm:my-3 md:my-4">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 sm:px-6 md:px-8 py-3 text-left font-semibold text-gray-600">
                  Caller
                </th>
                <th className="px-4 sm:px-6 md:px-8 py-3 text-left font-semibold text-gray-600">
                  Service
                </th>
                <th className="px-4 sm:px-6 md:px-8 py-3 text-left font-semibold text-gray-600">
                  When
                </th>
                <th className="px-4 sm:px-6 md:px-8 py-3 text-left font-semibold text-gray-600">
                  Outcome
                </th>
                <th className="px-4 sm:px-6 md:px-8 py-3 text-left font-semibold text-gray-600 w-2/5">
                  Summary
                </th>
                <th className="px-4 sm:px-6 md:px-8 py-3 text-left font-semibold text-gray-600">
                  Transcript
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 sm:px-6 md:px-8 py-8 text-center text-sm text-gray-500">
                    Loading call summaries…
                  </td>
                </tr>
              ) : current.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 sm:px-6 md:px-8 py-8 text-center text-sm text-gray-500">
                    No call summaries yet. They will appear here when Vapi sends end-of-call reports to your webhook.
                  </td>
                </tr>
              ) : current.map((call) => (
                <tr key={call.id} className="align-top hover:bg-gray-50/60">
                  <td className="px-4 sm:px-6 md:px-8 py-4">
                    <div className="space-y-0.5">
                      <p className="font-medium text-gray-900">
                        {call.callerName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {call.callerNumber}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 md:px-8 py-4">
                    <div className="space-y-0.5">
                      <p className="inline-flex items-center gap-1.5 text-gray-800">
                        <PhoneCall className="w-4 h-4 text-purple-500" />
                        {call.service}
                      </p>
                      <p className="text-xs text-gray-500">
                        {call.price != null ? `${call.price}${call.currency === 'USD' ? '$' : ` ${call.currency}`}` : '—'}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 md:px-8 py-4">
                    <div className="space-y-0.5 text-xs text-gray-600">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        <span>{call.createdAt}</span>
                      </div>
                      <p className="text-gray-500">
                        Duration: {call.durationMinutes != null ? `${call.durationMinutes} min` : '—'}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 md:px-8 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium">
                      {call.outcome}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 md:px-8 py-4">
                    <p className="text-xs sm:text-sm text-gray-700 leading-snug line-clamp-3">
                      {call.summary}
                    </p>
                  </td>
                  <td className="px-4 sm:px-6 md:px-8 py-4">
                    <button
                      type="button"
                      onClick={() => setTranscriptModal(call)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-medium transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      View transcript
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-4 sm:px-6 md:px-8 py-3 border-t border-gray-200 flex items-center justify-between gap-3">
          <p className="text-xs sm:text-sm text-gray-600">
            Showing{' '}
            <span className="font-medium">
              {calls.length === 0 ? 0 : startIndex + 1}
            </span>{' '}
            to{' '}
            <span className="font-medium">
              {Math.min(startIndex + pageSize, calls.length)}
            </span>{' '}
            of <span className="font-medium">{calls.length}</span> calls
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
              if (
                p === 1 ||
                p === totalPages ||
                (p >= currentPage - 1 && p <= currentPage + 1)
              ) {
                return (
                  <button
                    key={p}
                    onClick={() => goToPage(p)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium ${
                      currentPage === p
                        ? 'bg-purple-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {p}
                  </button>
                );
              }
              if (p === currentPage - 2 || p === currentPage + 2) {
                return (
                  <span key={p} className="px-1.5 text-xs text-gray-400">
                    …
                  </span>
                );
              }
              return null;
            })}
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Transcript modal */}
      {transcriptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setTranscriptModal(null)}>
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Call transcript — {transcriptModal.callerName}
              </h3>
              <button
                type="button"
                onClick={() => setTranscriptModal(null)}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-4">
              {transcriptModal.transcript ? (
                <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
                  {transcriptModal.transcript}
                </pre>
              ) : (
                <p className="text-gray-500 text-sm">No transcript available for this call.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

