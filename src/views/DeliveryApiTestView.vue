<template>
  <section class="max-w-3xl mx-auto space-y-8">
    <h2 class="text-2xl font-semibold">Delivery API Test</h2>

    <!-- Request Quote -->
    <div class="rounded-xl border bg-white p-4 shadow-sm space-y-3">
      <h3 class="text-lg font-medium">1) Request Delivery Quote</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label class="text-sm">Sender ZIP</label>
          <input v-model="rq.sender_zip_code" class="w-full h-10 px-3 rounded-lg border" placeholder="e.g., 0150" />
        </div>
        <div>
          <label class="text-sm">Receiver ZIP</label>
          <input v-model="rq.receiver_zip_code" class="w-full h-10 px-3 rounded-lg border" placeholder="e.g., 5003" />
        </div>
        <div>
          <label class="text-sm">Package (W,H,W,L)</label>
          <input v-model="rqPkg" class="w-full h-10 px-3 rounded-lg border" placeholder="1.0,10,10,10" />
        </div>
      </div>
      <button class="h-10 px-4 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50" :disabled="loadingRQ" @click="onRequest">
        {{ loadingRQ ? 'Requesting…' : 'Request Quote' }}
      </button>
      <div v-if="rqError" class="text-sm text-red-600">{{ rqError }}</div>
      <div v-if="quotes" class="text-sm">
        <div class="font-medium">Response (uuid: {{ quotes.uuid }})</div>
        <ul class="list-disc ml-6">
          <li v-for="s in quotes.services" :key="s.service">{{ s.service }} — {{ s.price }} kr</li>
        </ul>
      </div>
    </div>

    <!-- Confirm Delivery -->
    <div class="rounded-xl border bg-white p-4 shadow-sm space-y-3">
      <h3 class="text-lg font-medium">2) Confirm Delivery</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label class="text-sm">UUID (from request)</label>
          <input v-model="confirm.uuid" class="w-full h-10 px-3 rounded-lg border" />
        </div>
        <div>
          <label class="text-sm">Service</label>
          <input v-model="confirm.service" class="w-full h-10 px-3 rounded-lg border" placeholder="standard" />
        </div>
        <div>
          <label class="text-sm">Price</label>
          <input v-model.number="confirm.price" type="number" class="w-full h-10 px-3 rounded-lg border" placeholder="100" />
        </div>
        <div>
          <label class="text-sm">Delivery location</label>
          <input v-model="confirm.delivery_location" class="w-full h-10 px-3 rounded-lg border" placeholder="Address" />
        </div>
        <div>
          <label class="text-sm">Receiver name</label>
          <input v-model="confirm.receiver" class="w-full h-10 px-3 rounded-lg border" placeholder="Name" />
        </div>
        <div>
          <label class="text-sm">Receiver phone</label>
          <input v-model="confirm.receiver_phone" class="w-full h-10 px-3 rounded-lg border" placeholder="+47…" />
        </div>
      </div>
      <button class="h-10 px-4 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50" :disabled="loadingCF" @click="onConfirm">
        {{ loadingCF ? 'Confirming…' : 'Confirm Delivery' }}
      </button>
      <div v-if="cfError" class="text-sm text-red-600">{{ cfError }}</div>
      <div v-if="cfResp" class="text-sm">Confirmed: {{ cfResp.status }} (uuid: {{ cfResp.uuid }})</div>
    </div>

    <!-- Status -->
    <div class="rounded-xl border bg-white p-4 shadow-sm space-y-3">
      <h3 class="text-lg font-medium">3) Get Delivery Status</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label class="text-sm">UUID</label>
          <input v-model="statusUuid" class="w-full h-10 px-3 rounded-lg border" />
        </div>
      </div>
      <button class="h-10 px-4 rounded-lg border bg-white hover:bg-gray-50 disabled:opacity-50" :disabled="loadingST" @click="onStatus">
        {{ loadingST ? 'Checking…' : 'Check Status' }}
      </button>
      <div v-if="stError" class="text-sm text-red-600">{{ stError }}</div>
      <div v-if="status" class="text-sm">
        <div class="font-medium">Delivery #{{ status.id }} — {{ status.delivery_status || '—' }}</div>
        <div>To: {{ status.delivery_location }}</div>
        <div>Packages: {{ status.packages.length }}</div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { requestDelivery, confirmDelivery, getDeliveryStatus } from '@/api/publicDeliveries'
import type { DeliveryQuoteResponse, ConfirmDeliveryRequest, ConfirmDeliveryResponse, DeliveryStatusResponse } from '@/types/api'

// Request payload state
const rq = ref({ sender_zip_code: '', receiver_zip_code: '', packages: [] as any[] })
const rqPkg = ref('1.0,10,10,10')
const quotes = ref<DeliveryQuoteResponse | null>(null)
const rqError = ref<string | null>(null)
const loadingRQ = ref(false)

async function onRequest() {
  loadingRQ.value = true
  rqError.value = null
  quotes.value = null
  try {
    const parts = rqPkg.value.split(',').map(s => s.trim())
    if (parts.length >= 4) {
      rq.value.packages = [{ weight: parts[0], height: parts[1], width: parts[2], length: parts[3] }]
    }
    quotes.value = await requestDelivery(rq.value as any)
  } catch (e: any) {
    rqError.value = e?.message || 'Failed to request quote'
  } finally {
    loadingRQ.value = false
  }
}

// Confirm delivery state
const confirm = ref<ConfirmDeliveryRequest>({
  uuid: '',
  packages: [{ weight: '1.0', height: '10', width: '10', length: '10' }],
  receiver: '',
  receiver_phone: '',
  delivery_location: '',
  service: 'standard',
  price: 0,
})
const cfResp = ref<ConfirmDeliveryResponse | null>(null)
const cfError = ref<string | null>(null)
const loadingCF = ref(false)

async function onConfirm() {
  loadingCF.value = true
  cfError.value = null
  cfResp.value = null
  try {
    cfResp.value = await confirmDelivery(confirm.value)
  } catch (e: any) {
    cfError.value = e?.message || 'Failed to confirm delivery'
  } finally {
    loadingCF.value = false
  }
}

// Status state
const statusUuid = ref('')
const status = ref<DeliveryStatusResponse | null>(null)
const stError = ref<string | null>(null)
const loadingST = ref(false)

async function onStatus() {
  loadingST.value = true
  stError.value = null
  status.value = null
  try {
    status.value = await getDeliveryStatus(statusUuid.value)
  } catch (e: any) {
    stError.value = e?.message || 'Failed to get status'
  } finally {
    loadingST.value = false
  }
}
</script>
