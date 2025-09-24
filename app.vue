<template>
  <div>
    <NuxtLayout>
      <NuxtLoadingIndicator color="#79A0D0" />
      <NewVersionBanner />
      <NuxtPage />
    </NuxtLayout>
    <NuxtSnackbar />
  </div>
</template>
<script setup lang="ts">
// import { useRegisterSW } from 'virtual:pwa-register/vue'

// const { needRefresh, updateServiceWorker } = useRegisterSW()

// // Mostrar un mensaje cuando haya una nueva versión disponible
// watch(needRefresh, (isUpdated) => {
//   if (isUpdated) {
//     if (confirm('Hay una nueva versión disponible. ¿Quieres actualizar ahora?')) {
//       updateServiceWorker(true)
//     }
//   }
// })
</script>
<style>
.page-enter-active,
.page-leave-active {
  transition: all 0.4s;
}
.page-enter-from,
.page-leave-to {
  opacity: 0;
  filter: blur(1rem);
}
</style>
