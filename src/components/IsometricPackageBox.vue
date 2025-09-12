<template>
  <svg
    v-bind="$attrs"
    :viewBox="viewBox"
    preserveAspectRatio="xMidYMid meet"
    xmlns="http://www.w3.org/2000/svg"
    class="block"
  >
    <defs>
      <!-- Gradients use a unique ID suffix to avoid DOM collisions -->
      <linearGradient :id="`frontGradient-${uid}`" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" :stop-color="colors.front.start" />
        <stop offset="50%" :stop-color="colors.front.middle" />
        <stop offset="100%" :stop-color="colors.front.end" />
      </linearGradient>

      <linearGradient :id="`rightGradient-${uid}`" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" :stop-color="colors.right.start" />
        <stop offset="50%" :stop-color="colors.right.middle" />
        <stop offset="100%" :stop-color="colors.right.end" />
      </linearGradient>

      <linearGradient :id="`topGradient-${uid}`" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" :stop-color="colors.top.start" />
        <stop offset="50%" :stop-color="colors.top.middle" />
        <stop offset="100%" :stop-color="colors.top.end" />
      </linearGradient>

      <linearGradient :id="`shadowGradient-${uid}`" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="rgba(0,0,0,0.25)" />
        <stop offset="50%" stop-color="rgba(0,0,0,0.15)" />
        <stop offset="100%" stop-color="rgba(0,0,0,0.05)" />
      </linearGradient>

      <filter :id="`shadowBlur-${uid}`" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
      </filter>
    </defs>

    <!-- Shadow -->
    <path
      :d="createPath(shadowPoints, 2)"
      :fill="`url(#shadowGradient-${uid})`"
      :filter="`url(#shadowBlur-${uid})`"
      :opacity="shadowOpacity"
    />

    <!-- Faces -->
    <path
      :d="createPath(frontFace, 4)"
      :fill="`url(#frontGradient-${uid})`"
      :stroke="colors.stroke"
      stroke-width="1.2"
      stroke-linejoin="round"
      stroke-linecap="round"
    />

    <path
      :d="createPath(rightFace, 4)"
      :fill="`url(#rightGradient-${uid})`"
      :stroke="colors.stroke"
      stroke-width="1.2"
      stroke-linejoin="round"
      stroke-linecap="round"
    />

    <path
      :d="createPath(topFace, 4)"
      :fill="`url(#topGradient-${uid})`"
      :stroke="colors.stroke"
      stroke-width="1.2"
      stroke-linejoin="round"
      stroke-linecap="round"
    />

    <!-- Edge highlights -->
    <g stroke="rgba(255,255,255,0.4)" stroke-width="1.2" stroke-linecap="round" fill="none">
      <!-- Top edges -->
      <line :x1="0" :y1="0" :x2="finalLength" :y2="0" />
      <line :x1="finalLength" :y1="0" :x2="finalLength + depthOffset" :y2="-heightOffset" />
      <line :x1="0" :y1="0" :x2="depthOffset" :y2="-heightOffset" />

      <!-- Vertical edges -->
      <line :x1="0" :y1="0" :x2="0" :y2="finalHeight" />
      <line :x1="finalLength" :y1="0" :x2="finalLength" :y2="finalHeight" />
      <line :x1="finalLength + depthOffset" :y1="-heightOffset" :x2="finalLength + depthOffset" :y2="finalHeight - heightOffset" />
    </g>

    <!-- Dimension labels (optional, disabled in modal usage) -->
    <template v-if="showDimensions">
      <text :x="finalLength / 2" :y="finalHeight + 15" text-anchor="middle" class="fill-gray-700" style="font: 600 10px system-ui;">
        {{ dimensions.length }}cm
      </text>
      <text
        :x="finalLength + depthOffset / 2"
        :y="finalHeight - heightOffset / 2 + 5"
        text-anchor="middle"
        class="fill-gray-700"
        style="font: 600 10px system-ui;"
        :transform="`rotate(-25 ${finalLength + depthOffset / 2} ${finalHeight - heightOffset / 2 + 5})`"
      >
        {{ dimensions.width }}cm
      </text>
      <text :x="-15" :y="finalHeight / 2" text-anchor="middle" class="fill-gray-700" style="font: 600 10px system-ui;" :transform="`rotate(-90 -15 ${finalHeight / 2})`">
        {{ dimensions.height }}cm
      </text>
    </template>
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type Size = 'small' | 'medium' | 'large'

interface Dimensions {
  length: number
  width: number
  height: number
}

const props = withDefaults(defineProps<{
  dimensions: Dimensions
  weight?: string
  showDimensions?: boolean
  size?: Size
}>(), {
  showDimensions: true,
  size: 'medium'
})

// Unique suffix for gradient/filter IDs to avoid collisions when multiple components render
const uid = Math.random().toString(36).slice(2, 9)

const sizeConfig: Record<Size, { baseSize: number; iconSize: number; textSize: string; minSize: number }> = {
  small: { baseSize: 60, iconSize: 12, textSize: 'text-xs', minSize: 20 },
  medium: { baseSize: 80, iconSize: 16, textSize: 'text-sm', minSize: 25 },
  large: { baseSize: 120, iconSize: 20, textSize: 'text-base', minSize: 30 },
}

const config = computed(() => sizeConfig[props.size])

const maxDim = computed(() => Math.max(props.dimensions.length, props.dimensions.width, props.dimensions.height))
const lengthRatio = computed(() => props.dimensions.length / maxDim.value)
const widthRatio = computed(() => props.dimensions.width / maxDim.value)
const heightRatio = computed(() => props.dimensions.height / maxDim.value)

const finalLength = computed(() => Math.round(config.value.baseSize * lengthRatio.value))
const finalWidth  = computed(() => Math.round(config.value.baseSize * widthRatio.value))
const finalHeight = computed(() => Math.round(config.value.baseSize * heightRatio.value))

// Isometric projection parameters
const perspectiveRatio = 0.8
const depthRatio = 0.6
const depthOffset = computed(() => Math.round(finalWidth.value * perspectiveRatio))
const heightOffset = computed(() => Math.round(finalWidth.value * depthRatio))

// Shadow
const shadowOffset = 6
const shadowOpacity = 0.2

// Face point arrays
const frontFace = computed(() => ([
  { x: 0, y: finalHeight.value },
  { x: finalLength.value, y: finalHeight.value },
  { x: finalLength.value, y: 0 },
  { x: 0, y: 0 },
]))

const rightFace = computed(() => ([
  { x: finalLength.value, y: finalHeight.value },
  { x: finalLength.value + depthOffset.value, y: finalHeight.value - heightOffset.value },
  { x: finalLength.value + depthOffset.value, y: -heightOffset.value },
  { x: finalLength.value, y: 0 },
]))

const topFace = computed(() => ([
  { x: 0, y: 0 },
  { x: finalLength.value, y: 0 },
  { x: finalLength.value + depthOffset.value, y: -heightOffset.value },
  { x: depthOffset.value, y: -heightOffset.value },
]))

const shadowPoints = computed(() => ([
  { x: 0 + 0.3 * finalHeight.value, y: finalHeight.value + shadowOffset },
  { x: finalLength.value + 0.3 * finalHeight.value, y: finalHeight.value + shadowOffset },
  { x: finalLength.value + depthOffset.value + 0.3 * finalHeight.value, y: finalHeight.value - heightOffset.value + shadowOffset },
  { x: depthOffset.value + 0.3 * finalHeight.value, y: finalHeight.value - heightOffset.value + shadowOffset },
]))

// ViewBox
const svgWidth = computed(() => finalLength.value + depthOffset.value + 10)
const svgHeight = computed(() => finalHeight.value + heightOffset.value + shadowOffset + 10)
const viewBox = computed(() => `-5 ${-heightOffset.value - 5} ${svgWidth.value} ${svgHeight.value + shadowOffset}`)

// Shape classification
const packageType = computed(() => {
  const { length, width, height } = props.dimensions
  const isFlat = height < Math.min(length, width) * 0.3
  const isTall = height > Math.max(length, width) * 1.5
  const isSquare = Math.abs(length - width) < Math.max(length, width) * 0.2
  if (isFlat) return 'flat'
  if (isTall) return 'tall'
  if (isSquare) return 'square'
  return 'rectangular'
})

const colors = computed(() => {
  switch (packageType.value) {
    case 'flat':
      return {
        front: { start: '#fff8e1', middle: '#ffeb3b', end: '#ff8f00' },
        right: { start: '#ff8f00', middle: '#f57c00', end: '#e65100' },
        top: { start: '#fff9c4', middle: '#ffeb3b', end: '#ffa000' },
        stroke: '#e65100',
      }
    case 'tall':
      return {
        front: { start: '#e8f5e8', middle: '#66bb6a', end: '#2e7d32' },
        right: { start: '#2e7d32', middle: '#1b5e20', end: '#0d3818' },
        top: { start: '#f1f8e9', middle: '#8bc34a', end: '#689f38' },
        stroke: '#1b5e20',
      }
    case 'square':
      return {
        front: { start: '#fce4ec', middle: '#e91e63', end: '#ad1457' },
        right: { start: '#ad1457', middle: '#880e4f', end: '#4a0e4e' },
        top: { start: '#f8bbd9', middle: '#e91e63', end: '#c2185b' },
        stroke: '#880e4f',
      }
    default:
      return {
        // Default to blue/purple family to match app styling
        front: { start: '#e3f2fd', middle: '#42a5f5', end: '#1565c0' },
        right: { start: '#1565c0', middle: '#0d47a1', end: '#002171' },
        top: { start: '#f3e5f5', middle: '#ba68c8', end: '#7b1fa2' },
        stroke: '#0d47a1',
      }
  }
})

// Rounded-corner polygon path
function createPath(points: Array<{ x: number; y: number }>, cornerRadius = 3) {
  if (!points || points.length < 3) return ''
  let path = ''
  for (let i = 0; i < points.length; i++) {
    const current = points[i]
    const next = points[(i + 1) % points.length]
    const prev = points[(i - 1 + points.length) % points.length]

    if (i === 0) {
      const dx = current.x - prev.x
      const dy = current.y - prev.y
      const len = Math.hypot(dx, dy)
      if (len > cornerRadius * 2) {
        const ux = dx / len
        const uy = dy / len
        path += `M ${current.x - ux * cornerRadius} ${current.y - uy * cornerRadius}`
      } else {
        path += `M ${current.x} ${current.y}`
      }
    }

    const dx1 = current.x - prev.x
    const dy1 = current.y - prev.y
    const dx2 = next.x - current.x
    const dy2 = next.y - current.y

    const len1 = Math.hypot(dx1, dy1)
    const len2 = Math.hypot(dx2, dy2)

    if (len1 > 0 && len2 > 0) {
      const ux1 = dx1 / len1
      const uy1 = dy1 / len1
      const ux2 = dx2 / len2
      const uy2 = dy2 / len2
      const radius = Math.min(cornerRadius, len1 / 2, len2 / 2)
      const cp1x = current.x - ux1 * radius
      const cp1y = current.y - uy1 * radius
      const cp2x = current.x + ux2 * radius
      const cp2y = current.y + uy2 * radius
      path += ` L ${cp1x} ${cp1y}`
      path += ` Q ${current.x} ${current.y} ${cp2x} ${cp2y}`
    } else {
      path += ` L ${current.x} ${current.y}`
    }
  }
  path += ' Z'
  return path
}
</script>
