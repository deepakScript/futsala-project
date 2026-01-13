import {
  LayoutDashboard,
  Building2,
  CalendarRange,
  Clock,
  DollarSign,
  Users,
  Star,
  Percent,
  Settings,
  User,
  CreditCard,
  LucideIcon,
} from 'lucide-react';

export interface MenuItem {
  title: string;
  icon: LucideIcon;
  href: string;
}

export interface MenuGroup {
  heading: string;
  items: MenuItem[];
}

export const MENU_ITEMS: MenuGroup[] = [
  {
    heading: 'Management',
    items: [
      {
        title: 'Dashboard',
        icon: LayoutDashboard,
        href: '/dashboard',
      },
      {
        title: 'Bookings',
        icon: CalendarRange,
        href: '/dashboard/bookings',
      },
      {
        title: 'Venue Management',
        icon: Building2,
        href: '/dashboard/venues',
      },
      {
        title: 'Time Slots',
        icon: Clock,
        href: '/dashboard/time-slots',
      },
    ],
  },
  {
    heading: 'Analytics & Engagement',
    items: [
      {
        title: 'Earnings',
        icon: DollarSign,
        href: '/dashboard/earnings',
      },
      {
        title: 'Customers',
        icon: Users,
        href: '/dashboard/customers',
      },
      {
        title: 'Reviews',
        icon: Star,
        href: '/dashboard/reviews',
      },
      {
        title: 'Offers',
        icon: Percent,
        href: '/dashboard/offers',
      },
    ],
  },
  {
    heading: 'System',
    items: [
      {
        title: 'Settings',
        icon: Settings,
        href: '/dashboard/settings',
      },
      {
        title: 'Profile',
        icon: User,
        href: '/dashboard/profile',
      },
      {
        title: 'Billing',
        icon: CreditCard,
        href: '/dashboard/billing',
      },
    ],
  },
];
