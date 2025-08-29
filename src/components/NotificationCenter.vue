<template>
  <section class="rounded-xl border bg-white shadow-sm">
    <header class="p-4 border-b flex items-center justify-between">
      <h3 class="text-lg font-semibold flex items-center gap-2"><Bell class="w-4 h-4" aria-hidden="true" /> Notifications <span v-if="unreadCount" class="ml-1 px-2 py-0.5 rounded bg-red-500 text-white text-xs">{{ unreadCount }}</span></h3>
      <div class="flex gap-2">
        <button v-if="unreadCount" class="h-8 px-3 rounded border text-xs bg-white hover:bg-gray-50" @click="markAllAsRead">Mark all read</button>
      </div>
    </header>
    <div class="max-h-96 overflow-y-auto divide-y">
      <div v-for="n in notifications" :key="n.id" class="p-4 cursor-pointer" :class="[getPriorityBg(n.priority), !n.isRead ? 'bg-blue-50/30' : '']" @click="markAsRead(n.id)">
        <div class="flex items-start gap-3">
          <div class="mt-1 flex-shrink-0">
            <component :is="getIcon(n.type)" class="w-4 h-4 text-gray-700" aria-hidden="true" />
          </div>
          <div class="flex-1 space-y-1 min-w-0">
            <div class="flex items-start justify-between gap-2">
              <h4 class="text-sm font-medium leading-tight">{{ n.title }}</h4>
              <div class="flex items-center gap-2 flex-shrink-0">
                <span v-if="n.actionRequired" class="px-2 py-0.5 rounded bg-red-600 text-white text-xs">Action Required</span>
                <button class="h-6 w-6 rounded hover:bg-gray-100 grid place-items-center" @click.stop="removeNotification(n.id)" aria-label="Dismiss notification">
                  <X class="w-4 h-4 text-gray-600" aria-hidden="true" />
                </button>
              </div>
            </div>
            <p class="text-sm text-gray-600 leading-tight">{{ n.message }}</p>
            <div class="flex items-center justify-between text-xs text-gray-500">
              <span>{{ n.timestamp }}</span>
              <button v-if="n.deliveryId" class="h-6 px-2 rounded border bg-white hover:bg-gray-50">View Details</button>
            </div>
          </div>
        </div>
      </div>
      <div v-if="notifications.length === 0" class="p-8 text-center text-gray-500">
        No notifications
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, type Component } from 'vue'
import { Bell, Package, Clock, Map, AlertTriangle, CheckCircle, X } from 'lucide-vue-next'

type Notification = {
  id: string
  type: 'new_delivery' | 'delivery_update' | 'route_change' | 'urgent' | 'payment'
  title: string
  message: string
  timestamp: string
  isRead: boolean
  priority: 'high' | 'medium' | 'low'
  actionRequired?: boolean
  deliveryId?: string
}

const notifications = reactive<Notification[]>([
  { id: '1', type: 'new_delivery', title: 'New Delivery Assignment', message: 'PKG-105: Express delivery to Downtown. Pick up from Tech Store in 15 minutes.', timestamp: '2 min ago', isRead: false, priority: 'high', actionRequired: true, deliveryId: 'PKG-105' },
  { id: '2', type: 'delivery_update', title: 'Customer Update', message: 'PKG-089: Customer requested contactless delivery. Leave at door.', timestamp: '5 min ago', isRead: false, priority: 'medium', deliveryId: 'PKG-089' },
  { id: '3', type: 'route_change', title: 'Route Optimized', message: 'Your route has been updated to save 12 minutes. Check the new sequence.', timestamp: '8 min ago', isRead: false, priority: 'medium' },
  { id: '4', type: 'payment', title: 'Daily Earnings Update', message: "You've earned $247.80 today. Great work!", timestamp: '1 hour ago', isRead: true, priority: 'low' },
  { id: '5', type: 'urgent', title: 'Urgent: Package Damaged', message: 'PKG-087: Customer reported damaged package. Please contact support.', timestamp: '2 hours ago', isRead: true, priority: 'high', actionRequired: true },
])

const unreadCount = computed(() => notifications.filter(n => !n.isRead).length)

function getIcon(type: Notification['type']): Component {
  const map: Record<Notification['type'], Component> = {
    new_delivery: Package,
    delivery_update: Clock,
    route_change: Map,
    urgent: AlertTriangle,
    payment: CheckCircle,
  }
  return map[type]
}

function getPriorityBg(priority: Notification['priority']) {
  switch (priority) {
    case 'high':
      return 'border-l-4 border-l-red-500 bg-red-50/50'
    case 'medium':
      return 'border-l-4 border-l-orange-500 bg-orange-50/50'
    case 'low':
      return 'border-l-4 border-l-green-500 bg-green-50/50'
    default:
      return 'border-l-4 border-l-gray-500 bg-gray-50/50'
  }
}

function markAsRead(id: string) {
  const i = notifications.findIndex(n => n.id === id)
  if (i !== -1) notifications[i].isRead = true
}

function markAllAsRead() {
  notifications.forEach(n => (n.isRead = true))
}

function removeNotification(id: string) {
  const i = notifications.findIndex(n => n.id === id)
  if (i !== -1) notifications.splice(i, 1)
}
</script>
