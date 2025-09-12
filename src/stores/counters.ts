import { reactive } from 'vue'

export const counters = reactive({
  jobs: 0,
  nearby: 0,
})

export function setJobsCount(n: number) {
  counters.jobs = Math.max(0, Number(n) || 0)
}

export function setNearbyCount(n: number) {
  counters.nearby = Math.max(0, Number(n) || 0)
}
