<template>
  <div :class="['rounded', { 'credit-days-missing col-span-3': missing }]" :data-credit-days-missing="missing || undefined">
    <InputText
      name="credit_days"
      type="number"
      density="compact"
      variant="solo-filled"
      label="Credit days *"
      :error="missing"
    />
    <div v-if="missing" class="credit-days-missing__msg" role="alert">
      <v-icon size="small" color="error" class="mr-1">mdi-alert-circle</v-icon>
      <span>
        Credit days must be updated: this customer has <strong>{{ customerDays }} days</strong> of credit but the
        reference has none registered.
      </span>
      <v-btn size="x-small" variant="tonal" color="error" class="ml-2" @click="apply">
        Use {{ customerDays }} days
      </v-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useField } from 'vee-validate'

/**
 * Credit days input of the reference edit forms. When the customer has credit but the
 * reference has none registered, it is highlighted in red with a message so the operator
 * doesn't miss it. It disappears as soon as a value is typed (or applied) and the
 * reference is saved with it.
 */
const props = defineProps<{
  /** Credit days defined in the customer catalog (import or export, depending on the module). */
  customerDays?: number | string | null
  /** Hide the alert while the reference has no saved customer (pending customer). */
  disabled?: boolean
}>()

// Same field the InputText binds to: shares the form's state.
const { value, setValue } = useField<number | string | null>('credit_days')

const customerDaysNumber = computed(() => Number(props.customerDays) || 0)
const missing = computed(() => !props.disabled && customerDaysNumber.value > 0 && !(Number(value.value) > 0))

const apply = () => setValue(customerDaysNumber.value)
</script>

<style scoped>
.credit-days-missing {
  border: 2px solid rgb(var(--v-theme-error));
  background: rgba(var(--v-theme-error), 0.08);
  padding: 6px 8px 4px;
}
.credit-days-missing__msg {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  font-size: 0.8125rem;
  line-height: 1.2;
  color: rgb(var(--v-theme-error));
  padding-bottom: 4px;
}
</style>
