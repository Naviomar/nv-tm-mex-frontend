<template>
  <div>
    <div class="grid grid-cols-2 gap-2 mb-4">
      <div>
        <InputText
          name="container_number"
          density="compact"
          variant="solo-filled"
          label="Container #"
          ref="containerNumberInput"
        />
      </div>
      <div class="flex items-start gap-2">
        <InputAutocomplete
          name="container_type_id"
          density="compact"
          label="Type"
          :items="props.containerTypes"
          item-title="name"
          item-value="id"
          variant="solo-filled"
        />
      </div>
      <div class="">
        <InputText
          name="volume"
          type="text"
          density="compact"
          variant="solo-filled"
          label="metros cúbicos"
          prepend-inner-icon="mdi-axis-arrow-info"
        />
      </div>
      <div class="">
        <InputText
          name="weight"
          type="text"
          density="compact"
          variant="solo-filled"
          label="Kgs"
          prepend-inner-icon="mdi-weight-kilogram"
        />
      </div>
      <div class="">
        <InputText
          name="num_packages"
          density="compact"
          type="number"
          variant="solo-filled"
          label="# Paquetes"
          prepend-inner-icon="mdi-package-variant-closed"
        />
        <div class="flex gap-4">
          <v-btn density="compact" variant="outlined" color="red" @click="cancel"><v-icon>mdi-close</v-icon></v-btn>
          <v-btn density="compact" variant="outlined" color="green" @click="save"><v-icon>mdi-plus</v-icon></v-btn>
        </div>
      </div>
      <div class="">
        <InputTextArea
          name="notes"
          density="compact"
          variant="solo-filled"
          :counter="3"
          :rows="2"
          label="Container notes"
        />
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { schemaReferencia } from '~~/forms/containerForm'
const snackbar = useSnackbar()

const props = defineProps({
  impoExpo: {
    type: String,
    required: true,
  },
  containerTypes: {
    type: Array,
    required: true,
  },
})

const emit = defineEmits(['cancel', 'add'])
const containerNumberInput = ref(null)

const { handleSubmit, values, errors, setValues, handleReset } = useForm({
  validationSchema: schemaReferencia,
  initialValues: {
    volume: 0,
    weight: 0,
    num_packages: 0,
  },
})

const cancel = () => {
  handleReset()
  emit('cancel')
}

const onSuccess = async (values: any) => {
  // uppercase container_number
  const body = {
    ...values,
    container_number: values.container_number.toUpperCase(),
  }
  console.log('body', body)
  emit('add', body)
  // clear only container_number
  if (props.impoExpo === 'I') {
    setValues({
      container_number: '',
      container_type_id: '',
      volume: 0,
      weight: 0,
      num_packages: 0,
      notes: '',
    })
  } else {
    setValues({
      container_number: '',
    })
  }
}

function onInvalidSubmit({ values, errors, results }: any) {
  snackbar.add({ type: 'error', text: 'Validate form before submit' })
}
const save = handleSubmit(onSuccess, onInvalidSubmit)
</script>
