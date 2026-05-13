<template>
  <v-dialog v-model="show" max-width="900" persistent>
    <v-card v-if="resourceData">
      <v-card-title class="bg-blue-darken-1 text-white flex flex-row items-center">
        <div class="flex items-center">
          <v-icon class="mr-2">mdi-file-compare</v-icon>
          <span class="text-lg font-bold">Invoice Cancellation History</span>
        </div>
        <v-spacer />
        <v-btn icon variant="text" color="white" @click="close">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="pa-4">
        <!-- Invoice Details -->
        <div class="mb-4">
          <div class="text-base font-bold mb-2">Invoice Details</div>
          <div class="grid grid-cols-2 gap-2">
            <div class="bg-blue-lighten-5 p-2 rounded">
              <div class="text-caption text-grey-darken-1">Invoice Number</div>
              <div class="font-weight-medium">{{ resourceData.invoice.invoice_number }}</div>
            </div>
            <div class="bg-blue-lighten-5 p-2 rounded">
              <div class="text-caption text-grey-darken-1">Invoice ID</div>
              <div class="font-weight-medium">{{ resourceData.invoice.id }}</div>
            </div>
            <div class="bg-green-lighten-5 p-2 rounded">
              <div class="text-caption text-grey-darken-1">Total</div>
              <div class="font-weight-medium">{{ formatToCurrency(resourceData.invoice.total) }}</div>
            </div>
            <div class="bg-green-lighten-5 p-2 rounded">
              <div class="text-caption text-grey-darken-1">Subtotal</div>
              <div class="font-weight-medium">{{ formatToCurrency(resourceData.invoice.subtotal) }}</div>
            </div>
            <div class="bg-purple-lighten-5 p-2 rounded">
              <div class="text-caption text-grey-darken-1">Currency</div>
              <div class="font-weight-medium">{{ getCurrencyName(resourceData.invoice.currency_id) }}</div>
            </div>
            <div v-if="hasIva" class="bg-purple-lighten-5 p-2 rounded">
              <div class="text-caption text-grey-darken-1">Has IVA</div>
              <div class="font-weight-medium">{{ resourceData.invoice.iva > 0 ? 'Yes' : 'No' }}</div>
            </div>
            <div v-else class="bg-orange-lighten-5 p-2 rounded">
              <div class="text-caption text-grey-darken-1">Created At</div>
              <div class="font-weight-medium">{{ formatDateString(resourceData.invoice.created_at) }}</div>
            </div>
            <div v-if="hasIva" class="bg-orange-lighten-5 p-2 rounded">
              <div class="text-caption text-grey-darken-1">Created At</div>
              <div class="font-weight-medium">{{ formatDateString(resourceData.invoice.created_at) }}</div>
            </div>
          </div>
        </div>

        <v-divider class="my-4" />

        <!-- Invoice Service Details -->
        <div class="mb-4">
          <div class="text-base font-bold mb-2">Invoice Service</div>
          <div class="grid grid-cols-2 gap-2">
            <div class="bg-teal-lighten-5 p-2 rounded">
              <div class="text-caption text-grey-darken-1">Service ID</div>
              <div class="font-weight-medium">{{ resourceData.invoice_service.id }}</div>
            </div>
            <div class="bg-teal-lighten-5 p-2 rounded">
              <div class="text-caption text-grey-darken-1">Consignee ID</div>
              <div class="font-weight-medium">{{ resourceData.invoice_service.consignee_id }}</div>
            </div>
            <div class="bg-teal-lighten-5 p-2 rounded col-span-2">
              <div class="text-caption text-grey-darken-1">Consignee Name</div>
              <div class="font-weight-medium">{{ resourceData.invoice_service.consignee_name }}</div>
            </div>
            <div class="bg-teal-lighten-5 p-2 rounded col-span-2">
              <div class="text-caption text-grey-darken-1">Is Proforma</div>
              <div class="font-weight-medium">{{ resourceData.invoice_service.is_proforma ? 'Yes' : 'No' }}</div>
            </div>
          </div>
        </div>

        <v-divider class="my-4" />

        <!-- Before Cancellation -->
        <div class="mb-4">
          <div class="text-base font-bold mb-2 flex items-center gap-2">
            <v-chip size="small" color="red">Before Cancellation</v-chip>
            <span class="text-caption text-grey-darken-1">Original charges</span>
          </div>
          <v-table density="compact" class="border">
            <thead>
              <tr>
                <th class="text-left">Charge</th>
                <th class="text-right">Amount</th>
                <th v-if="hasIva" class="text-right">IVA</th>
                <th class="text-left">Currency</th>
                <th class="text-left">Type</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(charge, index) in resourceData.original_charges" :key="`orig-${index}`">
                <td>{{ charge.charge_name || '-' }}</td>
                <td class="text-right">{{ formatToCurrency(charge.amount) }}</td>
                <td v-if="hasIva" class="text-right">{{ formatToCurrency(charge.amount_iva) }}</td>
                <td>{{ getCurrencyName(charge.currency_id) }}</td>
                <td>{{ formatType(charge.tm_wm || invoiceType) }}</td>
              </tr>
              <tr v-if="resourceData.original_charges.length === 0">
                <td :colspan="hasIva ? 5 : 4" class="text-center text-grey">No charges</td>
              </tr>
            </tbody>
          </v-table>
        </div>

        <v-divider class="my-4" />

        <!-- After Cancellation -->
        <div class="mb-4">
          <div class="text-base font-bold mb-2 flex items-center gap-2">
            <v-chip size="small" color="green">After Cancellation</v-chip>
            <span class="text-caption text-grey-darken-1">New charges to apply</span>
          </div>
          <v-table density="compact" class="border">
            <thead>
              <tr>
                <th class="text-left">Charge</th>
                <th class="text-right">Amount</th>
                <th v-if="hasIva" class="text-right">IVA</th>
                <th class="text-left">Currency</th>
                <th class="text-left">Type</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(charge, index) in resourceData.new_charges" :key="`new-${index}`">
                <td>{{ getChargeName(charge) }}</td>
                <td class="text-right">{{ formatToCurrency(charge.amount) }}</td>
                <td v-if="hasIva" class="text-right">{{ formatToCurrency(charge.amount_iva) }}</td>
                <td>{{ getCurrencyName(charge.currency_id) }}</td>
                <td>{{ formatType(invoiceType) }}</td>
              </tr>
              <tr v-if="!resourceData.new_charges || resourceData.new_charges.length === 0">
                <td :colspan="hasIva ? 5 : 4" class="text-center text-grey">No charges</td>
              </tr>
            </tbody>
          </v-table>
        </div>

        <v-divider class="my-4" />

        <!-- Metadata -->
        <div class="mb-4">
          <div class="text-base font-bold mb-2">Cancellation Metadata</div>
          <div class="grid grid-cols-2 gap-2">
            <div class="bg-amber-lighten-5 p-2 rounded">
              <div class="text-caption text-grey-darken-1">Include Refacturacion</div>
              <div class="font-weight-medium">{{ resourceData.include_refacturacion ? 'Yes' : 'No' }}</div>
            </div>
            <div class="bg-amber-lighten-5 p-2 rounded">
              <div class="text-caption text-grey-darken-1">Cancelled At</div>
              <div class="font-weight-medium">{{ formatDateString(resourceData.cancelled_at) }}</div>
            </div>
            <div class="bg-amber-lighten-5 p-2 rounded">
              <div class="text-caption text-grey-darken-1">Cancelled By</div>
              <div class="font-weight-medium">{{ resourceData.cancelled_by_name }}</div>
            </div>
            <div class="bg-amber-lighten-5 p-2 rounded">
              <div class="text-caption text-grey-darken-1">Cancelled By ID</div>
              <div class="font-weight-medium">{{ resourceData.cancelled_by }}</div>
            </div>
          </div>
        </div>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn color="primary" variant="tonal" @click="close">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { currencies } from '@/utils/data/systemData'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  resourceData: {
    type: Object as any,
    default: null,
  },
  authResource: {
    type: String as any,
    default: null,
  },
})

const emit = defineEmits(['update:modelValue'])

const show = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const close = () => {
  show.value = false
}

const formatToCurrency = (value: number) => {
  if (value === null || value === undefined) return '-'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value)
}

const formatDateString = (dateString: string) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleString()
}

const getCurrencyName = (id: number) => {
  const currency = currencies.find((c: any) => c.id == id)
  return currency?.name || '-'
}

const formatType = (type: string) => {
  if (!type) return '-'
  const upperType = type.toString().toUpperCase()
  if (upperType === 'TM') return 'TM'
  if (upperType === 'WM') return 'WM'
  return type
}

const getChargeName = (charge: any) => {
  if (charge.charge_name) return charge.charge_name
  if (charge.inv_charge?.charge_name) return charge.inv_charge.charge_name
  if (charge.inv_charge?.charge?.name) return charge.inv_charge.charge.name
  if (charge.charge?.name) return charge.charge.name
  return '-'
}

const deriveTypeFromResource = (resource: string | null): string | null => {
  if (!resource) return null
  if (resource.includes('-wm')) return 'WM'
  if (resource.includes('-tm')) return 'TM'
  return null
}

const hasIva = computed(() => {
  // WM invoices don't have IVA, only TM invoices have IVA
  // Priority: invoice_type field > original_charges.tm_wm > authResource type
  if (props.resourceData?.invoice_type) {
    return props.resourceData.invoice_type.toUpperCase() === 'TM'
  }
  if (props.resourceData?.original_charges?.length > 0) {
    const firstCharge = props.resourceData.original_charges[0]
    const upperType = firstCharge.tm_wm?.toString().toUpperCase()
    if (upperType === 'TM' || upperType === 'WM') return upperType === 'TM'
  }
  const derived = deriveTypeFromResource(props.authResource)
  if (derived) return derived === 'TM'
  return true
})

const invoiceType = computed(() => {
  // Priority: invoice_type field > original_charges.tm_wm > authResource type
  if (props.resourceData?.invoice_type) {
    return props.resourceData.invoice_type.toUpperCase()
  }
  if (props.resourceData?.original_charges?.length > 0) {
    const firstCharge = props.resourceData.original_charges[0]
    const tmWm = firstCharge.tm_wm?.toString().toUpperCase()
    if (tmWm === 'TM' || tmWm === 'WM') return tmWm
  }
  return deriveTypeFromResource(props.authResource) ?? '-'
})
</script>
