'use client';

import { useMemo, useState } from 'react';
import { Calendar, Phone, Users, TrendingUp } from 'lucide-react';

type TimeRange = 'day' | 'month';

const getTodayISO = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getWeekStartISO = (isoDate: string) => {
  const [year, month, day] = isoDate.split('-').map(Number);
  const date = new Date(year, (month ?? 1) - 1, day ?? 1);
  const jsDay = date.getDay(); // 0 (Sun) - 6 (Sat)
  const diffToMonday = (jsDay + 6) % 7; // 0 if Monday
  const weekStart = new Date(date);
  weekStart.setDate(date.getDate() - diffToMonday);
  const y = weekStart.getFullYear();
  const m = String(weekStart.getMonth() + 1).padStart(2, '0');
  const d = String(weekStart.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const formatWeekLabel = (weekStartISO: string, todayISO: string) => {
  const [y, m, d] = weekStartISO.split('-').map(Number);
  const start = new Date(y, (m ?? 1) - 1, d ?? 1);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  const sameMonth = start.getMonth() === end.getMonth();
  const options: Intl.DateTimeFormatOptions = { day: '2-digit' };
  const startDay = start.toLocaleDateString(undefined, options);

  const endOptions: Intl.DateTimeFormatOptions = sameMonth
    ? { day: '2-digit', month: 'short' }
    : { day: '2-digit', month: 'short' };

  const endLabel = end.toLocaleDateString(undefined, endOptions);

  const todayWeekStart = getWeekStartISO(todayISO);
  if (todayWeekStart === weekStartISO) {
    return `This week • ${startDay}–${endLabel}`;
  }

  return `${startDay}–${endLabel}`;
};

export default function DashboardPage() {
  const [bookingsRange, setBookingsRange] = useState<TimeRange>('day');
  const [salesRange, setSalesRange] = useState<'day' | 'week' | 'month'>('day');
  const [selectedDate, setSelectedDate] = useState<string | null>(() =>
    getWeekStartISO(getTodayISO()),
  );
  const [showDayPicker, setShowDayPicker] = useState(false);
  const stats = [
    {
      title: 'Total bookings',
      value: '1,247',
      change: '+12%',
      suffix: '',
      icon: Calendar,
      color: 'text-emerald-500',
    },
    {
      title: 'Calls handled',
      value: '3,891',
      change: '+8%',
      suffix: '',
      icon: Phone,
      color: 'text-sky-500',
    },
    {
      title: 'Active customers',
      value: '892',
      change: '+5%',
      suffix: '',
      icon: Users,
      color: 'text-indigo-500',
    },
    {
      title: 'Monthly sales',
      value: '$300',
      change: '+18%',
      suffix: 'this month',
      icon: TrendingUp,
      color: 'text-purple-500',
    },
  ];

  const recentBookings = [
    {
      id: 1,
      customer: 'John Doe',
      service: 'Consultation',
      date: '2024-01-15',
      time: '2:00 PM',
      status: 'Confirmed',
    },
    {
      id: 2,
      customer: 'Jane Smith',
      service: 'Follow-up',
      date: '2024-01-15',
      time: '3:30 PM',
      status: 'Pending',
    },
    {
      id: 3,
      customer: 'Mike Johnson',
      service: 'Initial Meeting',
      date: '2024-01-16',
      time: '10:00 AM',
      status: 'Confirmed',
    },
    {
      id: 4,
      customer: 'Sarah Williams',
      service: 'Consultation',
      date: '2024-01-16',
      time: '1:00 PM',
      status: 'Confirmed',
    },
  ];

  // Sales per month (used for monthly sales view)
  const monthlySales = useMemo(
    () => [
      { label: 'Jan', value: 12500 },
      { label: 'Feb', value: 18200 },
      { label: 'Mar', value: 21000 },
      { label: 'Apr', value: 23500 },
      { label: 'May', value: 26800 },
      { label: 'Jun', value: 30100 },
      { label: 'Jul', value: 32250 },
      { label: 'Aug', value: 34500 },
      { label: 'Sep', value: 33120 },
      { label: 'Oct', value: 35980 },
      { label: 'Nov', value: 37240 },
      { label: 'Dec', value: 39850 },
    ],
    [],
  );

  const dailyRevenue = useMemo(
    () => [
      { label: 'Mon', value: 5200 },
      { label: 'Tue', value: 6800 },
      { label: 'Wed', value: 7400 },
      { label: 'Thu', value: 8200 },
      { label: 'Fri', value: 9100 },
      { label: 'Sat', value: 4300 },
      { label: 'Sun', value: 3100 },
    ],
    [],
  );

  const weeklyRevenue = useMemo(
    () => [
      { label: 'W1', value: 14500 },
      { label: 'W2', value: 18800 },
      { label: 'W3', value: 21900 },
      { label: 'W4', value: 23650 },
    ],
    [],
  );

  // Time slots for 24h with 30 min intervals (00:00 → 23:30)
  const timeSlots = useMemo(
    () =>
      Array.from({ length: 48 }).map((_, idx) => {
        const hours = Math.floor(idx / 2);
        const minutes = idx % 2 === 0 ? '00' : '30';
        const label = `${hours.toString().padStart(2, '0')}:${minutes}`;
        return label;
      }),
    [],
  );

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

  // Mock bookings grid: for each day of week and time slot, decide if there's a booking
  const bookingsGrid = useMemo(
    () =>
      weekDays.map((day, dayIdx) =>
        timeSlots.map((slotLabel, slotIdx) => ({
          day,
          label: slotLabel,
          hasBooking: ((dayIdx + slotIdx * 3) % 17 === 0) || ((dayIdx * 5 + slotIdx) % 23 === 0),
        })),
      ),
    [timeSlots],
  );

  const todayISO = getTodayISO();
  const bookingsFilterLabel =
    selectedDate && selectedDate !== null
      ? formatWeekLabel(selectedDate, todayISO)
      : 'This week';

  return (
    <div className="space-y-4 sm:space-y-5 md:space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="mb-4 sm:mb-5 md:mb-6">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 sm:mb-3">
          Dashboard
        </h1>
        <p className="text-sm sm:text-base md:text-lg text-gray-600">
          Welcome back! Here's what's happening with your business today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6 lg:gap-8">
        {stats.map((stat) => {
          const isPositive = stat.change.startsWith('+');
          return (
            <div
              key={stat.title}
              className="rounded-2xl bg-white p-4 sm:p-5 md:p-6 shadow-sm my-1.5 sm:my-2 md:my-3 flex flex-col justify-between"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-500">
                    {stat.title}
                  </p>
                  <div className="mt-2 flex items-baseline gap-2">
                    <p className="text-2xl sm:text-3xl font-semibold tracking-tight text-gray-900">
                      {stat.value}
                    </p>
                    {stat.suffix ? (
                      <span className="text-[10px] sm:text-xs text-gray-500">
                        {stat.suffix}
                      </span>
                    ) : null}
                  </div>
                </div>
                <div
                  className={`inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-50 ${stat.color}`}
                >
                  <stat.icon className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] sm:text-xs font-medium ${
                    isPositive
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-red-50 text-red-700'
                  }`}
                >
                  {stat.change}
                </span>
                <span className="text-[10px] sm:text-xs text-gray-400">
                  vs. last month
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bookings chart – heatmap style */}
      <div className="rounded-2xl bg-white p-4 sm:p-5 md:p-6 lg:p-8 shadow-sm my-2 sm:my-3 md:my-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between md:gap-6 mb-3 sm:mb-4">
          <div>
            <h3 className="font-semibold mb-1 text-sm sm:text-base md:text-lg text-gray-900 leading-tight">
              Bookings activity
            </h3>
            <p className="text-xs sm:text-sm text-gray-500">
              See when your bookings are happening across the day.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative inline-flex items-center rounded-full bg-gray-100 p-1 text-xs sm:text-sm">
              <button
                type="button"
                onClick={() => {
                  setBookingsRange('day');
                  setShowDayPicker((prev) => !prev);
                }}
                className="px-2 sm:px-3 py-1 rounded-full transition bg-white text-gray-900 shadow-sm"
              >
                {bookingsFilterLabel}
              </button>

              {showDayPicker && (
                <div className="absolute right-0 top-10 z-20 w-60 rounded-xl border border-gray-200 bg-white p-3 shadow-lg">
                  <p className="mb-2 text-xs font-medium text-gray-700">
                    Choose a week
                  </p>
                  <input
                    type="date"
                    className="w-full rounded-lg border border-gray-200 px-2 py-1.5 text-xs sm:text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    value={selectedDate ?? getTodayISO()}
                    onChange={(e) => {
                      const value = e.target.value || getTodayISO();
                      setSelectedDate(getWeekStartISO(value));
                      setShowDayPicker(false);
                    }}
                  />
                  <button
                    type="button"
                    className="mt-2 w-full rounded-lg bg-gray-50 px-2 py-1.5 text-xs text-gray-600 hover:bg-gray-100"
                    onClick={() => setShowDayPicker(false)}
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="h-48 sm:h-56 md:h-64 lg:h-72 bg-gray-50 rounded-xl border border-dashed border-gray-200 px-3 sm:px-4 md:px-6 py-3 sm:py-4 flex items-end">
          {bookingsRange === 'day' && !selectedDate ? (
            <div className="flex h-full w-full items-center justify-center text-center">
              <p className="max-w-xs text-xs sm:text-sm text-gray-400">
                Select a date using the Day toggle to see bookings broken down by
                time slots.
              </p>
            </div>
          ) : (
            <>
              {/* 24h timeline with 30min intervals, days as rows */}
              {bookingsRange === 'day' ? (
                <div className="flex h-full w-full flex-col">
                  <div className="flex flex-1 overflow-visible pl-[1px]">
                    {/* Y axis labels: days of week */}
                    <div className="mr-2 w-8 sm:w-10 md:w-12 flex flex-col justify-between py-1 text-[9px] sm:text-[10px] text-gray-500">
                      {weekDays.map((day) => (
                        <span key={day} className="h-4 sm:h-5 md:h-6 flex items-center">
                          {day}
                        </span>
                      ))}
                    </div>

                    {/* Heatmap grid: rows = days, columns = 30min slots */}
                    <div className="flex-1">
                      <div className="flex h-full flex-col justify-between py-1">
                        {bookingsGrid.map((row, dayIdx) => (
                          <div
                            key={weekDays[dayIdx]}
                            className="grid gap-[2px]"
                            style={{ gridTemplateColumns: 'repeat(48, minmax(0, 1fr))' }}
                          >
                            {row.map((cell, slotIdx) => (
                              // eslint-disable-next-line react/no-array-index-key
                              <div
                                key={slotIdx}
                                className="group relative flex items-center justify-center"
                              >
                                <div className="relative w-full">
                                  {/* Square aspect ratio */}
                                  <div className="pb-[100%]" />
                                  <div
                                    className={`absolute inset-0 rounded-[2px] ${
                                      cell.hasBooking ? 'bg-emerald-400' : 'bg-gray-100'
                                    }`}
                                  />
                                  <div className="pointer-events-none absolute -top-8 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-[10px] text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100">
                                    <span className="font-semibold">
                                      {cell.day} {cell.label}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex">
                    {/* spacer to align with weekday labels column */}
                    <div className="w-8 sm:w-10 md:w-12" />
                    <div
                      className="flex-1 grid gap-0 text-[7px] sm:text-[8px] text-gray-400"
                      style={{ gridTemplateColumns: 'repeat(48, minmax(0, 1fr))' }}
                    >
                      {timeSlots.map((slot) => (
                        <span
                          key={slot}
                          className="flex items-start justify-center"
                          style={{
                            writingMode: 'vertical-rl',
                            textOrientation: 'mixed',
                          }}
                        >
                          {slot}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>

      {/* Sales chart – bar graph */}
      <div className="rounded-2xl bg-white p-4 sm:p-5 md:p-6 lg:p-8 shadow-sm my-2 sm:my-3 md:my-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4 mb-3 sm:mb-4 md:mb-5">
          <h3 className="font-semibold text-sm sm:text-base md:text-lg text-gray-900">
            Revenue overview
          </h3>
          <div className="flex gap-2 text-xs sm:text-sm">
            <div className="inline-flex items-center rounded-full bg-gray-100 p-1">
              <button
                type="button"
                onClick={() => setSalesRange('day')}
                className={`px-2 sm:px-3 py-1 rounded-full transition ${
                  salesRange === 'day'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500'
                }`}
              >
                Day
              </button>
              <button
                type="button"
                onClick={() => setSalesRange('week')}
                className={`px-2 sm:px-3 py-1 rounded-full transition ${
                  salesRange === 'week'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500'
                }`}
              >
                Week
              </button>
              <button
                type="button"
                onClick={() => setSalesRange('month')}
                className={`px-2 sm:px-3 py-1 rounded-full transition ${
                  salesRange === 'month'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500'
                }`}
              >
                Month
              </button>
            </div>
          </div>
        </div>

        {/* Sales bar chart with y-axis up to 40,000 */}
        <div className="h-56 sm:h-64 md:h-72 lg:h-80 bg-gray-50 rounded-xl border border-dashed border-gray-200 px-3 sm:px-4 md:px-6 py-3 sm:py-4 flex">
          {/* Y axis */}
          <div className="mr-3 flex flex-col justify-between text-[10px] sm:text-xs text-gray-400">
            {[40000, 30000, 20000, 10000, 0].map((tick) => (
              <span key={tick}>${(tick / 1000).toFixed(0)}k</span>
            ))}
          </div>

          {/* Bars */}
          <div className="flex-1 flex items-end">
            <div className="relative h-full w-full flex items-end gap-2 sm:gap-3 md:gap-4">
              {(
                salesRange === 'day'
                  ? dailyRevenue
                  : salesRange === 'week'
                  ? weeklyRevenue
                  : monthlySales
              ).map((entry) => {
                const maxY = 40000;
                const clamped = Math.min(entry.value, maxY);
                const height = (clamped / maxY) * 100;
                return (
                  <div
                    key={entry.label}
                    className="group relative flex-1 flex flex-col items-center justify-end gap-1"
                  >
                    <div className="relative h-full w-full flex items-end">
                      <div
                        className="w-full rounded-md bg-gradient-to-t from-[#1E1E5F] to-[#7B4FFF] shadow-sm"
                        style={{ height: `${Math.max(height, 6)}%` }}
                      />
                      <div className="pointer-events-none absolute -top-8 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-[10px] text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100">
                        <span className="font-semibold">
                          ${entry.value.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] sm:text-xs text-gray-500">
                      {entry.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
