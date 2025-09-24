<template>
  <div>
    <div class="grid grid-cols-2 lg:grid-cols-7 gap-2 mb-4">
      <div class="col-span-2">
        <InputAutocomplete
          name="charge_id"
          density="compact"
          label="Charge"
          :items="catalogs.charges"
          item-title="name"
          item-value="id"
          variant="solo-filled"
        />
      </div>
      <div class="">
        <InputText
          name="amount"
          density="compact"
          variant="solo-filled"
          label="Amount"
          prepend-inner-icon="mdi-currency-usd"
        />
      </div>
      <div>
        <InputAutocomplete
          name="currency_id"
          density="compact"
          label="Currency"
          :items="catalogs.currencies"
          item-title="name"
          item-value="id"
          variant="solo-filled"
        />
      </div>
      <div>
        <InputAutocomplete
          name="fuera_dentro_bl"
          density="compact"
          label="FueraDentro BL"
          :items="[{ name: 'Fuera BL' }, { name: 'Dentro BL' }]"
          item-title="name"
          variant="solo-filled"
        />
      </div>
      <div class="">
        <InputText name="exchange_rate" density="compact" variant="solo-filled" label="Exhange rate" clearable />
      </div>
      <div v-if="isTmInvoice" class="">
        <InputCheckbox name="is_con_iva" density="compact" variant="solo-filled" label="+ IVA" />
      </div>
    </div>
    <div class="flex justify-end gap-4">
      <v-btn density="compact" variant="flat" color="red" @click="cancel"><v-icon>mdi-close</v-icon></v-btn>
      <v-btn density="compact" variant="flat" color="green" @click="save"><v-icon>mdi-plus</v-icon></v-btn>
    </div>
  </div>
</template>
<script setup lang="ts">
import { schemaInvoiceCharge } from '~~/forms/maritimeReferenceForm'
const snackbar = useSnackbar()

const props = defineProps({
  catalogs: {
    required: true,
    type: Object,
  },
  editCharge: {
    default: null,
    required: false,
  },
  invoiceType: {
    required: false,
    type: String,
  },
})

const emit = defineEmits(['cancel', 'add', 'update'])

const { handleSubmit, values, errors, setValues, handleReset } = useForm({
  validationSchema: schemaInvoiceCharge,
})

const cancel = () => {
  handleReset()
  emit('cancel')
}

watch(
  () => props.editCharge,
  (value: any) => {
    if (value) {
      console.log('editCharge', value.chargeable?.is_con_iva)
      let fueraDentroBl = 'D'
      if (value.chargeable?.fuera_dentro_bl) {
        fueraDentroBl = value.chargeable?.fuera_dentro_bl
      }
      setValues({
        id: value.id,
        charge_id: value.charge_id,
        amount: value.amount,
        currency_id: value.currency_id,
        exchange_rate: value.chargeable?.exchange_rate,
        fuera_dentro_bl: fueraDentroBl,
        is_con_iva: value.chargeable?.is_con_iva,
      })
    }
  },
  { immediate: true, deep: true }
)

const isTmInvoice = computed(() => {
  return props.invoiceType?.toUpperCase() === 'TM'
})

const onSuccess = async (values: any) => {
  let body = {
    charge: props.catalogs.charges.find((c: any) => c.id == parseInt(values.charge_id)),
    ...values,
  }
  body.amount_iva = values.is_con_iva ? body.amount * 0.16 : 0
  console.log('inv charge body: ', body)
  if (body.id == null) {
    emit('add', body)
  } else {
    emit('update', body)
  }
  handleReset()
}

function onInvalidSubmit({ values, errors, results }: any) {
  snackbar.add({ type: 'error', text: 'Validate form before submit' })
}
const save = handleSubmit(onSuccess, onInvalidSubmit)
</script>
