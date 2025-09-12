<template>
  <div class="fixed bottom-4 right-4 z-[1000] space-y-2 w-80">
    <div v-for="t in toasts" :key="t.id" class="rounded-lg border p-3 shadow-sm bg-white flex items-start gap-2">
      <span :class="iconClass(t.type)" class="mt-0.5 inline-block h-2.5 w-2.5 rounded-full"></span>
      <div class="flex-1 min-w-0">
        <div v-if="t.title" class="text-sm font-medium">{{ t.title }}</div>
        <div class="text-sm text-gray-700 truncate">{{ t.message }}</div>
      </div>
      <button class="text-gray-400 hover:text-gray-700" @click="dismiss(t.id)" aria-label="Close">×</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, reactive } from 'vue'
import { addToastListener, type ToastListener } from '@/utils/toast'

type Toast = { id: string; type: 'success'|'error'|'info'; title: string; message: string; duration: number }

const toasts = reactive<Toast[]>([])
let removeListener: (() => void) | null = null

const onToast: ToastListener = (payload) => {
  toasts.push({ id: payload.id, type: payload.type, title: payload.title, message: payload.message, duration: payload.duration })
  setTimeout(() => dismiss(payload.id), payload.duration)
}

function dismiss(id: string) {
  const idx = toasts.findIndex(t => t.id === id)
  if (idx !== -1) toasts.splice(idx, 1)
}

function iconClass(type: Toast['type']) {
  switch (type) {
    case 'success': return 'bg-green-500'
    case 'error': return 'bg-red-500'
    default: return 'bg-blue-500'
  }
}

onMounted(() => {
  removeListener = addToastListener(onToast)
})

onUnmounted(() => {
  removeListener?.()
})
</script>
