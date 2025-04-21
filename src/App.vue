<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <div class="min-h-screen bg-gray-100 text-gray-900">
    <header class="bg-blue-600 text-white p-4">
      <h1 class="text-xl font-bold">音乐魔盒</h1>
    </header>
    <main class="container mx-auto p-4">
      <RouterView />
    </main>
  </div>
</template>
