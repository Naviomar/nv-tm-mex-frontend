<template>
  <v-tooltip v-if="isDeleted" location="top">
    <template #activator="{ props }">
      <v-chip
        v-bind="props"
        :color="color"
        :variant="variant"
        :size="size"
        :prepend-icon="icon"
        class="deleted-record-chip"
      >
        <span v-if="!iconOnly">{{ label }}</span>
      </v-chip>
    </template>
    <div class="text-caption">
      <div><strong>Eliminado:</strong> {{ formattedDeletedAt }}</div>
      <div v-if="deletedByName">
        <strong>Por:</strong> {{ deletedByName }}
      </div>
    </div>
  </v-tooltip>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  isDeleted?: boolean
  deletedAt?: string | null
  deletedBy?: number | null
  deletedByName?: string | null
  color?: string
  variant?: 'flat' | 'text' | 'elevated' | 'tonal' | 'outlined' | 'plain'
  size?: 'x-small' | 'small' | 'default' | 'large' | 'x-large'
  label?: string
  icon?: string
  iconOnly?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isDeleted: false,
  deletedAt: null,
  deletedBy: null,
  deletedByName: null,
  color: 'error',
  variant: 'tonal',
  size: 'small',
  label: 'Eliminado',
  icon: 'mdi-delete-alert',
  iconOnly: false,
})

const formattedDeletedAt = computed(() => {
  if (!props.deletedAt) return 'Fecha desconocida'
  
  try {
    const date = new Date(props.deletedAt)
    return date.toLocaleString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return props.deletedAt
  }
})
</script>

<style scoped>
.deleted-record-chip {
  cursor: help;
}
</style>
