<template>
  <section class="rounded-xl border bg-white shadow-sm">
    <header class="p-4 border-b flex items-center justify-between flex-wrap gap-2">
      <h3 class="text-lg font-semibold">{{ title }}</h3>
      <Spinner v-if="loading" size="sm" />
      <div v-else-if="error" class="text-sm text-red-600">{{ error }}</div>
    </header>

    <div class="p-4 space-y-3" v-if="!loading && !error">
      <div v-if="displayItems.length === 0" class="text-sm text-gray-500">{{ emptyText }}</div>

      <div
        v-for="(item, idx) in displayItems"
        :key="(item.delivery?.id ?? idx) + '-' + idx"
        class="rounded-lg border p-3 hover:shadow-sm"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2 text-sm">
            <span class="font-medium">#{{ item.delivery?.id ?? '—' }}</span>
            <span class="px-2 py-0.5 rounded text-xs" :class="item.is_delivered ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'">
              {{ item.is_delivered ? 'Completed' : 'Pending' }}
            </span>
          </div>
          <div class="text-xs text-gray-500">{{ item.date }} {{ item.time }}</div>
        </div>

        <div class="mt-2 grid gap-2 md:grid-cols-2 text-sm">
          <div>
            <div class="text-gray-500">Pickup</div>
            <div class="font-medium break-words">{{ item.pickup_location || item.delivery?.pickup_location || '—' }}</div>
          </div>
          <div>
            <div class="text-gray-500">Delivery</div>
            <div class="font-medium break-words">{{ item.delivery?.delivery_location || '—' }}</div>
          </div>
        </div>

        <div class="mt-2 space-y-2">
          <div class="text-sm font-medium">Packages ({{ item.packages?.length || 0 }})</div>
          <div v-for="pkg in item.packages" :key="pkg.id" class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded border p-2 text-sm">
            <div class="flex items-center gap-3 flex-wrap">
              <span class="px-2 py-0.5 rounded bg-gray-100">ID: {{ pkg.id ?? '—' }}</span>
              <span class="text-gray-600">Status: {{ formatStatus(pkg.delivery_status) || '—' }}</span>
              <span v-if="pkg.weight" class="text-gray-500">• {{ pkg.weight }} {{ pkg.weight_unit }}</span>
            </div>
            <div v-if="enableActions" class="flex gap-2 flex-wrap">
              <button
                v-if="shouldShowPickup(pkg)"
                class="h-8 px-3 tap-target rounded border bg-white hover:bg-gray-50 disabled:opacity-50"
                :disabled="actionLoading"
                @click="markPickedUp(pkg.id)"
              >
                Pick up
              </button>
              <button
                v-if="shouldShowDeliver(pkg)"
                class="h-8 px-3 tap-target rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                :disabled="actionLoading"
                @click="openDeliver(pkg.id)"
              >
                Deliver
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <PackageDeliveryModal :open="deliverOpen" :submitting="actionLoading" @update:open="deliverOpen = $event" @confirm="confirmDeliver" />
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { DriverDeliveryItem, Package } from '@/types/api'
import { pickup as apiPickup, deliver as apiDeliver } from '@/api/packages'
import PackageDeliveryModal from '@/components/PackageDeliveryModal.vue'
import { toast } from '@/utils/toast'
import Spinner from '@/components/Spinner.vue'

const props = withDefaults(defineProps<{
  items: DriverDeliveryItem[]
  loading?: boolean
  error?: string | null
  showFullView?: boolean
  title?: string
  emptyText?: string
  enableActions?: boolean
}>(), { items: () => [], loading: false, error: null, showFullView: false, title: 'Active Deliveries', emptyText: 'No active deliveries', enableActions: false })

const emit = defineEmits<{ (e: 'refresh'): void }>()

const displayItems = computed(() => props.showFullView ? props.items : props.items.slice(0, 3))
const pickedUpStatuses = ['picked_up', 'in_transit', 'delivered']
const deliveredStatuses = ['delivered']

const actionLoading = ref(false)
const deliverOpen = ref(false)
const deliverPackageId = ref<number | null>(null)

function openDeliver(id?: number) {
  if (!id && id !== 0) return
  deliverPackageId.value = id!
  deliverOpen.value = true
}

async function markPickedUp(id?: number) {
  if (!id && id !== 0) return
  actionLoading.value = true
  try {
    await apiPickup(id!, {
      success: true,
      message: 'Picked up',
      new_status: 'picked_up',
      new_status_display: 'Picked up',
      picked_up_at: new Date().toISOString(),
    })
    toast.success('Package marked as picked up')
    emit('refresh')
  } catch (e: any) {
    toast.error(e?.message || 'Failed to mark as picked up')
  } finally {
    actionLoading.value = false
  }
}

async function confirmDeliver(payload: { delivered_to: string; delivery_notes?: string }) {
  if (deliverPackageId.value == null) return
  actionLoading.value = true
  try {
    await apiDeliver(deliverPackageId.value, payload)
    deliverOpen.value = false
    toast.success('Package delivered')
    emit('refresh')
  } catch (e: any) {
    toast.error(e?.message || 'Failed to deliver package')
  } finally {
    actionLoading.value = false
  }
}

function shouldShowPickup(pkg: Package) {
  const status = (pkg.delivery_status || '').toLowerCase()
  if (!status) return true
  return !pickedUpStatuses.includes(status)
}

function shouldShowDeliver(pkg: Package) {
  const status = (pkg.delivery_status || '').toLowerCase()
  if (!status) return false
  return pickedUpStatuses.includes(status) && !deliveredStatuses.includes(status)
}

function formatStatus(s?: string): string {
  return String(s || '').replace(/_/g, ' ')
}
</script>
