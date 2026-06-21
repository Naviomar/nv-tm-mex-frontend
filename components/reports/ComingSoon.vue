<template>
  <div class="coming-soon">
    <v-icon size="72" :color="color" class="mb-4 cs-icon">{{ icon }}</v-icon>
    <h3 class="text-h5 font-weight-medium mb-2">No reports available for {{ title }} yet</h3>
    <p class="text-body-1 text-grey-darken-1 text-center" style="max-width: 460px;">
      Reports for this department are coming soon. They will appear here once available.
    </p>
    <v-chip class="mt-4" color="grey" variant="tonal" size="small">
      <v-icon start size="16">mdi-clock-outline</v-icon>
      Coming soon
    </v-chip>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  title: string
  icon?: string
  color?: string
}>(), {
  icon: 'mdi-chart-box-outline',
  color: 'grey-lighten-1',
})
</script>

<style scoped>
.coming-soon {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 460px;
  padding: 40px;
  border: 2px dashed rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 16px;
  background: rgba(var(--v-theme-on-surface), 0.02);
  animation: cs-fade 0.5s ease both;
}
.cs-icon {
  animation: cs-float 3.2s ease-in-out infinite;
}
@keyframes cs-float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}
@keyframes cs-fade {
  from {
    opacity: 0;
    transform: scale(0.98);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
