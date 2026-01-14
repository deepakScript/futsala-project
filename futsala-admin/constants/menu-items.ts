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
        href: 'bookings',
      },
      {
        title: 'Venue Management',
        icon: Building2,
        href: 'venues',
      },
      {
        title: 'Time Slots',
        icon: Clock,
        href: 'time-slots',
      },
    ],
  },
  {
    heading: 'Analytics & Engagement',
    items: [
      {
        title: 'Earnings',
        icon: DollarSign,
        href: 'earnings',
      },
      {
        title: 'Customers',
        icon: Users,
        href: 'customers',
      },
      {
        title: 'Reviews',
        icon: Star,
        href: 'reviews',
      },
      {
        title: 'Offers',
        icon: Percent,
        href: 'offers',
      },
    ],
  },
  {
    heading: 'System',
    items: [
      {
        title: 'Settings',
        icon: Settings,
        href: 'settings',
      },
      {
        title: 'Profile',
        icon: User,
        href: 'profile',
      },
      {
        title: 'Billing',
        icon: CreditCard,
        href: 'billing',
      },
    ],
  },
];
