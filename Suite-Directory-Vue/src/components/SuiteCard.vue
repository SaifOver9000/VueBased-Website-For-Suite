<template>
  <a
    :href="suite.websiteUrl"
    target="_blank"
    rel="noopener noreferrer"
    class="flex flex-col items-center justify-center text-center text-white
           bg-slate-900 rounded-2xl overflow-hidden p-6 gap-2
           hover:-translate-y-1 hover:shadow-lg transition"
    @click="handleClick"
  >
  
  <h3 class="text-base font-semibold">{{ suite.name }}</h3>
    <img
      :src="suite.image"
      :alt="suite.name"
      class="w-1/2 object-cover rounded-lg mb-2"
    />
    <p class="text-sm text-slate-300">{{ suite.location }}</p>
    <p class="text-xs text-slate-400">{{ suite.keyFeatures }}</p>
  </a>
</template>

<script setup>
defineProps({
  suite: {
    type: Object,
    required: true
  }
})

function handleClick(event) {
  // ...
}
</script>

<style scoped>
/* ...leave this as-is for now... */
</style>