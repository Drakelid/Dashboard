<template>
  <section class="space-y-6">
    <h2 class="text-2xl font-semibold">Profile</h2>

    <DriverProfile />

    <div class="rounded-xl border bg-white p-6 shadow-sm">
      <h3 class="text-lg font-semibold">Change Password</h3>
      <p class="text-sm text-gray-600 mb-4">
        Update your password to secure your account. Passwords must match and be at least 8 characters long.
      </p>
      <form class="space-y-4" @submit.prevent="onSubmit">
        <div>
          <label class="block text-sm font-medium mb-1" for="old-password">Current Password</label>
          <input
            id="old-password"
            v-model="form.old_password"
            type="password"
            required
            autocomplete="current-password"
            class="w-full h-10 px-3 rounded-lg border"
          />
        </div>
        <div class="grid gap-4 md:grid-cols-2">
          <div>
            <label class="block text-sm font-medium mb-1" for="new-password">New Password</label>
            <input
              id="new-password"
              v-model="form.new_password1"
              type="password"
              required
              minlength="8"
              autocomplete="new-password"
              class="w-full h-10 px-3 rounded-lg border"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1" for="confirm-password">Confirm New Password</label>
            <input
              id="confirm-password"
              v-model="form.new_password2"
              type="password"
              required
              minlength="8"
              autocomplete="new-password"
              class="w-full h-10 px-3 rounded-lg border"
            />
          </div>
        </div>
        <div class="flex items-center gap-3 flex-wrap">
          <button
            type="submit"
            :disabled="loading"
            class="h-10 px-4 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
          >
            <Spinner v-if="loading" size="sm" />
            <span>{{ loading ? 'Updating...' : 'Save Password' }}</span>
          </button>
          <button type="button" class="text-sm text-gray-600 hover:underline" @click="resetForm" :disabled="loading">
            Clear
          </button>
        </div>
        <div v-if="error" class="text-sm text-red-600">{{ error }}</div>
        <div v-if="success" class="text-sm text-green-600">{{ success }}</div>
      </form>
    </div>
  </section>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import DriverProfile from '@/components/DriverProfile.vue'
import Spinner from '@/components/Spinner.vue'
import { useAuth } from '@/composables/useAuth'

const { changePassword } = useAuth()

const form = reactive({
  old_password: '',
  new_password1: '',
  new_password2: '',
})

const loading = ref(false)
const error = ref<string | null>(null)
const success = ref<string | null>(null)

function resetForm() {
  form.old_password = ''
  form.new_password1 = ''
  form.new_password2 = ''
  error.value = null
  success.value = null
}

async function onSubmit() {
  if (form.new_password1 !== form.new_password2) {
    error.value = 'New passwords do not match.'
    success.value = null
    return
  }
  if (form.new_password1.length < 8) {
    error.value = 'Password must be at least 8 characters long.'
    success.value = null
    return
  }

  loading.value = true
  error.value = null
  success.value = null
  try {
    await changePassword({
      old_password: form.old_password,
      new_password1: form.new_password1,
      new_password2: form.new_password2,
    })
    success.value = 'Password updated successfully.'
    form.old_password = ''
    form.new_password1 = ''
    form.new_password2 = ''
  } catch (e: any) {
    error.value = e?.message || 'Failed to update password.'
  } finally {
    loading.value = false
  }
}
</script>
