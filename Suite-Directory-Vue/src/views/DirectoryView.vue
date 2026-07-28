<template>
  <main class="min-h-screen w-full bg-slate-50 py-12 px-4 flex flex-col items-center">
    
    <!-- Page Header Section -->
    <header class="w-full max-w-xl text-center mb-8">
      <!-- Dynamic Title -->
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
        <!-- Search Icon -->
        <svg class="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
      </div>
    </header>
    

    <!-- Grid Layout Container -->
    <section class="w-full max-w-xl">
      <SuiteGrid :suites="filteredSuites" @select="handleSuiteSelect" />
    </section>

  </main>
</template>

<script setup>
import { ref, computed } from 'vue'
import SuiteGrid from '../components/SuiteGrid.vue'

// Search state
const searchQuery = ref('Toronto')

// Dynamic Title computation
const currentCity = computed(() => {
  return searchQuery.value.trim() ? searchQuery.value : 'Everywhere'
})

// Sample Data Array (Can be replaced with API data)
const suites = ref([
  {
    id: 1,
    name: "Grand Horizon Ocean Suite",
    city: "Toronto",
    description: "Experience ultimate luxury with uninterrupted vistas, private balcony access, and personalized concierge services.",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80",
    rating: "4.9 (128)",
    tag: "Featured",
    price: 350,
    features: { beds: 2, baths: 2, guests: 4, sqft: 850 }
  },
  {
    id: 2,
    name: "Royal Penthouse Villa",
    city: "Toronto",
    description: "A private rooftop sanctuary featuring a plunge pool, expansive marble bathrooms, and panoramic skyline vistas.",
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1000&q=80",
    rating: "5.0 (84)",
    tag: "Luxury",
    price: 580,
    features: { beds: 3, baths: 3, guests: 6, sqft: 1400 }
  },
  {
    id: 3,
    name: "Serenity Garden Bungalow",
    city: "Paris",
    description: "Tucked away in lush flora, offering open-air rainfall showers, private hammock patios, and calm garden views.",
    image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1000&q=80",
    rating: "4.8 (92)",
    price: 275,
    features: { beds: 1, baths: 1, guests: 2, sqft: 600 }
  }
])

// Filter logic matching search input against city or suite name
const filteredSuites = computed(() => {
  if (!searchQuery.value) return suites.value
  const query = searchQuery.value.toLowerCase()
  return suites.value.filter(suite => 
    suite.city.toLowerCase().includes(query) || 
    suite.name.toLowerCase().includes(query)
  )
})

function handleSuiteSelect(selectedSuite) {
  console.log('Booked:', selectedSuite.name)
}
</script>