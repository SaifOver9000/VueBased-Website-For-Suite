<template>
  <main class="min-h-screen w-full bg-slate-50 py-12 px-4 flex flex-col items-center">
    <div class="w-full max-w-lg bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
      <h2 class="text-2xl font-bold text-slate-900 mb-6">Create New Suite</h2>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label class="block text-sm font-semibold text-slate-700 mb-1">Suite Name</label>
          <input 
            v-model="form.suite_name" 
            type="text" 
            placeholder="e.g. Grand Horizon Ocean Suite" 
            required 
            class="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>

        <div>
          <label class="block text-sm font-semibold text-slate-700 mb-1">Location / City</label>
          <input 
            v-model="form.location" 
            type="text" 
            placeholder="e.g. Toronto" 
            required 
            class="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>

        <div>
          <label class="block text-sm font-semibold text-slate-700 mb-1">Suite Image / Website URL</label>
          <input 
            v-model="form.url" 
            type="url" 
            placeholder="https://..." 
            required 
            class="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-1">Bedrooms</label>
            <input 
              v-model.number="form.bedroom_num" 
              type="number" 
              min="0"
              required 
              class="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-1">Bathrooms</label>
            <input 
              v-model.number="form.bathroom_num" 
              type="number" 
              min="0"
              required 
              class="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>
        </div>

        <button 
          type="submit" 
          :disabled="isSubmitting"
          class="w-full mt-4 bg-slate-900 text-white font-semibold py-3 rounded-xl hover:bg-slate-800 transition-all disabled:bg-slate-400"
        >
          {{ isSubmitting ? 'Saving...' : 'Publish Suite' }}
        </button>

        <p v-if="statusMessage" :class="['text-center font-medium text-sm mt-3', isError ? 'text-red-500' : 'text-emerald-600']">
          {{ statusMessage }}
        </p>
      </form>
    </div>
  </main>
</template>

<script setup>
import { ref } from 'vue'
import { supabase } from '../supabase'

const form = ref({
  suite_name: '',
  location: '',
  url: '',
  bedroom_num: 1,
  bathroom_num: 1
})

const isSubmitting = ref(false)
const statusMessage = ref('')
const isError = ref(false)

async function handleSubmit() {
  isSubmitting.value = true
  statusMessage.value = ''
  isError.value = false

  const { error } = await supabase
    .from('Suites')
    .insert([
      {
        suite_name: form.value.suite_name,
        location: form.value.location,
        url: form.value.url,
        bedroom_num: form.value.bedroom_num,
        bathroom_num: form.value.bathroom_num
      }
    ])

  isSubmitting.value = false

  if (error) {
    isError.value = true
    statusMessage.value = 'Error adding suite. Please try again.'
    console.error(error)
  } else {
    statusMessage.value = 'Suite added successfully!'
    form.value = { suite_name: '', location: '', url: '', bedroom_num: 1, bathroom_num: 1 }
  }
}
</script>

<style scoped></style>