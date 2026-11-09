import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import SuiteCard from '../src/components/SuiteCard.vue'

const baseSuite = { id: 1, name: 'Harbour Loft', city: 'Toronto', features: { beds: 2, baths: 1 } }

describe('SuiteCard', () => {
  it('renders the name, beds and baths', () => {
    const wrapper = mount(SuiteCard, { props: { suite: baseSuite } })
    expect(wrapper.text()).toContain('Harbour Loft')
    expect(wrapper.text()).toContain('2 Beds')
    expect(wrapper.text()).toContain('1 Baths')
  })

  it('shows a placeholder when there is no image', () => {
    const wrapper = mount(SuiteCard, { props: { suite: baseSuite } })
    expect(wrapper.find('img').exists()).toBe(false)
    expect(wrapper.text()).toContain('No photo yet')
  })

  it('shows the image when one is set', () => {
    const wrapper = mount(SuiteCard, {
      props: { suite: { ...baseSuite, image: 'https://x/a.jpg' } }
    })
    const img = wrapper.get('img')
    expect(img.attributes('src')).toBe('https://x/a.jpg')
    expect(img.attributes('alt')).toBe('Harbour Loft')
  })

  it('hides optional fields that are missing', () => {
    const wrapper = mount(SuiteCard, { props: { suite: baseSuite } })
    const text = wrapper.text()
    expect(text).not.toContain('★')
    expect(text).not.toContain('/ night')
    expect(text).not.toContain('Guests')
    expect(text).not.toContain('sq ft')
  })

  it('renders optional fields when present', () => {
    const suite = {
      ...baseSuite,
      rating: 4.8,
      tag: 'Featured',
      price: 220,
      description: 'Lake views',
      features: { beds: 2, baths: 1, guests: 4, sqft: 900 }
    }
    const text = mount(SuiteCard, { props: { suite } }).text()
    expect(text).toContain('★ 4.8')
    expect(text).toContain('Featured')
    expect(text).toContain('$220')
    expect(text).toContain('Lake views')
    expect(text).toContain('4 Guests')
    expect(text).toContain('900 sq ft')
  })

  it('hides the features bar when there are no features', () => {
    const wrapper = mount(SuiteCard, { props: { suite: { id: 1, name: 'Bare' } } })
    expect(wrapper.text()).not.toContain('Beds')
  })

  it('emits select with the suite when clicked', async () => {
    vi.spyOn(console, 'log').mockImplementation(() => {})
    const wrapper = mount(SuiteCard, { props: { suite: baseSuite } })
    await wrapper.trigger('click')
    expect(wrapper.emitted('select')).toEqual([[baseSuite]])
  })
})
