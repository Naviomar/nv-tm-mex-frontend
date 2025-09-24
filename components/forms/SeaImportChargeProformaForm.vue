<template>
  <div>
    <div class="grid grid-cols-2 lg:grid-cols-8 gap-2 mb-4">
      <div class="col-span-2">
        <InputAutocomplete
          name="serviceable_id"
          density="compact"
          label="Service"
          :items="services"
          :item-title="(item: any) => item.referencia?.reference_number"
          item-value="referencia_id"
          variant="solo-filled"
        />
      </div>
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
        <InputCheckbox
          v-if="invoiceType == 'tm'"
          name="is_con_iva"
          density="compact"
          variant="solo-filled"
          label="+ IVA"
        />
      </div>
    </div>
    <div class="flex justify-end gap-4">
      <v-btn density="compact" variant="flat" color="red" @click="cancel"><v-icon>mdi-close</v-icon></v-btn>
      <v-btn density="compact" variant="flat" color="green" @click="save"><v-icon>mdi-plus</v-icon></v-btn>
    </div>
  </div>
</template>
<script setup lang="ts">
import { schemaProformaChargeTm } from '~~/forms/maritimeReferenceForm'
const snackbar = useSnackbar()

const props = defineProps({
  catalogs: {
    required: true,
    type: Object,
  },
  invoiceType: {
    required: true,
    type: String,
  },
  editCharge: {
    default: null,
    required: false,
  },
  services: {
    required: true,
    type: Array as PropType<any[]>,
  },
})

const emit = defineEmits(['cancel', 'add', 'update'])

const { handleSubmit, values, resetForm, setValues, handleReset } = useForm({
  validationSchema: schemaProformaChargeTm,
})

const cancel = () => {
  resetForm({
    values: {},
  })
  emit('cancel')
}

watch(
  () => props.editCharge,
  (value: any) => {
    if (!value) {
      resetForm({
        values: {},
      })
      return
    }
    if (value) {
      console.log('editCharge', value.chargeable?.is_con_iva)
      let fueraDentroBl = 'D'
      if (value.chargeable?.fuera_dentro_bl) {
        fueraDentroBl = value.chargeable?.fuera_dentro_bl
      }
      setValues({
        id: value.id,
        serviceable: value.serviceable,
        serviceable_id: value.serviceable_id,
        serviceable_type: value.serviceable_type,
        charge_id: parseInt(value.charge_id) || null,
        amount: value.amount,
        currency_id: parseInt(value.currency_id) || null,
        fuera_dentro_bl: fueraDentroBl,
        is_con_iva: value.chargeable?.is_con_iva,
        tm_wm: value.tm_wm,
      })
    }
  },
  { immediate: true, deep: true }
)

const onSuccess = async (values: any) => {
  let body = {
    charge: props.catalogs.charges.find((c: any) => c.id == parseInt(values.charge_id)),
    ...values,
  }
  body.amount_iva = values.is_con_iva ? body.amount * 0.16 : 0
  console.log('inv charge body: ', body)
  if (body.id == null) {
    // add serviceable to body
    body.serviceable_type = 'App\\Models\\Mexico\\\Referencia'
    body.serviceable = props.services.find((s: any) => s.referencia_id == values.serviceable_id).referencia
    emit('add', body)
  } else {
    emit('update', body)
  }
  handleReset()
}

function onInvalidSubmit({ values, errors, results }: any) {
  console.log(values) // current form values
  console.log(errors) // a map of field names and their first error message
  console.log(results) // a detailed map of field names and their validation results
  snackbar.add({ type: 'error', text: 'Validate form before submit' })
}
const save = handleSubmit(onSuccess, onInvalidSubmit)
</script>
