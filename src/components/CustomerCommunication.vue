<template>
  <section class="rounded-xl border bg-white shadow-sm">
    <header class="p-4 border-b">
      <h3 class="text-lg font-semibold flex items-center gap-2">💬 Customer Communication</h3>
      <p class="text-sm text-gray-500">{{ deliveryId }} — {{ customerName }}</p>
    </header>

    <div class="p-4 space-y-4">
      <!-- Tabs -->
      <div class="flex gap-2">
        <button
          class="h-9 px-3 rounded border text-sm"
          :class="activeTab === 'chat' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white hover:bg-gray-50'"
          @click="activeTab = 'chat'"
        >💬 Chat</button>
        <button
          class="h-9 px-3 rounded border text-sm"
          :class="activeTab === 'call' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white hover:bg-gray-50'"
          @click="activeTab = 'call'"
        >📞 Call</button>
        <button
          class="h-9 px-3 rounded border text-sm"
          :class="activeTab === 'sms' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white hover:bg-gray-50'"
          @click="activeTab = 'sms'"
        >📨 SMS</button>
      </div>

      <!-- Chat -->
      <div v-if="activeTab === 'chat'" class="space-y-4">
        <div ref="scrollEl" class="h-64 overflow-y-auto border rounded-lg p-3 space-y-3 bg-gray-50">
          <div
            v-for="m in messages"
            :key="m.id"
            class="flex"
            :class="m.sender === 'driver' ? 'justify-end' : 'justify-start'"
          >
            <div
              class="max-w-[75%] rounded-lg p-2 text-sm shadow-sm"
              :class="m.sender === 'driver' ? 'bg-blue-600 text-white' : m.sender === 'customer' ? 'bg-white border' : 'bg-gray-200 text-gray-700'"
            >
              <div>{{ m.content }}</div>
              <div class="flex items-center justify-between mt-1 text-xs opacity-75">
                <span>{{ m.timestamp }}</span>
                <span v-if="m.sender === 'driver'">{{ statusIcon(m.status) }}</span>
              </div>
            </div>
          </div>
          <div v-if="messages.length === 0" class="text-center text-gray-500 text-sm py-6">No messages yet</div>
        </div>

        <div class="space-y-2">
          <div class="text-xs text-gray-500">Quick Replies</div>
          <div class="grid grid-cols-1 gap-2">
            <button
              v-for="(qr, i) in quickReplies"
              :key="i"
              class="text-left justify-start h-auto py-2 px-3 rounded border bg-white hover:bg-gray-50 text-xs"
              @click="sendQuickReply(qr)"
            >
              {{ qr }}
            </button>
          </div>
        </div>

        <div class="flex gap-2">
          <input
            v-model="newMessage"
            type="text"
            placeholder="Type your message..."
            class="flex-1 h-9 px-3 rounded border"
            @keydown.enter.prevent="sendMessage"
          />
          <button class="h-9 px-3 rounded bg-blue-600 text-white hover:bg-blue-700" :disabled="!newMessage.trim()" @click="sendMessage">
            ➤
          </button>
        </div>
      </div>

      <!-- Call -->
      <div v-else-if="activeTab === 'call'" class="space-y-4">
        <div class="text-center p-6 border rounded-lg bg-gray-50">
          <div class="text-4xl mb-2">📞</div>
          <h4 class="font-medium mb-1">{{ customerName }}</h4>
          <p class="text-sm text-gray-500 mb-4">{{ customerPhone }}</p>
          <button class="h-9 w-full rounded bg-blue-600 text-white hover:bg-blue-700">
            Call Customer
          </button>
        </div>
        <div class="space-y-2">
          <h5 class="text-sm font-medium">Call History</h5>
          <div class="space-y-2">
            <div class="flex justify-between items-center p-2 border rounded text-sm">
              <span>Outgoing call</span>
              <span class="text-gray-500">10:35 AM • 1m 23s</span>
            </div>
            <div class="flex justify-between items-center p-2 border rounded text-sm">
              <span>Incoming call</span>
              <span class="text-gray-500">9:45 AM • 2m 45s</span>
            </div>
          </div>
        </div>
      </div>

      <!-- SMS -->
      <div v-else class="space-y-4">
        <div class="space-y-2">
          <h5 class="text-sm font-medium">Send SMS Update</h5>
          <textarea v-model="smsBody" placeholder="Type your SMS message..." class="w-full min-h-[100px] rounded border p-2"></textarea>
          <div class="flex justify-between items-center text-sm">
            <span class="text-gray-500">To: {{ customerPhone }}</span>
            <button class="h-9 px-3 rounded bg-blue-600 text-white hover:bg-blue-700" :disabled="!smsBody.trim()" @click="sendSms">Send SMS</button>
          </div>
        </div>
        <div class="space-y-2">
          <h5 class="text-sm font-medium">SMS Templates</h5>
          <div class="space-y-2">
            <button
              v-for="(t, i) in smsTemplates"
              :key="i"
              class="w-full text-left justify-start h-auto py-2 px-3 rounded border bg-white hover:bg-gray-50 text-xs"
              @click="smsBody = t"
            >
              {{ t }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { nextTick, reactive, ref } from 'vue'

const props = defineProps<{
  deliveryId: string
  customerName: string
  customerPhone: string
}>()

// Tabs
const activeTab = ref<'chat' | 'call' | 'sms'>('chat')

// Chat
type Message = {
  id: string
  sender: 'system' | 'customer' | 'driver'
  content: string
  timestamp: string
  status: 'sent' | 'delivered' | 'read'
}

const messages = reactive<Message[]>([
  { id: '1', sender: 'system', content: 'Delivery has been assigned to your driver. ETA: 25 minutes', timestamp: '10:30 AM', status: 'delivered' },
  { id: '2', sender: 'customer', content: "Hi! I'm not home right now. Can you leave the package with my neighbor at apartment 2A?", timestamp: '10:45 AM', status: 'read' },
  { id: '3', sender: 'driver', content: "Hi Michael! I can leave it with your neighbor. I'll need their name for confirmation.", timestamp: '10:47 AM', status: 'read' },
  { id: '4', sender: 'customer', content: 'Great! Her name is Sarah Johnson. Thanks!', timestamp: '10:48 AM', status: 'read' },
])

const quickReplies = [
  "I'm on my way to your location",
  'Running 5 minutes late due to traffic',
  'Package delivered successfully',
  'Unable to deliver - please contact me',
  'Package requires signature',
]

const newMessage = ref('')
const scrollEl = ref<HTMLDivElement | null>(null)

function nowHM() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function sendMessage() {
  if (!newMessage.value.trim()) return
  messages.push({ id: Date.now().toString(), sender: 'driver', content: newMessage.value, timestamp: nowHM(), status: 'sent' })
  newMessage.value = ''
  nextTick(() => scrollEl.value?.scrollTo({ top: scrollEl.value.scrollHeight, behavior: 'smooth' }))
}

function sendQuickReply(text: string) {
  messages.push({ id: Date.now().toString(), sender: 'driver', content: text, timestamp: nowHM(), status: 'sent' })
  nextTick(() => scrollEl.value?.scrollTo({ top: scrollEl.value.scrollHeight, behavior: 'smooth' }))
}

function statusIcon(s: Message['status']) {
  return s === 'read' ? '✔✔' : s === 'delivered' ? '✔✔' : '✔'
}

// SMS
const smsBody = ref('')
const smsTemplates = [
  'Your package is out for delivery. ETA: [TIME]',
  'Delivery attempted - please contact for redelivery',
  'Package delivered successfully to [LOCATION]',
  'Unable to access delivery location - please advise',
]

function sendSms() {
  // Placeholder: integrate with SMS service if needed
  smsBody.value = ''
}
</script>
