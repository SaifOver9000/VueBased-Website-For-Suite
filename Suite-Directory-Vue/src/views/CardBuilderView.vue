<template>
  <div class="admin-container">
    <h2>Create New Suite</h2>
    
    <form @submit.prevent="handleSubmit" class="suite-form">
      <div class="form-group">
        <label>Suite Title</label>
        <input v-model="form.title" type="text" placeholder="e.g. Yorkville Penthouse" required />
      </div>

      <div class="form-group">
        <label>Location / Neighborhood</label>
        <input v-model="form.location" type="text" placeholder="e.g. Downtown Toronto, ON" required />
      </div>

      <div class="form-group">
        <label>Image URL</label>
        <input v-model="form.imageUrl" type="url" placeholder="https://..." required />
      </div>

      <div class="form-group">
        <label>Official Website Link</label>
        <input v-model="form.websiteUrl" type="url" placeholder="https://..." required />
      </div>

      <button type="submit" :disabled="isSubmitting" class="submit-btn">
        {{ isSubmitting ? 'Saving...' : 'Publish Suite' }}
      </button>

      <p v-if="message" :class="['status-msg', isError ? 'error' : 'success']">
        {{ message }}
      </p>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { supabase } from '../supabase'

const form = ref({
  title: '',
  location: '',
  imageUrl: '',
  websiteUrl: ''
})

const isSubmitting = ref(false)
const message = ref('')
const isError = ref(false)

async function handleSubmit() {
  isSubmitting.value = true
  message.value = ''
  isError.value = false

  // Insert form data into the Supabase 'suites' table
  const { error } = await supabase
    .from('suites')
    .insert([
      {
        title: form.value.title,
        location: form.value.location,
        image_url: form.value.imageUrl,
        website_url: form.value.websiteUrl
      }
    ])

  isSubmitting.value = false

  if (error) {
    isError.value = true
    message.value = 'Failed to create suite. Please try again.'
    console.error(error)
  } else {
    message.value = 'Suite published successfully!'
    // Reset form fields
    form.value = { title: '', location: '', imageUrl: '', websiteUrl: '' }
  }
}
</script>

<style scoped>
.admin-container {
  max-width: 500px;
  margin: 40px auto;
  padding: 24px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}
.form-group {
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
}
.form-group label {
  font-weight: 600;
  margin-bottom: 6px;
}
.form-group input {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.submit-btn {
  width: 100%;
  padding: 12px;
  background-color: #10b981;
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
}
.submit-btn:disabled {
  background-color: #a7f3d0;
}
.status-msg {
  margin-top: 16px;
  text-align: center;
  font-weight: bold;
}
.success { color: #059669; }
.error { color: #dc2626; }
</style>