import { describe, it, expect, vi, beforeEach } from 'vitest'
import { supabase } from './mocks/supabase.js'
import router from '../src/router/router.js'

vi.mock('../src/supabase', () => import('./mocks/supabase.js'))

describe('router auth guard', () => {
  beforeEach(async () => {
    supabase.auth.getSession.mockResolvedValue({ data: { session: null } })
    await router.push('/')
  })

  it('lets anyone open public routes without checking the session', async () => {
    supabase.auth.getSession.mockClear()
    await router.push('/login')
    expect(router.currentRoute.value.name).toBe('Login')
    expect(supabase.auth.getSession).not.toHaveBeenCalled()
  })

  it.each(['/admin', '/admin/create', '/admin/edit/3'])(
    'redirects %s to login when signed out',
    async (path) => {
      await router.push(path)
      expect(router.currentRoute.value.name).toBe('Login')
      expect(router.currentRoute.value.query.redirect).toBe(path)
    }
  )

  it('allows admin routes with a session', async () => {
    supabase.auth.getSession.mockResolvedValue({ data: { session: { user: { id: 'u' } } } })
    await router.push('/admin/edit/3')
    expect(router.currentRoute.value.name).toBe('CardEditor')
    expect(router.currentRoute.value.params.id).toBe('3')
  })
})
