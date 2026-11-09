import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { supabase, query, bucket } from './mocks/supabase.js'
import { makeRouter } from './helpers.js'
import CardBuilderView from '../src/views/CardBuilderView.vue'

vi.mock('../src/supabase', () => import('./mocks/supabase.js'))

const existing = {
  id: 7, suite_name: 'Harbour Loft', location: 'Toronto', url: 'https://harbour.example',
  image_url: 'https://img/old.jpg', bedroom_num: 2, bathroom_num: 1,
}

async function setup(path) {
  const router = await makeRouter(path)
  const push = vi.spyOn(router, 'push')
  const wrapper = mount(CardBuilderView, { global: { plugins: [router] } })
  await flushPromises()
  return { wrapper, push }
}

async function fillForm(wrapper) {
  const inputs = wrapper.findAll('input')
  await inputs[0].setValue('New Suite')
  await inputs[1].setValue('Paris')
  await inputs[2].setValue('https://new.example')
  await inputs[4].setValue('3')
  await inputs[5].setValue('2')
}

async function pickFile(wrapper, file) {
  const input = wrapper.get('input[type="file"]')
  Object.defineProperty(input.element, 'files', { value: file ? [file] : [], configurable: true })
  await input.trigger('change')
}

const image = (size = 1000, type = 'image/png', name = 'photo.png') =>
  new File([new Uint8Array(size)], name, { type })

describe('CardBuilderView', () => {
  beforeEach(() => {
    URL.createObjectURL = vi.fn(() => 'blob:preview')
    URL.revokeObjectURL = vi.fn()
    bucket.upload.mockResolvedValue({ error: null })
    bucket.getPublicUrl.mockReturnValue({ data: { publicUrl: 'https://img/new.png' } })
  })

  describe('create mode', () => {
    it('shows the create heading and an empty form without fetching', async () => {
      const { wrapper } = await setup('/admin/create')
      expect(wrapper.text()).toContain('Create New Suite')
      expect(wrapper.get('button[type="submit"]').text()).toBe('Publish Suite')
      expect(supabase.from).not.toHaveBeenCalled()
    })

    it('inserts the suite, then resets the form', async () => {
      const ins = query({ data: [{ id: 1 }], error: null })
      supabase.from.mockReturnValue(ins)
      const { wrapper } = await setup('/admin/create')
      await fillForm(wrapper)
      await wrapper.get('form').trigger('submit')
      await flushPromises()
      expect(ins.insert).toHaveBeenCalledWith([{
        suite_name: 'New Suite', location: 'Paris', url: 'https://new.example',
        image_url: null, bedroom_num: 3, bathroom_num: 2,
      }])
      expect(wrapper.text()).toContain('Suite added successfully!')
      expect(wrapper.findAll('input')[0].element.value).toBe('')
    })

    it('uploads a picked photo and saves its public URL', async () => {
      const ins = query({ data: [{ id: 1 }], error: null })
      supabase.from.mockReturnValue(ins)
      const { wrapper } = await setup('/admin/create')
      await fillForm(wrapper)
      const file = image()
      await pickFile(wrapper, file)
      expect(wrapper.get('img').attributes('src')).toBe('blob:preview')
      await wrapper.get('form').trigger('submit')
      await flushPromises()
      expect(supabase.storage.from).toHaveBeenCalledWith('suite-images')
      const [path, uploaded, opts] = bucket.upload.mock.calls[0]
      expect(path).toMatch(/^[0-9a-f-]{36}\.png$/)
      expect(uploaded).toBe(file)
      expect(opts).toEqual({ contentType: 'image/png' })
      expect(ins.insert.mock.calls[0][0][0].image_url).toBe('https://img/new.png')
      expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:preview')
    })

    it('stops and reports when the upload fails', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => {})
      bucket.upload.mockResolvedValue({ error: new Error('bucket full') })
      const { wrapper } = await setup('/admin/create')
      await fillForm(wrapper)
      await pickFile(wrapper, image())
      await wrapper.get('form').trigger('submit')
      await flushPromises()
      expect(wrapper.text()).toContain('Error uploading photo: bucket full')
      expect(supabase.from).not.toHaveBeenCalled()
    })

    it('rejects non-images and files over 5 MB', async () => {
      const { wrapper } = await setup('/admin/create')
      await pickFile(wrapper, image(10, 'application/pdf', 'doc.pdf'))
      expect(wrapper.text()).toContain('Please choose an image under 5 MB.')
      await pickFile(wrapper, image(5 * 1024 * 1024 + 1))
      expect(wrapper.text()).toContain('Please choose an image under 5 MB.')
      expect(URL.createObjectURL).not.toHaveBeenCalled()
    })

    it('clears the preview when the file picker is emptied', async () => {
      const { wrapper } = await setup('/admin/create')
      await pickFile(wrapper, image())
      expect(wrapper.find('img').exists()).toBe(true)
      await pickFile(wrapper, null)
      expect(wrapper.find('img').exists()).toBe(false)
    })

    it('treats an empty insert result (RLS) as a permission error', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => {})
      supabase.from.mockReturnValue(query({ data: [], error: null }))
      const { wrapper } = await setup('/admin/create')
      await fillForm(wrapper)
      await wrapper.get('form').trigger('submit')
      await flushPromises()
      expect(wrapper.text()).toContain('Error adding suite: Permission denied. Are you signed in?')
    })

    it('revokes the preview URL on unmount', async () => {
      const { wrapper } = await setup('/admin/create')
      await pickFile(wrapper, image())
      wrapper.unmount()
      expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:preview')
    })
  })

  describe('edit mode', () => {
    it('loads the suite into the form', async () => {
      const load = query({ data: existing, error: null })
      supabase.from.mockReturnValue(load)
      const { wrapper } = await setup('/admin/edit/7')
      expect(load.eq).toHaveBeenCalledWith('id', '7')
      expect(load.single).toHaveBeenCalled()
      expect(wrapper.text()).toContain('Edit Suite')
      expect(wrapper.text()).toContain('Leave empty to keep the current photo.')
      expect(wrapper.findAll('input')[0].element.value).toBe('Harbour Loft')
      expect(wrapper.get('img').attributes('src')).toBe('https://img/old.jpg')
    })

    it('shows an error when the suite cannot be loaded', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => {})
      supabase.from.mockReturnValue(query({ data: null, error: { message: 'not found' } }))
      const { wrapper } = await setup('/admin/edit/7')
      expect(wrapper.text()).toContain('Error loading suite.')
    })

    it('updates the suite, keeping the old photo, and returns to the dashboard', async () => {
      supabase.from.mockReturnValue(query({ data: { ...existing, image_url: null }, error: null }))
      const { wrapper, push } = await setup('/admin/edit/7')
      const upd = query({ data: [{ id: 7 }], error: null })
      supabase.from.mockReturnValue(upd)
      await wrapper.findAll('input')[0].setValue('Renamed')
      await wrapper.get('form').trigger('submit')
      await flushPromises()
      expect(upd.update).toHaveBeenCalledWith(expect.objectContaining({ suite_name: 'Renamed', image_url: null }))
      expect(upd.eq).toHaveBeenCalledWith('id', '7')
      expect(push).toHaveBeenCalledWith('/admin')
    })

    it('shows the database error when the update fails', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => {})
      supabase.from.mockReturnValue(query({ data: existing, error: null }))
      const { wrapper, push } = await setup('/admin/edit/7')
      supabase.from.mockReturnValue(query({ data: null, error: { message: 'violates check' } }))
      await wrapper.get('form').trigger('submit')
      await flushPromises()
      expect(wrapper.text()).toContain('Error saving suite: violates check')
      expect(push).not.toHaveBeenCalled()
    })
  })
})
