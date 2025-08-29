<template>
  <section class="grid gap-6 lg:grid-cols-2">
    <!-- Weekly Earnings -->
    <div class="rounded-xl border bg-white p-6">
      <h3 class="font-semibold mb-3">Weekly Earnings</h3>
      <div class="h-56">
        <Bar :data="earningsData" :options="barOptions" />
      </div>
    </div>

    <!-- Performance Trend -->
    <div class="rounded-xl border bg-white p-6">
      <h3 class="font-semibold mb-3">Performance Trend</h3>
      <div class="h-56">
        <Line :data="performanceData" :options="lineOptions" />
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

const performanceData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    {
      label: 'On-time %',
      data: [89, 92, 94, 95, 96, 97],
      borderColor: 'rgb(59,130,246)',
      backgroundColor: 'rgba(59,130,246,0.2)',
      tension: 0.3
    }
  ]
}

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
</script>
