import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '../supabase'
import DirectoryView from '../views/DirectoryView.vue'
import CardBuilderView from '../views/CardBuilderView.vue'
import AdminDashboardView from '../views/AdminDashboardView.vue'
import LoginView from '../views/LoginView.vue'

const routes = [
  { path: '/', name: 'Directory', component: DirectoryView },
  { path: '/login', name: 'Login', component: LoginView },
  {
    path: '/admin',
    name: 'AdminDashboard',
    component: AdminDashboardView,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/create',
    name: 'CardBuilder',
    component: CardBuilderView,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/edit/:id',
    name: 'CardEditor',
    component: CardBuilderView,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Send signed-out users to the login page for any admin route
router.beforeEach(async (to) => {
  if (!to.meta.requiresAuth) return true
  const { data } = await supabase.auth.getSession()
  if (!data.session) return { name: 'Login', query: { redirect: to.fullPath } }
  return true
})

export default router
