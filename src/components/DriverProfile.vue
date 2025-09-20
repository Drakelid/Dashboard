<template>
  <section class="space-y-6">
    <div class="grid gap-6 lg:grid-cols-3">
      <!-- Driver Overview -->
      <article class="rounded-xl border bg-white shadow-sm relative overflow-hidden">
        <header class="p-6 border-b text-center space-y-2">
          <div class="mx-auto h-24 w-24 rounded-full overflow-hidden ring-2 ring-green-200">
            <img
              class="h-full w-full object-cover"
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
              alt="Driver avatar"
            />
          </div>
          <h3 class="text-lg font-semibold">{{ displayName }}</h3>
          <p class="text-sm text-gray-500">Driver ID: {{ driverId }}</p>
          <p class="text-xs text-gray-500">Status: <span class="font-medium">{{ statusLabel }}</span></p>
          <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
        </header>
        <dl class="p-6 space-y-3 text-sm text-gray-600">
          <div class="flex justify-between"><dt>Member since</dt><dd class="font-medium text-gray-900">{{ memberSince }}</dd></div>
          <div class="flex justify-between"><dt>Email</dt><dd class="font-medium text-gray-900">{{ email }}</dd></div>
          <div class="flex justify-between"><dt>Phone</dt><dd class="font-medium text-gray-900">{{ phone }}</dd></div>
          <div class="flex justify-between"><dt>License number</dt><dd class="font-medium text-gray-900">{{ licenseNumber }}</dd></div>
          <div class="flex justify-between"><dt>Work period</dt><dd class="font-medium text-gray-900">{{ workPeriod }}</dd></div>
        </dl>
        <div v-if="loading" class="absolute inset-0 bg-white/70 grid place-items-center">
          <Spinner />
        </div>
      </article>

      <!-- Vehicle Details -->
      <article class="rounded-xl border bg-white shadow-sm">
        <header class="p-6 border-b flex items-center gap-2">
          <Truck class="w-4 h-4 text-green-600" aria-hidden="true" />
          <h3 class="text-lg font-semibold">Vehicle Details</h3>
        </header>
        <div class="p-6 space-y-4 text-sm text-gray-600">
          <div class="grid grid-cols-2 gap-4">
            <div><div class="text-gray-500">Type</div><div class="font-medium text-gray-900">{{ vehicleType }}</div></div>
            <div><div class="text-gray-500">Make / Model</div><div class="font-medium text-gray-900">{{ vehicleMakeModel }}</div></div>
            <div><div class="text-gray-500">Color</div><div class="font-medium text-gray-900">{{ vehicleColor }}</div></div>
            <div><div class="text-gray-500">License Plate</div><div class="font-medium text-gray-900">{{ licensePlate }}</div></div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div><div class="text-gray-500">Capacity</div><div class="font-medium text-gray-900">{{ capacity }}</div></div>
            <div><div class="text-gray-500">Max load</div><div class="font-medium text-gray-900">{{ maxLoad }}</div></div>
            <div><div class="text-gray-500">Engine</div><div class="font-medium text-gray-900">{{ engineType }}</div></div>
            <div><div class="text-gray-500">Next inspection</div><div class="font-medium text-gray-900">{{ nextInspection }}</div></div>
          </div>
          <div v-if="vehicleNotes" class="rounded-lg bg-gray-50 border border-dashed border-gray-200 p-3 text-xs text-gray-500">
            {{ vehicleNotes }}
          </div>
          <p v-if="!hasVehicle" class="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            Vehicle information is unavailable. Contact your administrator to register a vehicle profile.
          </p>
        </div>
      </article>

      <!-- Account Summary -->
      <article class="rounded-xl border bg-white shadow-sm">
        <header class="p-6 border-b flex items-center gap-2">
          <Star class="w-4 h-4 text-yellow-500" aria-hidden="true" />
          <h3 class="text-lg font-semibold">Account Summary</h3>
        </header>
        <div class="p-6 space-y-4 text-sm text-gray-600">
          <div><span class="text-gray-500">Created</span><div class="font-medium text-gray-900">{{ createdAt }}</div></div>
          <div><span class="text-gray-500">Last updated</span><div class="font-medium text-gray-900">{{ updatedAt }}</div></div>
          <div class="border-t pt-3">
            <div class="text-gray-500 mb-2">Recent notes</div>
            <ul class="space-y-2 text-xs text-gray-500">
              <li>98% on-time deliveries in the past 30 days.</li>
              <li>Assigned to downtown & suburbs service zone.</li>
              <li v-if="statusLabel === 'Inactive'">Reactivation requires administrator approval.</li>
            </ul>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import Spinner from '@/components/Spinner.vue'
import { Truck, Star } from 'lucide-vue-next'
import { useDriverProfile } from '@/composables/useDriverProfile'

const { profile, vehicle, loading, error, load } = useDriverProfile()

onMounted(() => {
  load()
})

const displayName = computed(() => {
  const u = profile.value?.user
  const full = [u?.first_name, u?.last_name].filter(Boolean).join(' ').trim()
  return full || u?.email || u?.username || 'Driver'
})

const driverId = computed(() => (profile.value?.id ? String(profile.value.id) : 'N/A'))
const email = computed(() => profile.value?.user?.email || 'N/A')
const phone = computed(() => profile.value?.phone || 'N/A')
const licenseNumber = computed(() => profile.value?.license_number || 'N/A')
const statusLabel = computed(() => profile.value?.status || (profile.value?.active ? 'Active' : 'Inactive'))

const memberSince = computed(() => formatDate(profile.value?.start_date || profile.value?.created_at))
const workPeriod = computed(() => {
  const start = formatDate(profile.value?.start_date)
  const end = profile.value?.end_date ? formatDate(profile.value?.end_date) : 'Present'
  return start === 'N/A' && end === 'Present' ? 'N/A' : `${start} -> ${end}`
})

const createdAt = computed(() => formatDate(profile.value?.created_at))
const updatedAt = computed(() => formatDate(profile.value?.updated_at))

const hasVehicle = computed(() => !!vehicle.value)
const vehicleType = computed(() => vehicle.value?.type || 'N/A')
const vehicleMakeModel = computed(() => {
  if (!vehicle.value) return 'N/A'
  const { make, model } = vehicle.value
  const combined = [make, model].filter(Boolean).join(' ')
  return combined || 'N/A'
})
const vehicleColor = computed(() => vehicle.value?.color || 'N/A')
const licensePlate = computed(() => vehicle.value?.license_plate || 'N/A')
const capacity = computed(() => formatNumber(vehicle.value?.capacity, 'packages'))
const maxLoad = computed(() => formatNumber(vehicle.value?.maximum_load_kg ?? vehicle.value?.maximum_total_weight_kg, 'kg'))
const engineType = computed(() => (vehicle.value?.engine_type ? capitalize(vehicle.value.engine_type) : 'N/A'))
const nextInspection = computed(() => formatDate(vehicle.value?.next_inspection_date))
const vehicleNotes = computed(() => vehicle.value?.notes || null)

function formatDate(value?: string | null) {
  if (!value) return 'N/A'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'N/A'
  return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(date)
}

function formatNumber(value?: number | null, suffix?: string) {
  if (value == null) return 'N/A'
  const num = Number(value)
  if (!Number.isFinite(num)) return 'N/A'
  const formatted = new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 }).format(num)
  return suffix ? `${formatted} ${suffix}` : formatted
}

function capitalize(value: string) {
  if (!value) return value
  return value.charAt(0).toUpperCase() + value.slice(1)
}
</script>



