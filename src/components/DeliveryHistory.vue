<template>
  <section class="rounded-xl border bg-white shadow-sm">
    <header class="p-4 border-b">
      <h3 class="text-lg font-semibold flex items-center gap-2">
        <span class="inline-block h-4 w-4 rounded-full bg-emerald-500" />
        Delivery History
      </h3>
      <p class="text-sm text-gray-500">
        {{ showFullView ? "Today's completed deliveries" : 'Recent completed deliveries' }}
      </p>
    </header>

    <div class="p-4 space-y-3">
      <p v-if="isEmpty" class="text-sm text-gray-500">
        No completed deliveries yet. Finish a delivery to populate this list.
      </p>

      <template v-else>
        <div
          v-for="delivery in displayedDeliveries"
          :key="delivery.id"
          class="border rounded-lg p-3 space-y-2"
        >
          <div class="flex items-center justify-between gap-3">
            <div class="flex items-center gap-3">
              <span class="inline-block h-4 w-4 rounded-full bg-emerald-500" />
              <span class="font-medium text-sm">#{{ delivery.id }}</span>
              <span class="px-2 py-0.5 rounded text-xs" :class="delivery.statusClass">
                {{ delivery.statusLabel }}
              </span>
              <span v-if="delivery.ecoFriendly" class="px-2 py-0.5 rounded text-xs bg-emerald-100 text-emerald-800">
                Eco
              </span>
            </div>
            <div class="text-xs text-gray-500 whitespace-nowrap">{{ delivery.completedAt }}</div>
          </div>

          <div class="space-y-1 text-sm">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
              <span class="font-medium">{{ delivery.routeLabel }}</span>
              <span class="text-gray-500">{{ delivery.actorLabel }}</span>
            </div>
            <div class="flex flex-wrap items-center gap-3 text-xs text-gray-500">
              <span>{{ delivery.packageSummary }}</span>
              <span v-if="delivery.firstPackageLabel">{{ delivery.firstPackageLabel }}</span>
            </div>
          </div>

          <div class="flex items-center justify-between text-xs text-gray-500 pt-1">
            <span>{{ delivery.notesLabel }}</span>
            <span class="font-medium text-green-600">{{ delivery.amountLabel }}</span>
          </div>
        </div>

        <div v-if="!showFullView && hasMore" class="text-center pt-2">
          <span class="inline-block px-2 py-1 border rounded text-xs">
            +{{ mappedDeliveries.length - displayedDeliveries.length }} more completed deliveries
          </span>
        </div>

        <div class="pt-3 border-t">
          <div class="flex justify-between items-center text-sm">
            <span class="text-gray-500">{{ showFullView ? "Today's Totals" : 'Shown Deliveries' }}</span>
            <div class="flex items-center gap-3">
              <span>{{ totalPackages }} packages</span>
              <span class="font-medium text-green-600">{{ totalEarningsLabel }}</span>
            </div>
          </div>
        </div>
      </template>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { DriverDeliveryItem, Package } from '@/types/api'

const props = withDefaults(defineProps<{
  deliveries?: DriverDeliveryItem[]
  showFullView?: boolean
}>(), {
  deliveries: () => [],
  showFullView: false,
})

interface HistoryRow {
  id: string
  statusLabel: string
  statusClass: string
  ecoFriendly: boolean
  completedAt: string
  routeLabel: string
  actorLabel: string
  packageSummary: string
  firstPackageLabel?: string
  notesLabel: string
  amountLabel: string
  amountValue: number | null
  packageCount: number
}

function coerceNumber(value: unknown): number | null {
  if (value == null) return null
  const num = typeof value === 'number' ? value : Number.parseFloat(String(value))
  return Number.isFinite(num) ? num : null
}

function formatCurrency(value: number | null): string {
  if (value == null || value === 0) return 'n/a'
  return `kr ${Math.round(value).toLocaleString()}`
}

function formatDate(date?: string | null, time?: string | null): string {
  if (!date) return 'Pending'
  const safeTime = time || '00:00:00'
  const composed = `${date}T${safeTime}`
  const parsed = new Date(composed)
  if (Number.isNaN(parsed.getTime())) return date
  const dateFormatter = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' })
  const timeFormatter = new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit' })
  return `${dateFormatter.format(parsed)} ${timeFormatter.format(parsed)}`
}

function getPackageSummary(packages: Package[] | undefined) {
  const list = packages || []
  const packageCount = list.length
  const ecoFriendly = packageCount > 0 ? list.every(pkg => !pkg.hazardous) : false
  const summary = packageCount === 0 ? 'No packages assigned yet' : packageCount === 1 ? '1 package' : `${packageCount} packages`
  const first = list[0]
  let firstLabel: string | undefined
  if (first) {
    const details = [first.description, first.delivery_status, first.weight && first.weight_unit ? `${first.weight} ${first.weight_unit}` : null]
      .filter(Boolean)
      .join(' - ')
    if (details) firstLabel = details
  }
  return { summary, ecoFriendly, packageCount, firstLabel }
}

function mapDelivery(item: DriverDeliveryItem, index: number): HistoryRow {
  const delivery = item.delivery || ({} as DriverDeliveryItem['delivery'])
  const identifier = delivery?.id ?? (delivery as any)?.uuid ?? `delivery-${index + 1}`
  const pickup = item.pickup_location || delivery?.pickup_location || 'Pickup pending'
  const dropoff = delivery?.delivery_location || item.location || 'Destination pending'
  const receiverName = delivery?.receiver?.name || item.actor?.name || 'Recipient unknown'
  const packageMeta = getPackageSummary(item.packages)

  const amountCandidates = [
    (delivery as any)?.price,
    (delivery as any)?.total_price,
    (delivery as any)?.delivery_fee,
    (delivery as any)?.fee,
  ]
  const amountValue = amountCandidates.reduce<number | null>((acc, candidate) => acc ?? coerceNumber(candidate), null)

  return {
    id: String(identifier),
    statusLabel: item.is_delivered ? 'Delivered' : 'In progress',
    statusClass: item.is_delivered ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800',
    ecoFriendly: packageMeta.ecoFriendly,
    completedAt: item.is_delivered
      ? formatDate(delivery?.delivery_date || item.date, delivery?.delivery_time || item.time)
      : formatDate(item.date, item.time),
    routeLabel: `${pickup} -> ${dropoff}`,
    actorLabel: `Recipient: ${receiverName}`,
    packageSummary: packageMeta.summary,
    firstPackageLabel: packageMeta.firstLabel,
    notesLabel: delivery?.service ? `Service: ${delivery.service}` : 'Service pending',
    amountLabel: formatCurrency(amountValue),
    amountValue,
    packageCount: packageMeta.packageCount,
  }
}

const mappedDeliveries = computed(() => props.deliveries.map(mapDelivery))
const isEmpty = computed(() => mappedDeliveries.value.length === 0)
const displayedDeliveries = computed(() => (props.showFullView ? mappedDeliveries.value : mappedDeliveries.value.slice(0, 4)))
const hasMore = computed(() => mappedDeliveries.value.length > displayedDeliveries.value.length)
const totalPackages = computed(() => displayedDeliveries.value.reduce((sum, d) => sum + d.packageCount, 0))
const totalEarnings = computed(() => displayedDeliveries.value.reduce((sum, d) => sum + (d.amountValue ?? 0), 0))
const totalEarningsLabel = computed(() => formatCurrency(totalEarnings.value || null))
const showFullView = computed(() => props.showFullView)
</script>
