import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { supabase } from './mocks/supabase.js'
import { makeRouter } from './helpers.js'
import App from '../src/App.vue'

vi.mock('../src/supabase', () => import('./mocks/supabase.js'))

let authCallback
async function setup(session) {
  supabase.auth.getSession.mockResolvedValue({ data: { session } })
  supabase.auth.onAuthStateChange.mockImplementation(cb => { authCallback = cb })
  supabase.auth.signOut.mockResolvedValue({ error: null })
  const router = await makeRouter('/admin')
  const push = vi.spyOn(router, 'push')
  const wrapper = mount(App, { global: { plugins: [router] } })
  await flushPromises()
  return { wrapper, push }
}

describe('App', () => {
  beforeEach(() => { authCallback = undefined })

  it('hides admin controls when signed out', async () => {
    const { wrapper } = await setup(null)
    expect(wrapper.text()).toContain('Directory')
    expect(wrapper.text()).not.toContain('Admin')
    expect(wrapper.text()).not.toContain('Sign out')
  })

  it('shows admin controls when signed in', async () => {
    const { wrapper } = await setup({ user: { id: 'u' } })
    expect(wrapper.get('a[href="/admin"]').text()).toBe('Admin')
    expect(wrapper.text()).toContain('Sign out')
  })

  it('reacts to auth state changes', async () => {
    const { wrapper } = await setup(null)
    authCallback('SIGNED_IN', { user: { id: 'u' } })
    await flushPromises()
    expect(wrapper.text()).toContain('Sign out')
    authCallback('SIGNED_OUT', null)
    await flushPromises()
    expect(wrapper.text()).not.toContain('Sign out')
  })

  it('signs out and goes home', async () => {
    const { wrapper, push } = await setup({ user: { id: 'u' } })
    await wrapper.get('button').trigger('click')
    await flushPromises()
    expect(supabase.auth.signOut).toHaveBeenCalled()
    expect(push).toHaveBeenCalledWith('/')
  })
})
