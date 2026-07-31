<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div class="min-h-screen bg-slate-50">
    <!-- Navigation Bar -->
    <nav class="w-full bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
      <RouterLink to="/" class="text-xl font-bold text-slate-900 tracking-tight">
        🏢 Toronto Suites
      </RouterLink>
      
      <div class="flex items-center space-x-4">
        <RouterLink 
          to="/" 
          class="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
        >
          Directory
        </RouterLink>
        <RouterLink 
          to="/admin/create" 
          class="text-sm font-medium bg-slate-900 text-white px-4 py-2 rounded-xl hover:bg-slate-800 transition-all shadow-sm"
        >
          + Add Suite
        </RouterLink>
      </div>
    </nav>

    <!-- CRITICAL: This is where Vue Router injects DirectoryView or CardBuilderView -->
    <main>
      <RouterView />
    </main>
  </div>
</template>

<style scoped></style>