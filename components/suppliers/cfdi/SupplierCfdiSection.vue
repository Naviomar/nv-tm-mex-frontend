<template>
  <section class="cfdi-section rounded-lg mb-4" :class="`cfdi-section--${color}`">
    <header class="flex flex-wrap items-center gap-3 px-4 py-3">
      <div class="cfdi-section__badge" :class="`bg-${color}`">
        <span v-if="step" class="font-bold text-sm">{{ step }}</span>
        <v-icon v-else size="18" color="white">{{ icon }}</v-icon>
      </div>
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 font-bold text-base">
          <v-icon v-if="step && icon" size="18" :color="color">{{ icon }}</v-icon>
          {{ title }}
        </div>
        <div v-if="subtitle" class="text-xs text-medium-emphasis">{{ subtitle }}</div>
      </div>
      <slot name="actions" />
    </header>
    <div class="px-4 pb-4">
      <slot />
    </div>
  </section>
</template>
<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string
    subtitle?: string
    icon?: string
    step?: string | number
    color?: string
  }>(),
  { color: 'primary', icon: 'mdi-circle-small' },
)
</script>
<style scoped>
.cfdi-section {
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgba(var(--v-theme-on-surface), 0.1);
  border-left-width: 4px;
}
.cfdi-section--primary {
  border-left-color: rgb(var(--v-theme-primary));
}
.cfdi-section--indigo {
  border-left-color: #3f51b5;
}
.cfdi-section--teal {
  border-left-color: #009688;
}
.cfdi-section--deep-purple {
  border-left-color: #673ab7;
}
.cfdi-section--blue-grey {
  border-left-color: #607d8b;
}
.cfdi-section--amber-darken-2 {
  border-left-color: #ffa000;
}
.cfdi-section__badge {
  width: 30px;
  height: 30px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}
</style>
