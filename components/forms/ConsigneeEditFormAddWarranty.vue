<template>
  <div>
    <v-card class="mb-4">
      <v-card-title>
        <div class="flex justify-between">
          <div>Guarantee letter(s)</div>
          <div>
            <v-btn icon size="x-small" @click="toggle" :color="showForm ? 'black' : 'success'">
              <v-icon v-if="showForm">mdi-close</v-icon>
              <v-icon v-if="!showForm">mdi-plus</v-icon>
            </v-btn>
          </div>
        </div>
      </v-card-title>
      <v-card-text>
        <!-- <pre>{{ catalogs }}</pre> -->
        <div v-if="showForm" class="p-4 mb-4 grid grid-cols-2 gap-2">
          <div class="col-span-2">
            <InputAutocomplete
              name="warranty_agent_id"
              label="Agent"
              :items="catalogs.agents"
              item-value="id"
              item-title="short_name"
              variant="solo-filled"
              density="compact"
            />
          </div>
          <div class="col-span-2">
            <AGlobalSearch
              :onSearch="searchPorts"
              validate-key="port_id"
              append-inner-icon="mdi-ferry"
              :item-title="(row : any) => `[${row.country?.code2}] ${row.name}`"
              label="Port"
            />
          </div>
          <div>
            <InputText
              name="warranty_valid_from"
              type="date"
              density="compact"
              variant="solo-filled"
              label="Valid from"
            />
          </div>
          <div>
            <InputText name="warranty_valid_to" type="date" density="compact" variant="solo-filled" label="Valid to" />
          </div>
          <div class="col-span-2">
            <div class="flex justify-end items-center">
              <v-btn class="mr-4" color="secondary" @click="toggle"> Cancel </v-btn>
              <v-btn color="primary" @click="save"> Save </v-btn>
            </div>
          </div>
        </div>
        <v-table density="compact">
          <thead>
            <tr>
              <th class="text-left">Actions</th>
              <th class="text-left">Customs agent</th>
              <th class="text-left">Port</th>
              <th class="text-left">Validity of</th>
              <th class="text-left">To</th>
              <th v-if="false" class="text-left">Attachment</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in guarantee" :key="`carta-encomienda-${index}`">
              <td>
                <div class="flex">
                  <v-btn
                    size="small"
                    variant="text"
                    icon="mdi-pencil-outline"
                    color="green"
                    class="cursor-pointer"
                    @click="editWarrantyLetter(item)"
                  ></v-btn>
                  <v-btn
                    size="small"
                    variant="text"
                    icon="mdi-delete-outline"
                    color="red-lighten-2"
                    dense
                    @click="showConfirmDelete(item.id)"
                  ></v-btn>
                </div>
              </td>
              <td class="whitespace-nowrap">{{ item.custom_agent?.short_name }}</td>
              <td class="whitespace-nowrap">{{ item.port?.name }}</td>
              <td class="whitespace-nowrap">{{ item.valid_from }}</td>
              <td class="whitespace-nowrap">{{ item.valid_to }}</td>
              <td v-if="false">
                <v-btn size="small" variant="outlined"
                  ><v-icon>mdi-download-circle-outline</v-icon>Adjunto.pdf/img</v-btn
                >
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-card-text>
    </v-card>
    <v-dialog v-model="formWarrantyLetter.show" max-width="600px">
      <v-card>
        <v-card-title class="text-h6">Edit Warranty Letter #{{ values.id }}</v-card-title>
        <v-card-text>
          <div class="p-4 mb-4 grid grid-cols-2 gap-2">
            <div class="col-span-2">
              <InputAutocomplete
                name="warranty_agent_id"
                label="Agent"
                :items="catalogs.agents"
                item-value="id"
                item-title="short_name"
                variant="solo-filled"
                density="compact"
              />
            </div>
            <div class="col-span-2">
              <AGlobalSearch
                :onSearch="searchPorts"
                validate-key="port_id"
                append-inner-icon="mdi-ferry"
                :item-title="(row : any) => `[${row.country?.code2}] ${row.name}`"
                label="Port"
                :set-id="values.port_id"
              />
            </div>
            <div>
              <InputText
                name="warranty_valid_from"
                type="date"
                density="compact"
                variant="solo-filled"
                label="Valid from"
              />
            </div>
            <div>
              <InputText
                name="warranty_valid_to"
                type="date"
                density="compact"
                variant="solo-filled"
                label="Valid to"
              />
            </div>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-btn color="secondary" @click="closeDialogWarranty">Close</v-btn>
          <v-btn color="primary" @click="updateWarranty">Save changes</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script setup lang="ts">
import { schema } from '~~/forms/warrantyLetterForm'
const { $api, $notifications } = useNuxtApp()
const snackbar = useSnackbar()
const confirm = $notifications.useConfirm()
const loadingStore = useLoadingStore()

const props = defineProps(['guarantee', 'catalogs', 'id'])
const emit = defineEmits(['refresh'])

const { handleSubmit, values, errors, setValues, resetForm } = useForm({
  validationSchema: schema,
})

const showForm = ref(false)
const formWarrantyLetter = ref<any>({
  show: false,
})

const closeDialogWarranty = () => {
  formWarrantyLetter.value.show = false
}

const closeAddForm = () => {
  showForm.value = false
  setValues({
    id: undefined,
    port_id: undefined,
    warranty_agent_id: undefined,
    warranty_valid_from: undefined,
    warranty_valid_to: undefined,
  })
}

const editWarrantyLetter = async (item: any) => {
  // formWarrantyLetter.value.item = item
  setValues({
    id: item.id,
    port_id: item.port_id,
    warranty_agent_id: item.custom_agent_id,
    warranty_valid_from: item.valid_from,
    warranty_valid_to: item.valid_to,
  })
  formWarrantyLetter.value.show = true
  // hide add form
  showForm.value = false
}

const searchPorts = async (search: any) => {
  try {
    // Define the allowed keys you want to search by
    const allowedKeys = ['name', 'id']

    // Create the query object, filtering out any keys not in allowedKeys
    const query = Object.keys(search)
      .filter((key) => allowedKeys.includes(key))
      .reduce((obj: any, key) => {
        obj[key] = search[key]
        return obj
      }, {})

    // Add additional static values to the query if needed
    query['country_id'] = 140
    const response = await $api.ports.searchPorts({
      query: query,
    })
    return response
  } catch (error) {
    snackbar.add({
      type: 'error',
      text: 'Error fetching ports',
    })
  }
}

const toggle = () => {
  showForm.value = !showForm.value
  if (showForm.value) {
    setValues({
      id: undefined,
      port_id: undefined,
      warranty_agent_id: undefined,
      warranty_valid_from: undefined,
      warranty_valid_to: undefined,
    })
  }
}

const onSuccess = async (values: any) => {
  const body = {
    ...values,
  }
  await $api.consignees.upsertWarrantyLetter(props.id, body)

  snackbar.add({ type: 'success', text: 'Warranty letter saved.' })

  setValues({
    warranty_agent_id: undefined,
    warranty_valid_from: undefined,
    warranty_valid_to: undefined,
    port_id: undefined,
  })
  emit('refresh')
  closeAddForm()
  closeDialogWarranty()
}

function onInvalidSubmit({ values, errors, results }: any) {
  console.log(values) // current form values
  console.log(errors) // a map of field names and their first error message
  console.log(results) // a detailed map of field names and their validation results
  snackbar.add({ type: 'warning', text: 'Validate form before submit' })
}

const showConfirmDelete = async (id: any) => {
  const result = await confirm({
    title: 'Are you sure?',
    confirmationText: 'Update',
    content: 'Please confirm you want to delete or activate this Warranty letter.',
    dialogProps: {
      persistent: true,
      maxWidth: 500,
    },
    confirmationButtonProps: {
      color: 'primary',
    },
  })

  if (result) {
    try {
      loadingStore.loading = true
      await $api.consignees.deleteWarrantyLetter(id)

      snackbar.add({ type: 'success', text: 'Warranty letter deleted' })
      emit('refresh')
    } catch (e) {
      console.error(e)
    } finally {
      setTimeout(() => {
        loadingStore.stop()
      }, 250)
    }
  }
}

const save = handleSubmit(onSuccess, onInvalidSubmit)
const updateWarranty = handleSubmit(onSuccess, onInvalidSubmit)
</script>
