<template>
  <v-text-field
    v-model="value"
    :type="type || 'text'"
    :label="label"
    :variant="variant"
    :density="density"
    :error-messages="errorMessage"
    :ref="refName"
    v-on="validationListeners"
    @blur="handleBlur"
    @change="handleChange"
  />
</template>

<script setup>
import { useField } from 'vee-validate'

const props = defineProps({
  name: String,
  type: String,
  label: String,
  variant: String || 'flat',
  density: String,
  refName: {
    type: [String, null],
    default: null,
  },
})

// const name = toRef(props, 'name');

// const emit = defineEmits(['onchange'])

// const onchangeEmit = (e) => {
//   emit('onchange', e)
// }

// The `name` is returned in a function because we want to make sure it stays reactive
// If the name changes you want `useField` to be able to pick it up
const { value, errorMessage, handleChange, handleBlur } = useField(() => props.name)

const validationListeners = computed(() => {
  if (!errorMessage.value) {
    return {
      blur: handleChange,
      change: handleChange,
      input: (e) => handleChange(e, false),
    }
  }
  return {
    blur: handleChange,
    change: handleChange,
    input: handleChange,
  }
})
</script>
