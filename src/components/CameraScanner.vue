<template>
  <teleport to="body">
    <div v-if="open" class="fixed inset-0 z-[1400] overflow-y-auto bg-black/60">
      <div class="flex min-h-full items-center justify-center p-4 md:p-6">
        <div class="relative w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-gray-100 flex flex-col overflow-hidden max-h-[min(90vh,640px)]">
          <header class="px-4 py-3 border-b flex items-center justify-between gap-3">
            <div>
              <h2 class="text-lg font-semibold text-gray-900">Scan label / QR</h2>
              <p class="text-xs text-gray-500">Align the code within the frame below.</p>
            </div>
            <button
              class="h-9 w-9 rounded-full border border-gray-200 bg-white hover:bg-gray-50 grid place-items-center"
              @click="handleCancel"
              aria-label="Close"
            >
              ?
            </button>
          </header>

          <section class="relative bg-black flex-1 min-h-[260px]">
            <video
              ref="videoEl"
              class="absolute inset-0 h-full w-full object-cover"
              autoplay
              playsinline
              muted
            ></video>
            <div class="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div class="h-48 w-48 border-2 border-white/70 rounded-lg"></div>
            </div>
            <div v-if="!supportsCamera" class="absolute inset-0 grid place-items-center bg-black/70 px-4 text-center text-white text-sm">
              Camera access is not available in this browser.
            </div>
            <div v-if="permissionDenied" class="absolute inset-0 grid place-items-center bg-black/70 px-4 text-center text-white text-sm">
              We couldn't access the camera. Please allow camera permissions and try again.
            </div>
          </section>

          <section class="px-4 py-3 space-y-3">
            <div class="text-xs text-gray-600 border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 min-h-[40px]">
              {{ statusMessage }}
            </div>

            <div v-if="availableDevices.length > 1" class="flex items-center gap-2">
              <label class="text-xs font-medium text-gray-600">Camera</label>
              <select
                class="flex-1 h-9 rounded border bg-white px-2 text-sm"
                v-model="selectedDeviceId"
                :disabled="initializing"
              >
                <option v-for="device in availableDevices" :key="device.deviceId" :value="device.deviceId">
                  {{ device.label || `Camera ${deviceIndex(device)}` }}
                </option>
              </select>
            </div>
          </section>

          <footer class="px-4 py-3 border-t flex items-center justify-between bg-white">
            <button
              class="h-9 px-3 rounded border bg-white hover:bg-gray-50 text-sm"
              @click="handleCancel"
            >
              Cancel
            </button>
            <button
              class="h-9 px-3 rounded border bg-white hover:bg-gray-50 text-sm"
              @click="restart"
              :disabled="initializing"
            >
              Restart
            </button>
          </footer>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { BrowserMultiFormatReader, type IScannerControls } from '@zxing/browser'
import { onBeforeUnmount, ref, watch } from 'vue'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ (e: 'close'): void; (e: 'decoded', payload: string): void; (e: 'error', payload: string): void }>()

const supportsCamera = typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia

const videoEl = ref<HTMLVideoElement | null>(null)
const availableDevices = ref<MediaDeviceInfo[]>([])
const selectedDeviceId = ref<string | null>(null)
const statusMessage = ref('Initializing camera...')
const initializing = ref(false)
const permissionDenied = ref(false)

let controls: IScannerControls | null = null
let reader: BrowserMultiFormatReader | null = null
let hasResult = false
let ignoreDeviceChange = false

const deviceIndex = (device: MediaDeviceInfo) => availableDevices.value.indexOf(device) + 1

async function loadDevices() {
  try {
    const devices = await BrowserMultiFormatReader.listVideoInputDevices()
    availableDevices.value = devices
    if (!devices.length) {
      statusMessage.value = 'No camera devices found.'
      return
    }
    if (!selectedDeviceId.value) {
      const preferred = devices.find(device => (device.label || '').toLowerCase().includes('back'))
      selectedDeviceId.value = preferred?.deviceId || devices[0].deviceId
    }
  } catch (error: any) {
    statusMessage.value = error?.message || 'Unable to list camera devices.'
    emit('error', statusMessage.value)
  }
}

async function stop() {
  hasResult = false
  controls?.stop()
  controls = null
  reader?.reset()
  reader = null
  const stream = videoEl.value?.srcObject as MediaStream | null
  if (stream) {
    stream.getTracks().forEach(track => track.stop())
  }
  if (videoEl.value) {
    videoEl.value.srcObject = null
  }
}

async function start() {
  if (!supportsCamera || !videoEl.value) {
    if (!supportsCamera) {
      statusMessage.value = 'Camera access is not supported in this browser.'
      emit('error', statusMessage.value)
    }
    return
  }
  initializing.value = true
  permissionDenied.value = false
  statusMessage.value = 'Requesting camera...'
  if (!reader) reader = new BrowserMultiFormatReader()

  try {
    controls = await reader.decodeFromVideoDevice(selectedDeviceId.value ?? undefined, videoEl.value, (result, error) => {
      if (result) {
        if (hasResult) return
        hasResult = true
        statusMessage.value = 'Code detected'
        emit('decoded', result.getText())
        stop().finally(() => emit('close'))
      } else if (error && error.name !== 'NotFoundException') {
        statusMessage.value = error.message || 'Unable to read code. Please try again.'
      }
    })
    statusMessage.value = 'Align the code inside the frame.'
  } catch (error: any) {
    if (error?.name === 'NotAllowedError') {
      permissionDenied.value = true
      statusMessage.value = 'Camera access was denied.'
    } else {
      statusMessage.value = error?.message || 'Failed to start camera.'
    }
    emit('error', statusMessage.value)
    await stop()
  } finally {
    initializing.value = false
  }
}

async function restart() {
  await stop()
  if (props.open) await start()
}

async function handleCancel() {
  await stop()
  emit('close')
}

watch(
  () => props.open,
  async open => {
    if (open) {
      statusMessage.value = 'Initializing camera...'
      ignoreDeviceChange = true
      await loadDevices()
      ignoreDeviceChange = false
      await start()
    } else {
      ignoreDeviceChange = false
      await stop()
    }
  }
)

watch(selectedDeviceId, async (id, prev) => {
  if (!props.open) return
  if (ignoreDeviceChange) return
  if (!id || id === prev) return
  await restart()
})

onBeforeUnmount(async () => {
  await stop()
})
</script>
