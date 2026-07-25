<template>
  <!-- Full-page background container with vertical centering -->
  <div class="min-h-screen bg-slate-50 flex justify-center items-start p-6 sm:p-12">

    <div class="absolute top-0 left-0 w-full h-full pointer-events-none">
        <h1 class="sr-only">Hotel Suites</h1>
    </div>
    

    <!-- Vertical Stack Container with spacing between cards -->
    <div class="w-full max-w-xl flex flex-col items-center gap-8">
      
      <SuiteCard 
        v-for="suite in suites" 
        :key="suite.id" 
        :suite="suite"
        @select="handleSuiteSelect"
      />

    </div>

  </div>
</template>

<script setup>
import { ref } from 'vue'
import SuiteCard from './SuiteCard.vue';

// Sample data structure matching key features requirements
const suites = ref([
  {
    id: 1,
    name: "Grand Horizon Ocean Suite",
    description: "Experience ultimate luxury with uninterrupted ocean vistas, private balcony access, and personalized concierge services.",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80",
    rating: "4.9 (128)",
    tag: "Featured",
    price: 350,
    features: {
      beds: 2,
      baths: 2,
      guests: 4,
      sqft: 850
    }
  },
  {
    id: 2,
    name: "Royal Penthouse Villa",
    description: "A private rooftop sanctuary featuring a plunge pool, expansive marble bathrooms, and panoramic skyline vistas.",
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1000&q=80",
    rating: "5.0 (84)",
    tag: "Luxury",
    price: 580,
    features: {
      beds: 3,
      baths: 3,
      guests: 6,
      sqft: 1400
    }
  },
  {
    id: 3,
    name: "Serenity Garden Bungalow",
    description: "Tucked away in lush tropical flora, offering open-air rainfall showers, private hammock patios, and calm garden views.",
    image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1000&q=80",
    rating: "4.8 (92)",
    price: 275,
    features: {
      beds: 1,
      baths: 1,
      guests: 2,
      sqft: 600
    }
  }
])

function handleSuiteSelect(selectedSuite) {
  console.log('Selected Suite from Grid Parent:', selectedSuite.name)
}
</script>