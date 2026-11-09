import { describe, it, expect, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { supabase, query } from './mocks/supabase.js'
import { makeRouter } from './helpers.js'
import AdminDashboardView from '../src/views/AdminDashboardView.vue'

vi.mock('../src/supabase', () => import('./mocks/supabase.js'))

const rows = () => [
  {
    id: 1,
    suite_name: 'Bravo',
    location: 'Toronto',
    url: 'https://b',
    image_url: 'https://img/b.jpg',
    bedroom_num: 2,
    bathroom_num: 1,
    click_count: 5,
    created_at: '2026-01-02T00:00:00Z'
  },
  {
    id: 2,
    suite_name: 'Alpha',
    location: 'Paris',
    url: 'https://a',
    image_url: null,
    bedroom_num: 1,
    bathroom_num: 1,
    click_count: 12,
    created_at: '2026-01-01T00:00:00Z'
  },
  {
    id: 3,
    suite_name: 'Charlie',
    location: 'Toronto',
    url: 'https://c',
    image_url: null,
    bedroom_num: 3,
    bathroom_num: 2,
    click_count: null,
    created_at: null
  }
]

async function mountWith(result) {
  supabase.from.mockReturnValue(query(result))
  const router = await makeRouter('/admin')
  const wrapper = mount(AdminDashboardView, { global: { plugins: [router] } })
  await flushPromises()
  return wrapper
}

const names = (wrapper) => wrapper.findAll('tbody a[target="_blank"]').map((a) => a.text())
const stats = (wrapper) => wrapper.findAll('section > div').map((d) => d.text())

describe('AdminDashboardView', () => {
  it('shows a loading state first', async () => {
    supabase.from.mockReturnValue(query({ data: [], error: null }))
    const router = await makeRouter('/admin')
    const wrapper = mount(AdminDashboardView, { global: { plugins: [router] } })
    expect(wrapper.text()).toContain('Loading suites...')
  })

  it('computes suite count, total clicks and the most clicked suite', async () => {
    const wrapper = await mountWith({ data: rows(), error: null })
    const [count, clicks, top] = stats(wrapper)
    expect(count).toContain('3')
    expect(clicks).toContain('17')
    expect(top).toContain('Alpha')
    expect(top).toContain('12 clicks')
  })

  it('shows a dash for most clicked when there are no clicks', async () => {
    const wrapper = await mountWith({ data: [], error: null })
    expect(stats(wrapper)[2]).toContain('—')
    expect(wrapper.text()).toContain('No suites found.')
  })

  it('renders rows with images, click counts, dates and edit links', async () => {
    const wrapper = await mountWith({ data: rows(), error: null })
    const trs = wrapper.findAll('tbody tr')
    expect(trs).toHaveLength(3)
    expect(trs[0].find('img').attributes('src')).toBe('https://img/b.jpg')
    expect(trs[1].find('img').exists()).toBe(false)
    expect(trs[2].text()).toContain('—') // missing created_at
    expect(trs[2].findAll('td')[4].text()).toBe('0') // null click_count
    expect(trs[0].get('a[href="/admin/edit/1"]').text()).toBe('Edit')
  })

  it('shows an error when loading fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const wrapper = await mountWith({ data: null, error: { message: 'x' } })
    expect(wrapper.text()).toContain('Error loading suites.')
  })

  it('filters by name or city', async () => {
    const wrapper = await mountWith({ data: rows(), error: null })
    await wrapper.get('input').setValue('  paris ')
    expect(names(wrapper)).toEqual(['Alpha'])
    await wrapper.get('input').setValue('char')
    expect(names(wrapper)).toEqual(['Charlie'])
  })

  it('sorts by clicks and by name', async () => {
    const wrapper = await mountWith({ data: rows(), error: null })
    expect(names(wrapper)).toEqual(['Bravo', 'Alpha', 'Charlie'])
    await wrapper.get('select').setValue('clicks')
    expect(names(wrapper)).toEqual(['Alpha', 'Bravo', 'Charlie'])
    await wrapper.get('select').setValue('name')
    expect(names(wrapper)).toEqual(['Alpha', 'Bravo', 'Charlie'].sort())
  })

  it('does nothing when delete is not confirmed', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false)
    const wrapper = await mountWith({ data: rows(), error: null })
    supabase.from.mockClear()
    await wrapper.findAll('tbody button')[0].trigger('click')
    expect(supabase.from).not.toHaveBeenCalled()
  })

  it('deletes a suite and removes its row', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    const wrapper = await mountWith({ data: rows(), error: null })
    const del = query({ data: [{ id: 1 }], error: null })
    supabase.from.mockReturnValue(del)
    await wrapper.findAll('tbody button')[0].trigger('click')
    expect(wrapper.findAll('tbody button')[0].text()).toBe('Deleting...')
    await flushPromises()
    expect(del.delete).toHaveBeenCalled()
    expect(del.eq).toHaveBeenCalledWith('id', 1)
    expect(names(wrapper)).toEqual(['Alpha', 'Charlie'])
    expect(wrapper.text()).toContain('Deleted "Bravo".')
  })

  it('treats an empty delete result (RLS) as a failure', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const wrapper = await mountWith({ data: rows(), error: null })
    supabase.from.mockReturnValue(query({ data: [], error: null }))
    await wrapper.findAll('tbody button')[0].trigger('click')
    await flushPromises()
    expect(names(wrapper)).toHaveLength(3)
    expect(wrapper.text()).toContain('Error deleting suite. Please try again.')
  })

  it('shows an error when delete fails', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const wrapper = await mountWith({ data: rows(), error: null })
    supabase.from.mockReturnValue(query({ data: null, error: { message: 'denied' } }))
    await wrapper.findAll('tbody button')[0].trigger('click')
    await flushPromises()
    expect(wrapper.text()).toContain('Error deleting suite. Please try again.')
  })
})
