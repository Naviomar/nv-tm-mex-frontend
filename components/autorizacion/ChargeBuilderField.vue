<template>
  <div class="charge-builder">
    <!-- Charges accumulated so far -->
    <div v-if="modelValue.length > 0" class="cb-list mb-3">
      <div class="cb-list-label">
        Charges to request ({{ modelValue.length }})
      </div>
      <div
        v-for="(ch, idx) in modelValue"
        :key="idx"
        class="cb-charge-row"
        :class="ch.tipo_operacion === 'compra' ? 'cb-charge-row--compra' : 'cb-charge-row--venta'"
      >
        <v-chip
          size="x-small"
          :color="ch.tipo_operacion === 'compra' ? 'blue' : 'deep-purple'"
          variant="tonal"
          class="flex-shrink-0"
        >
          {{ ch.tipo_operacion === 'compra' ? 'Compra' : 'Venta' }}
        </v-chip>

        <div class="cb-charge-detail">
          <div class="cb-charge-name">{{ ch.charge_name }}</div>
          <div class="cb-charge-meta">
            <template v-if="ch.tipo_operacion === 'compra'">
              {{ ch.tm_wm }} · {{ ch.fuera_dentro_bl === 'F' ? 'Fuera BL' : 'Dentro BL' }}
            </template>
            <template v-else>
              {{ ch.inv_type?.toUpperCase() }} · {{ ch.charge_type }}
              <span v-if="ch.has_desglose"> · Desglose</span>
            </template>
            · {{ ch.currency_name }} {{ ch.amount }}
            <span v-if="ch.is_con_iva"> + IVA</span>
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

        <!-- Tipo operación toggle -->
        <div class="text-caption text-medium-emphasis mb-1">
          Operation type <span class="text-error">*</span>
        </div>
        <v-btn-toggle
          v-model="form.tipo_operacion"
          mandatory
          density="compact"
          variant="outlined"
          divided
          color="primary"
          class="mb-3"
        >
          <v-btn value="compra" size="small">
            <v-icon start size="14">mdi-package-down</v-icon>Compra (local)
          </v-btn>
          <v-btn value="venta" size="small">
            <v-icon start size="14">mdi-package-up</v-icon>Venta (reference)
          </v-btn>
        </v-btn-toggle>

        <v-row dense>
          <!-- COMPRA fields -->
          <template v-if="form.tipo_operacion === 'compra'">
            <v-col cols="6">
              <v-select
                v-model="form.tm_wm"
                :items="tmWmOptions"
                item-title="label"
                item-value="value"
                label="TM / WM *"
                density="compact"
                variant="outlined"
              />
            </v-col>
            <v-col cols="6">
              <v-select
                v-model="form.fuera_dentro_bl"
                :items="fueraDentroOptions"
                item-title="label"
                item-value="value"
                label="Fuera / Dentro BL *"
                density="compact"
                variant="outlined"
              />
            </v-col>
          </template>

          <!-- VENTA fields -->
          <template v-else>
            <v-col cols="6">
              <v-select
                v-model="form.inv_type"
                :items="invTypeOptions"
                item-title="label"
                item-value="value"
                label="TM / WM *"
                density="compact"
                variant="outlined"
              />
            </v-col>
            <v-col cols="6">
              <v-select
                v-model="form.charge_type"
                :items="chargeTypeOptions"
                item-title="label"
                item-value="value"
                label="Charge type *"
                density="compact"
                variant="outlined"
              />
            </v-col>
          </template>

          <!-- Charge autocomplete -->
          <v-col cols="12">
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

          <!-- Amount + currency -->
          <v-col cols="7">
            <v-text-field
              v-model.number="form.amount"
              label="Amount *"
              type="number"
              density="compact"
              variant="outlined"
              prepend-inner-icon="mdi-currency-usd"
            />
          </v-col>
          <v-col cols="5">
            <v-select
              v-model="form.currency_id"
              :items="currencyOptions"
              item-title="label"
              item-value="value"
              label="Currency *"
              density="compact"
              variant="outlined"
            />
          </v-col>

          <!-- Flags -->
          <v-col cols="6">
            <v-checkbox v-model="form.is_con_iva" label="+ IVA" density="compact" hide-details />
          </v-col>
          <v-col v-if="form.tipo_operacion === 'venta'" cols="6">
            <v-checkbox v-model="form.has_desglose" label="Breakdown (desglose)" density="compact" hide-details />
          </v-col>
        </v-row>

        <div class="d-flex justify-end mt-1">
          <v-btn
            size="small"
            variant="tonal"
            color="primary"
            prepend-icon="mdi-plus"
            :disabled="!canAdd"
            @click="addCharge"
          >
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
}>()

const emit = defineEmits<{ 'update:modelValue': [v: any[]] }>()

// ── Static options ─────────────────────────────────────────────────────────

const tmWmOptions = [
  { label: 'TM', value: 'TM' },
  { label: 'WM', value: 'WM' },
]

const fueraDentroOptions = [
  { label: 'Fuera BL', value: 'F' },
  { label: 'Dentro BL', value: 'D' },
]

const invTypeOptions = [
  { label: 'TM', value: 'tm' },
  { label: 'WM', value: 'wm' },
]

const chargeTypeOptions = [
  { label: 'Fuera BL', value: 'Fuera BL' },
  { label: 'Dentro BL', value: 'Dentro BL' },
]

const currencyOptions = computed(() =>
  (currenciesData as any[]).map((c: any) => ({ label: c.name, value: c.id }))
)

// ── Form state ─────────────────────────────────────────────────────────────

const emptyForm = () => ({
  tipo_operacion: 'compra' as 'compra' | 'venta',
  tm_wm: 'TM',
  fuera_dentro_bl: 'F',
  inv_type: 'tm',
  charge_type: 'Fuera BL',
  charge_id: null as number | null,
  amount: null as number | null,
  currency_id: null as number | null,
  is_con_iva: false,
  has_desglose: false,
})

const form = ref(emptyForm())

// ── Charge catalog filtering ───────────────────────────────────────────────

const filteredChargeOptions = computed(() => {
  const all = props.chargesCatalog ?? []
  // TM compra: only charges that have a SAT key (code field)
  if (form.value.tipo_operacion === 'compra' && form.value.tm_wm === 'TM') {
    return all.filter((c) => c.code && String(c.code).trim() !== '')
  }
  return all
})

const chargeHint = computed(() => {
  if (form.value.tipo_operacion === 'compra' && form.value.tm_wm === 'TM') {
    return `TM compra: mostrando solo cargos con clave SAT (${filteredChargeOptions.value.length})`
  }
  return ''
})

// Reset charge_id when filter changes so a stale value isn't kept
watch(() => [form.value.tipo_operacion, form.value.tm_wm], () => {
  form.value.charge_id = null
})

// ── Add / remove ──────────────────────────────────────────────────────────

const canAdd = computed(() => {
  const f = form.value
  if (!f.charge_id || !f.amount || f.amount <= 0 || !f.currency_id) return false
  if (f.tipo_operacion === 'compra' && (!f.tm_wm || !f.fuera_dentro_bl)) return false
  if (f.tipo_operacion === 'venta' && (!f.inv_type || !f.charge_type)) return false
  return true
})

function addCharge() {
  const f = form.value
  const chargeItem = props.chargesCatalog.find((c) => c.value === f.charge_id)
  const currency = (currenciesData as any[]).find((c: any) => c.id === f.currency_id)

  const entry: Record<string, any> = {
    tipo_operacion: f.tipo_operacion,
    charge_id: f.charge_id,
    charge_name: chargeItem?.label ?? '',
    amount: f.amount,
    currency_id: f.currency_id,
    currency_name: currency?.name ?? '',
    is_con_iva: f.is_con_iva,
  }

  if (f.tipo_operacion === 'compra') {
    entry.tm_wm = f.tm_wm
    entry.fuera_dentro_bl = f.fuera_dentro_bl
  } else {
    entry.inv_type = f.inv_type
    entry.charge_type = f.charge_type
    entry.has_desglose = f.has_desglose
  }

  emit('update:modelValue', [...props.modelValue, entry])

  // Keep tipo_operacion + currency for continuity
  const prev = { tipo_operacion: f.tipo_operacion, currency_id: f.currency_id, tm_wm: f.tm_wm, fuera_dentro_bl: f.fuera_dentro_bl, inv_type: f.inv_type, charge_type: f.charge_type }
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
  border-left: 3px solid transparent;
  background: rgba(var(--v-theme-on-surface), 0.04);
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.cb-charge-row--compra {
  border-left-color: rgb(var(--v-theme-info));
}

.cb-charge-row--venta {
  border-left-color: rgb(var(--v-theme-secondary));
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
