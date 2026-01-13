import { 
  LayoutDashboard, 
  MapPin, 
  CalendarCheck, 
  Users, 
  Settings, 
  ShieldCheck,
  CreditCard,
  BarChart3,
  Star,
  LifeBuoy,
  Tag,
  UserCog
} from 'lucide-react'

export const SIDEBAR_GROUPS = [
  {
    name: 'Overview',
    items: [
      {
        name: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
      },
    ],
  },
  {
    name: 'Management',
    items: [
      {
        name: 'Venues',
        href: '/venues',
        icon: MapPin,
      },
      {
        name: 'Venue Owners',
        href: '/venue-owners',
        icon: UserCog,
      },
      {
        name: 'Bookings',
        href: '/bookings',
        icon: CalendarCheck,
      },
      {
        name: 'Payments',
        href: '/payments',
        icon: CreditCard,
      },
      {
        name: 'Users',
        href: '/users',
        icon: Users,
      },
      {
        name: 'Reviews',
        href: '/reviews',
        icon: Star,
      },
    ],
  },
  {
    name: 'Marketing & Support',
    items: [
      {
        name: 'Support',
        href: '/support',
        icon: LifeBuoy,
      },
      {
        name: 'Reports',
        href: '/reports',
        icon: BarChart3,
      },
      {
        name: 'Offers',
        href: '/offers',
        icon: Tag,
      },
    ],
  },
  {
    name: 'Administration',
    items: [
      {
        name: 'Admins',
        href: '/admins',
        icon: ShieldCheck,
      },
      {
        name: 'Settings',
        href: '/settings',
        icon: Settings,
      },
    ],
  },
]
