import { beforeEach, describe, expect, it, vi } from "vitest"
import { mount, flushPromises } from "@vue/test-utils"
import { createRouter, createMemoryHistory, RouterView } from "vue-router"
import { defineComponent } from "vue"

const sampleDeliveries = [
  {
    type: "delivery",
    delivery: {
      id: 101,
      pickup_location: "Warehouse",
      delivery_location: "Fjordgata 12, Oslo",
      receiver: { name: "Alex Johnson", phone: "+47 998 88 776" },
      service: "standard",
      pickup_date: "2024-01-15",
      pickup_time: "09:30:00",
      delivery_time: "10:15:00",
      pickup_latitude: 59.9096,
      pickup_longitude: 10.7449,
      delivery_latitude: 59.9187,
      delivery_longitude: 10.7523,
    },
    packages: [
      {
        id: 9101,
        description: "Organic produce crate",
        hazardous: false,
        fragile: true,
        delivery_status: "ready_for_pickup",
      },
    ],
    location: "Fjordgata 12, Oslo",
    date: "2024-01-15",
    time: "10:15:00",
    pickup_location: "Warehouse",
    pickup_date: "2024-01-15",
    pickup_time: "09:30:00",
    pickup_latitude: 59.9096,
    pickup_longitude: 10.7449,
    delivery_latitude: 59.9187,
    delivery_longitude: 10.7523,
  },
] as any

const listDeliveriesMock = vi.fn(async (filter?: string) =>
  filter === "future" ? sampleDeliveries : []
)

vi.mock("@/components/SmallMap.vue", () => ({
  default: defineComponent({
    name: "SmallMapStub",
    template: '<div class="small-map-stub" />',
  }),
}))

vi.mock("@/components/AssignmentPackageModal.vue", () => ({
  default: defineComponent({
    name: "AssignmentPackageModalStub",
    template: '<div class="package-modal-stub" />',
  }),
}))

vi.mock("@/api/driver", () => ({
  listDeliveries: listDeliveriesMock,
}))

vi.mock("@/utils/geocode", () => ({
  geocodeAddress: vi.fn(async () => null),
}))

vi.mock("@/utils/toast", () => ({
  toast: {
    show: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    EVENT: "APP_TOAST",
  },
  addToastListener: vi.fn(),
}))

const Root = defineComponent({
  components: { RouterView },
  template: "<RouterView />",
})

let AssignmentsView: any
let useDriverDeliveries: any

describe("AssignmentsView route lifecycle", () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    const deliveriesModule = await import("@/composables/useDriverDeliveries")
    useDriverDeliveries = deliveriesModule.useDriverDeliveries
    const viewModule = await import("@/views/AssignmentsView.vue")
    AssignmentsView = viewModule.default
    const { future, past, loading, error } = useDriverDeliveries()
    future.value = null
    past.value = null
    loading.value = false
    error.value = null
  })

  it("renders after navigating away and back", async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: "/", component: defineComponent({ template: "<div>Home</div>" }) },
        { path: "/assignments", component: AssignmentsView },
      ],
    })

    router.push("/")
    await router.isReady()

    const wrapper = mount(Root, {
      global: {
        plugins: [router],
      },
    })

    await router.push("/assignments")
    await flushPromises()
    await flushPromises()

    expect(wrapper.text()).toContain("Assignments")
    expect(listDeliveriesMock).toHaveBeenCalledWith("future")

    await router.push("/")
    await flushPromises()

    await router.push("/assignments")
    await flushPromises()
    await flushPromises()

    expect(wrapper.text()).toContain("Assignments queued")
    expect(wrapper.text()).toContain("Fjordgata 12, Oslo")
  })
})
