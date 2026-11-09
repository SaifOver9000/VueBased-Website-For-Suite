<template>
  <main class="min-h-screen w-full bg-slate-50 py-12 px-4 flex flex-col items-center">
    <div class="w-full max-w-lg bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
      <RouterLink to="/admin" class="text-sm font-medium text-slate-500 hover:text-slate-900">
        ← Back to dashboard
      </RouterLink>
      <h2 class="text-2xl font-bold text-slate-900 mt-2 mb-6">
        {{ isEditing ? 'Edit Suite' : 'Create New Suite' }}
      </h2>

      <div v-if="isLoading" class="text-slate-500 font-medium py-8 text-center">
        Loading suite...
      </div>

      <form v-else class="space-y-4" @submit.prevent="handleSubmit">
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
          <label class="block text-sm font-semibold text-slate-700 mb-1">Suite Website URL</label>
          <input
            v-model="form.url"
            type="url"
            placeholder="https://..."
            required
            class="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>

        <div>
          <label class="block text-sm font-semibold text-slate-700 mb-1">Suite Photo</label>
          <img
            v-if="previewUrl"
            :src="previewUrl"
            alt="Suite photo preview"
            class="w-full h-48 object-cover rounded-xl border border-slate-200 mb-2"
          />
          <input
            type="file"
            accept="image/*"
            class="w-full text-sm text-slate-600 file:mr-4 file:px-4 file:py-2 file:rounded-xl file:border-0 file:bg-slate-100 file:font-semibold file:text-slate-700 hover:file:bg-slate-200"
            @change="handleFileChange"
          />
          <p class="text-xs text-slate-500 mt-1">
            JPG, PNG or WebP, up to 5 MB.{{
              isEditing ? ' Leave empty to keep the current photo.' : ''
            }}
          </p>
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
          {{ isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Publish Suite' }}
        </button>

        <p
          v-if="statusMessage"
          :class="[
            'text-center font-medium text-sm mt-3',
            isError ? 'text-red-500' : 'text-emerald-600'
          ]"
        >
          {{ statusMessage }}
        </p>
      </form>
    </div>
  </main>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { supabase } from '../supabase'

const IMAGE_BUCKET = 'suite-images'
const MAX_IMAGE_BYTES = 5 * 1024 * 1024

const route = useRoute()
const router = useRouter()

// /admin/edit/:id edits an existing suite; /admin/create makes a new one
const suiteId = route.params.id
const isEditing = computed(() => Boolean(suiteId))

const emptyForm = () => ({
  suite_name: '',
  location: '',
  url: '',
  image_url: '',
  bedroom_num: 1,
  bathroom_num: 1
})

const form = ref(emptyForm())
const imageFile = ref(null)
const localPreview = ref('')

const isLoading = ref(Boolean(suiteId))
const isSubmitting = ref(false)
const statusMessage = ref('')
const isError = ref(false)

// A newly picked file wins over the suite's saved image
const previewUrl = computed(() => localPreview.value || form.value.image_url)

onMounted(async () => {
  if (!suiteId) return

  const { data, error } = await supabase.from('Suites').select('*').eq('id', suiteId).single()

  if (error) {
    isError.value = true
    statusMessage.value = 'Error loading suite.'
    console.error(error)
  } else {
    form.value = {
      suite_name: data.suite_name,
      location: data.location,
      url: data.url,
      image_url: data.image_url || '',
      bedroom_num: data.bedroom_num,
      bathroom_num: data.bathroom_num
    }
  }
  isLoading.value = false
})

onBeforeUnmount(clearLocalPreview)

function clearLocalPreview() {
  if (localPreview.value) URL.revokeObjectURL(localPreview.value)
  localPreview.value = ''
}

function handleFileChange(event) {
  const file = event.target.files[0]
  clearLocalPreview()
  imageFile.value = null
  statusMessage.value = ''
  isError.value = false

  if (!file) return

  if (!file.type.startsWith('image/') || file.size > MAX_IMAGE_BYTES) {
    isError.value = true
    statusMessage.value = 'Please choose an image under 5 MB.'
    event.target.value = ''
    return
  }

  imageFile.value = file
  localPreview.value = URL.createObjectURL(file)
}

// Uploads the picked file and returns its public URL
async function uploadImage(file) {
  const extension = file.name.split('.').pop()
  const path = `${crypto.randomUUID()}.${extension}`

  const { error } = await supabase.storage
    .from(IMAGE_BUCKET)
    .upload(path, file, { contentType: file.type })

  if (error) throw error

  return supabase.storage.from(IMAGE_BUCKET).getPublicUrl(path).data.publicUrl
}

async function handleSubmit() {
  isSubmitting.value = true
  statusMessage.value = ''
  isError.value = false

  let imageUrl = form.value.image_url || null
  if (imageFile.value) {
    try {
      imageUrl = await uploadImage(imageFile.value)
    } catch (error) {
      isSubmitting.value = false
      isError.value = true
      statusMessage.value = `Error uploading photo: ${error.message}`
      console.error(error)
      return
    }
  }

  const suite = {
    suite_name: form.value.suite_name,
    location: form.value.location,
    url: form.value.url,
    image_url: imageUrl,
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
    // An empty result with no error means RLS silently blocked the write
    const reason = error?.message || 'Permission denied. Are you signed in?'
    statusMessage.value = isEditing.value
      ? `Error saving suite: ${reason}`
      : `Error adding suite: ${reason}`
    console.error(error)
  } else if (isEditing.value) {
    router.push('/admin')
  } else {
    statusMessage.value = 'Suite added successfully!'
    form.value = emptyForm()
    imageFile.value = null
    clearLocalPreview()
  }
}
</script>

<style scoped></style>
