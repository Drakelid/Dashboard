import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const routes: RouteRecordRaw[] = [
  { path: '/login', name: 'login', component: () => import('../views/LoginView.vue') },
  { path: '/', name: 'dashboard', component: () => import('../views/DashboardView.vue') },
  { path: '/active', name: 'active', component: () => import('../views/ActiveDeliveriesView.vue') },
  { path: '/messages', name: 'messages', component: () => import('../views/MessagesView.vue') },
  { path: '/history', name: 'history', component: () => import('../views/HistoryView.vue') },
  { path: '/profile', name: 'profile', component: () => import('../views/ProfileView.vue') },
  { path: '/support', name: 'support', component: () => import('../views/SupportView.vue') },
  { path: '/assignments', name: 'assignments', component: () => import('../views/AssignmentsView.vue') },
  {
    path: '/menu',
    name: 'menu',
    component: () => import('../views/MobileMenuView.vue'),
    beforeEnter: (to, from) => {
      if (typeof window !== 'undefined') {
        try {
          const mql = window.matchMedia('(min-width: 1024px)')
          if (mql.matches) {
            const back = (to.query.redirect as string) || from.fullPath || '/'
            return back.startsWith('/menu') ? '/' : back
          }
        } catch {}
      }
      return true
    },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

router.beforeEach((to, from) => {
  const { isAuthenticated } = useAuth()
  const apiKey = (import.meta as any).env?.VITE_API_KEY

  const allowUnauthed = ['/login']
  const isAllow = allowUnauthed.some(p => to.path === p || to.path.startsWith(p + '/'))

  // In API key mode, treat user as authenticated for routing purposes
  if (apiKey) {
    if (to.path === '/login') {
      const redirect = (to.query.redirect as string) || from.fullPath || '/'
      return redirect
    }
    return true
  }

  // Allow listed public routes
  if (isAllow) return true

  // Enforce auth for all other routes
  if (!isAuthenticated.value) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  // Prevent navigating to /login when already authenticated
  if (to.path === '/login' && isAuthenticated.value) {
    const redirect = (to.query.redirect as string) || from.fullPath || '/'
    return redirect
  }

  return true
})

export default router
