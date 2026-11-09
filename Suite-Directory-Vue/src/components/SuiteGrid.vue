<template>
  <!-- Vertical Stack Container with spacing between cards -->
  <div class="w-full flex flex-col items-center gap-8">
    <h1 class="sr-only">Hotel Suites</h1>

    <p v-if="suites.length === 0" class="text-slate-500 font-medium py-8">No suites found.</p>

    <SuiteCard
      v-for="suite in suites"
      :key="suite.id"
      :suite="suite"
      @select="emit('select', $event)"
    />
  </div>
</template>

<script setup>
import SuiteCard from './SuiteCard.vue'

defineProps({
  suites: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['select'])
</script>
