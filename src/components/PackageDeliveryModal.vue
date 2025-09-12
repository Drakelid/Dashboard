<template>
  <div v-if="open" class="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4">
    <div class="w-full max-w-md rounded-xl border bg-white shadow-lg">
      <header class="p-4 border-b">
        <h3 class="text-lg font-semibold">Deliver Package</h3>
      </header>
      <form class="p-4 space-y-4" @submit.prevent="onSubmit">
        <div class="space-y-1">
          <label class="text-sm font-medium">Delivered To</label>
          <input v-model="deliveredTo" :disabled="submitting" required class="w-full h-10 px-3 rounded-lg border" placeholder="Recipient name" />
        </div>
        <div class="space-y-1">
          <label class="text-sm font-medium">Delivery Notes</label>
          <textarea v-model="deliveryNotes" :disabled="submitting" rows="3" class="w-full p-3 rounded-lg border" placeholder="Optional notes (max 500 chars)"></textarea>
        </div>
        <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
        <footer class="flex justify-end gap-2 pt-2 border-t">
          <button type="button" class="h-9 px-3 rounded border bg-white hover:bg-gray-50" @click="$emit('update:open', false)" :disabled="submitting">Cancel</button>
          <button type="submit" class="h-9 px-3 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 flex items-center gap-2" :disabled="submitting">
            <Spinner v-if="submitting" size="sm" />
            <span>{{ submitting ? 'Delivering…' : 'Confirm Delivery' }}</span>
          </button>
        </footer>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import Spinner from '@/components/Spinner.vue'

const props = withDefaults(defineProps<{ open: boolean; submitting?: boolean }>(), { submitting: false })
const emit = defineEmits<{
  (e: 'update:open', open: boolean): void
  (e: 'confirm', payload: { delivered_to: string; delivery_notes?: string }): void
}>()

const deliveredTo = ref('')
const deliveryNotes = ref('')
const error = ref<string | null>(null)

watch(() => props.open, (v) => {
  if (v) {
    deliveredTo.value = ''
    deliveryNotes.value = ''
    error.value = null
  }
})

async function onSubmit() {
  error.value = null
  if (!deliveredTo.value.trim()) {
    error.value = 'Please enter who received the package.'
    return
  }
  emit('confirm', { delivered_to: deliveredTo.value.trim(), delivery_notes: deliveryNotes.value.trim() || undefined })
}
</script>
