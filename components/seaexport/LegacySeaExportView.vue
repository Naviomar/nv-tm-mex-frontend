<template>
  <div>
    <v-skeleton-loader v-if="loading" type="article, table" />
    <v-alert v-else-if="error" type="warning" variant="tonal" density="compact">{{ error }}</v-alert>

    <template v-else-if="reference">
      <v-alert v-if="reference.cancelled" type="error" variant="tonal" density="compact" class="mb-4" icon="mdi-cancel">
        This TM1 reference is cancelled<template v-if="reference.cancellation_note">: {{ reference.cancellation_note }}</template>
      </v-alert>
      <v-alert type="info" variant="tonal" density="compact" class="mb-4" icon="mdi-history">
        Read-only reference from the legacy system (TM1). It cannot be edited, invoiced or notified from here.
      </v-alert>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <v-card>
          <v-card-title><div class="font-bold">Sea Export information</div></v-card-title>
          <v-card-text>
            <div class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
              <div class="font-bold">Reference #</div>
              <div class="font-bold flex items-center gap-2">
                {{ info.reference }}
                <v-chip size="x-small" class="tm1-chip" variant="flat">TM1</v-chip>
                <v-btn icon="mdi-content-copy" size="x-small" variant="text" density="compact" title="Copy" @click="copyToClipboard(info.reference)" />
              </div>

              <template v-if="reference.origin?.chile_reference">
                <div>Origin system</div>
                <ReferenceOriginBands class="items-start" :chile-reference="reference.origin.chile_reference" />
              </template>

              <div>Booking Number #</div>
              <div>{{ info.booking }}</div>
              <div>Line</div>
              <div>{{ info.line }}</div>
              <div>Vessel / Voyage</div>
              <div>{{ info.vessel_voyage }}</div>
              <div>ETD</div>
              <div>{{ fmtDate(info.etd) }}</div>
              <div>ETA</div>
              <div>{{ fmtDate(info.eta) }}</div>
              <div>Document cut-off</div>
              <div>{{ fmtDate(info.document_cutoff) }}</div>

              <div class="col-span-2"><v-divider /></div>

              <div>Origin</div>
              <div>{{ info.origin }}</div>
              <div>POL</div>
              <div>{{ info.pol }}</div>
              <div>POD</div>
              <div>{{ info.pod }}</div>
              <div>Destination</div>
              <div>{{ info.destination }}</div>
              <div>Region</div>
              <div>{{ info.region }}</div>
              <template v-if="info.transit_days">
                <div>Transit days</div>
                <div>{{ info.transit_days }}</div>
              </template>
            </div>
          </v-card-text>
        </v-card>

        <v-card>
          <v-card-title><div class="font-bold">Customer info</div></v-card-title>
          <v-card-text>
            <div class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
              <div>Shipper</div>
              <div class="font-bold">{{ customer.shipper }}</div>
              <div>
                <v-icon size="small">mdi-account-tie-outline</v-icon>
                Executive
              </div>
              <div>{{ customer.executive || 'No executive' }}</div>
              <div>Credit expiration date</div>
              <div>{{ fmtDate(customer.credit_due_date) }}</div>
              <div>Created at</div>
              <div>{{ createdLabel }}</div>
              <div class="col-span-2"><v-divider /></div>
              <div>Consignee</div>
              <div>{{ customer.consignee }}</div>
              <div>Notify</div>
              <div>{{ customer.notify }}</div>
              <div>Freight forwarder</div>
              <div>{{ customer.freight_forwarder }}</div>
              <template v-if="customer.observation">
                <div>Observation</div>
                <div class="whitespace-normal break-words">{{ customer.observation }}</div>
              </template>
            </div>

            <div v-if="milestones.length" class="mt-4 flex flex-wrap gap-2">
              <v-chip v-for="m in milestones" :key="m.label" size="small" variant="tonal" color="success" prepend-icon="mdi-check-circle-outline">
                {{ m.label }}<template v-if="m.at"> · {{ fmtDate(m.at) }}</template><template v-if="m.by"> · {{ m.by }}</template>
              </v-chip>
            </div>
          </v-card-text>
        </v-card>

        <v-card>
          <v-card-title>
            <div class="flex items-center gap-2">
              <div class="font-bold">Master BLs</div>
              <v-chip size="x-small" variant="tonal">{{ reference.master_bls.length }}</v-chip>
            </div>
          </v-card-title>
          <v-card-text>
            <v-table density="compact" style="height: auto">
              <thead><tr><th class="text-left">Master BL #</th></tr></thead>
              <tbody>
                <tr v-for="(item, index) in reference.master_bls" :key="`mbl-${index}`">
                  <td class="whitespace-nowrap">
                    {{ item.name }}
                    <v-btn icon="mdi-content-copy" size="x-small" variant="text" density="compact" title="Copy" @click="copyToClipboard(item.name)" />
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-card-text>
        </v-card>

        <v-card>
          <v-card-title>
            <div class="flex items-center gap-2">
              <div class="font-bold">House BLs</div>
              <v-chip size="x-small" variant="tonal">{{ reference.house_bls.length }}</v-chip>
            </div>
          </v-card-title>
          <v-card-text>
            <v-table density="compact" style="height: auto">
              <thead><tr><th class="text-left">House BL #</th><th class="text-left">Letter</th></tr></thead>
              <tbody>
                <tr v-for="(item, index) in reference.house_bls" :key="`hbl-${index}`">
                  <td class="whitespace-nowrap">
                    {{ item.name }}
                    <v-btn icon="mdi-content-copy" size="x-small" variant="text" density="compact" title="Copy" @click="copyToClipboard(item.name)" />
                  </td>
                  <td>{{ item.letter }}</td>
                </tr>
              </tbody>
            </v-table>
          </v-card-text>
        </v-card>

        <v-card class="md:col-span-2">
          <v-card-title><div class="font-bold">Cargo</div></v-card-title>
          <v-card-text>
            <div class="grid grid-cols-[auto_1fr_auto_1fr] gap-x-4 gap-y-1 mb-3">
              <div>Condition</div>
              <div>{{ cargo.condition }}</div>
              <div>Packages</div>
              <div>{{ cargo.packages }}</div>
              <div>Commodity description</div>
              <div>{{ cargo.commodity }}</div>
              <div>Equipment</div>
              <div>{{ (cargo.equipment || []).join(', ') }}</div>
              <div>Weight (kg)</div>
              <div>{{ cargo.weight ? num(cargo.weight) : '' }}</div>
              <div>Volume (m<sup>3</sup>)</div>
              <div>{{ cargo.volume ? num(cargo.volume) : '' }}</div>
            </div>
            <v-alert v-if="!cargo.containers.length" type="info" density="compact">No containers found</v-alert>
            <v-table v-else density="compact" style="height: auto">
              <thead>
                <tr><th class="text-left">#</th><th class="text-left">Container #</th><th class="text-left">Type</th><th class="text-right">Kgs</th></tr>
              </thead>
              <tbody>
                <tr v-for="(c, index) in cargo.containers" :key="`container-${index}`">
                  <td>{{ index + 1 }}</td>
                  <td class="whitespace-nowrap">
                    {{ c.number }}
                    <v-btn icon="mdi-content-copy" size="x-small" variant="text" density="compact" title="Copy" @click="copyToClipboard(c.number)" />
                  </td>
                  <td>{{ c.type }}</td>
                  <td class="text-right">{{ c.weight ? num(c.weight) : '' }}</td>
                </tr>
              </tbody>
            </v-table>
          </v-card-text>
        </v-card>

        <div v-for="b in blocks" :key="b.key" :class="b.half ? 'col-span-1' : 'col-span-1 md:col-span-2'">
          <LegacyBlockCard service="sea-export" :id="id" :block-key="b.key" :title="b.title" :icon="b.icon" :layout="b.layout" :tint="b.tint" />
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
const cargo = computed(() => reference.value?.cargo ?? { containers: [] })

const fmtDate = (value?: string | null) => (value ? formatDateOnlyString(value) : '')
const num = (value: number) => value.toLocaleString('en-US')
const createdLabel = computed(() => [fmtDate(customer.value.created_at), customer.value.created_by].filter(Boolean).join(' · '))

// Steps of the export process that TM1 recorded, in process order
const milestones = computed(() => {
  const m = reference.value?.milestones ?? {}
  return [
    m.booking_confirmed ? { label: 'Booking confirmed' } : null,
    m.draft_bl ? { label: 'Draft BL', ...m.draft_bl } : null,
    m.first_prealert ? { label: 'First pre-alert', ...m.first_prealert } : null,
    m.final_prealert ? { label: 'Final pre-alert', ...m.final_prealert } : null,
    m.release ? { label: 'Release', ...m.release } : null,
    m.line_release ? { label: 'Line release', ...m.line_release } : null,
  ].filter(Boolean) as { label: string; at?: string; by?: string }[]
})

// Screen order of the lazily loaded cards (the backend serves them one by one)
const blocks = computed(() => [
  { key: 'charges', title: 'Charges', icon: 'mdi-currency-usd' },
  { key: 'credit_debit_notes', title: 'Credit / Debit note(s)', icon: 'mdi-file-document-edit-outline', layout: 'split' },
  { key: 'customer_payments', title: 'Customer payments', icon: 'mdi-cash-check', tint: 'blue' },
  { key: 'line_payments', title: 'Line invoices & payments', icon: 'mdi-ferry', tint: 'blue' },
  { key: 'supplier_invoices', title: 'Supplier invoices & payments', icon: 'mdi-truck-delivery-outline', tint: 'blue' },
  { key: 'refunds', title: 'Refunds', icon: 'mdi-cash-refund', tint: 'red' },
  ...(hasPermission(permissions.SeaExportProfit) ? [{ key: 'profit', title: 'Profit', icon: 'mdi-finance', tint: 'green' }] : []),
  { key: 'transshipments', title: 'Transshipments', icon: 'mdi-source-branch', half: true },
  { key: 'release_notes', title: 'Release notes', icon: 'mdi-note-text-outline', half: true },
  { key: 'notes', title: 'Notes', icon: 'mdi-note-multiple-outline' },
] as { key: string; title: string; icon: string; layout?: 'split'; tint?: 'blue' | 'red' | 'green'; half?: boolean }[])

onMounted(async () => {
  try {
    reference.value = await $api.legacy.getReference('sea-export', props.id)
  } catch (e: any) {
    const status = e?.response?.status
    error.value =
      status === 404
        ? 'Reference not found in TM1.'
        : status === 403
          ? 'You do not have access to this reference.'
          : 'TM1 information is not available right now.'
  } finally {
    loading.value = false
  }
})
</script>
