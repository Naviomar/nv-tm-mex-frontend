<template>
  <v-card class="mb-4">
    <v-card-title>
      <div class="flex justify-between">
        <div>Freight Bank Accounts</div>
        <div>
          <v-btn icon size="x-small" @click="toggle" :color="showForm ? 'black' : 'success'">
            <v-icon v-if="showForm">mdi-close</v-icon>
            <v-icon v-if="!showForm">mdi-plus</v-icon>
          </v-btn>
        </div>
      </div>
    </v-card-title>
    <v-card-text>
      <div v-if="showForm" class="bg-white p-4 mb-4 grid grid-cols-2 gap-4">
        <div class="">
          <InputAutocomplete
            name="bank_id"
            label="Banks"
            :items="catalogs.banks"
            item-value="id"
            item-title="name"
            density="compact"
          />
        </div>
        <div class="">
          <InputAutocomplete
            name="country_id"
            label="Country"
            :items="catalogs.countries"
            item-value="id"
            item-title="name"
            density="compact"
          />
        </div>
        <div class="">
          <InputAutocomplete
            name="currency_id"
            label="Currency"
            :items="catalogs.currencies"
            item-value="id"
            item-title="name"
            density="compact"
          />
        </div>
        <div class="">
          <InputText name="beneficiary_name" density="compact" label="Beneficiary name" />
        </div>
        <div class="">
          <InputText name="beneficiary_address" density="compact" label="Beneficiary address" />
        </div>
        <div class="">
          <InputText name="beneficiary_zip_code" density="compact" label="Beneficiary zip code" />
        </div>
        <div class="">
          <InputText name="beneficiary_city" density="compact" label="Beneficiary city" />
        </div>
        <div class="">
          <InputText name="beneficiary_email" density="compact" label="Beneficiary email" />
        </div>
        <div class="">
          <InputText name="beneficiary_phone" density="compact" label="Beneficiary phone" />
        </div>
        <div class="">
          <InputText name="account_number" density="compact" label="Account number" />
        </div>
        <div class="">
          <InputText name="clabe" density="compact" label="CLABE" type="number" />
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
            <th class="text-left">Bank name</th>
            <th class="text-left">Beneficiary name</th>
            <th class="text-left">beneficiary address</th>
            <th class="text-left">beneficiary zipcode</th>
            <th class="text-left">beneficiary city</th>
            <th class="text-left">country</th>
            <th class="text-left">account number</th>
            <th class="text-left">currency</th>
            <th class="text-left">beneficiary email</th>
            <th class="text-left">beneficiary phone</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in local_freight_banks" :key="`carta-encomienda-${index}`">
            <td>
              <div class="flex gap-2">
                <div class="flex gap-2">
                  <v-btn
                    size="small"
                    variant="text"
                    icon="mdi-delete-outline"
                    color="red-lighten-2"
                    dense
                    @click="showConfirmDelete(item.id)"
                  ></v-btn>
                </div>
              </div>
            </td>
            <td>{{ item.bank.name }}</td>
            <td>{{ item.beneficiary_name }}</td>
            <td>{{ item.beneficiary_address }}</td>
            <td>{{ item.beneficiary_zip_code }}</td>
            <td>{{ item.beneficiary_city }}</td>
            <td>{{ item.country.name }}</td>
            <td>{{ item.account_number }}</td>
            <td>{{ item.currency.name }}</td>
            <td>{{ item.beneficiary_email }}</td>
            <td>{{ item.beneficiary_phone }}</td>
          </tr>
        </tbody>
      </v-table>
    </v-card-text>
  </v-card>
</template>
<script setup lang="ts">
import { schema } from '~~/forms/freightBankAccount'
const router = useRouter()
const route = useRoute()
const { $api, $notifications } = useNuxtApp()
const snackbar = useSnackbar()
const confirm = $notifications.useConfirm()
const loadingStore = useLoadingStore()

const props = defineProps(['freight_banks', 'catalogs', 'id'])

let local_freight_banks = ref([...props.freight_banks])

const { handleSubmit, values, errors, resetForm } = useForm({
  validationSchema: schema,
})

const showForm = ref(false)

const toggle = () => {
  console.log('toggleEmailForm')
  showForm.value = !showForm.value
}

const onSuccess = async (values: any) => {
  console.log('click submit add Freight Bank', values)
  values.id = props.id
  values.name = 'empty'

  await $api.freightForwarders.update(props.id, values)

  snackbar.add({ type: 'success', text: 'Freight Bank created' })

  const response: any = await $api.freightForwarders.getById(route.params.id!.toString())

  local_freight_banks.value = [...response.freight_banks]
  toggle()
}

function onInvalidSubmit({ values, errors, results }: any) {
  snackbar.add({ type: 'error', text: 'Validate form before submit' })
}

const showConfirmDelete = async (id: any) => {
  const result = await confirm({
    title: 'Are you sure?',
    confirmationText: 'Update',
    content: 'Please confirm you want to delete or activate this Freight Bank Account.',
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
      await $api.freightForwarders.deleteFreightBank(id)

      snackbar.add({ type: 'success', text: 'Freight Bank Account deleted' })
      const response: any = await $api.freightForwarders.getById(route.params.id!.toString())

      local_freight_banks.value = [...response.freight_banks]
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
</script>
