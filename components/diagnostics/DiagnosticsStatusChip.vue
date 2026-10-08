<template>
  <v-chip :color="color" variant="tonal" size="small" label class="font-weight-bold text-uppercase">
    <v-icon start size="14">{{ icon }}</v-icon>
    {{ label ?? status }}
  </v-chip>
</template>

<script setup lang="ts">
const props = defineProps<{ status: string; label?: string }>()

const map: Record<string, { color: string; icon: string }> = {
  ok: { color: 'success', icon: 'mdi-check-circle' },
  warn: { color: 'warning', icon: 'mdi-alert' },
  fail: { color: 'error', icon: 'mdi-close-circle' },
  skip: { color: 'grey', icon: 'mdi-minus-circle-outline' },
}

const color = computed(() => map[props.status]?.color ?? 'grey')
const icon = computed(() => map[props.status]?.icon ?? 'mdi-help-circle-outline')
</script>
