<script setup>
import { ref } from 'vue'
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { supabase } from './supabase'

const router = useRouter()
const session = ref(null)

supabase.auth.getSession().then(({ data }) => {
  session.value = data.session
})

supabase.auth.onAuthStateChange((_event, newSession) => {
  session.value = newSession
})

async function handleSignOut() {
  await supabase.auth.signOut()
  router.push('/')
}
</script>

<template>
  <div class="min-h-screen bg-slate-50">
    <!-- Navigation Bar -->
    <nav class="w-full bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
      <RouterLink to="/" class="text-xl font-bold text-slate-900 tracking-tight">
        🏢 Toronto Suites
      </RouterLink>

      <div class="flex items-center space-x-4">
        <RouterLink
          to="/"
          class="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
        >
          Directory
        </RouterLink>
        <!-- Admin controls only appear once signed in; admins enter via /admin (see README) -->
        <RouterLink
          v-if="session"
          to="/admin"
          class="text-sm font-medium bg-slate-900 text-white px-4 py-2 rounded-xl hover:bg-slate-800 transition-all shadow-sm"
        >
          Admin
        </RouterLink>
        <button
          v-if="session"
          type="button"
          @click="handleSignOut"
          class="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
        >
          Sign out
        </button>
      </div>
    </nav>

    <!-- CRITICAL: This is where Vue Router injects the current view.
         Keyed by path so create/edit (same component) remount when switching between them. -->
    <main>
      <RouterView :key="$route.fullPath" />
    </main>
  </div>
</template>

<style scoped></style>
