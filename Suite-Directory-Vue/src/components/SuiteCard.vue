<template>
  <div 
    @click="handleClick"
    class="max-w-xl w-full bg-white border border-slate-900 rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer"
  >
    <!-- Hotel Image -->
    <a href="#" class="block relative group overflow-hidden" @click.prevent>
      <img 
        class="w-full h-72 object-cover group-hover:scale-105 transition-transform duration-500" 
        :src="suite.image" 
        :alt="suite.name" 
      />
      <!-- Rating Badge -->
      <span 
        v-if="suite.rating" 
        class="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-md text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm"
      >
        ★ {{ suite.rating }}
      </span>
      <!-- Tag Badge -->
      <span 
        v-if="suite.tag" 
        class="absolute top-4 left-4 bg-white/90 backdrop-blur-md text-slate-900 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm"
      >
        {{ suite.tag }}
      </span>
    </a>

    <!-- Card Body -->
    <div class="p-8">
      <!-- Title & Price Header -->
      <div class="flex items-start justify-between gap-4 mb-3">
        <h2 class="text-2xl font-bold tracking-tight text-slate-900 hover:text-blue-600 transition-colors">
          {{ suite.name }}
        </h2>
        <div v-if="suite.price" class="text-right shrink-0">
          <span class="text-2xl font-extrabold text-slate-900">${{ suite.price }}</span>
          <span class="text-xs text-slate-500 block">/ night</span>
        </div>
      </div>

      <!-- Description -->
      <p class="text-slate-600 leading-relaxed mb-6">
        {{ suite.description }}
      </p>

      <!-- Key Features Specs Bar -->
      <div 
        v-if="suite.features" 
        class="grid grid-cols-4 gap-2 py-3 px-4 bg-slate-100 rounded-2xl mb-6 text-slate-700 text-xs font-medium"
      >
        <div class="flex items-center gap-1.5 justify-center">
          <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
          <span>{{ suite.features.beds }} Beds</span>
        </div>
        <div class="flex items-center gap-1.5 justify-center">
          <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"/></svg>
          <span>{{ suite.features.baths }} Baths</span>
        </div>
        <div class="flex items-center gap-1.5 justify-center">
          <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
          <span>{{ suite.features.guests }} Guests</span>
        </div>
        <div class="flex items-center gap-1.5 justify-center">
          <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/></svg>
          <span>{{ suite.features.sqft }} sq ft</span>
        </div>
      </div>

      <!-- Action Button -->
      <button 
        type="button" 
        class="inline-flex w-full items-center justify-center font-semibold text-sm text-white bg-slate-900 hover:bg-slate-800 active:scale-[0.98] rounded-2xl px-6 py-3.5 transition-all shadow-md"
      >
        Book Now
        <svg class="w-4 h-4 ms-2 rtl:rotate-180" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 12H5m14 0-4 4m4-4-4-4"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  suite: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['select'])

function handleClick() {
  console.log('Card clicked:', props.suite)
  emit('select', props.suite)
}
</script>

<style scoped>
/* Scoped styles */
</style>