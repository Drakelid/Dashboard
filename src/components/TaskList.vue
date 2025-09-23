<template>
  <component :is="variantTag" :class="containerClasses">
    <header v-if="title" class="flex items-center justify-between mb-3">
      <div>
        <h3 class="text-lg font-semibold">{{ title }}</h3>
        <p v-if="subtitle" class="text-sm text-gray-600">{{ subtitle }}</p>
      </div>
      <slot name="header-actions" />
    </header>

    <div v-if="!tasks.length" class="text-sm text-gray-500">
      {{ emptyText }}
    </div>

    <ul v-else class="space-y-3">
      <li
        v-for="task in tasks"
        :key="task.id"
        class="p-4 rounded-lg border transition-shadow hover:shadow-sm"
        :class="priorityBackground(task.priority)"
      >
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-2 text-sm flex-wrap">
            <span class="px-2 py-0.5 rounded bg-black/5 capitalize">{{ task.priority }}</span>
            <span class="font-medium">{{ task.id }}</span>
            <span class="text-gray-500">{{ task.type }}</span>
            <span v-if="task.ecoFriendly" class="px-2 py-0.5 rounded bg-green-100 text-green-800 text-xs">Eco</span>
          </div>
          <div class="flex items-center gap-3 text-sm">
            <span class="font-medium text-green-600">{{ task.earnings }}</span>
            <span class="font-medium">{{ task.time }}</span>
          </div>
        </div>

        <div class="text-sm space-y-1">
          <div class="font-medium">{{ task.location }}</div>
          <div class="text-gray-500">{{ task.address }}</div>
          <div class="flex items-center justify-between mt-2">
            <div class="text-gray-500">{{ task.distance }}</div>
            <button
              v-if="showNavigate"
              class="h-8 px-3 text-xs tap-target rounded-lg border bg-white hover:bg-gray-50 inline-flex items-center gap-1.5"
              @click="emit('navigate', task)"
            >
              <Navigation class="w-3.5 h-3.5" />
              <span>{{ navigateLabel }}</span>
            </button>
          </div>
        </div>
      </li>
    </ul>
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Navigation } from 'lucide-vue-next'
import type { DeliveryTask, TaskPriority } from '@/types/tasks'

type Variant = 'panel' | 'plain'

const props = withDefaults(defineProps<{
  tasks: DeliveryTask[]
  title?: string
  subtitle?: string
  emptyText?: string
  showNavigate?: boolean
  navigateLabel?: string
  variant?: Variant
}>(), {
  tasks: () => [],
  emptyText: 'No tasks available.',
  showNavigate: true,
  navigateLabel: 'Navigate',
  variant: 'panel',
})

const emit = defineEmits<{
  (e: 'navigate', task: DeliveryTask): void
}>()

const variantTag = computed(() => (props.variant === 'panel' ? 'section' : 'div'))

const containerClasses = computed(() => {
  if (props.variant === 'plain') return ''
  return 'rounded-xl border bg-white p-4 shadow-sm'
})

function priorityBackground(priority: TaskPriority) {
  switch (priority) {
    case 'urgent':
      return 'border-red-200 bg-red-50'
    case 'express':
      return 'border-orange-200 bg-orange-50'
    default:
      return 'border-blue-200 bg-blue-50'
  }
}
</script>
