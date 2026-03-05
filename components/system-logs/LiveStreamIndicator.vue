<template>
  <div class="d-flex align-center ga-2">
    <v-chip
      :color="isActive ? (isPaused ? 'orange' : 'red') : 'grey'"
      size="small"
      variant="flat"
      class="font-weight-bold"
    >
      <v-icon start size="10" :icon="isActive && !isPaused ? 'mdi-circle' : 'mdi-circle-outline'" :class="{ 'live-pulse': isActive && !isPaused }" />
      {{ isActive ? (isPaused ? 'PAUSED' : 'LIVE') : 'OFFLINE' }}
    </v-chip>
    <v-btn
      v-if="isActive"
      :icon="isPaused ? 'mdi-play' : 'mdi-pause'"
      size="x-small"
      variant="text"
      :color="isPaused ? 'success' : 'warning'"
      @click="$emit('toggle-pause')"
    />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  isActive: boolean
  isPaused: boolean
}>()

defineEmits<{
  (e: 'toggle-pause'): void
}>()
</script>

<style scoped>
.live-pulse {
  animation: pulse 1.5s ease-in-out infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}
</style>
