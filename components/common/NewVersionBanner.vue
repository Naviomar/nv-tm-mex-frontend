<template>
  <div
    v-if="insNewVersionAvailable"
    class="fixed bottom-12 left-1/2 transform -translate-x-1/2 z-50 px-6 py-4 rounded-lg shadow-lg flex items-center gap-4 bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 border border-white animate-fade-in"
    style="min-width: 320px; max-width: 90vw"
  >
    <v-icon color="white" size="large">mdi-update</v-icon>
    <div class="flex-1">
      <p class="text-white font-bold text-lg mb-1">New version available!</p>
      <p class="text-white text-sm opacity-80">We've made improvements. Please refresh to get the latest updates.</p>
    </div>
    <button
      @click="refresh"
      class="bg-white text-blue-700 font-semibold px-4 py-2 rounded shadow hover:bg-blue-100 transition-all border border-blue-300"
      style="min-width: 120px"
    >
      <v-icon left size="small" color="blue">mdi-refresh</v-icon>
      Refresh
    </button>
  </div>
</template>

<script setup lang="ts">
const { insNewVersionAvailable } = useVersionUpdater()

function useVersionUpdater() {
  const insNewVersionAvailable = ref(false)
  const nuxtApp = useNuxtApp()
  nuxtApp.hooks.hookOnce('app:manifest:update', () => {
    insNewVersionAvailable.value = true
  })

  return {
    insNewVersionAvailable: readonly(insNewVersionAvailable),
  }
}

function refresh() {
  window.location.reload()
}
</script>

<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fade-in {
  animation: fade-in 0.7s ease;
}
</style>
