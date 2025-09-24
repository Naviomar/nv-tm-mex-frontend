<template>
  <div>
    <div class="grid grid-cols-2 gap-2">
      <div>
        <v-card density="compact" color="blue-grey-lighten-5" class="mb-4">
          <v-card-text>
            <div class="font-bold mb-4">Sea Import reference detail. Charges as TM</div>
            <div class="font-bold">Sell charges</div>
            <v-table density="compact">
              <thead>
                <th class="font-bold!">Concept</th>
                <th class="font-bold!">Amount</th>
                <th class="font-bold!">+ iva</th>
                <th class="font-bold!">Subtotal</th>
              </thead>
              <tbody>
                <tr v-for="(charge, idx) in refSellChargesTm" :key="`ref-sell-charge-${idx}`">
                  <td>
                    <v-icon :color="linkedChargeToInvoice(charge) === 'mdi-link' ? 'primary' : 'red'">{{
                      linkedChargeToInvoice(charge)
                    }}</v-icon>
                    {{ charge.charge?.name }}
                  </td>
                  <td class="text-right">
                    {{ formatToCurrency(charge.amount) }}
                  </td>
                  <td class="text-right">
                    {{ formatToCurrency(getTmConceptIva(charge)) }}
                  </td>
                  <td class="text-right">
                    {{ formatToCurrency(getTmConceptTotal(charge)) }}
                  </td>
                </tr>
              </tbody>
            </v-table>
            <div class="font-bold">Charges</div>
            <v-table density="compact">
              <thead>
                <th class="font-bold!">Concept</th>
                <th class="font-bold!">Amount</th>
                <th class="font-bold!">+ iva</th>
                <th class="font-bold!">Subtotal</th>
              </thead>
              <tbody>
                <tr v-for="(charge, idx) in refChargesTm" :key="`ref-charge-${idx}`">
                  <td>
                    <v-icon :color="linkedChargeToInvoice(charge) === 'mdi-link' ? 'primary' : 'red'">{{
                      linkedChargeToInvoice(charge)
                    }}</v-icon>
                    {{ charge.charge?.name }}
                  </td>
                  <td class="text-right">
                    {{ formatToCurrency(charge.amount) }}
                  </td>
                  <td class="text-right">
                    {{ formatToCurrency(getTmConceptIva(charge)) }}
                  </td>
                  <td class="text-right">
                    {{ formatToCurrency(getTmConceptTotal(charge)) }}
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="3" class="text-right font-bold">Total</td>
                  <td class="font-bold text-right">
                    {{ formatToCurrency(referenciaTotal) }}
                  </td>
                </tr>
              </tfoot>
            </v-table>
          </v-card-text>
        </v-card>
      </div>
      <div>
        <v-card color="blue-lighten-4" class="mb-4">
          <v-card-title><div class="font-bold">Invoice detail</div></v-card-title>
          <v-card-text>
            <v-btn color="primary" size="small" @click="toggleConceptForm">New concept</v-btn>
            <div v-if="showConceptForm" class="py-2">
              <SeaImportChargeTmForm :catalogs="catalogs" @add="addConcept" @cancel="toggleConceptForm" />
            </div>
            <v-table density="compact">
              <thead>
                <tr>
                  <th class="font-bold! w-5"></th>
                  <th class="font-bold! w-5">Linked Ref</th>
                  <th class="font-bold!">Concept</th>
                  <th class="font-bold!">Amount</th>
                  <th class="font-bold!">+ iva</th>
                  <th class="font-bold! text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(concept, idx) in invoiceTm.concepts" :key="`invoice-concept-${idx}`">
                  <td>
                    <v-icon
                      v-if="concept.id == null"
                      @click="removeConcept(concept.id)"
                      class="cursor-pointer"
                      color="error"
                      >mdi-delete</v-icon
                    >
                  </td>
                  <td>
                    <v-icon>{{ isLinkedWithRefIcon(concept) }}</v-icon>
                  </td>
                  <td>{{ concept.charge?.name }}</td>
                  <td>{{ formatToCurrency(parseFloat(concept.amount)) }}</td>
                  <td>{{ formatToCurrency(getTmConceptIva(concept)) }}</td>
                  <td class="text-right">
                    {{ formatToCurrency(getTmConceptTotal(concept)) }}
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="5" class="text-right font-bold">Total</td>
                  <td class="font-bold text-right">
                    {{ formatToCurrency(invoiceTmTotal) }}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </v-table>
          </v-card-text>
          <v-card-actions class="px-4">
            <v-btn color="blue" variant="flat" @click="createInvoiceTm">Create invoice</v-btn>
          </v-card-actions>
        </v-card>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()

const props = defineProps({
  referencia: {
    type: Object,
    required: true,
  },
})

const invoiceTm = ref<any>({
  concepts: [],
})
const catalogs = ref<any>({
  consigness: [],
  charges: [],
  currencies: [],
})

const refChargesTm = computed(() => {
  return props.referencia?.charges.filter((charge: any) => charge.inv_type === 'tm')
})

const refSellChargesTm = computed(() => {
  return props.referencia?.sell_rate_breakdown.filter((charge: any) => charge.inv_type === 'tm')
})

const getTmConceptIva = (concept: any) => {
  return concept.is_con_iva ? parseFloat(concept.amount) * 0.16 : 0
}

const getTmConceptTotal = (concept: any) => {
  return parseFloat(concept.amount) + getTmConceptIva(concept)
}

const referenciaTotal = computed(() => {
  const charges = refChargesTm.value.reduce((acc: number, charge: any) => {
    return acc + parseFloat(charge.amount) + (charge.is_con_iva ? parseFloat(charge.amount) * 0.16 : 0)
  }, 0)
  const sellCharges = refSellChargesTm.value.reduce((acc: number, charge: any) => {
    return acc + parseFloat(charge.amount) + (charge.is_con_iva ? parseFloat(charge.amount) * 0.16 : 0)
  }, 0)
  return charges + sellCharges
})

const linkedChargeToInvoice = (charge: any) => {
  if (charge.invoice_tm != null || charge.invoice_wm != null) {
    return 'mdi-link'
  }
  return 'mdi-link-off'
}

onMounted(() => {
  // add charges and sell charges to invoiceTm
  invoiceTm.value.concepts = refChargesTm.value.concat(refSellChargesTm.value)
})

const getCatalogs = async () => {
  try {
    loadingStore.loading = true
    const response = (await $api.tmInvoices.getCatalogs()) as any

    catalogs.value = response
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

await getCatalogs()

const showConceptForm = ref(false)

const toggleConceptForm = () => {
  console.log('add concept')
  showConceptForm.value = !showConceptForm.value
}

const addConcept = (concept: any) => {
  invoiceTm.value.concepts.push(concept)
  showConceptForm.value = false
}

const removeConcept = (id: string) => {
  invoiceTm.value.concepts = invoiceTm.value.concepts.filter((concept: any) => concept.id !== id)
}

const invoiceTmTotal = computed(() => {
  return invoiceTm.value?.concepts.reduce((acc: number, concept: any) => {
    return acc + parseFloat(concept.amount) + getTmConceptIva(concept)
  }, 0)
})

const isLinkedWithRefIcon = (concept: any) => {
  // if concept is linked with a reference, return a link icon
  const charges = refChargesTm.value.concat(refSellChargesTm.value)
  const chargeLinked = charges.find((charge: any) => charge.charge_id == concept.charge_id)
  return chargeLinked ? 'mdi-link' : 'mdi-link-off'
}

const createInvoiceTm = async () => {
  try {
    loadingStore.loading = true
    const response = (await $api.tmInvoices.createInvoiceTm({
      referencia_id: props.referencia.id,
      concepts: invoiceTm.value.concepts,
    })) as any

    snackbar.add({ type: 'success', text: 'Invoice created successfully' })
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}
</script>
