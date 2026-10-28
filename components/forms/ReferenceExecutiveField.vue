<template>
  <v-autocomplete
    v-model="value"
    :items="executives"
    item-title="name"
    item-value="id"
    :label="label"
    density="compact"
    :disabled="disabled"
    :error-messages="errorMessage"
    :hint="hint"
    :persistent-hint="!!hint"
    clearable
  />
</template>

<script setup lang="ts">
import type { PropType } from 'vue'

/**
 * Selector de ejecutivo para referencias sin cliente. Se enlaza al campo
 * executive_id del VeeForm; sin cliente es obligatorio (lo valida el schema).
 */
defineProps({
  executives: {
    type: Array as PropType<{ id: number; name: string }[]>,
    default: () => [],
  },
  label: {
    type: String,
    default: 'Executive *',
  },
  hint: {
    type: String,
    default: 'Required while the reference has no customer',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

const { value, errorMessage } = useField<string | number | null>('executive_id')
</script>
