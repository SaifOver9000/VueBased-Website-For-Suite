import { describe, it, expect, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { supabase } from './mocks/supabase.js'
import { makeRouter } from './helpers.js'
import LoginView from '../src/views/LoginView.vue'

vi.mock('../src/supabase', () => import('./mocks/supabase.js'))

async function setup(path = '/login') {
  const router = await makeRouter(path)
  const push = vi.spyOn(router, 'push')
  const wrapper = mount(LoginView, { global: { plugins: [router] } })
  await wrapper.get('input[type="email"]').setValue('admin@example.com')
  await wrapper.get('input[type="password"]').setValue('secret')
  return { wrapper, push }
}

describe('LoginView', () => {
  it('signs in with the entered credentials and goes to /admin', async () => {
    supabase.auth.signInWithPassword.mockResolvedValue({ error: null })
    const { wrapper, push } = await setup()
    await wrapper.get('form').trigger('submit')
    await flushPromises()
    expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({ email: 'admin@example.com', password: 'secret' })
    expect(push).toHaveBeenCalledWith('/admin')
  })

  it('returns to the redirect query after signing in', async () => {
    supabase.auth.signInWithPassword.mockResolvedValue({ error: null })
    const { wrapper, push } = await setup('/login?redirect=/admin/create')
    await wrapper.get('form').trigger('submit')
    await flushPromises()
    expect(push).toHaveBeenCalledWith('/admin/create')
  })

  it('disables the button while submitting', async () => {
    let resolve
    supabase.auth.signInWithPassword.mockReturnValue(new Promise(r => { resolve = r }))
    const { wrapper } = await setup()
    await wrapper.get('form').trigger('submit')
    const button = wrapper.get('button')
    expect(button.text()).toBe('Signing in...')
    expect(button.attributes('disabled')).toBeDefined()
    resolve({ error: null })
    await flushPromises()
    expect(wrapper.get('button').text()).toBe('Sign In')
  })

  it("shows Supabase's error message and stays on the page", async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    supabase.auth.signInWithPassword.mockResolvedValue({ error: { message: 'Email not confirmed' } })
    const { wrapper, push } = await setup()
    await wrapper.get('form').trigger('submit')
    await flushPromises()
    expect(wrapper.text()).toContain('Email not confirmed')
    expect(push).not.toHaveBeenCalled()
  })

  it('falls back to a generic message when the error has none', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    supabase.auth.signInWithPassword.mockResolvedValue({ error: {} })
    const { wrapper } = await setup()
    await wrapper.get('form').trigger('submit')
    await flushPromises()
    expect(wrapper.text()).toContain('Sign in failed. Please try again.')
  })
})
