import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  { path: '/', name: 'dashboard', component: () => import('../views/DashboardView.vue') },
  { path: '/active', name: 'active', component: () => import('../views/ActiveDeliveriesView.vue') },
  { path: '/route', name: 'route', component: () => import('../views/RoutePlanningView.vue') },
  { path: '/messages', name: 'messages', component: () => import('../views/MessagesView.vue') },
  { path: '/history', name: 'history', component: () => import('../views/HistoryView.vue') },
  { path: '/profile', name: 'profile', component: () => import('../views/ProfileView.vue') },
  { path: '/earnings', name: 'earnings', component: () => import('../views/EarningsView.vue') },
  { path: '/support', name: 'support', component: () => import('../views/SupportView.vue') },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

export default router
