import type { Component } from 'vue'
import { Home, Truck, ClipboardList, MessageSquare, History, User, HelpCircle } from 'lucide-vue-next'

export type NavBadge =
  | { type: 'static'; value: string | number }
  | { type: 'jobsTotal' }
  | { type: 'none' }

export interface NavItem {
  path: string
  label: string
  description?: string
  icon: Component
  badge?: NavBadge
}

export interface NavSection {
  id: string
  title: string
  items: NavItem[]
}

export const navSections: NavSection[] = [
  {
    id: 'main',
    title: 'Main Navigation',
    items: [
      {
        path: '/',
        label: 'Dashboard',
        description: 'Overview & performance',
        icon: Home,
      },
      {
        path: '/active',
        label: 'Jobs & Nearby',
        description: 'Your jobs and nearby pickups',
        icon: Truck,
        badge: { type: 'jobsTotal' },
      },
      {
        path: '/assignments',
        label: 'Assignments',
        description: 'Manage delivery assignments',
        icon: ClipboardList,
      },
      {
        path: '/messages',
        label: 'Messages',
        description: 'Customer communications',
        icon: MessageSquare,
        badge: { type: 'static', value: 3 },
      },
    ],
  },
  {
    id: 'data-settings',
    title: 'Data & Settings',
    items: [
      {
        path: '/history',
        label: 'History',
        description: 'Past deliveries',
        icon: History,
      },
      {
        path: '/profile',
        label: 'Profile',
        description: 'Your driver profile',
        icon: User,
      },
      {
        path: '/support',
        label: 'Support',
        description: 'Help & assistance',
        icon: HelpCircle,
      },
    ],
  },
]
