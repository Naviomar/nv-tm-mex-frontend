<template>
  <v-list density="compact" class="rev-checks bg-transparent py-0">
    <v-list-item v-for="check in checks" :key="check.key + (check.label_es ?? '')" class="px-0">
      <template #prepend>
        <v-icon :color="check.ok ? 'success' : 'error'" size="20" class="mr-2">
          {{ check.ok ? 'mdi-check-circle' : 'mdi-close-circle' }}
        </v-icon>
      </template>
      <v-list-item-title :class="check.ok ? 'text-medium-emphasis' : 'font-weight-medium'">
        {{ check.label_es || check.label }}
      </v-list-item-title>
      <v-list-item-subtitle v-if="!check.ok" class="text-error">
        {{ check.issue }}<span v-if="check.detail"> ({{ check.detail }})</span>
      </v-list-item-subtitle>
    </v-list-item>
  </v-list>
</template>

<script setup lang="ts">
// Result of each checklist point that applies to the reference (backend `checks[]`)
defineProps<{
  checks: { key: string; label: string; label_es?: string; ok: boolean; detail?: string | null; issue: string }[]
}>()
</script>
