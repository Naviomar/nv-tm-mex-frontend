<template>
  <div class="flow-card" :class="[highlight ? 'flow-card--highlight' : '', small ? 'flow-card--small' : '']">
    <div class="flow-card__icon" :class="`bg-${color}`">
      <v-icon size="16" color="white">{{ icon }}</v-icon>
    </div>
    <div>
      <div class="flow-card__title">{{ title }}</div>
      <div v-if="subtitle" class="flow-card__subtitle">{{ subtitle }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  icon: string
  color?: string
  title: string
  subtitle?: string
  highlight?: boolean
  small?: boolean
}>()
</script>

<style scoped>
.flow-card {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  border-radius: 10px;
  padding: 10px 14px;
  min-width: 150px;
}

.flow-card--highlight {
  border-width: 2px;
  border-color: rgb(var(--v-theme-primary));
}

.flow-card--small {
  min-width: 130px;
  padding: 6px 10px;
}

.flow-card__icon {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.flow-card__title {
  font-size: 0.8rem;
  font-weight: 600;
  line-height: 1.1;
}

.flow-card__subtitle {
  font-size: 0.68rem;
  color: rgba(var(--v-theme-on-surface), 0.6);
}
</style>
