<template>
  <section class="grid gap-6 lg:grid-cols-2">
    <!-- Weekly Earnings -->
    <div class="rounded-xl border bg-white p-6">
      <h3 class="font-semibold mb-3">Weekly Earnings</h3>
      <div class="h-56">
        <Bar :data="earningsData" :options="barOptions" />
      </div>
    </div>

    <!-- User Signups (Live) -->
    <div class="rounded-xl border bg-white p-6 relative">
      <h3 class="font-semibold mb-3">User Signups</h3>
      <div class="h-56">
        <Line :data="signupsData" :options="lineOptions" />
      </div>
      <div v-if="statsLoading" class="absolute inset-0 bg-white/60 grid place-items-center pointer-events-none">
        <Spinner />
      </div>
    </div>

    <!-- Delivery Types -->
    <div class="rounded-xl border bg-white p-6">
      <h3 class="font-semibold mb-3">Delivery Types</h3>
      <div class="h-56">
        <Pie :data="deliveryTypeData" :options="pieOptions" />
      </div>
    </div>

    <!-- Hourly Activity -->
    <div class="rounded-xl border bg-white p-6">
      <h3 class="font-semibold mb-3">Hourly Activity</h3>
      <div class="h-56">
        <Bar :data="hourlyActivityData" :options="barOptions" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { Bar, Line, Pie } from 'vue-chartjs'
import 'chart.js/auto'
import { ref, onMounted } from 'vue'
import { useDashboardStats } from '@/composables/useDashboardStats'
import Spinner from '@/components/Spinner.vue'

// Chart data
const earningsData = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  datasets: [
    {
      label: 'Earnings (kr)',
      data: [1895, 2342, 1988, 2673, 2984, 1563, 2018],
      backgroundColor: 'rgba(34,197,94,0.5)',
      borderColor: 'rgb(34,197,94)'
    }
  ]
}

// Live signups data, defaults then replaced on load
const signupsData = ref({
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    {
      label: 'Signups',
      data: [10, 12, 9, 14, 18, 16],
      borderColor: 'rgb(59,130,246)',
      backgroundColor: 'rgba(59,130,246,0.2)',
      tension: 0.3
    }
  ]
})

const deliveryTypeData = {
  labels: ['Standard', 'Express', 'Eco'],
  datasets: [
    {
      label: 'Deliveries',
      data: [60, 25, 15],
      backgroundColor: ['#93c5fd', '#fca5a5', '#86efac'],
      borderColor: ['#60a5fa', '#f87171', '#22c55e']
    }
  ]
}

const hourlyActivityData = {
  labels: ['8', '9', '10', '11', '12', '13', '14', '15', '16'],
  datasets: [
    {
      label: 'Deliveries',
      data: [2, 4, 6, 5, 7, 8, 6, 4, 3],
      backgroundColor: 'rgba(59,130,246,0.5)',
      borderColor: 'rgb(59,130,246)'
    }
  ]
}

// Minimal options reused for bars
const barOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: { x: { grid: { display: false } }, y: { grid: { color: '#eee' } } }
}

const lineOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: { x: { grid: { display: false } }, y: { grid: { color: '#eee' } } }
}

const pieOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { position: 'bottom' as const } }
}

// Load live stats and update the chart
const { stats, load, loading: statsLoading } = useDashboardStats()

onMounted(async () => {
  try {
    await load()
    if (stats.value && stats.value.length) {
      // take last 7 by date, ascending
      const sorted = [...stats.value].sort((a, b) => a.date.localeCompare(b.date))
      const last7 = sorted.slice(-7)
      signupsData.value = {
        labels: last7.map(s => s.date),
        datasets: [
          {
            label: 'Signups',
            data: last7.map(s => s.count),
            borderColor: 'rgb(59,130,246)',
            backgroundColor: 'rgba(59,130,246,0.2)',
            tension: 0.3
          }
        ]
      }
    }
  } catch (e) {
    // leave fallback data
  }
})
</script>
