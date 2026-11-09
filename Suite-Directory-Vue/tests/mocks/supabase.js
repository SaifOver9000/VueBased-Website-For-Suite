import { vi } from 'vitest'

// A chainable stand-in for a Supabase query: every builder method returns the
// same object, and awaiting it resolves to `result` ({ data, error }).
export function query(result = { data: [], error: null }) {
  const q = {}
  for (const method of ['select', 'order', 'eq', 'insert', 'update', 'delete', 'single']) {
    q[method] = vi.fn(() => q)
  }
  q.then = (resolve, reject) => Promise.resolve(result).then(resolve, reject)
  return q
}

export const bucket = {
  upload: vi.fn(),
  getPublicUrl: vi.fn(),
}

export const supabase = {
  from: vi.fn(),
  rpc: vi.fn(),
  auth: {
    getSession: vi.fn(),
    onAuthStateChange: vi.fn(),
    signInWithPassword: vi.fn(),
    signOut: vi.fn(),
  },
  storage: {
    from: vi.fn(() => bucket),
  },
}
