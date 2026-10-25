<template>
  <main class="min-h-screen w-full bg-slate-50 py-12 px-4 flex flex-col items-center">
    
    <!-- Page Header Section -->
    <header class="w-full max-w-xl text-center mb-8">
      <h1 class="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
        Suites in {{ currentCity }}
      </h1>
      <p class="text-slate-500 text-sm">
        Discover top-rated luxury accommodations and stays
      </p>

      <!-- Search Bar -->
      <div class="mt-6 relative">
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Search by city (e.g., Toronto, Paris)..." 
          class="w-full px-5 py-3.5 pl-11 bg-white border-2 border-black rounded-2xl shadow-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
        />
        <svg class="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
      </div>
    </header>
    
    <!-- Loading State -->
    <div v-if="isLoading" class="text-slate-500 font-medium py-8">
      Loading suites...
    </div>

    <!-- Grid Layout Container -->
    <section v-else class="w-full max-w-xl">
      <SuiteGrid :suites="filteredSuites" @select="handleSuiteSelect" />
    </section>

  </main>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '../supabase'
import SuiteGrid from '../components/SuiteGrid.vue'

const searchQuery = ref('Toronto')
const suites = ref([])
const isLoading = ref(true)

onMounted(async () => {
  const { data, error } = await supabase
    .from('Suites')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching suites:', error)
  } else if (data) {
    // Map Supabase columns to UI structure
    suites.value = data.map(item => ({
      id: item.id,
      name: item.suite_name,
      city: item.location,
      image: item.image_url,
      websiteUrl: item.url,
      features: { 
        beds: item.bedroom_num, 
        baths: item.bathroom_num 
      }
    }))
  }
  isLoading.value = false
})

const currentCity = computed(() => {
  return searchQuery.value.trim() ? searchQuery.value : 'Everywhere'
})

const filteredSuites = computed(() => {
  if (!searchQuery.value) return suites.value
  const query = searchQuery.value.toLowerCase()
  return suites.value.filter(suite => 
    (suite.city && suite.city.toLowerCase().includes(query)) || 
    (suite.name && suite.name.toLowerCase().includes(query))
  )
})

function handleSuiteSelect(selectedSuite) {
  if (selectedSuite.websiteUrl) {
    // Open before any await so the browser treats it as part of the click (no popup blocking)
    window.open(selectedSuite.websiteUrl, '_blank')
  }
  recordClick(selectedSuite.id)
}

async function recordClick(suiteId) {
  const { error } = await supabase.rpc('increment_suite_clicks', { suite_id: suiteId })
  if (error) console.error('Error recording click:', error)
}
</script>