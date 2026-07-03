<template>
  <div v-if="fields && fields.length > 0" class="d-flex flex-column gap-3 mt-2">
    <template v-for="field in fields" :key="field.name">
      <div v-if="isVisible(field)">
        <!-- textarea -->
        <v-textarea
          v-if="field.type === 'textarea'"
          v-model="localValues[field.name]"
          :label="field.label"
          :required="isRequired(field)"
          :hint="field.hint"
          :persistent-hint="!!field.hint"
          rows="2"
          density="compact"
          variant="outlined"
          @update:model-value="emit('update:modelValue', { ...localValues })"
        />

        <!-- text / number -->
        <v-text-field
          v-else-if="field.type === 'text' || field.type === 'number'"
          v-model="localValues[field.name]"
          :label="field.label"
          :type="field.type"
          :required="isRequired(field)"
          :hint="field.hint"
          :persistent-hint="!!field.hint"
          :prepend-inner-icon="field.prepend_inner_icon"
          density="compact"
          variant="outlined"
          @update:model-value="emit('update:modelValue', { ...localValues })"
        />

        <!-- select (static options or catalog) -->
        <v-select
          v-else-if="field.type === 'select'"
          v-model="localValues[field.name]"
          :label="field.label"
          :items="resolvedOptions(field)"
          item-title="label"
          item-value="value"
          :required="isRequired(field)"
          :hint="field.hint"
          :persistent-hint="!!field.hint"
          density="compact"
          variant="outlined"
          @update:model-value="emit('update:modelValue', { ...localValues })"
        />

        <!-- autocomplete (catalog-backed) -->
        <v-autocomplete
          v-else-if="field.type === 'autocomplete'"
          v-model="localValues[field.name]"
          :label="field.label"
          :items="resolvedOptions(field)"
          item-title="label"
          item-value="value"
          :required="isRequired(field)"
          :hint="field.hint"
          :persistent-hint="!!field.hint"
          :prepend-inner-icon="field.prepend_inner_icon"
          density="compact"
          variant="outlined"
          clearable
          @update:model-value="emit('update:modelValue', { ...localValues })"
        />

        <!-- radio -->
        <div v-else-if="field.type === 'radio'">
          <div class="text-caption text-medium-emphasis mb-1">
            {{ field.label }}<span v-if="isRequired(field)" class="text-error"> *</span>
          </div>
          <v-radio-group
            v-model="localValues[field.name]"
            inline
            density="compact"
            hide-details
            @update:model-value="emit('update:modelValue', { ...localValues })"
          >
            <v-radio
              v-for="opt in resolvedOptions(field)"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </v-radio-group>
        </div>

        <!-- checkbox -->
        <v-checkbox
          v-else-if="field.type === 'checkbox'"
          v-model="localValues[field.name]"
          :label="field.label"
          density="compact"
          hide-details
          @update:model-value="emit('update:modelValue', { ...localValues })"
        />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { IFormField, IFormFieldOption } from '~/repository/modules/catalogs/authRequestTypes'

const props = defineProps<{
  fields: IFormField[]
  modelValue: Record<string, any>
  /** Dynamic catalog options keyed by field.catalog value */
  fieldCatalogs?: Record<string, IFormFieldOption[]>
}>()

const emit = defineEmits<{
  'update:modelValue': [value: Record<string, any>]
}>()

const localValues = ref<Record<string, any>>({ ...props.modelValue })

watch(
  () => props.modelValue,
  (val) => { localValues.value = { ...val } },
)

function resolvedOptions(field: IFormField): IFormFieldOption[] {
  if (field.catalog && props.fieldCatalogs?.[field.catalog]) {
    return props.fieldCatalogs[field.catalog]
  }
  return field.options ?? []
}

function isVisible(field: IFormField): boolean {
  if (!field.show_when) return true
  const { field: depField, equals } = field.show_when
  return localValues.value[depField] === equals
}

function isRequired(field: IFormField): boolean {
  if (field.required) return true
  if (field.required_when) {
    const { field: depField, equals } = field.required_when
    return localValues.value[depField] === equals
  }
  return false
}
</script>
