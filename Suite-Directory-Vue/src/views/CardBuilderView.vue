<template>
  <main class="min-h-screen w-full bg-slate-50 py-12 px-4 flex flex-col items-center">
    <div class="w-full max-w-lg bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
      <RouterLink to="/admin" class="text-sm font-medium text-slate-500 hover:text-slate-900">
        ← Back to dashboard
      </RouterLink>
      <h2 class="text-2xl font-bold text-slate-900 mt-2 mb-6">{{ isEditing ? 'Edit Suite' : 'Create New Suite' }}</h2>

      <div v-if="isLoading" class="text-slate-500 font-medium py-8 text-center">
        Loading suite...
      </div>

      <form v-else @submit.prevent="handleSubmit" class="space-y-4">
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
          {{ isSubmitting ? 'Saving...' : (isEditing ? 'Save Changes' : 'Publish Suite') }}
        </button>

        <p v-if="statusMessage" :class="['text-center font-medium text-sm mt-3', isError ? 'text-red-500' : 'text-emerald-600']">
          {{ statusMessage }}
        </p>
      </form>
    </div>
  </main>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { supabase } from '../supabase'

const route = useRoute()
const router = useRouter()

// /admin/edit/:id edits an existing suite; /admin/create makes a new one
const suiteId = route.params.id
const isEditing = computed(() => Boolean(suiteId))

const form = ref({
  suite_name: '',
  location: '',
  url: '',
  bedroom_num: 1,
  bathroom_num: 1
})

const isLoading = ref(Boolean(suiteId))
const isSubmitting = ref(false)
const statusMessage = ref('')
const isError = ref(false)

onMounted(async () => {
  if (!suiteId) return

  const { data, error } = await supabase
    .from('Suites')
    .select('*')
    .eq('id', suiteId)
    .single()

  if (error) {
    isError.value = true
    statusMessage.value = 'Error loading suite.'
    console.error(error)
  } else {
    form.value = {
      suite_name: data.suite_name,
      location: data.location,
      url: data.url,
      bedroom_num: data.bedroom_num,
      bathroom_num: data.bathroom_num
    }
  }
  isLoading.value = false
})

async function handleSubmit() {
  isSubmitting.value = true
  statusMessage.value = ''
  isError.value = false

  const suite = {
    suite_name: form.value.suite_name,
    location: form.value.location,
    url: form.value.url,
    bedroom_num: form.value.bedroom_num,
    bathroom_num: form.value.bathroom_num
  }

  // .select() returns the written rows, so a write blocked by RLS shows up as an empty result
  const { data, error } = isEditing.value
    ? await supabase.from('Suites').update(suite).eq('id', suiteId).select()
    : await supabase.from('Suites').insert([suite]).select()

  isSubmitting.value = false

  if (error || !data?.length) {
    isError.value = true
    statusMessage.value = isEditing.value
      ? 'Error saving suite. Please try again.'
      : 'Error adding suite. Please try again.'
    console.error(error)
  } else if (isEditing.value) {
    router.push('/admin')
  } else {
    statusMessage.value = 'Suite added successfully!'
    form.value = { suite_name: '', location: '', url: '', bedroom_num: 1, bathroom_num: 1 }
  }
}
</script>

<style scoped></style>