<template>
  <v-textarea v-model="value" :label="label" :rows="rows || 5" :error-messages="errorMessage" @change="onchangeEmit" />
</template>

<script setup>
import { useField } from 'vee-validate'

const props = defineProps({
  name: String,
  type: String,
  label: String,
  rows: Number,
})

const emit = defineEmits(['onchange'])

const onchangeEmit = (e) => {
  emit('onchange', e)
}

// The `name` is returned in a function because we want to make sure it stays reactive
// If the name changes you want `useField` to be able to pick it up
const { value, errorMessage } = useField(() => props.name)
</script>
