import {
  LayoutDashboard,
  Calendar,
  Bell,
  Users,
  MessageCircle,
  Headphones,
  Mail,
} from 'lucide-react';

export interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const mainNavItems: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Bookings', href: '/dashboard/bookings', icon: Calendar },
  { name: 'Alerts', href: '/dashboard/alerts', icon: Bell },
  { name: 'Customers', href: '/dashboard/customers', icon: Users },
];

export const supportNavItems: NavItem[] = [
  { name: 'Chat', href: '/dashboard/chat', icon: MessageCircle },
  { name: 'Support', href: '/dashboard/support', icon: Headphones },
  { name: 'Email', href: '/dashboard/email', icon: Mail },
];

