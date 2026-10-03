<template>
  <div class="rounded-lg tm-panel mb-4 overflow-hidden">
    <!-- Title bar -->
    <div class="flex flex-wrap items-center gap-3 px-4 py-3 tm-muted">
      <v-icon color="primary">mdi-invoice-text-outline</v-icon>
      <div class="flex-1 min-w-0">
        <div class="flex flex-wrap items-center gap-2">
          <span class="text-lg font-bold">{{ supplierCfdi.serie_folio || `CFDI #${supplierCfdi.id}` }}</span>
          <span class="text-xs text-medium-emphasis">ID #{{ supplierCfdi.id }}</span>
          <v-chip size="x-small" :color="typeColor" variant="flat">{{ supplierCfdi.tipo_comprobante_name }}</v-chip>
          <v-chip size="x-small" :color="status.color" variant="tonal" :prepend-icon="status.icon">
            {{ status.label }}
          </v-chip>
          <v-chip v-if="supplierCfdi.is_manual" color="purple" size="x-small" variant="tonal">Manual CFDI</v-chip>
          <v-chip v-if="supplierCfdi.is_free_format" color="deep-purple" size="x-small" variant="tonal" prepend-icon="mdi-tag-outline">
            Formato libre
          </v-chip>
          <v-chip v-if="supplierCfdi.deleted_at" color="error" size="x-small" variant="flat">Cancelled</v-chip>
        </div>
        <div class="text-sm">
          <span class="font-medium">{{ supplierCfdi.supplier?.name || 'Pending supplier' }}</span>
          <span class="text-medium-emphasis"> · RFC {{ supplierCfdi.rfc_emisor }}</span>
        </div>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <SatValidationStatus v-if="supplierCfdi.uuid" :supplierCfdi="supplierCfdi" @validated="(r: any) => emit('sat-validated', r)" />
        <ButtonDownloadS3Object2 :s3Path="supplierCfdi.xml_attachment" label="XML" />
        <ButtonDownloadS3Object2 :s3Path="supplierCfdi.pdf_attachment" label="Zip" />
      </div>
    </div>

    <!-- KPI tiles -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-3 p-4">
      <div class="kpi">
        <div class="kpi__label">Total CFDI</div>
        <div class="kpi__value">{{ formatToCurrency(supplierCfdi.amount_cfdi) }} <small>{{ currencyName }}</small></div>
        <div v-if="!isUsd && supplierCfdi.amount_cfdi" class="kpi__hint">
          ≈ {{ formatToCurrency(toUsd(supplierCfdi.amount_cfdi, supplierCfdi.currency_id)) }} USD
        </div>
      </div>
      <div class="kpi">
        <div class="kpi__label">Broken down</div>
        <div class="kpi__value">{{ formatToCurrency(brokenDown) }} <small>{{ currencyName }}</small></div>
        <v-progress-linear :model-value="progress" color="success" height="6" rounded class="mt-2" />
      </div>
      <div class="kpi" :class="availableBalance > 0.01 ? 'kpi--warning' : 'kpi--success'">
        <div class="kpi__label">Available to break down</div>
        <div class="kpi__value">{{ formatToCurrency(availableBalance) }} <small>{{ currencyName }}</small></div>
        <div v-if="supplierCfdi.should_apply_cap_limit" class="flex items-center gap-1 mt-1">
          <v-chip color="primary" size="x-small">Cap limit by supplier type</v-chip>
          <v-btn v-if="canResyncCapLimit" icon="mdi-sync" size="x-small" variant="text" color="purple" @click="emit('resync-cap-limit')" />
        </div>
      </div>
      <div class="kpi">
        <div class="kpi__label">Exchange rate (CFDI date)</div>
        <div class="kpi__value text-base!">{{ isUsd ? 'USD invoice' : rateLabel(supplierCfdi.currency_id) }}</div>
        <div class="kpi__hint">
          {{ rateDate ? formatDateOnlyString(rateDate) : '-' }}
        </div>
      </div>
    </div>

    <!-- Details -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-2 px-4 pb-4 text-sm">
      <div>
        <div class="detail__label">CFDI date</div>
        <div>{{ formatDateOnlyString(supplierCfdi.invoice_date) || '-' }}</div>
      </div>
      <div>
        <div class="detail__label">Received at</div>
        <div>{{ formatDateString(supplierCfdi.created_at) }}</div>
      </div>
      <div>
        <div class="detail__label">Currency</div>
        <div>{{ supplierCfdi.currency?.name || currencyName }}</div>
      </div>
      <div>
        <div class="detail__label">UUID</div>
        <div class="font-mono text-xs break-all">{{ supplierCfdi.uuid || '-' }}</div>
      </div>
    </div>

    <div v-if="$slots.default" class="px-4 pb-4">
      <slot />
    </div>
  </div>
</template>
<script setup lang="ts">
const props = defineProps({
  supplierCfdi: { type: Object, required: true },
  availableBalance: { type: Number, default: 0 },
  canResyncCapLimit: { type: Boolean, default: false },
})

const emit = defineEmits(['sat-validated', 'resync-cap-limit'])

const { toUsd, rateLabel, rateDate } = useCfdiUsdRates(() => props.supplierCfdi.usd_rates)

const isUsd = computed(() => Number(props.supplierCfdi.currency_id) === 2)
const currencyName = computed(() => getCurrencyName(props.supplierCfdi.currency_id) || '')

const brokenDown = computed(() => {
  const cfdi = props.supplierCfdi
  const sum = (items: any[] | undefined, field: string) =>
    (items || []).reduce((acc: number, item: any) => acc + (parseFloat(item[field]) || 0), 0)
  if (cfdi.is_free_format) return sum(cfdi.cfdi_charges, 'amount')
  return sum(cfdi.invoices, 'amount_total') + sum(cfdi.line_containers, 'amount')
})

const progress = computed(() => {
  const total = parseFloat(props.supplierCfdi.amount_cfdi) || 0
  return total > 0 ? Math.min(100, (brokenDown.value / total) * 100) : 0
})

const typeColor = computed(() => (props.supplierCfdi.tipo_comprobante === 'E' ? 'red' : 'green'))

const status = computed(() => {
  const cfdi = props.supplierCfdi
  if (cfdi.deleted_at) return { label: 'Cancelled', color: 'error', icon: 'mdi-cancel' }
  if (cfdi.sat_status === 'Cancelado') return { label: 'Cancelled in SAT', color: 'error', icon: 'mdi-alert-circle' }
  if (cfdi.requested_payment) return { label: 'Payment requested', color: 'success', icon: 'mdi-cash-check' }
  if (cfdi.is_free_format || props.availableBalance <= 0.01)
    return { label: 'Ready to request payment', color: 'info', icon: 'mdi-check-circle-outline' }
  return { label: 'Pending breakdown', color: 'warning', icon: 'mdi-progress-clock' }
})
</script>
<style scoped>
.kpi {
  border-radius: 10px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.1);
  padding: 10px 14px;
  background: rgba(var(--v-theme-on-surface), 0.02);
}
.kpi--warning {
  border-color: rgba(var(--v-theme-warning), 0.6);
  background: rgba(var(--v-theme-warning), 0.08);
}
.kpi--success {
  border-color: rgba(var(--v-theme-success), 0.6);
  background: rgba(var(--v-theme-success), 0.08);
}
.kpi__label,
.detail__label {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: rgba(var(--v-theme-on-surface), 0.6);
}
.kpi__value {
  font-size: 1.15rem;
  font-weight: 700;
  line-height: 1.3;
}
.kpi__value small {
  font-size: 0.7rem;
  font-weight: 500;
}
.kpi__hint {
  font-size: 0.72rem;
  color: rgba(var(--v-theme-on-surface), 0.6);
}
</style>
