<template>
  <div class="">
    <v-btn color="orange" size="small" @click="showDialog">Add Credit Note</v-btn>
    <v-dialog v-model="dialog" max-width="800">
      <v-card>
        <v-card-title> Add credit note to {{ partyInvoice.invoice?.invoice_number }} </v-card-title>
        <v-card-text>
          <div
            v-for="(concept, index) in form.charges"
            class="grid grid-cols-[1fr_1fr_auto] gap-4"
            :key="`ff-concept-${index}`"
          >
            <div>
              <div class="flex items-center gap-2">
                <v-autocomplete
                  v-model="concept.charge_id"
                  :items="partyInvoiceCharges"
                  density="compact"
                  item-title="name"
                  item-value="id"
                  label="Concept"
                  readonly
                />
              </div>
            </div>
            <div>
              <v-text-field v-model="concept.amount" type="number" density="compact" label="Amount" hide-details />
              <div class="text-sm">Max available: {{ formatToCurrency(concept.max_amount) }}</div>
            </div>
            <div>
              <v-checkbox v-model="concept.is_con_iva" density="compact" label="+ IVA" />
            </div>
          </div>

          <v-alert density="compact" type="warning" variant="outlined" class="mb-2">
            <strong>Important:</strong> Amount can not be greater than {{ formatToCurrency(maxPartyInvoiceAmount) }}
          </v-alert>

          <div class="flex justify-end gap-2">
            <v-btn color="red" @click="closeDialog" class="mb-4">Cancel</v-btn>
            <v-btn color="green-darken-4" @click="createFreeFormatCreditNote" class="mb-4"
              >Add Credit Note to invoice</v-btn
            >
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>
<script setup lang="ts">
const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()

const props = defineProps({
  partyInvoice: {
    type: Object,
    required: true,
  },
  charge: {
    type: Object,
    required: false,
    default: null,
  },
})

const emits = defineEmits(['cancel', 'refresh'])

const dialog = ref(false)

const catalogs = ref<any>({
  charges: [],
})

const form = ref<any>({
  charges: [],
})

const showDialog = () => {
  dialog.value = true
}

const closeDialog = () => {
  dialog.value = false
}

const addConcept = () => {
  form.value.charges.push({
    charge_id: null,
    amount: 0,
    is_con_iva: false,
  })
}

const partyInvoiceCharges = computed(() => {
  return catalogs.value.charges.filter((charge: any) => {
    return props.partyInvoice.invoice?.charges?.some((c: any) => c.charge_id === charge.id)
  })
})

const maxPartyInvoiceAmount = computed(() => {
  return props.partyInvoice.invoice?.charges.reduce((acc: number, charge: any) => {
    return acc + (parseFloat(charge.amount) + parseFloat(charge.amount_iva))
  }, 0)
})

const removeConcept = (index: number) => {
  form.value.charges.splice(index, 1)
}

const createFreeFormatCreditNote = async () => {
  try {
    if (!form.value.charges.length) {
      snackbar.add({ type: 'error', text: 'You must add at least one concept' })
      return
    }
    // if negative amount show error
    if (form.value.charges.some((charge: any) => charge.amount < 0)) {
      snackbar.add({ type: 'error', text: 'Amount can not be negative' })
      return
    }

    // if amount is greater than partyInvoice.invoice?.charges?.pending_balance show error
    if (form.value.charges.some((charge: any) => charge.amount >= charge.max_amount)) {
      snackbar.add({ type: 'error', text: 'Amount can not be greater than max available' })
      return
    }

    // remove charges with amount 0
    const body = {
      charges: form.value.charges.filter((charge: any) => charge.amount > 0),
    }

    loadingStore.loading = true
    await $api.freeFormatInvoices.createCreditNote(props.partyInvoice.id, body)
    snackbar.add({ type: 'success', text: 'Party proforma updated' })
    emits('refresh')

    closeDialog()
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const getCatalogs = async () => {
  try {
    loadingStore.start()
    const response = (await $api.freeFormatInvoices.getCatalogs()) as any

    catalogs.value = response
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

watch(
  () => props.partyInvoice,
  () => {
    // set charges in form from partyInvoice.invoice?.charges
    form.value.charges = props.partyInvoice.invoice?.charges.map((charge: any) => {
      return {
        invoice_charge_id: charge.id,
        charge_id: charge.charge_id,
        amount: 0,
        max_amount: charge.pending_balance,
        is_con_iva: false,
      }
    })
  },
  { immediate: true }
)

onMounted(() => {
  getCatalogs()
})
</script>
