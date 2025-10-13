<template>
  <div>
    <div>
      <v-autocomplete
        v-model="form.invoice_type"
        density="compact"
        variant="solo-filled"
        label="Invoice type"
        :items="invoiceTypes"
        item-title="name"
        item-value="name"
      />
      <v-autocomplete
        v-model="form.currency_id"
        density="compact"
        variant="solo-filled"
        :label="`Invoice currency`"
        hint="Only charges with the same currency will be added"
        :items="currencies"
        item-title="name"
        item-value="id"
      />
      <v-autocomplete v-model="form.inv_serie" density="compact" variant="solo-filled" label="Serie" :items="series" />
      <v-autocomplete
        v-model="form.partyable_type"
        density="compact"
        variant="solo-filled"
        :label="`Party`"
        :items="partyables"
        item-title="name"
        item-value="value"
        @change="(v: any) => form.new_partyable_id = null"
      />
      <div>Search a new one to update it.</div>
      <PartyableSearch v-model="form.new_partyable_id" :partyableType="form.partyable_type" />
    </div>
    <div v-if="isTm" class="font-bold mb-4">
      <div>CFDI information</div>
      <v-autocomplete
        v-model="form.regimen_fiscal"
        :items="cfdiCatalogs.regimenFiscales"
        density="compact"
        label="Régimen fiscal"
        item-title="name"
        item-value="name"
      />
      <v-autocomplete
        v-model="form.uso_cfdi"
        :items="cfdiCatalogs.usosCfdi"
        density="compact"
        label="Uso de CFDI"
        item-title="name"
        item-value="name"
      />
      <v-autocomplete
        v-model="form.metodo_pago"
        :items="cfdiCatalogs.metodosPago"
        density="compact"
        label="Método de pago"
        item-title="name"
        item-value="name"
        @update:model-value="form.forma_pago = null"
      />
      <v-autocomplete
        v-model="form.forma_pago"
        :items="availableFormasPago"
        density="compact"
        label="Forma de pago"
        item-title="name"
        item-value="name"
      />
    </div>

    <div class="my-2">
      <div class="col-span-2 font-bold mb-2">Details</div>
      <div>Razón social</div>
      <div>
        <v-text-field v-model="form.razon_social" density="compact" label="Razón social *" />
      </div>
      <div>RFC/VAT</div>
      <div>
        <v-text-field v-model="form.rfc" density="compact" label="RFC/VAT *" />
      </div>
      <div>Zip code</div>
      <div>
        <v-text-field v-model="form.zip_code" density="compact" label="Zip code" />
      </div>
    </div>
    <div class="my-2 flex gap-2">
      <v-btn color="red" @click="emits('cancel')" class="mb-4">Cancel</v-btn>
      <v-btn color="green-darken-4" @click="updatePartyProforma" class="mb-4">Save changes</v-btn>
    </div>
  </div>
</template>
<script setup lang="ts">
import { partyables } from '@/utils/data/systemData'
import { currencies, cfdiCatalogs } from '~/utils/data/systemData'
const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()

const props = defineProps({
  partyInvoice: {
    type: Object,
    required: true,
  },
})

const emits = defineEmits(['cancel', 'refresh'])

const valueRef = toRef(props, 'partyInvoice')

const form = ref<any>({
  invoice_type: '',
  currency_id: null,
  inv_serie: null,
  new_partyable_id: null,
  partyable_type: null,
  partyable_id: null,
  regimen_fiscal: null,
  uso_cfdi: null,
  metodo_pago: null,
  forma_pago: null,
})

const series = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i))
const invoiceTypes = [{ name: 'TM' }, { name: 'WM' }]

const isTm = computed(() => {
  return form.value.invoice_type === 'TM'
})

const availableFormasPago = computed(() => {
  if (!form.value.metodo_pago) return []
  if (form.value.metodo_pago.includes('PPD')) {
    return cfdiCatalogs.formasPago.filter((forma: any) => forma.name === '99 - Por definir')
  }

  return cfdiCatalogs.formasPago
})

const updatePartyProforma = async () => {
  try {
    loadingStore.loading = true
    await $api.freeFormatInvoices.updateProformaHeader(props.partyInvoice.id, form.value)
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

const getPartyInfoInvoice = async (body: any) => {
  try {
    loadingStore.start()
    const response: any = await $api.freeFormatInvoices.getPartyInfoInvoice(body)

    form.value.razon_social = response.razon_social
    form.value.rfc = response.rfc
    form.value.zip_code = response.zip_code
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

onMounted(() => {
  console.log('partyInvoice', valueRef.value)
  form.value = {
    ...form.value,
    invoice_type: valueRef.value.inv_type.toUpperCase(),
    ...valueRef.value,
  }
})

watch(
  () => form.value.new_partyable_id,
  async (newValue) => {
    // clear form values
    form.value = {
      ...form.value,
      razon_social: null,
      rfc: null,
      zip_code: null,
    }
    if (newValue) {
      const body = {
        partyable_id: newValue,
        partyable_type: form.value.partyable_type,
      }
      await getPartyInfoInvoice(body)
    }
  }
)
</script>
