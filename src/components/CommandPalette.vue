<template>
  <teleport to="body">
    <transition name="fade">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-[1200]"
        role="dialog"
        aria-modal="true"
        @keydown.stop
      >
        <div class="absolute inset-0 bg-black/40" @click="close" />
        <div class="relative mx-auto mt-24 max-w-xl px-4">
          <div class="rounded-2xl bg-white shadow-2xl ring-1 ring-black/10 overflow-hidden">
            <div class="border-b border-gray-100">
              <input
                ref="searchInput"
                type="search"
                :value="query"
                @input="onInput"
                @keydown.down.prevent="moveSelection(1)"
                @keydown.up.prevent="moveSelection(-1)"
                @keydown.enter.prevent="runActive"
                @keydown.esc.prevent="close"
                class="w-full px-4 py-3 text-sm outline-none"
                placeholder="Search commands, routes, deliveries…"
                aria-label="Command palette search"
                autofocus
              />
            </div>
            <div class="max-h-80 overflow-y-auto">
              <template v-if="filteredResults.length">
                <div
                  v-for="(group, groupIndex) in groupedResults"
                  :key="group.id || groupIndex"
                  class="py-1"
                >
                  <div v-if="group.label" class="px-4 py-1 text-xs uppercase tracking-wide text-gray-400">
                    {{ group.label }}
                  </div>
                  <button
                    v-for="item in group.items"
                    :key="item.command.id"
                    class="w-full px-4 py-2 text-left text-sm flex flex-col gap-1 hover:bg-gray-50"
                    :class="{ 'bg-blue-50': activeId === item.command.id }"
                    @click="runCommand(item.command)"
                  >
                    <div class="flex items-center justify-between gap-3">
                      <span class="font-medium text-gray-900">{{ item.command.title }}</span>
                      <span v-if="item.command.group" class="text-xs text-gray-400">{{ item.command.group }}</span>
                    </div>
                    <div v-if="item.command.subtitle" class="text-xs text-gray-500">
                      {{ item.command.subtitle }}
                    </div>
                  </button>
                </div>
              </template>
              <div v-else class="px-4 py-6 text-sm text-gray-500">
                No results for “{{ query }}”.
              </div>
            </div>
            <div class="border-t border-gray-100 px-4 py-2 text-xs text-gray-500 flex items-center justify-between">
              <div>Use ↑ ↓ to navigate, Enter to run</div>
              <div class="flex items-center gap-2">
                <span class="inline-flex h-6 min-w-[1.75rem] items-center justify-center rounded border px-1">Esc</span>
                to close
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import type { CommandItem } from '@/types/command'

type EnhancedCommand = { command: CommandItem; score: number }

type GroupBlock = {
  id?: string
  label?: string
  items: EnhancedCommand[]
}

const props = defineProps<{
  modelValue: boolean
  commands: CommandItem[]
  initialQuery?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'run', command: CommandItem): void
}>()

const searchInput = ref<HTMLInputElement | null>(null)
const query = ref('')
const activeId = ref<string | null>(null)

const normalizedCommands = computed(() => props.commands || [])

const filteredResults = computed<EnhancedCommand[]>(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) {
    return normalizedCommands.value.map(command => ({ command, score: 0 }))
  }
  return normalizedCommands.value
    .map(command => {
      const haystack = [command.title, command.subtitle, ...(command.keywords || [])]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      const score = haystack.includes(q) ? (command.title.toLowerCase().startsWith(q) ? 0 : 1) : Infinity
      return { command, score }
    })
    .filter(item => item.score !== Infinity)
    .sort((a, b) => a.score - b.score)
})

const groupedResults = computed<GroupBlock[]>(() => {
  const groups = new Map<string, EnhancedCommand[]>()
  const ungrouped: EnhancedCommand[] = []
  for (const item of filteredResults.value) {
    const group = item.command.group
    if (group) {
      const bucket = groups.get(group) || []
      bucket.push(item)
      groups.set(group, bucket)
    } else {
      ungrouped.push(item)
    }
  }
  const output: GroupBlock[] = []
  if (ungrouped.length) output.push({ items: ungrouped })
  for (const [group, items] of groups.entries()) {
    output.push({ id: group, label: group, items })
  }
  return output
})

function close() {
  emit('update:modelValue', false)
}

function onInput(event: Event) {
  const target = event.target as HTMLInputElement
  query.value = target.value
  updateActiveFromResults()
}

function updateActiveFromResults() {
  if (!filteredResults.value.length) {
    activeId.value = null
    return
  }
  const current = filteredResults.value.find(item => item.command.id === activeId.value)
  if (!current) {
    activeId.value = filteredResults.value[0].command.id
  }
}

function moveSelection(delta: number) {
  const list = filteredResults.value
  if (!list.length) return
  const currentIndex = list.findIndex(item => item.command.id === activeId.value)
  let nextIndex = currentIndex + delta
  if (nextIndex < 0) nextIndex = list.length - 1
  if (nextIndex >= list.length) nextIndex = 0
  activeId.value = list[nextIndex].command.id
}

async function runActive() {
  const active = filteredResults.value.find(item => item.command.id === activeId.value)
  if (!active) return
  await runCommand(active.command)
}

async function runCommand(command: CommandItem) {
  try {
    await command.run()
    emit('run', command)
  } finally {
    close()
  }
}

watch(
  () => props.modelValue,
  value => {
    if (value) {
      query.value = props.initialQuery ?? ''
      nextTick(() => {
        if (props.initialQuery) {
          const len = props.initialQuery.length
          searchInput.value?.setSelectionRange(len, len)
        }
        searchInput.value?.focus()
      })
      updateActiveFromResults()
    } else {
      query.value = ''
      activeId.value = null
    }
  }
)

watch(
  () => props.initialQuery,
  newValue => {
    if (props.modelValue) {
      query.value = newValue ?? ''
      nextTick(() => searchInput.value?.focus())
      updateActiveFromResults()
    }
  }
)

watch(filteredResults, () => {
  if (props.modelValue) {
    updateActiveFromResults()
  }
})

onMounted(() => {
  document.addEventListener('keydown', handleGlobalKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleGlobalKeydown)
})

function handleGlobalKeydown(event: KeyboardEvent) {
  if (!props.modelValue) return
  if (event.key === 'Escape') {
    event.preventDefault()
    close()
  }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>



