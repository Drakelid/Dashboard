<template>
  <teleport to="body">
    <div v-if="open" class="fixed inset-0 z-[1400] overflow-y-auto bg-black/60">
      <div class="flex min-h-full items-center justify-center p-4 md:p-6">
        <div class="relative w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-gray-100 flex flex-col overflow-hidden max-h-[min(90vh,680px)]">
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

          <section class="relative bg-black flex-1 min-h-[280px]">
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
            <div v-if="!streamReady" class="absolute inset-0 grid place-items-center bg-black/70 px-4 text-center text-white text-sm">
              {{ statusMessage }}
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
                <option v-for="(device, index) in availableDevices" :key="device.deviceId" :value="device.deviceId">
                  {{ device.label || `Camera ${index + 1}` }}
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

const isLocalhost = typeof window !== 'undefined' && /^(localhost|127\.0\.0\.1|\[::1\])$/.test(window.location.hostname)
const secureContext = typeof window !== 'undefined' ? (window.isSecureContext || isLocalhost) : true
const supportsCamera = typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia && secureContext
const hasBarcodeDetector = typeof window !== 'undefined' && 'BarcodeDetector' in window

const videoEl = ref<HTMLVideoElement | null>(null)
const availableDevices = ref<MediaDeviceInfo[]>([])
const selectedDeviceId = ref<string | null>(null)
const statusMessage = ref(
  secureContext
    ? 'Initializing camera...'
    : 'Camera access requires HTTPS (or use localhost).'
)
const initializing = ref(false)
const permissionDenied = ref(false)
const hasStream = ref(false)
const streamReady = ref(false)

let controls: IScannerControls | null = null
let reader: BrowserMultiFormatReader | null = null
let hasResult = false
let ignoreDeviceChange = false
let permissionsRequested = false
let detectionFrame = 0
type BarcodeDetectorInstance = {
  detect: (source: CanvasImageSource) => Promise<Array<{ rawValue?: string }>>
}

let barcodeDetector: BarcodeDetectorInstance | null = null
let stream: MediaStream | null = null

async function ensureCameraAccess() {
  if (!supportsCamera) {
    emit('error', statusMessage.value)
    return false
  }
  if (permissionsRequested) return true
  try {
    const tempStream = await navigator.mediaDevices.getUserMedia({ video: true })
    tempStream.getTracks().forEach(track => track.stop())
    permissionsRequested = true
    return true
  } catch (error: any) {
    permissionDenied.value = true
    statusMessage.value = error?.message || 'Unable to access the camera.'
    emit('error', statusMessage.value)
    return false
  }
}

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

function stopBarcodeLoop() {
  if (detectionFrame) {
    cancelAnimationFrame(detectionFrame)
    detectionFrame = 0
  }
}

async function stop() {
  hasResult = false
  stopBarcodeLoop()
  controls?.stop()
  controls = null
  // BrowserMultiFormatReader in @zxing/browser 0.1.x does not expose a public reset API; rely on controls.stop instead.
  if (stream) {
    stream.getTracks().forEach(track => track.stop())
    stream = null
  }
  hasStream.value = false
  streamReady.value = false
  if (videoEl.value) {
    try { videoEl.value.pause() } catch {}
    videoEl.value.srcObject = null
  }
}

function handleDetectedValue(value: string) {
  if (hasResult) return
  hasResult = true
  emit('decoded', value)
  handleCancel()
}

async function runBarcodeLoop() {
  if (!barcodeDetector || !videoEl.value || !props.open) return
  try {
    const results = await barcodeDetector.detect(videoEl.value)
    if (results && results.length) {
      const candidate = results[0]
      if (candidate.rawValue) {
        handleDetectedValue(candidate.rawValue)
        return
      }
    }
  } catch (error: any) {
    if (error?.name !== 'NotFoundError') {
      statusMessage.value = error?.message || 'Unable to read code. Please try again.'
    }
  }
  detectionFrame = requestAnimationFrame(runBarcodeLoop)
}

async function playVideo(video: HTMLVideoElement) {
  try {
    await video.play()
    streamReady.value = true
    statusMessage.value = 'Align the code inside the frame.'
  } catch (error: any) {
    streamReady.value = false
    statusMessage.value = error?.message || 'Unable to start video playback.'
    emit('error', statusMessage.value)
  }
}

function bindStreamToVideo(srcStream: MediaStream) {
  if (!videoEl.value) return
  try {
    videoEl.value.srcObject = srcStream
    hasStream.value = true
    if (videoEl.value.readyState >= 2) {
      playVideo(videoEl.value)
    } else {
      videoEl.value.onloadedmetadata = () => {
        videoEl.value && playVideo(videoEl.value)
      }
    }
  } catch (error: any) {
    statusMessage.value = error?.message || 'Failed to attach camera stream.'
    emit('error', statusMessage.value)
  }
}

async function startWithBarcodeDetector(constraints: MediaStreamConstraints) {
  try {
    stream = await navigator.mediaDevices.getUserMedia(constraints)
    bindStreamToVideo(stream)
    if (!barcodeDetector) {
      try {
        const formats = await (window as any).BarcodeDetector.getSupportedFormats?.()
        barcodeDetector = new (window as any).BarcodeDetector({ formats: formats || undefined })
      } catch {
        barcodeDetector = new (window as any).BarcodeDetector()
      }
    }
    stopBarcodeLoop()
    detectionFrame = requestAnimationFrame(runBarcodeLoop)
  } catch (error: any) {
    if (error?.name === 'NotAllowedError') {
      permissionDenied.value = true
      statusMessage.value = 'Camera access was denied.'
    } else {
      statusMessage.value = error?.message || 'Failed to start camera.'
    }
    emit('error', statusMessage.value)
    await stop()
  }
}

async function startWithZxing(constraints: MediaStreamConstraints) {
  if (!reader) reader = new BrowserMultiFormatReader()
  try {
    const deviceId = (() => {
      const video = constraints.video
      if (video && typeof video === 'object' && 'deviceId' in video && video.deviceId) {
        const specifier = video.deviceId as MediaTrackConstraintSet['deviceId']
        if (typeof specifier === 'string') return specifier
        if (specifier && typeof specifier === 'object' && 'exact' in specifier) {
          return specifier.exact as string
        }
      }
      return undefined
    })()

    const video = videoEl.value!
    streamReady.value = false
    statusMessage.value = 'Starting scanner...'

    const assignControls = (ctrl?: IScannerControls | null) => {
      if (ctrl) controls = ctrl
    }

    controls = await reader.decodeFromVideoDevice(deviceId, video, (result, error, ctrl) => {
      assignControls(ctrl)
      if (result) {
        handleDetectedValue(result.getText())
        ctrl?.stop()
      } else if (error && error.name !== 'NotFoundException') {
        statusMessage.value = error.message || 'Unable to read code. Please try again.'
      }
    })

    stream = (video.srcObject as MediaStream) || null
    hasStream.value = !!stream

    if (video.readyState >= 2) {
      await playVideo(video)
    } else {
      video.onloadedmetadata = () => {
        if (video) {
          playVideo(video)
        }
      }
    }
  } catch (error: any) {
    if (error?.name === 'NotAllowedError') {
      permissionDenied.value = true
      statusMessage.value = 'Camera access was denied.'
    } else {
      statusMessage.value = error?.message || 'Failed to start camera.'
    }
    emit('error', statusMessage.value)
    await stop()
  }
}

async function start() {
  if (!supportsCamera || !videoEl.value) {
    statusMessage.value = supportsCamera ? 'Camera element unavailable.' : statusMessage.value
    return
  }
  initializing.value = true
  permissionDenied.value = false
  statusMessage.value = 'Requesting camera...'

  const constraints: MediaStreamConstraints = {
    video: selectedDeviceId.value
      ? { deviceId: { exact: selectedDeviceId.value } }
      : { facingMode: 'environment' }
  }

  hasResult = false
  stopBarcodeLoop()

  if (hasBarcodeDetector) {
    await startWithBarcodeDetector(constraints)
  } else {
    await startWithZxing(constraints)
  }

  initializing.value = false
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
      const ready = await ensureCameraAccess()
      if (!ready) return
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
