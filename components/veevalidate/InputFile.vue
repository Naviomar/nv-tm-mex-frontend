<template>
  <FileDropzone :multiple="multiple" @drop-files="onDropFiles">
    <v-file-input
      v-model="value"
      :label="label"
      :error-messages="errorMessage"
      :multiple="multiple"
      :variant="variant"
      :density="density"
      @change="onchangeEmit"
    />
  </FileDropzone>
</template>

<script setup>
import { useField } from 'vee-validate'

const props = defineProps({
  name: String,
  type: String,
  label: String,
  multiple: Boolean || false,
  variant: String || 'flat',
  density: String,
})

const emit = defineEmits(['onchange'])

const onchangeEmit = (e) => {
  emit('onchange', e)
}

// The `name` is returned in a function because we want to make sure it stays reactive
// If the name changes you want `useField` to be able to pick it up
const { value, errorMessage } = useField(() => props.name)

const onDropFiles = (files) => {
  value.value = files
  emit('onchange', { target: { files: props.multiple ? files : [files] } })
}
</script>
