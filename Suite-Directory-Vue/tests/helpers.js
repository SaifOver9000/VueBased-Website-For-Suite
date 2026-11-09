import { createRouter, createMemoryHistory } from 'vue-router'

const Stub = { template: '<div />' }

// A throwaway router with the app's paths, so views can use useRoute/useRouter
export async function makeRouter(initialPath = '/', component = Stub) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: Stub },
      { path: '/login', component: Stub },
      { path: '/admin', component: Stub },
      { path: '/admin/create', component },
      { path: '/admin/edit/:id', component },
    ],
  })
  router.push(initialPath)
  await router.isReady()
  return router
}
