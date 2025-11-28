<template>
  <v-card class="mb-4">
    <v-card-title>
      <div class="flex justify-between">
        <div>Address book</div>
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
        <div class="col-span-2">New address form</div>
        <div class="col-span-2">
          <InputText density="compact" name="name" label="Alias *" />
        </div>
        <div>
          <InputText density="compact" name="street" label="Street *" />
        </div>
        <div>
          <InputText density="compact" name="number" label="Number *" />
        </div>
        <div class="col-span-2">
          <InputText density="compact" name="neighborhood" label="Neighborhood *" />
        </div>
        <div>
          <InputText density="compact" name="city" label="City *" />
        </div>
        <div>
          <InputText density="compact" name="state" label="State *" />
        </div>
        <div class="col-span-2">
          <InputAutocomplete
            name="country_id"
            label="Country *"
            :items="catalogs.countries"
            item-value="id"
            item-title="name"
            variant="solo-filled"
            density="compact"
          />
        </div>
        <div>
          <InputText density="compact" name="zip_code" label="Zip code *" />
        </div>
        <div>
          <InputSwitch density="compact" name="is_default" label="Is Default address" class="mx-4" />
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
            <th width="10px"></th>
            <th class="text-left">Name</th>
            <th class="text-left">Street</th>
            <th class="text-left">Neighborhood</th>
            <th class="text-left">City</th>
            <th class="text-left">State</th>
            <th class="text-left">Country</th>
            <th class="text-left">Zip code</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in addresses" :key="`line-address-${index}`">
            <td>
              <div class="flex gap-2">
                <div class="flex">
                  <v-btn
                    size="small"
                    variant="text"
                    icon="mdi-pencil-outline"
                    color="green-lighten-2"
                    density="comfortable"
                    @click="editAddress(item)"
                  ></v-btn>
                  <v-btn
                    size="small"
                    variant="text"
                    icon="mdi-delete-outline"
                    color="red-lighten-2"
                    density="comfortable"
                    @click="showConfirmDelete(item.id)"
                  ></v-btn>
                </div>
              </div>
            </td>
            <td>
              <div class="flex items-center gap-2">
                <v-chip color="yellow-darken-4" v-if="item.is_default" size="small"><v-icon>mdi-star</v-icon></v-chip>
                {{ item.name }}
              </div>
            </td>
            <td>{{ item.street }} {{ item.number }}</td>
            <td>{{ item.neighborhood }}</td>
            <td>{{ item.city }}</td>
            <td>{{ item.state }}</td>
            <td>{{ item.country?.name }}</td>
            <td>{{ item.zip_code }}</td>
          </tr>
        </tbody>
      </v-table>
    </v-card-text>
  </v-card>
</template>
<script setup lang="ts">
import { schemaAddress } from '~~/forms/supplierForm'
const { $api, $notifications } = useNuxtApp()
const snackbar = useSnackbar()
const confirm = $notifications.useConfirm()
const loadingStore = useLoadingStore()

const props = defineProps({
  id: {
    type: [String, Number],
    required: true,
  },
})

const emit = defineEmits(['update:line'])

const addresses = ref<any>([])
const catalogs = ref({
  countries: [] as any,
})

const response = await $api.countries.getAll()
catalogs.value.countries = response

const { handleSubmit, values, errors, setValues, resetForm } = useForm({
  validationSchema: schemaAddress,
})

const showForm = ref(false)

const toggle = () => {
  showForm.value = !showForm.value
  setValues({
    id: null,
    name: '',
    street: '',
    number: '',
    neighborhood: '',
    city: '',
    state: '',
    country_id: '',
    zip_code: '',
    is_default: false,
  })
}

const getLineAddresses = async () => {
  const response = await $api.lines.getAddresses(props.id.toString())
  addresses.value = response
}

const onSuccess = async (values: any) => {
  const body = {
    ...values,
    line_id: props.id.toString(),
  }
  const response: any = await $api.lines.updateAddress(props.id.toString(), body)

  snackbar.add({ type: 'success', text: 'All changes saved.' })
  await getLineAddresses()
  toggle()
}

function onInvalidSubmit({ values, errors, results }: any) {
  snackbar.add({ type: 'error', text: 'Validate form before submit' })
}

const editAddress = (address: any) => {
  setValues(address)
  showForm.value = true
}

const showConfirmDelete = async (id: any) => {
  const result = await confirm({
    title: 'Are you sure?',
    confirmationText: 'Update',
    content: 'Please confirm you want to delete or activate this address.',
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
      await $api.lines.deleteAddress(props.id.toString(), id)

      snackbar.add({ type: 'success', text: 'Address deleted' })
      getLineAddresses()
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

onMounted(() => {
  getLineAddresses()
})
</script>
