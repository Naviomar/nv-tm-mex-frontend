<template>
  <v-switch
    v-model="value"
    :label="label"
    :error-messages="errorMessage"
    color="green"
    :variant="variant"
    :density="density"
    :false-value="falseValue"
    :true-value="trueValue"
    @change="onchangeEmit"
  />
</template>

<script setup>
import { useField } from 'vee-validate'

const props = defineProps({
  name: String,
  label: String,
  variant: String,
  density: String,
  falseValue: {
    type: [String, Number, Boolean],
    default: 0,
  },
  trueValue: {
    type: [String, Number, Boolean],
    default: 1,
  },
})

const emit = defineEmits(['onchange'])

const onchangeEmit = (e) => {
  emit('onchange', e)
}

// The `name` is returned in a function because we want to make sure it stays reactive
// If the name changes you want `useField` to be able to pick it up
const { value, errorMessage } = useField(() => props.name)
</script>
