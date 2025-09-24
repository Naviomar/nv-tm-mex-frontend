<template>
  <v-autocomplete
    v-model="value"
    :items="items"
    :item-title="itemTitle"
    :item-value="itemValue"
    :multiple="multiple"
    :label="label"
    :variant="variant"
    :density="density"
    :error-messages="errorMessage"
    :readonly="readonly"
    :bg-color="bgColor"
    :chips="chips"
    :closable-chips="closableChips"
    @update:modelValue="onChangeData"
  >
    <template v-slot:item="{ item, props }">
      <v-list-item
        v-bind="props"
        :title="`${item.title} ${item.raw.deleted_at ? '(Eliminado)' : ''}`"
        :disabled="item.raw.deleted_at != null"
      >
        <template v-slot:prepend>
          <v-avatar v-if="item.raw.logo_url">
            <img :src="item.raw.logo_url" alt="Logo" />
          </v-avatar>
        </template>
      </v-list-item>
    </template>
  </v-autocomplete>
</template>

<script setup>
import { useField } from 'vee-validate'

const emit = defineEmits(['onChange'])

const props = defineProps({
  name: String,
  type: String,
  label: String,
  multiple: Boolean,
  items: Array,
  itemTitle: String,
  itemValue: String,
  variant: String || 'flat',
  density: String,
  bgColor: String,
  closableChips: Boolean,
  readonly: {
    type: Boolean,
    default: false,
  },
  chips: Boolean,
})

const onChangeData = (value) => {
  emit('onChange', value)
}

// The `name` is returned in a function because we want to make sure it stays reactive
// If the name changes you want `useField` to be able to pick it up
const { value, errorMessage } = useField(() => props.name)
</script>
