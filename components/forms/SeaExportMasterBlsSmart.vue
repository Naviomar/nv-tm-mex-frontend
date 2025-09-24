<template>
  <div>
    <v-card density="compact" class="mb-2">
      <v-card-title>
        <div class="flex justify-between">
          <div class="flex items-center">
            <v-icon size="x-small">mdi-multicast</v-icon>
            <div class="ml-2 font-bold">Master BLs</div>
          </div>
          <div>
            <v-btn icon size="x-small" @click="toggleForm" :color="showForm ? 'black' : 'success'">
              <v-icon v-if="showForm">mdi-close</v-icon>
              <v-icon v-if="!showForm">mdi-plus</v-icon>
            </v-btn>
          </div>
        </div>
      </v-card-title>
      <v-card-text>
        <div v-if="showForm" class="grid grid-cols-2 gap-2 mb-4">
          <div>
            <InputText name="name" density="compact" variant="solo-filled" label="Master BL # *" />
          </div>
          <div class="">
            <InputFile name="attachment" density="compact" label="File" variant="solo-filled" />
          </div>
          <div>
            <v-btn density="compact" variant="outlined" color="red" @click="cancel"><v-icon>mdi-close</v-icon></v-btn>
            <v-btn density="compact" variant="outlined" color="green" @click="save"><v-icon>mdi-plus</v-icon></v-btn>
          </div>
        </div>

        <v-table density="compact">
          <thead>
            <tr>
              <th class="text-left" width="20"></th>
              <th class="text-left">Master BL #</th>
              <th class="text-left">Attachment</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in masterBls" :key="`mbl-${index}`">
              <td>
                <div class="flex gap-2">
                  <EditButton :item="item" @click="editMasterBl(item, index)" />
                  <TrashButton :item="item" @click="removeMasterBl(item, index)" />
                </div>
              </td>
              <td>{{ item.name }}</td>
              <td>
                <div v-if="item.id">
                  <ButtonDownloadS3Object :s3Path="item.attachment" />
                </div>
                <div v-if="!item.id && item.attachment != null">
                  <div class="flex items-center"><v-icon>mdi-file-outline</v-icon>Attached File</div>
                </div>
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-card-text>
    </v-card>
  </div>
</template>
<script setup lang="ts">
import { schemaExportMasterBl } from '~~/forms/maritimeReferenceForm'
const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()

const props = defineProps({
  referenciaId: {
    type: [String, Number],
    required: false,
  },
  currentMasterBls: {
    type: Array,
    required: false,
  },
})

const emit = defineEmits(['update:masterBls'])

const { handleSubmit, values, setValues, resetForm } = useForm({
  validationSchema: schemaExportMasterBl,
})

const showForm = ref(false)
const masterBls = ref<any[]>([])

const toggleForm = () => {
  showForm.value = !showForm.value
  if (!showForm.value) {
    clearValues()
  }
}

// watch
watch(
  () => props.currentMasterBls,
  (currentMasterBls) => {
    if (currentMasterBls) {
      masterBls.value = [...currentMasterBls]
    }
  },
  { immediate: true }
)

// emit transhipments
watch(
  () => masterBls.value,
  (masterBls) => {
    emit('update:masterBls', masterBls)
  },
  { deep: true }
)

const cancel = () => {
  clearValues()
  showForm.value = false
}

const clearValues = () => {
  resetForm({
    values: {
      id: null,
      referencia_id: null,
      name: '',
      attachment: null,
    },
  })
}

const onSuccess = async (values: any) => {
  if (values.id != null) {
    await updateReferenciaMasterBl()
  }
  if (values.id == null) {
    masterBls.value.push({
      referencia_id: props.referenciaId,
      ...values,
    })
    cancel()
  }
}

function onInvalidSubmit({ values, errors, results }: any) {
  snackbar.add({ type: 'error', text: 'Validate form before submit' })
}

const save = handleSubmit(onSuccess, onInvalidSubmit)

const updateReferenciaMasterBl = async () => {
  try {
    loadingStore.start()
    const body = {
      ...values,
      referencia_id: props.referenciaId,
    }
    const response = await $api.referencias.updateMasterBl(props.referenciaId!.toString(), body)
    snackbar.add({ type: 'success', text: 'Master BL updated successfully' })
    // update masterBls
    const index = masterBls.value.findIndex((mbl) => mbl.id == values.id)
    masterBls.value[index] = response
    cancel()
  } catch (e: any) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const editMasterBl = (masterBl: any, index: number) => {
  setValues({
    ...masterBl,
    attachment: null,
  })
  toggleForm()
  if (masterBl.id == null) {
    removeMasterBl(masterBl, index)
  }
}

const removeMasterBl = (masterBl: any, index: number) => {
  masterBls.value.splice(index, 1)
}

// watch
watch(
  () => props.currentMasterBls,
  (currentMasterBls) => {
    if (currentMasterBls) {
      masterBls.value = [...currentMasterBls]
    }
  },
  { immediate: true }
)

watch(
  () => masterBls.value,
  (masterBls) => {
    emit('update:masterBls', masterBls)
  },
  { deep: true }
)
</script>
