<template>
  <div class="py-4">
    <div class="grid grid-cols-2 gap-4">
      <div>
        <v-autocomplete
          v-model="form.charge_id"
          :items="catalogs.charges"
          density="compact"
          item-title="name"
          item-value="id"
          label="Concept"
        />
      </div>
      <div>
        <v-text-field v-model="form.notes" density="compact" maxlength="150" label="Notes" />
      </div>
      <div>
        <v-text-field v-model="form.amount" type="number" density="compact" label="Amount" />
      </div>
      <div>
        <v-checkbox v-model="form.is_con_iva" density="compact" label="+ IVA" />
      </div>
      <div class="my-2 flex gap-2">
        <v-btn color="red" @click="emits('cancel')" class="mb-4">Cancel</v-btn>
        <v-btn color="green-darken-4" @click="upatePartyConcept" class="mb-4">Save changes</v-btn>
      </div>
    </div>
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

const valueRef = toRef(props, 'partyInvoice')
const chargeRef = toRef(props, 'charge')

const catalogs = ref<any>({
  charges: [],
})

const form = ref<any>({
  id: null,
  charge_id: null,
  notes: '',
  amount: 0,
  is_con_iva: false,
  currency_id: null,
})

const upatePartyConcept = async () => {
  try {
    loadingStore.loading = true
    await $api.freeFormatInvoices.updateProformaConcpet(props.partyInvoice.id, form.value)
    snackbar.add({ type: 'success', text: 'Party proforma updated' })
    emits('refresh')
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

onMounted(() => {
  getCatalogs()
  console.log('partyInvoice', valueRef.value)
  if (chargeRef.value) {
    form.value = {
      id: chargeRef.value.id,
      charge_id: chargeRef.value.charge_id,
      notes: chargeRef.value.notes,
      amount: chargeRef.value.amount,
      is_con_iva: chargeRef.value.amount_iva > 0,
      currency_id: chargeRef.value.currency_id,
    }
  }
})
</script>
