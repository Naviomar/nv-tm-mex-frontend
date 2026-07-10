<template>
  <div class="flow-arrow">
    <v-icon size="20">mdi-arrow-right-thin</v-icon>
    <span v-if="label" class="flow-arrow__label">{{ label }}</span>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label?: string
}>()
</script>

<style scoped>
.flow-arrow {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: rgba(var(--v-theme-on-surface), 0.5);
  flex-shrink: 0;
}

.flow-arrow__label {
  font-size: 0.6rem;
  white-space: nowrap;
  margin-top: -4px;
}
</style>
