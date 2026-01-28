from __future__ import annotations

from datetime import datetime, timedelta
from decimal import Decimal

from django.db.models import Count, Q, Sum
from django.utils import timezone
from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Booking, Service
from .serializers import BookingSerializer, ServiceSerializer


class ServiceViewSet(viewsets.ModelViewSet):
    """
    CRUD endpoints for salon/business services that Elara can book.
    """

    serializer_class = ServiceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Only return services for the authenticated business owner.
        return Service.objects.filter(owner=self.request.user).order_by("name")


class BookingViewSet(viewsets.ModelViewSet):
    """
    CRUD endpoints for bookings/appointments.
    """

    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Only return bookings for the authenticated business owner.
        queryset = Booking.objects.filter(owner=self.request.user).select_related('client', 'service').order_by('-starts_at')
        
        # Filter by client if provided
        client_id = self.request.query_params.get('client')
        if client_id:
            queryset = queryset.filter(client_id=client_id)
        
        return queryset

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get dashboard statistics."""
        user = request.user
        now = timezone.now()
        this_month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        last_month_start = (this_month_start - timedelta(days=1)).replace(day=1)
        last_month_end = this_month_start - timedelta(seconds=1)

        # Total bookings (all time)
        total_bookings = Booking.objects.filter(owner=user).count()

        # Bookings this month vs last month
        bookings_this_month = Booking.objects.filter(
            owner=user,
            starts_at__gte=this_month_start
        ).count()
        bookings_last_month = Booking.objects.filter(
            owner=user,
            starts_at__gte=last_month_start,
            starts_at__lt=this_month_start
        ).count()
        bookings_change = self._calculate_percentage_change(bookings_last_month, bookings_this_month)

        # Active customers (customers with bookings in last 30 days)
        thirty_days_ago = now - timedelta(days=30)
        active_customers = Booking.objects.filter(
            owner=user,
            starts_at__gte=thirty_days_ago
        ).values('client').distinct().count()
        
        # Active customers last month
        active_customers_last_month = Booking.objects.filter(
            owner=user,
            starts_at__gte=last_month_start,
            starts_at__lt=this_month_start
        ).values('client').distinct().count()
        customers_change = self._calculate_percentage_change(active_customers_last_month, active_customers)

        # Monthly sales (sum of service prices from bookings this month)
        monthly_sales = Booking.objects.filter(
            owner=user,
            starts_at__gte=this_month_start,
            service__isnull=False
        ).aggregate(total=Sum('service__price'))['total'] or Decimal('0')
        
        # Monthly sales last month
        monthly_sales_last_month = Booking.objects.filter(
            owner=user,
            starts_at__gte=last_month_start,
            starts_at__lt=this_month_start,
            service__isnull=False
        ).aggregate(total=Sum('service__price'))['total'] or Decimal('0')
        sales_change = self._calculate_percentage_change(float(monthly_sales_last_month), float(monthly_sales))

        # Calls handled (using bookings count for now, can be extended later)
        calls_handled = total_bookings
        calls_handled_last_month = bookings_last_month
        calls_change = self._calculate_percentage_change(calls_handled_last_month, calls_handled)

        return Response({
            'total_bookings': total_bookings,
            'bookings_change': bookings_change,
            'calls_handled': calls_handled,
            'calls_change': calls_change,
            'active_customers': active_customers,
            'customers_change': customers_change,
            'monthly_sales': float(monthly_sales),
            'sales_change': sales_change,
        })

    @action(detail=False, methods=['get'])
    def revenue(self, request):
        """Get revenue data for charts."""
        user = request.user
        range_type = request.query_params.get('range', 'day')  # day, week, month
        
        now = timezone.now()
        data = []

        if range_type == 'day':
            # Last 7 days
            for i in range(6, -1, -1):
                date = (now - timedelta(days=i)).date()
                day_start = timezone.make_aware(datetime.combine(date, datetime.min.time()))
                day_end = day_start + timedelta(days=1)
                
                revenue = Booking.objects.filter(
                    owner=user,
                    starts_at__gte=day_start,
                    starts_at__lt=day_end,
                    service__isnull=False
                ).aggregate(total=Sum('service__price'))['total'] or Decimal('0')
                
                day_name = date.strftime('%a')
                data.append({
                    'label': day_name,
                    'value': float(revenue)
                })
        
        elif range_type == 'week':
            # Last 4 weeks
            for i in range(3, -1, -1):
                week_start = now - timedelta(weeks=i+1)
                week_end = now - timedelta(weeks=i)
                
                revenue = Booking.objects.filter(
                    owner=user,
                    starts_at__gte=week_start,
                    starts_at__lt=week_end,
                    service__isnull=False
                ).aggregate(total=Sum('service__price'))['total'] or Decimal('0')
                
                data.append({
                    'label': f'W{4-i}',
                    'value': float(revenue)
                })
        
        elif range_type == 'month':
            # Last 12 months
            for i in range(11, -1, -1):
                month_start = (now - timedelta(days=30*i)).replace(day=1, hour=0, minute=0, second=0, microsecond=0)
                if i == 0:
                    month_end = now
                else:
                    next_month = month_start + timedelta(days=32)
                    month_end = next_month.replace(day=1) - timedelta(seconds=1)
                
                revenue = Booking.objects.filter(
                    owner=user,
                    starts_at__gte=month_start,
                    starts_at__lt=month_end,
                    service__isnull=False
                ).aggregate(total=Sum('service__price'))['total'] or Decimal('0')
                
                month_name = month_start.strftime('%b')
                data.append({
                    'label': month_name,
                    'value': float(revenue)
                })

        return Response(data)

    @action(detail=False, methods=['get'])
    def heatmap(self, request):
        """Get bookings heatmap data for a specific week."""
        user = request.user
        week_start_str = request.query_params.get('week_start')
        
        if not week_start_str:
            # Default to current week
            today = timezone.now().date()
            # weekday() returns 0 for Monday, 6 for Sunday
            days_since_monday = today.weekday()
            week_start = today - timedelta(days=days_since_monday)
        else:
            week_start = datetime.strptime(week_start_str, '%Y-%m-%d').date()
        
        week_end = week_start + timedelta(days=7)
        week_start_dt = timezone.make_aware(datetime.combine(week_start, datetime.min.time()))
        week_end_dt = timezone.make_aware(datetime.combine(week_end, datetime.min.time()))

        # Get all bookings for this week
        bookings = Booking.objects.filter(
            owner=user,
            starts_at__gte=week_start_dt,
            starts_at__lt=week_end_dt
        ).select_related('client', 'service')

        # Create a 7x48 grid (7 days, 48 time slots of 30 minutes)
        week_days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        grid = []
        
        for day_idx in range(7):
            day_date = week_start + timedelta(days=day_idx)
            day_row = []
            
            for slot_idx in range(48):
                hours = slot_idx // 2
                minutes = (slot_idx % 2) * 30
                slot_time = datetime.combine(day_date, datetime.min.time().replace(hour=hours, minute=minutes))
                slot_start = timezone.make_aware(slot_time)
                slot_end = slot_start + timedelta(minutes=30)
                
                # Check if there's a booking in this time slot
                has_booking = bookings.filter(
                    starts_at__gte=slot_start,
                    starts_at__lt=slot_end
                ).exists()
                
                day_row.append({
                    'day': week_days[day_idx],
                    'label': f'{hours:02d}:{minutes:02d}',
                    'hasBooking': has_booking
                })
            
            grid.append(day_row)
        
        return Response({
            'week_start': week_start_str or week_start.isoformat(),
            'grid': grid
        })

    def _calculate_percentage_change(self, old_value, new_value):
        """Calculate percentage change between two values."""
        if old_value == 0:
            return 100.0 if new_value > 0 else 0.0
        change = ((new_value - old_value) / old_value) * 100
        return round(change, 1)
