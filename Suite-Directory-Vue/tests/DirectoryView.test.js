import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { supabase, query } from './mocks/supabase.js'
import DirectoryView from '../src/views/DirectoryView.vue'
import SuiteGrid from '../src/components/SuiteGrid.vue'

vi.mock('../src/supabase', () => import('./mocks/supabase.js'))

const rows = [
  {
    id: 1,
    suite_name: 'Harbour Loft',
    location: 'Toronto',
    url: 'https://harbour.example',
    image_url: 'https://img/1.jpg',
    bedroom_num: 2,
    bathroom_num: 1
  },
  {
    id: 2,
    suite_name: 'Seine View',
    location: 'Paris',
    url: 'https://seine.example',
    image_url: null,
    bedroom_num: 1,
    bathroom_num: 1
  },
  {
    id: 3,
    suite_name: 'No Link',
    location: 'Toronto',
    url: null,
    image_url: null,
    bedroom_num: 3,
    bathroom_num: 2
  }
]

async function mountWith(result) {
  const q = query(result)
  supabase.from.mockReturnValue(q)
  const wrapper = mount(DirectoryView)
  await flushPromises()
  return { wrapper, q }
}

const gridSuites = (wrapper) => wrapper.getComponent(SuiteGrid).props('suites')

describe('DirectoryView', () => {
  beforeEach(() => {
    supabase.rpc.mockResolvedValue({ error: null })
  })

  it('shows a loading state before data arrives', () => {
    supabase.from.mockReturnValue(query({ data: rows, error: null }))
    const wrapper = mount(DirectoryView)
    expect(wrapper.text()).toContain('Loading suites...')
  })

  it('queries Suites newest first and maps columns to the UI shape', async () => {
    const { wrapper, q } = await mountWith({ data: rows, error: null })
    expect(supabase.from).toHaveBeenCalledWith('Suites')
    expect(q.order).toHaveBeenCalledWith('created_at', { ascending: false })
    expect(gridSuites(wrapper)[0]).toEqual({
      id: 1,
      name: 'Harbour Loft',
      city: 'Toronto',
      image: 'https://img/1.jpg',
      websiteUrl: 'https://harbour.example',
      features: { beds: 2, baths: 1 }
    })
  })

  it('filters to Toronto by default', async () => {
    const { wrapper } = await mountWith({ data: rows, error: null })
    expect(wrapper.text()).toContain('Suites in Toronto')
    expect(gridSuites(wrapper).map((s) => s.id)).toEqual([1, 3])
  })

  it('filters by city or name, case-insensitively', async () => {
    const { wrapper } = await mountWith({ data: rows, error: null })
    await wrapper.get('input').setValue('paris')
    expect(gridSuites(wrapper).map((s) => s.id)).toEqual([2])
    await wrapper.get('input').setValue('LOFT')
    expect(gridSuites(wrapper).map((s) => s.id)).toEqual([1])
  })

  it('shows everything and an "Everywhere" heading when search is empty', async () => {
    const { wrapper } = await mountWith({ data: rows, error: null })
    await wrapper.get('input').setValue('')
    expect(wrapper.text()).toContain('Suites in Everywhere')
    expect(gridSuites(wrapper)).toHaveLength(3)
  })

  it('treats a whitespace-only search as "Everywhere"', async () => {
    const { wrapper } = await mountWith({ data: rows, error: null })
    await wrapper.get('input').setValue('   ')
    expect(wrapper.text()).toContain('Suites in Everywhere')
  })

  it('logs and shows no suites when the fetch fails', async () => {
    const err = vi.spyOn(console, 'error').mockImplementation(() => {})
    const { wrapper } = await mountWith({ data: null, error: { message: 'boom' } })
    expect(err).toHaveBeenCalled()
    expect(wrapper.text()).toContain('No suites found.')
  })

  it('opens the suite website and records a click on select', async () => {
    const open = vi.spyOn(window, 'open').mockImplementation(() => null)
    const { wrapper } = await mountWith({ data: rows, error: null })
    wrapper.getComponent(SuiteGrid).vm.$emit('select', gridSuites(wrapper)[0])
    await flushPromises()
    expect(open).toHaveBeenCalledWith('https://harbour.example', '_blank')
    expect(supabase.rpc).toHaveBeenCalledWith('increment_suite_clicks', { suite_id: 1 })
  })

  it('still records a click when the suite has no website', async () => {
    const open = vi.spyOn(window, 'open').mockImplementation(() => null)
    const { wrapper } = await mountWith({ data: rows, error: null })
    wrapper.getComponent(SuiteGrid).vm.$emit('select', gridSuites(wrapper)[1])
    await flushPromises()
    expect(open).not.toHaveBeenCalled()
    expect(supabase.rpc).toHaveBeenCalledWith('increment_suite_clicks', { suite_id: 3 })
  })

  it('logs when recording a click fails', async () => {
    vi.spyOn(window, 'open').mockImplementation(() => null)
    const err = vi.spyOn(console, 'error').mockImplementation(() => {})
    supabase.rpc.mockResolvedValue({ error: { message: 'nope' } })
    const { wrapper } = await mountWith({ data: rows, error: null })
    wrapper.getComponent(SuiteGrid).vm.$emit('select', gridSuites(wrapper)[0])
    await flushPromises()
    expect(err).toHaveBeenCalledWith('Error recording click:', { message: 'nope' })
  })
})
