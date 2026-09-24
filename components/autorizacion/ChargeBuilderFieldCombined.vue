<template>
  <div class="charge-builder">
    <!-- Charges accumulated so far -->
    <div v-if="modelValue.length > 0" class="cb-list mb-3">
      <div class="cb-list-label">Charges to request ({{ modelValue.length }})</div>
      <div v-for="(ch, idx) in modelValue" :key="idx" class="cb-charge-row">
        <v-chip size="x-small" color="primary" variant="tonal" class="flex-shrink-0">
          {{ ch.inv_type?.toUpperCase() }}
        </v-chip>

        <div class="cb-charge-detail">
          <div class="cb-charge-name">{{ ch.charge_name }}</div>
          <div class="cb-charge-meta">
            {{ ch[fdField.name] === 'F' ? `Fuera ${fdField.unit}` : `Dentro ${fdField.unit}` }}
            <template v-if="showChargeType"> · {{ ch.charge_type === 'C' ? 'Per container' : 'Per BL' }}</template>
            <template v-if="ch.has_sell"> · Sell {{ ch.sell_currency_name }} {{ ch.sell_amount }}<span v-if="ch.is_sell_con_iva"> +IVA</span></template>
            <template v-if="ch.has_buy"> · Buy {{ ch.buy_currency_name }} {{ ch.buy_amount }}<span v-if="ch.is_buy_con_iva"> +IVA</span></template>
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
        <div class="cb-form-label mb-2">Add charge</div>

        <v-row dense>
          <v-col cols="6">
            <v-select
              v-model="form.inv_type"
              :items="invTypeOptions"
              item-title="label"
              item-value="value"
              label="Invoice type *"
              density="compact"
              variant="outlined"
            />
          </v-col>
          <v-col cols="6">
            <v-select
              v-model="form[fdField.name]"
              :items="fdOptions"
              item-title="label"
              item-value="value"
              :label="`${fdField.label} *`"
              density="compact"
              variant="outlined"
            />
          </v-col>

          <v-col v-if="showChargeType" cols="6">
            <v-select
              v-model="form.charge_type"
              :items="chargeTypeOptions"
              item-title="label"
              item-value="value"
              label="Type *"
              density="compact"
              variant="outlined"
            />
          </v-col>

          <v-col :cols="showChargeType ? 6 : 12">
            <v-autocomplete
              v-model="form.charge_id"
              :items="filteredChargeOptions"
              item-title="label"
              item-value="value"
              label="Charge *"
              density="compact"
              variant="outlined"
              clearable
              :hint="chargeHint"
              :persistent-hint="!!chargeHint"
            />
          </v-col>

          <v-col cols="6">
            <v-checkbox v-model="form.has_sell" label="Has sell" density="compact" hide-details />
          </v-col>
          <v-col cols="6">
            <v-checkbox v-model="form.has_buy" label="Has buy" density="compact" hide-details />
          </v-col>

          <template v-if="form.has_sell">
            <v-col cols="4">
              <v-text-field v-model.number="form.sell_amount" label="Sell amount" type="number" density="compact" variant="outlined" />
            </v-col>
            <v-col cols="4">
              <v-select v-model="form.sell_currency_id" :items="currencyOptions" item-title="label" item-value="value" label="Sell currency" density="compact" variant="outlined" />
            </v-col>
            <v-col cols="4">
              <v-select v-model="form[sellTypeField]" :items="ppccOptions" item-title="label" item-value="value" label="Sell PP/CC" density="compact" variant="outlined" />
            </v-col>
            <v-col cols="12">
              <v-checkbox v-model="form.is_sell_con_iva" label="Sell + IVA" density="compact" hide-details />
            </v-col>
          </template>

          <template v-if="form.has_buy">
            <v-col v-if="showBuyOwner" cols="4">
              <v-select v-model="form.buy_owner" :items="buyOwnerOptions" item-title="label" item-value="value" label="Buy owner" density="compact" variant="outlined" />
            </v-col>
            <v-col :cols="showBuyOwner ? 4 : 6">
              <v-text-field v-model.number="form.buy_amount" label="Buy amount" type="number" density="compact" variant="outlined" />
            </v-col>
            <v-col :cols="showBuyOwner ? 4 : 6">
              <v-select v-model="form.buy_currency_id" :items="currencyOptions" item-title="label" item-value="value" label="Buy currency" density="compact" variant="outlined" />
            </v-col>
            <v-col cols="6">
              <v-select v-model="form[buyTypeField]" :items="ppccOptions" item-title="label" item-value="value" label="Buy PP/CC" density="compact" variant="outlined" />
            </v-col>
            <v-col cols="6">
              <v-checkbox v-model="form.is_buy_con_iva" label="Buy + IVA" density="compact" hide-details />
            </v-col>
          </template>
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
import { currencies as currenciesData } from '@/utils/data/systemData'
import type { IFormFieldOption } from '~/repository/modules/catalogs/authRequestTypes'

const props = defineProps<{
  /** Array of accumulated charge objects — v-model */
  modelValue: any[]
  /** Catalog of charges: {label, value, code?} — from fieldCatalogs[charges_catalog_key] */
  chargesCatalog: (IFormFieldOption & { code?: string })[]
  /** 'sea-export' (F/D BL, charge_type, buy_owner, sell_type/buy_type) or 'air' (F/D AWB, no charge_type/buy_owner, sell_ppcc/buy_ppcc) */
  variant: 'sea-export' | 'air'
}>()

const emit = defineEmits<{ 'update:modelValue': [v: any[]] }>()

const invTypeOptions = [
  { label: 'TM', value: 'tm' },
  { label: 'WM', value: 'wm' },
]

const fdField = computed(() =>
  props.variant === 'air'
    ? { name: 'fuera_dentro_awb', label: 'F/D AWB', unit: 'AWB' }
    : { name: 'fuera_dentro_bl', label: 'F/D BL', unit: 'BL' }
)

const fdOptions = computed(() => [
  { label: `Fuera de ${fdField.value.unit}`, value: 'F' },
  { label: `Dentro de ${fdField.value.unit}`, value: 'D' },
])

const showChargeType = computed(() => props.variant === 'sea-export')
const showBuyOwner = computed(() => props.variant === 'sea-export')
const sellTypeField = computed(() => (props.variant === 'air' ? 'sell_ppcc' : 'sell_type'))
const buyTypeField = computed(() => (props.variant === 'air' ? 'buy_ppcc' : 'buy_type'))

const chargeTypeOptions = [
  { label: 'Per container', value: 'C' },
  { label: 'Per BL', value: 'B' },
]

const buyOwnerOptions = [
  { label: 'Freight line', value: 'F' },
  { label: 'Supplier', value: 'S' },
]

const ppccOptions = [
  { label: 'Prepaid', value: 'P' },
  { label: 'Collect', value: 'C' },
]

const currencyOptions = computed(() => (currenciesData as any[]).map((c: any) => ({ label: c.name, value: c.id })))

const emptyForm = () => ({
  inv_type: 'tm' as string | null,
  fuera_dentro_bl: 'F' as string | null,
  fuera_dentro_awb: 'F' as string | null,
  charge_type: 'B' as string | null,
  charge_id: null as number | null,
  has_sell: false,
  sell_amount: null as number | null,
  sell_currency_id: null as number | null,
  sell_type: null as string | null,
  sell_ppcc: null as string | null,
  is_sell_con_iva: false,
  has_buy: false,
  buy_owner: null as string | null,
  buy_amount: null as number | null,
  buy_currency_id: null as number | null,
  buy_type: null as string | null,
  buy_ppcc: null as string | null,
  is_buy_con_iva: false,
})

const form = ref<Record<string, any>>(emptyForm())

const filteredChargeOptions = computed(() => {
  const all = props.chargesCatalog ?? []
  if (form.value.inv_type === 'tm') {
    return all.filter((c) => c.code && String(c.code).trim() !== '')
  }
  return all
})

const chargeHint = computed(() => {
  if (form.value.inv_type === 'tm') {
    return `TM: mostrando solo cargos con clave SAT (${filteredChargeOptions.value.length})`
  }
  return ''
})

watch(() => form.value.inv_type, () => {
  form.value.charge_id = null
})

const canAdd = computed(() => {
  const f = form.value
  if (!f.charge_id || !f[fdField.value.name]) return false
  if (!f.has_sell && !f.has_buy) return false
  if (f.has_sell && (!f.sell_amount || f.sell_amount <= 0 || !f.sell_currency_id)) return false
  if (f.has_buy && (!f.buy_amount || f.buy_amount <= 0 || !f.buy_currency_id)) return false
  return true
})

function addCharge() {
  const f = form.value
  const chargeItem = props.chargesCatalog.find((c) => c.value === f.charge_id)
  const sellCurrency = (currenciesData as any[]).find((c: any) => c.id === f.sell_currency_id)
  const buyCurrency = (currenciesData as any[]).find((c: any) => c.id === f.buy_currency_id)

  const entry: Record<string, any> = {
    inv_type: f.inv_type,
    charge_id: f.charge_id,
    charge_name: chargeItem?.label ?? '',
    [fdField.value.name]: f[fdField.value.name],
    has_sell: f.has_sell,
    has_buy: f.has_buy,
  }

  if (showChargeType.value) entry.charge_type = f.charge_type

  if (f.has_sell) {
    entry.sell_amount = f.sell_amount
    entry.sell_currency_id = f.sell_currency_id
    entry.sell_currency_name = sellCurrency?.name ?? ''
    entry[sellTypeField.value] = f[sellTypeField.value]
    entry.is_sell_con_iva = f.is_sell_con_iva
  }

  if (f.has_buy) {
    if (showBuyOwner.value) entry.buy_owner = f.buy_owner
    entry.buy_amount = f.buy_amount
    entry.buy_currency_id = f.buy_currency_id
    entry.buy_currency_name = buyCurrency?.name ?? ''
    entry[buyTypeField.value] = f[buyTypeField.value]
    entry.is_buy_con_iva = f.is_buy_con_iva
  }

  emit('update:modelValue', [...props.modelValue, entry])

  const prev = { inv_type: f.inv_type }
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
