<template>
  <section class="space-y-6">
    <div class="rounded-xl border bg-white p-6 shadow-sm space-y-4">
      <header class="space-y-1">
        <h3 class="text-lg font-semibold">Request Delivery Quote</h3>
        <p class="text-sm text-gray-600">Estimate pricing for a new delivery based on ZIP codes and package dimensions.</p>
      </header>
      <div class="grid gap-4 md:grid-cols-3">
        <div>
          <label class="block text-sm font-medium mb-1">Sender ZIP</label>
          <input v-model="quoteForm.sender_zip_code" class="w-full h-10 px-3 rounded-lg border" placeholder="e.g., 0150" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Receiver ZIP</label>
          <input v-model="quoteForm.receiver_zip_code" class="w-full h-10 px-3 rounded-lg border" placeholder="e.g., 5003" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Package (kg, cm)</label>
          <input v-model="quotePackage" class="w-full h-10 px-3 rounded-lg border" placeholder="1.5,40,30,20" />
          <p class="text-xs text-gray-500 mt-1">Weight, height, width, length</p>
        </div>
      </div>
      <button
        class="h-10 px-4 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
        :disabled="loadingQuote"
        @click="requestQuote"
      >
        <Spinner v-if="loadingQuote" size="sm" />
        <span>{{ loadingQuote ? 'Requesting...' : 'Request Quote' }}</span>
      </button>
      <div v-if="quoteError" class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{{ quoteError }}</div>
      <div v-if="quote" class="space-y-2 text-sm">
        <div class="font-medium">Quote ID: {{ quote.uuid }}</div>
        <ul class="divide-y">
          <li v-for="service in quote.services" :key="service.service" class="py-1">
            <span class="font-medium">{{ service.service }}</span>
            <span class="ml-2 text-gray-600">{{ service.price }} kr</span>
          </li>
        </ul>
      </div>
    </div>

    <div class="rounded-xl border bg-white p-6 shadow-sm space-y-4">
      <header class="space-y-1">
        <h3 class="text-lg font-semibold">Confirm Delivery</h3>
        <p class="text-sm text-gray-600">Finalize a quote when the customer is ready to book.</p>
      </header>
      <div class="grid gap-4 md:grid-cols-2">
        <div>
          <label class="block text-sm font-medium mb-1">Quote UUID</label>
          <input v-model="confirmForm.uuid" class="w-full h-10 px-3 rounded-lg border" placeholder="Paste from quote" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Service</label>
          <input v-model="confirmForm.service" class="w-full h-10 px-3 rounded-lg border" placeholder="standard" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Price (kr)</label>
          <input v-model.number="confirmForm.price" type="number" min="0" class="w-full h-10 px-3 rounded-lg border" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Delivery Location</label>
          <input v-model="confirmForm.delivery_location" class="w-full h-10 px-3 rounded-lg border" placeholder="Street, city" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Receiver Name</label>
          <input v-model="confirmForm.receiver" class="w-full h-10 px-3 rounded-lg border" placeholder="Customer name" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Receiver Phone</label>
          <input v-model="confirmForm.receiver_phone" class="w-full h-10 px-3 rounded-lg border" placeholder="+47..." />
        </div>
        <div class="md:col-span-2">
          <label class="block text-sm font-medium mb-1">Notes (optional)</label>
          <textarea v-model="confirmForm.delivery_notes" rows="2" class="w-full px-3 py-2 rounded-lg border" placeholder="Access instructions, contact preferences..."></textarea>
        </div>
      </div>
      <button
        class="h-10 px-4 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
        :disabled="loadingConfirm"
        @click="confirmQuote"
      >
        <Spinner v-if="loadingConfirm" size="sm" />
        <span>{{ loadingConfirm ? 'Submitting...' : 'Confirm Delivery' }}</span>
      </button>
      <div v-if="confirmError" class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{{ confirmError }}</div>
      <div v-if="confirmResult" class="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
        Delivery confirmed — status: {{ confirmResult.status }}
      </div>
    </div>

    <div class="rounded-xl border bg-white p-6 shadow-sm space-y-4">
      <header class="space-y-1">
        <h3 class="text-lg font-semibold">Track Delivery Status</h3>
        <p class="text-sm text-gray-600">Look up the state of a delivery using the confirmation UUID.</p>
      </header>
      <div class="grid gap-4 md:grid-cols-[minmax(0,_320px)_auto] items-end">
        <div>
          <label class="block text-sm font-medium mb-1">Delivery UUID</label>
          <input v-model="statusUuid" class="w-full h-10 px-3 rounded-lg border" placeholder="Paste confirmation UUID" />
        </div>
        <button
          class="h-10 px-4 rounded-lg border bg-white hover:bg-gray-50 disabled:opacity-50 flex items-center gap-2"
          :disabled="loadingStatus"
          @click="fetchStatus"
        >
          <Spinner v-if="loadingStatus" size="sm" />
          <span>{{ loadingStatus ? 'Checking...' : 'Check Status' }}</span>
        </button>
      </div>
      <div v-if="statusError" class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{{ statusError }}</div>
      <div v-if="status" class="space-y-2 text-sm text-gray-700">
        <div class="font-medium">Delivery #{{ status.id }} — {{ status.delivery_status || 'Unknown' }}</div>
        <div>Pickup: {{ status.pickup_location || '—' }}</div>
        <div>Delivery: {{ status.delivery_location || '—' }}</div>
        <div>Packages: {{ status.packages.length }}</div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import Spinner from '@/components/Spinner.vue'
import { requestDelivery, confirmDelivery, getDeliveryStatus } from '@/api/publicDeliveries'
import type { DeliveryQuoteResponse, ConfirmDeliveryRequest, ConfirmDeliveryResponse, DeliveryStatusResponse } from '@/types/api'

const quoteForm = reactive<{ sender_zip_code: string; receiver_zip_code: string; packages: any[] }>({
  sender_zip_code: '',
  receiver_zip_code: '',
  packages: [],
})
const quotePackage = ref('1.5,40,30,20')
const quote = ref<DeliveryQuoteResponse | null>(null)
const quoteError = ref<string | null>(null)
const loadingQuote = ref(false)

function buildPackagePayload() {
  const parts = quotePackage.value.split(',').map(s => s.trim()).filter(Boolean)
  if (parts.length >= 4) {
    const [weight, height, width, length] = parts
    return [{ weight, height, width, length }]
  }
  return []
}

async function requestQuote() {
  loadingQuote.value = true
  quoteError.value = null
  quote.value = null
  try {
    quoteForm.packages = buildPackagePayload()
    if (quoteForm.packages.length === 0) {
      quoteError.value = 'Please provide weight, height, width and length (comma separated).'
      return
    }
    quote.value = await requestDelivery(quoteForm)
  } catch (e: any) {
    quoteError.value = e?.message || 'Failed to request quote.'
  } finally {
    loadingQuote.value = false
  }
}

const confirmForm = reactive<ConfirmDeliveryRequest>({
  uuid: '',
  packages: [{ weight: '1.5', height: '40', width: '30', length: '20' }],
  receiver: '',
  receiver_phone: '',
  delivery_location: '',
  service: 'standard',
  price: 0,
})
const confirmResult = ref<ConfirmDeliveryResponse | null>(null)
const confirmError = ref<string | null>(null)
const loadingConfirm = ref(false)

async function confirmQuote() {
  loadingConfirm.value = true
  confirmError.value = null
  confirmResult.value = null
  try {
    if (!confirmForm.uuid) throw new Error('Quote UUID is required.')
    if (!confirmForm.receiver || !confirmForm.receiver_phone) throw new Error('Receiver details are required.')
    confirmResult.value = await confirmDelivery(confirmForm)
  } catch (e: any) {
    confirmError.value = e?.message || 'Failed to confirm delivery.'
  } finally {
    loadingConfirm.value = false
  }
}

const statusUuid = ref('')
const status = ref<DeliveryStatusResponse | null>(null)
const statusError = ref<string | null>(null)
const loadingStatus = ref(false)

async function fetchStatus() {
  loadingStatus.value = true
  statusError.value = null
  status.value = null
  try {
    if (!statusUuid.value) throw new Error('Enter a delivery UUID to check status.')
    status.value = await getDeliveryStatus(statusUuid.value)
  } catch (e: any) {
    statusError.value = e?.message || 'Failed to fetch status.'
  } finally {
    loadingStatus.value = false
  }
}
</script>
