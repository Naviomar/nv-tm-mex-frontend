<template>
  <div class="dashboard-page">
    <GlobalDashboard />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  title: 'Dashboard',
  layout: 'default',
})
</script>

<style scoped>
.dashboard-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e8eef5 100%);
  padding: 0;
}
</style>
