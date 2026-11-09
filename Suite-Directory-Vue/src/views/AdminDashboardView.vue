<template>
  <main class="min-h-screen w-full bg-slate-50 py-12 px-4 flex flex-col items-center">
    <div class="w-full max-w-5xl">
      <!-- Header -->
      <header class="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 class="text-3xl font-extrabold text-slate-900 tracking-tight">Admin Dashboard</h1>
          <p class="text-slate-500 text-sm">Manage the suites shown on the directory</p>
        </div>
        <RouterLink
          to="/admin/create"
          class="text-sm font-medium bg-slate-900 text-white px-4 py-2.5 rounded-xl hover:bg-slate-800 transition-all shadow-sm"
        >
          + Add Suite
        </RouterLink>
      </header>

      <!-- Stats -->
      <section class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div class="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <p class="text-sm font-medium text-slate-500">Total suites</p>
          <p class="text-3xl font-extrabold text-slate-900 mt-1">{{ suites.length }}</p>
        </div>
        <div class="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <p class="text-sm font-medium text-slate-500">Total clicks</p>
          <p class="text-3xl font-extrabold text-slate-900 mt-1">{{ totalClicks }}</p>
        </div>
        <div class="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <p class="text-sm font-medium text-slate-500">Most clicked</p>
          <p class="text-lg font-bold text-slate-900 mt-1 truncate">
            {{ topSuite ? topSuite.suite_name : '—' }}
          </p>
          <p v-if="topSuite" class="text-sm text-slate-500">{{ topSuite.click_count }} clicks</p>
        </div>
      </section>

      <!-- Toolbar -->
      <div class="flex flex-wrap items-center gap-3 mb-4">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search by name or city..."
          class="flex-1 min-w-48 px-4 py-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
        />
        <select
          v-model="sortBy"
          class="px-4 py-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
        >
          <option value="newest">Newest first</option>
          <option value="clicks">Most clicks</option>
          <option value="name">Name (A–Z)</option>
        </select>
      </div>

      <p
        v-if="statusMessage"
        :class="['font-medium text-sm mb-4', isError ? 'text-red-500' : 'text-emerald-600']"
      >
        {{ statusMessage }}
      </p>

      <!-- Loading State -->
      <div v-if="isLoading" class="text-slate-500 font-medium py-8 text-center">
        Loading suites...
      </div>

      <!-- Suites Table -->
      <div v-else class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
        <table class="w-full text-sm text-left">
          <thead class="bg-slate-100 text-slate-600 font-semibold">
            <tr>
              <th class="px-4 py-3">Suite</th>
              <th class="px-4 py-3">Location</th>
              <th class="px-4 py-3 text-center">Beds</th>
              <th class="px-4 py-3 text-center">Baths</th>
              <th class="px-4 py-3 text-center">Clicks</th>
              <th class="px-4 py-3">Added</th>
              <th class="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="visibleSuites.length === 0">
              <td colspan="7" class="px-4 py-8 text-center text-slate-500">No suites found.</td>
            </tr>
            <tr
              v-for="suite in visibleSuites"
              :key="suite.id"
              class="border-t border-slate-200 hover:bg-slate-50"
            >
              <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                  <img
                    v-if="suite.image_url"
                    :src="suite.image_url"
                    :alt="suite.suite_name"
                    class="w-12 h-12 rounded-lg object-cover shrink-0"
                  />
                  <div v-else class="w-12 h-12 rounded-lg bg-slate-200 shrink-0"></div>
                  <a
                    :href="suite.url"
                    target="_blank"
                    rel="noopener"
                    class="font-semibold text-slate-900 hover:text-blue-600"
                  >
                    {{ suite.suite_name }}
                  </a>
                </div>
              </td>
              <td class="px-4 py-3 text-slate-600">{{ suite.location }}</td>
              <td class="px-4 py-3 text-center text-slate-600">{{ suite.bedroom_num }}</td>
              <td class="px-4 py-3 text-center text-slate-600">{{ suite.bathroom_num }}</td>
              <td class="px-4 py-3 text-center font-semibold text-slate-900">
                {{ suite.click_count ?? 0 }}
              </td>
              <td class="px-4 py-3 text-slate-500 whitespace-nowrap">
                {{ formatDate(suite.created_at) }}
              </td>
              <td class="px-4 py-3 text-right whitespace-nowrap">
                <RouterLink
                  :to="`/admin/edit/${suite.id}`"
                  class="font-medium text-slate-700 hover:text-slate-900 mr-4"
                >
                  Edit
                </RouterLink>
                <button
                  type="button"
                  :disabled="deletingId === suite.id"
                  class="font-medium text-red-600 hover:text-red-800 disabled:text-slate-400"
                  @click="handleDelete(suite)"
                >
                  {{ deletingId === suite.id ? 'Deleting...' : 'Delete' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { supabase } from '../supabase'

const suites = ref([])
const isLoading = ref(true)
const searchQuery = ref('')
const sortBy = ref('newest')
const deletingId = ref(null)
const statusMessage = ref('')
const isError = ref(false)

onMounted(async () => {
  const { data, error } = await supabase
    .from('Suites')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    isError.value = true
    statusMessage.value = 'Error loading suites.'
    console.error('Error fetching suites:', error)
  } else if (data) {
    suites.value = data
  }
  isLoading.value = false
})

const totalClicks = computed(() => {
  return suites.value.reduce((sum, suite) => sum + (suite.click_count ?? 0), 0)
})

const topSuite = computed(() => {
  const top = suites.value.reduce(
    (best, suite) => ((suite.click_count ?? 0) > (best?.click_count ?? 0) ? suite : best),
    null
  )
  return top
})

const visibleSuites = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  const filtered = query
    ? suites.value.filter(
        (suite) =>
          (suite.location && suite.location.toLowerCase().includes(query)) ||
          (suite.suite_name && suite.suite_name.toLowerCase().includes(query))
      )
    : [...suites.value]

  if (sortBy.value === 'clicks') {
    filtered.sort((a, b) => (b.click_count ?? 0) - (a.click_count ?? 0))
  } else if (sortBy.value === 'name') {
    filtered.sort((a, b) => (a.suite_name || '').localeCompare(b.suite_name || ''))
  }
  return filtered
})

function formatDate(value) {
  return value ? new Date(value).toLocaleDateString() : '—'
}

async function handleDelete(suite) {
  if (!window.confirm(`Delete "${suite.suite_name}"? This can't be undone.`)) return

  deletingId.value = suite.id
  statusMessage.value = ''
  isError.value = false

  // .select() returns the deleted rows, so a delete blocked by RLS shows up as an empty result
  const { data, error } = await supabase.from('Suites').delete().eq('id', suite.id).select()

  deletingId.value = null

  if (error || !data?.length) {
    isError.value = true
    statusMessage.value = 'Error deleting suite. Please try again.'
    console.error(error)
  } else {
    suites.value = suites.value.filter((s) => s.id !== suite.id)
    statusMessage.value = `Deleted "${suite.suite_name}".`
  }
}
</script>
