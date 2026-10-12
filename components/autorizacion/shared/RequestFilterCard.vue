<template>
  <div class="req-filters" @keyup.enter="$emit('search')">
    <div class="req-filters__row">
      <div class="req-filters__fields">
        <slot />
      </div>
      <div class="req-filters__actions">
        <v-btn size="small" color="primary" prepend-icon="mdi-magnify" @click="$emit('search')">Search</v-btn>
        <v-btn size="small" variant="text" @click="$emit('clear')">Clear</v-btn>
      </div>
    </div>
    <div v-if="$slots.quick" class="req-filters__quick">
      <span class="text-caption text-medium-emphasis">Quick view:</span>
      <slot name="quick" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineEmits<{ (e: 'search'): void; (e: 'clear'): void }>()
</script>

<style scoped>
.req-filters {
  margin-bottom: 12px;
  padding: 12px 14px 10px;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 8px;
  background: rgb(var(--v-theme-surface));
}
.req-filters__row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}
.req-filters__fields {
  flex: 1 1 auto;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
  gap: 10px 12px;
}
.req-filters__fields :deep(.req-filters__wide) {
  grid-column: span 2;
}
.req-filters__actions {
  flex: 0 0 auto;
  display: flex;
  gap: 4px;
  padding-top: 4px;
}
.req-filters__quick {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}
</style>
