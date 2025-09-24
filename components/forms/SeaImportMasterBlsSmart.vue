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
            <InputAutocomplete
              name="consignee_mbl_id"
              density="compact"
              label="Consignee MBL *"
              :items="(props.consigneesmbls as any)"
              item-title="name"
              item-value="id"
              variant="solo-filled"
            />
          </div>
          <div class="">
            <InputAutocomplete
              name="type"
              density="compact"
              label="Type"
              :items="blTypes"
              item-title="name"
              variant="solo-filled"
            />
          </div>
          <div class="">
            <InputFile name="attachment" density="compact" label="File" variant="solo-filled" />
          </div>
          <div class="">
            <InputSwitch
              name="can_be_delivered"
              density="compact"
              label="Can be delivered?"
              variant="solo-filled"
              hide-details
            />
          </div>
          <div class="">
            <InputTextArea
              name="comments"
              density="compact"
              label="Comments"
              variant="solo-filled"
              :rows="3"
              hide-details
            />
          </div>
          <div class="flex gap-2">
            <v-btn density="compact" variant="outlined" color="red" @click="cancel"><v-icon>mdi-close</v-icon></v-btn>
            <v-btn density="compact" variant="outlined" color="green" @click="save"><v-icon>mdi-plus</v-icon></v-btn>
          </div>
        </div>

        <v-table density="compact">
          <thead>
            <tr>
              <th class="text-left" width="20"></th>
              <th class="text-left" width="20"></th>
              <th class="text-left">Master BL #</th>
              <th class="text-left">Consginee</th>
              <th class="text-left">Type</th>
              <th class="text-left">Attachment</th>
              <th class="text-left" width="20"></th>
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
              <td>
                <div class="flex gap-2">
                  <v-btn
                    v-if="item.can_be_delivered != null"
                    size="x-small"
                    color="amber"
                    variant="outlined"
                    :icon="getDeliveredIcon(item)"
                  ></v-btn>
                  <v-tooltip location="top">
                    <template v-slot:activator="{ props }">
                      <v-btn v-bind="props" size="x-small" color="blue" variant="outlined" icon="mdi-comment-outline">
                      </v-btn>
                    </template>
                    {{ item.comments || 'No comments' }}
                  </v-tooltip>
                  <v-btn v-if="item.logs?.length > 0" icon size="x-small" color="purple" @click="onClickShowLogs(item)">
                    <v-icon>mdi-format-list-checkbox</v-icon>
                  </v-btn>
                </div>
              </td>
              <td>{{ item.name }}</td>
              <td>{{ getConsigneeName(item.consignee_mbl_id) }}</td>
              <td>{{ item.type }}</td>
              <td>
                <div v-if="item.id">
                  <ButtonDownloadS3Object :s3Path="item.attachment" />
                </div>
                <div v-if="!item.id && item.attachment != null">
                  <div class="flex items-center"><v-icon>mdi-file-outline</v-icon>Attached File</div>
                </div>
              </td>
              <td>
                <UserInfoBadge :item="item" />
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-card-text>
    </v-card>

    <v-dialog v-model="masterBlDetails.show" max-width="800">
      <v-card>
        <v-card-title>
          <div class="flex items-center gap-2">
            <v-icon size="x-small">mdi-format-list-checkbox</v-icon>
            <span>Master BL #{{ masterBlDetails.masterBl.name }}</span>
          </div>
        </v-card-title>
        <v-card-text>
          <v-table density="compact">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Comments</th>
                <th>Updated at</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(mblLog, index) in masterBlDetails.masterBl.logs" :key="`mbl-log-${index}`">
                <td>{{ mblLog.name }}</td>
                <td>{{ mblLog.type }}</td>
                <td>{{ mblLog.comments }}</td>
                <td>
                  <UserInfoBadge :item="mblLog">
                    {{ formatDateString(mblLog.created_at) }}
                  </UserInfoBadge>
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" @click="masterBlDetails.show = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script setup lang="ts">
import { schemaMasterBl } from '~~/forms/maritimeReferenceForm'
const { $api } = useNuxtApp()
const loadingStore = useLoadingStore()
const snackbar = useSnackbar()

const props = defineProps({
  referenciaId: {
    type: [String, Number],
    required: false,
  },
  currentMasterBls: {
    type: Array,
    required: false,
  },
  consigneesmbls: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['update:masterBls'])

const { handleSubmit, values, errors, setValues, resetForm } = useForm({
  validationSchema: schemaMasterBl,
})

const blTypes = [{ name: 'Sea waybill' }, { name: 'TLX Release' }, { name: 'Original' }]
const showForm = ref(false)
const masterBls = ref<any[]>([])
const masterBlDetails = ref<any>({
  show: false,
  masterBl: null,
})

const toggleForm = () => {
  showForm.value = !showForm.value
  if (!showForm.value) {
    clearValues()
  }
}

const onClickShowLogs = (masterBl: any) => {
  masterBlDetails.value.masterBl = masterBl
  masterBlDetails.value.show = true
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

const getConsigneeName = (id: number) => {
  const consignee = props.consigneesmbls.find((c: any) => c.id == id)
  return consignee?.name
}

const cancel = () => {
  clearValues()
  showForm.value = false
}

const getDeliveredIcon = (item: any) => {
  return item.can_be_delivered === 1 ? 'mdi-check' : 'mdi-close'
}

const clearValues = () => {
  resetForm({
    values: {
      id: null,
      referencia_id: null,
      name: '',
      can_be_delivered: null,
      comments: null,
      consignee_mbl_id: undefined,
      type: null,
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

function onInvalidSubmit({ values, errors, results }: any) {
  console.log(values) // current form values
  console.log(errors) // a map of field names and their first error message
  console.log(results) // a detailed map of field names and their validation results
  snackbar.add({
    type: 'warning',
    text: 'Validate form before submit',
  })
}

const save = handleSubmit(onSuccess, onInvalidSubmit)

const removeMasterBl = (masterBl: any, index: number) => {
  masterBls.value.splice(index, 1)
}

const editMasterBl = (masterBl: any, index: number) => {
  setValues({
    ...masterBl,
    consignee_mbl_id: Number(masterBl.consignee_mbl_id),
    attachment: null,
  })
  toggleForm()
  if (masterBl.id == null) {
    removeMasterBl(masterBl, index)
  }
}
</script>
