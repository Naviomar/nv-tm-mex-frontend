<template>
  <div>
    <v-card density="compact" class="mb-2">
      <v-card-title>
        <div class="flex justify-between">
          <div class="flex items-center">
            <v-icon size="x-small">mdi-multicast</v-icon>
            <div class="ml-2 font-bold">House BLs</div>
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
            <InputText name="name" density="compact" variant="solo-filled" label="House BL # *" />
          </div>
          <div class="">
            <AGlobalSearch
              :onSearch="searchCustomers"
              validate-key="consignee"
              :return-object="true"
              label="Consignee HBL *"
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
              @update:model-value="updateCanBeDelivered"
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
              <th class="text-left">House BL #</th>
              <th class="text-left">Consginee</th>
              <th class="text-left">Type</th>
              <th class="text-left">Attachment</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in houseBls" :key="`hbl-${index}`">
              <td>
                <div class="flex gap-2">
                  <EditButton :item="item" @click="editHouseBl(item, index)" />
                  <TrashButton :item="item" @click="removeHouseBl(item, index)" />
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
              <td>{{ item.consignee?.name }}</td>
              <td>{{ item.type }}</td>
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

    <v-dialog v-model="houseBlDetails.show" max-width="800">
      <v-card>
        <v-card-title>
          <div class="flex items-center gap-2">
            <v-icon size="x-small">mdi-format-list-checkbox</v-icon>
            <span>Master BL #{{ houseBlDetails.masterBl.name }}</span>
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
              <tr v-for="(mblLog, index) in houseBlDetails.masterBl.logs" :key="`mbl-log-${index}`">
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
          <v-btn color="primary" @click="houseBlDetails.show = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script setup lang="ts">
import { schemaHouseBl } from '~~/forms/maritimeReferenceForm'
const { $api } = useNuxtApp()
const loadingStore = useLoadingStore()
const snackbar = useSnackbar()

const props = defineProps({
  referenciaId: {
    required: false,
    type: [String, Number],
  },
  currentHouseBls: {
    type: Array,
    required: false,
  },
})

const emit = defineEmits(['update:houseBls'])

const { handleSubmit, values, setValues, resetForm, handleReset } = useForm({
  validationSchema: schemaHouseBl,
})

const blTypes = [{ name: 'FCR' }, { name: 'TLX Release' }, { name: 'Original' }]
const showForm = ref(false)
const houseBls = ref<any[]>([])
const houseBlDetails = ref<any>({
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
  houseBlDetails.value.masterBl = masterBl
  houseBlDetails.value.show = true
}

const getDeliveredIcon = (item: any) => {
  return item.can_be_delivered === 1 ? 'mdi-check' : 'mdi-close'
}

const clearValues = () => {
  resetForm({
    values: {
      id: null,
      referencia_id: null,
      name: undefined,
      consignee: undefined,
      consignee_id: null,
      type: null,
      attachment: null,
    },
  })
}

const isFile = computed(() => {
  if (!values.attachment) return false
  return isFileOrArrayOfFiles(values.attachment)
})

function isFileOrArrayOfFiles(variable: any) {
  // Check for a single File
  if (variable instanceof File) {
    return true
  }

  // Check for an array of File objects
  if (Array.isArray(variable) && variable.every((item) => item instanceof File)) {
    return true
  }

  // Not a File or an array of File objects
  return false
}

// watch
watch(
  () => props.currentHouseBls,
  (currentHouseBls) => {
    if (currentHouseBls) {
      houseBls.value = [...currentHouseBls]
    }
  },
  { immediate: true }
)

// emit transhipments
watch(
  () => houseBls.value,
  (houseBls) => {
    emit('update:houseBls', houseBls)
  },
  { deep: true }
)

const cancel = () => {
  handleReset()
  toggleForm()
}

const updateCanBeDelivered = (value: any) => {
  const canBeDelivered = value === 'FCR' || value === 'TLX Release' ? 1 : 0
  setValues({
    ...values,
    can_be_delivered: canBeDelivered,
  })
}

const onSuccess = async (values: any) => {
  if (props.referenciaId) {
    if (values.id != null) {
      await updateReferenciaHouseBl()
    } else {
      await saveHouseBl()
    }
  }

  if (!props.referenciaId) {
    if (values.id == null) {
      houseBls.value.push({
        referencia_id: props.referenciaId,
        consignee_id: values.consignee.id,
        ...values,
        consignee: {
          id: values.consignee.id,
          name: values.consignee.name,
        },
      })
      console.log(houseBls.value)
      cancel()
    }
  }
}

interface SearchParams {
  name?: string
  id?: number
  [key: string]: any // Allow additional keys, but we will filter them
}

const searchCustomers = async (search: SearchParams) => {
  try {
    const response = await $api.consignees.searchConsignees({
      query: search,
    })
    return response
  } catch (error) {
    snackbar.add({
      type: 'error',
      text: 'Error fetching consignees',
    })
  }
}

const saveHouseBl = async () => {
  try {
    loadingStore.start()
    const body = {
      ...values,
      referencia_id: props.referenciaId,
      consignee_id: values.consignee?.id,
      consignee: {
        id: values.consignee?.id,
        name: values.consignee?.name,
      },
    }
    const response = await $api.referencias.saveHouseBl(props.referenciaId!.toString(), body)
    snackbar.add({ type: 'success', text: 'House BL added successfully' })
    houseBls.value.push(response)
    cancel()
  } catch (e: any) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const updateReferenciaHouseBl = async () => {
  try {
    loadingStore.start()
    const body = {
      ...values,
      referencia_id: props.referenciaId,
      consignee_id: values.consignee?.id,
      consignee: {
        id: values.consignee?.id,
        name: values.consignee?.name,
      },
    }
    const response = await $api.referencias.updateHouseBl(props.referenciaId!.toString(), body)
    snackbar.add({ type: 'success', text: 'House BL updated successfully' })
    // update houseBls
    const index = houseBls.value.findIndex((hbl) => hbl.id == values.id)
    houseBls.value[index] = response
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
  snackbar.add({
    type: 'warning',
    text: 'Validate form before submit',
  })
}

const save = handleSubmit(onSuccess, onInvalidSubmit)

const removeHouseBl = (houseBl: any, index: number) => {
  houseBls.value.splice(index, 1)
}

const editHouseBl = (houseBl: any, index: number) => {
  setValues({
    ...houseBl,
    attachment: null,
  })
  toggleForm()
  if (houseBl.id == null) {
    removeHouseBl(houseBl, index)
  }
}
</script>
