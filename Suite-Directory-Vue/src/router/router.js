import { createRouter, createWebHistory } from 'vue-router'
import DirectoryView from '../views/DirectoryView.vue'
import CardBuilderView from '../views/CardBuilderView.vue'

const routes = [
  { path: '/', name: 'Directory', component: DirectoryView },
  { path: '/admin/create', name: 'CardBuilder', component: CardBuilderView }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router