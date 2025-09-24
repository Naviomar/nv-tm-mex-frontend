<template>
  <div>
    <v-dialog v-model="hasContainer">
      <v-card>
        <v-toolbar color="amber">
          <v-btn icon @click="cancelEdit">
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <v-toolbar-title>Updating container #{{ props.container?.container_number }}</v-toolbar-title>
          <v-spacer></v-spacer>
        </v-toolbar>
        <v-card-text>
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
        </v-card-text>
        <v-card-actions>
          <v-btn color="secondary" @click="cancelEdit">Cancel</v-btn>
          <v-btn color="primary" @click="save">Save changes</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script setup lang="ts">
import { schemaReferencia } from '~~/forms/containerForm'

const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()

const props = defineProps({
  referenciaId: {
    type: [String, Number],
    required: false,
  },
  container: {
    type: [Object, null],
    required: false,
    default: null,
  },
  containerTypes: {
    type: Array,
    required: true,
  },
})

const emit = defineEmits(['cancel', 'updated'])
const containerNumberInput = ref(null)

const { handleSubmit, values, errors, setValues, handleReset, resetForm } = useForm({
  validationSchema: schemaReferencia,
})

const hasContainer = computed(() => !!props.container)

const cancelEdit = () => {
  handleReset()
  emit('cancel')
}

const onSuccess = async (values: any) => {
  if (values.id == null) {
    emit('updated', values)
  }
  if (values.id != null) {
    saveUpdatedContainer(values)
  }
}

const saveUpdatedContainer = async (values: any) => {
  try {
    loadingStore.start()

    const body = {
      ...values,
    }
    const container = await $api.referencias.updateContainer(props.referenciaId!.toString(), body)

    snackbar.add({ type: 'success', text: 'Container updated' })
    emit('updated', container)
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

function onInvalidSubmit({ values, errors, results }: any) {
  snackbar.add({ type: 'error', text: 'Validate form before submit' })
}
const save = handleSubmit(onSuccess, onInvalidSubmit)

watch(
  () => props.container,
  (container) => {
    if (container) {
      // string to number
      container.container_type_id = Number(container.container_type_id)
      setValues({
        id: container.id ?? null,
        uuid: container.uuid ?? null,
        container_number: container.container_number ?? '',
        container_type_id: container.container_type_id ?? '',
        volume: container.volume ?? 0,
        weight: container.weight ?? 0,
        num_packages: container.num_packages ?? 0,
        notes: container.notes ?? '',
      })
    }
  }
)
</script>
