import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import SuiteGrid from '../src/components/SuiteGrid.vue'
import SuiteCard from '../src/components/SuiteCard.vue'

const suites = [
  { id: 1, name: 'A', features: { beds: 1, baths: 1 } },
  { id: 2, name: 'B', features: { beds: 2, baths: 2 } }
]

describe('SuiteGrid', () => {
  it('shows an empty message with no suites', () => {
    const wrapper = mount(SuiteGrid, { props: { suites: [] } })
    expect(wrapper.text()).toContain('No suites found.')
    expect(wrapper.findAllComponents(SuiteCard)).toHaveLength(0)
  })

  it('renders one card per suite', () => {
    const wrapper = mount(SuiteGrid, { props: { suites } })
    expect(wrapper.findAllComponents(SuiteCard)).toHaveLength(2)
    expect(wrapper.text()).not.toContain('No suites found.')
  })

  it('re-emits select from a card', async () => {
    vi.spyOn(console, 'log').mockImplementation(() => {})
    const wrapper = mount(SuiteGrid, { props: { suites } })
    await wrapper.findAllComponents(SuiteCard)[1].trigger('click')
    expect(wrapper.emitted('select')).toEqual([[suites[1]]])
  })
})
