<template>
  <div class="charge-builder">
    <!-- Charges accumulated so far -->
    <div v-if="modelValue.length > 0" class="cb-list mb-3">
      <div class="cb-list-label">Charges to request ({{ modelValue.length }})</div>
      <div v-for="(ch, idx) in modelValue" :key="idx" class="cb-charge-row">
        <v-chip size="x-small" color="primary" variant="tonal" class="flex-shrink-0">
          {{ ch.type === 'flete' ? 'Flete' : 'Local' }}
        </v-chip>

        <div class="cb-charge-detail">
          <div class="cb-charge-name">{{ ch.charge_name }}</div>
          <div class="cb-charge-meta">
            {{ ch.master_bl }} · {{ ch.currency_name }} {{ ch.amount }}
          </div>
        </div>

        <v-btn icon size="x-small" variant="text" color="error" @click="removeCharge(idx)">
          <v-icon size="14">mdi-delete-outline</v-icon>
        </v-btn>
      </div>
    </div>

    <!-- Add-charge form -->
    <v-card variant="tonal" color="surface-variant">
      <v-card-text class="pa-3 pb-2">
        <div class="cb-form-label mb-2">Add buy charge</div>

        <v-row dense>
          <v-col cols="6">
            <v-select
              v-model="form.type"
              :items="typeOptions"
              item-title="label"
              item-value="value"
              label="Flete / Local charge"
              density="compact"
              variant="outlined"
            />
          </v-col>
          <v-col cols="6">
            <v-autocomplete
              v-model="form.master_bl"
              :items="masterBlOptions"
              item-title="label"
              item-value="value"
              label="Master BL"
              density="compact"
              variant="outlined"
            />
          </v-col>

          <v-col cols="12">
            <v-autocomplete
              v-model="form.charge_id"
              :items="chargesCatalog"
              item-title="label"
              item-value="value"
              label="Buy charge *"
              density="compact"
              variant="outlined"
              clearable
            />
          </v-col>

          <v-col cols="7">
            <v-text-field v-model.number="form.amount" label="Amount *" type="number" density="compact" variant="outlined" prepend-inner-icon="mdi-currency-usd" />
          </v-col>
          <v-col cols="5">
            <v-select v-model="form.currency_id" :items="currencyOptions" item-title="label" item-value="value" label="Currency *" density="compact" variant="outlined" />
          </v-col>
        </v-row>

        <div class="d-flex justify-end mt-1">
          <v-btn size="small" variant="tonal" color="primary" prepend-icon="mdi-plus" :disabled="!canAdd" @click="addCharge">
            Add to list
          </v-btn>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import type { IFormFieldOption } from '~/repository/modules/catalogs/authRequestTypes'

const props = defineProps<{
  /** Array of accumulated charge objects — v-model */
  modelValue: any[]
  /** Catalog of buy charges: {label, value} — from fieldCatalogs.charges */
  chargesCatalog: IFormFieldOption[]
  /** Catalog of currencies: {label, value} — from fieldCatalogs.currencies */
  currencyOptions: IFormFieldOption[]
  /** Catalog of master BLs: {label, value} — from fieldCatalogs.master_bls */
  masterBlOptions: IFormFieldOption[]
}>()

const emit = defineEmits<{ 'update:modelValue': [v: any[]] }>()

const typeOptions = [
  { label: 'Flete', value: 'flete' },
  { label: 'Local charge', value: 'local' },
]

const emptyForm = () => ({
  type: 'flete' as string | null,
  master_bl: null as string | null,
  charge_id: null as number | null,
  amount: null as number | null,
  currency_id: null as number | null,
})

const form = ref(emptyForm())

const canAdd = computed(() => {
  const f = form.value
  return !!f.charge_id && !!f.amount && f.amount > 0 && !!f.currency_id
})

function addCharge() {
  const f = form.value
  const chargeItem = props.chargesCatalog.find((c) => c.value === f.charge_id)
  const currency = props.currencyOptions.find((c) => c.value === f.currency_id)

  const entry: Record<string, any> = {
    type: f.type,
    master_bl: f.master_bl,
    charge_id: f.charge_id,
    charge_name: chargeItem?.label ?? '',
    amount: f.amount,
    currency_id: f.currency_id,
    currency_name: currency?.label ?? '',
  }

  emit('update:modelValue', [...props.modelValue, entry])

  const prev = { type: f.type, master_bl: f.master_bl, currency_id: f.currency_id }
  Object.assign(form.value, emptyForm(), prev)
}

function removeCharge(idx: number) {
  const next = [...props.modelValue]
  next.splice(idx, 1)
  emit('update:modelValue', next)
}
</script>

<style scoped>
.charge-builder {
  margin-top: 4px;
}

.cb-list-label {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: rgba(var(--v-theme-on-surface), 0.38);
  margin-bottom: 6px;
}

.cb-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.cb-charge-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border-radius: 6px;
  border-left: 3px solid rgb(var(--v-theme-info));
  background: rgba(var(--v-theme-on-surface), 0.04);
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.cb-charge-detail {
  flex: 1;
  min-width: 0;
}

.cb-charge-name {
  font-size: 12px;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: rgba(var(--v-theme-on-surface), 0.87);
}

.cb-charge-meta {
  font-size: 10px;
  color: rgba(var(--v-theme-on-surface), 0.5);
}

.cb-form-label {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: rgba(var(--v-theme-on-surface), 0.38);
}
</style>
