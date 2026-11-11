<template>
  <div>
    <v-skeleton-loader v-if="loading" type="article, table" />
    <v-alert v-else-if="error" type="warning" variant="tonal" density="compact">{{ error }}</v-alert>

    <template v-else-if="reference">
      <v-alert v-if="reference.cancelled" type="error" variant="tonal" density="compact" class="mb-4" icon="mdi-cancel">
        This TM1 reference is cancelled<template v-if="reference.cancellation_note">: {{ reference.cancellation_note }}</template>
      </v-alert>
      <v-alert v-if="reference.archived" type="info" variant="tonal" density="compact" class="mb-4" icon="mdi-archive-outline">
        The paper file of this reference was archived in TM1 (baja de expediente)<template v-if="reference.archived.at"> on {{ fmtDate(reference.archived.at) }}</template><template v-if="reference.archived.by"> by {{ reference.archived.by }}</template>. The reference itself is still valid.
      </v-alert>
      <v-alert type="info" variant="tonal" density="compact" class="mb-4" icon="mdi-history">
        Read-only reference from the legacy system (TM1). It cannot be edited, invoiced or notified from here.
      </v-alert>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <v-card>
          <v-card-title><div class="font-bold">Air Export information</div></v-card-title>
          <v-card-text>
            <div class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
              <div class="font-bold">Reference #</div>
              <div class="font-bold flex items-center gap-2">
                {{ info.reference }}
                <v-chip size="x-small" class="tm1-chip" variant="flat">TM1</v-chip>
                <v-btn icon="mdi-content-copy" size="x-small" variant="text" density="compact" title="Copy" @click="copyToClipboard(info.reference)" />
              </div>
              <div>Master AWB</div>
              <div>{{ reference.awbs.master }}</div>
              <div>House AWB</div>
              <div>{{ reference.awbs.house }}</div>
              <div>Airline</div>
              <div>{{ info.airline }}</div>
              <div>Flight</div>
              <div>{{ info.flight }}</div>
              <div>Departure</div>
              <div>{{ fmtDate(info.departure) }}</div>
              <div class="col-span-2"><v-divider /></div>
              <div>Origin</div>
              <div>{{ info.origin }}</div>
              <div>Destination</div>
              <div>{{ info.destination }}</div>
              <template v-if="info.customs_entry">
                <div>Customs entry</div>
                <div>{{ info.customs_entry }}</div>
              </template>
              <template v-if="info.customs_agent">
                <div>Customs agent</div>
                <div>{{ info.customs_agent }}</div>
              </template>
              <template v-if="info.locked_at">
                <div>Reference locked</div>
                <div>{{ info.locked_at === 'Yes' ? 'Yes' : fmtDate(info.locked_at) }}</div>
              </template>
            </div>
          </v-card-text>
        </v-card>

        <v-card>
          <v-card-title><div class="font-bold">Customer info</div></v-card-title>
          <v-card-text>
            <div class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
              <div>Customer</div>
              <div class="font-bold">{{ customer.customer }}</div>
              <template v-if="customer.credit_days">
                <div>Credit days</div>
                <div>{{ customer.credit_days }} days</div>
              </template>
              <div>Created at</div>
              <div>{{ createdLabel }}</div>
              <div class="col-span-2"><v-divider /></div>
              <div>Shipper</div>
              <div>{{ customer.shipper }}</div>
              <div>Consignee</div>
              <div>{{ customer.consignee }}</div>
              <div>Freight forwarder</div>
              <div>{{ customer.freight_forwarder }}</div>
              <template v-if="customer.observation">
                <div>Observation</div>
                <div class="whitespace-normal break-words">{{ customer.observation }}</div>
              </template>
            </div>
          </v-card-text>
        </v-card>

        <v-card class="md:col-span-2">
          <v-card-title><div class="font-bold">Cargo</div></v-card-title>
          <v-card-text>
            <div class="grid grid-cols-[auto_1fr_auto_1fr] gap-x-4 gap-y-1 mb-3">
              <div>Packages</div>
              <div>{{ cargo.packages }}</div>
              <div>Gross weight (kg)</div>
              <div>{{ cargo.gross_weight }}</div>
              <div>Commodity description</div>
              <div>{{ cargo.commodity }}</div>
              <div>Volume weight (kg)</div>
              <div>{{ cargo.volume_weight }}</div>
              <div>Dimensions</div>
              <div class="whitespace-normal break-words">{{ cargo.dimensions }}</div>
            </div>
            <v-alert v-if="!cargo.flights?.length" type="info" density="compact">No flights found</v-alert>
            <v-table v-else density="compact" style="height: auto">
              <thead>
                <tr><th class="text-left">#</th><th class="text-left">Flight</th><th class="text-left">From</th><th class="text-left">To</th><th class="text-left">Departure</th></tr>
              </thead>
              <tbody>
                <tr v-for="(f, index) in cargo.flights" :key="`flight-${index}`">
                  <td>{{ index + 1 }}</td>
                  <td>{{ f.flight }}</td>
                  <td>{{ f.from }}</td>
                  <td>{{ f.to }}</td>
                  <td class="whitespace-nowrap">{{ fmtDate(f.departure) }} {{ f.hour }}</td>
                </tr>
              </tbody>
            </v-table>
          </v-card-text>
        </v-card>

        <div v-for="b in blocks" :key="b.key" :class="b.half ? 'col-span-1' : 'col-span-1 md:col-span-2'">
          <LegacyBlockCard service="air-export" :id="id" :block-key="b.key" :title="b.title" :icon="b.icon" :layout="b.layout" :tint="b.tint" />
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { permissions } from '@/utils/data/system'

const props = defineProps<{ id: string | number }>()

const { $api } = useNuxtApp()
const { hasPermission } = useCheckUser()
const { copyToClipboard } = useCopyToClipboard()

const reference = ref<any>(null)
const loading = ref(true)
const error = ref('')
useHead({ title: computed(() => `#${reference.value?.reference ?? ''} (TM1) - View details`) })

const info = computed(() => reference.value?.info ?? {})
const customer = computed(() => reference.value?.customer ?? {})
const cargo = computed(() => reference.value?.cargo ?? { flights: [] })

const fmtDate = (value?: string | null) => (value ? formatDateOnlyString(value) : '')
const createdLabel = computed(() => [fmtDate(customer.value.created_at), customer.value.created_by].filter(Boolean).join(' · '))

// Screen order of the lazily loaded cards (the backend serves them one by one)
const blocks = computed(() => [
  { key: 'credit_debit_notes', title: 'Credit / Debit note(s)', icon: 'mdi-file-document-edit-outline', layout: 'split' },
  { key: 'invoices', title: 'Customer invoices', icon: 'mdi-receipt-text-outline', tint: 'blue' },
  { key: 'customer_payments', title: 'Customer payments', icon: 'mdi-cash-check', tint: 'blue' },
  { key: 'supplier_invoices', title: 'Supplier invoices & payments', icon: 'mdi-truck-delivery-outline', tint: 'blue' },
  { key: 'refunds', title: 'Refunds', icon: 'mdi-cash-refund', tint: 'red' },
  ...(hasPermission(permissions.AirProfitTotals) ? [{ key: 'profit', title: 'Profit', icon: 'mdi-finance', tint: 'green' }] : []),
  { key: 'notes', title: 'Notes', icon: 'mdi-note-multiple-outline' },
] as { key: string; title: string; icon: string; layout?: 'split'; tint?: 'blue' | 'red' | 'green'; half?: boolean }[])

onMounted(async () => {
  try {
    reference.value = await $api.legacy.getReference('air-export', props.id)
  } catch (e: any) {
    const status = e?.response?.status
    error.value =
      status === 404
        ? 'Reference not found in TM1.'
        : status === 403
          ? 'You do not have access to the references of this customer.'
          : 'TM1 information is not available right now.'
  } finally {
    loading.value = false
  }
})
</script>
