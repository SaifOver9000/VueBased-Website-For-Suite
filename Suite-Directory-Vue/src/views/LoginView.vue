<template>
  <main class="min-h-screen w-full bg-slate-50 py-12 px-4 flex flex-col items-center">
    <div class="w-full max-w-sm bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
      <h2 class="text-2xl font-bold text-slate-900 mb-6">Admin Sign In</h2>

      <form class="space-y-4" @submit.prevent="handleLogin">
        <div>
          <label class="block text-sm font-semibold text-slate-700 mb-1">Email</label>
          <input
            v-model="email"
            type="email"
            autocomplete="email"
            required
            class="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>

        <div>
          <label class="block text-sm font-semibold text-slate-700 mb-1">Password</label>
          <input
            v-model="password"
            type="password"
            autocomplete="current-password"
            required
            class="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>

        <button
          type="submit"
          :disabled="isSubmitting"
          class="w-full mt-4 bg-slate-900 text-white font-semibold py-3 rounded-xl hover:bg-slate-800 transition-all disabled:bg-slate-400"
        >
          {{ isSubmitting ? 'Signing in...' : 'Sign In' }}
        </button>

        <p v-if="errorMessage" class="text-center font-medium text-sm mt-3 text-red-500">
          {{ errorMessage }}
        </p>
      </form>
    </div>
  </main>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '../supabase'

const route = useRoute()
const router = useRouter()

const email = ref('')
const password = ref('')
const isSubmitting = ref(false)
const errorMessage = ref('')

async function handleLogin() {
  isSubmitting.value = true
  errorMessage.value = ''

  const { error } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value
  })

  isSubmitting.value = false

  if (error) {
    // Show Supabase's message (e.g. "Email not confirmed") rather than assuming a bad password
    errorMessage.value = error.message || 'Sign in failed. Please try again.'
    console.error(error)
  } else {
    router.push(route.query.redirect || '/admin')
  }
}
</script>
