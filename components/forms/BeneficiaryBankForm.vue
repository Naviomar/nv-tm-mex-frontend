<template>
  <v-card class="mb-4">
    <v-card-title>
      <div class="flex justify-between">
        <div>Bank accounts</div>
        <div>
          <v-btn icon size="x-small" @click="toggle" :color="showForm ? 'black' : 'success'">
            <v-icon v-if="showForm">mdi-close</v-icon>
            <v-icon v-else>mdi-plus</v-icon>
          </v-btn>
        </div>
      </div>
    </v-card-title>
    <v-card-text>
      <div v-if="showForm" class="mb-4 grid grid-cols-2 gap-2">
        <div class="font-bold col-span-2">New bank account</div>
        <div class="col-span-2">
          <InputText name="name" density="compact" label="Alias *" />
        </div>
        <div class="col-span-2">
          <InputAutocomplete
            name="bank_id"
            label="Bank *"
            :items="catalogs.banks"
            item-value="id"
            item-title="name"
            density="compact"
          />
        </div>
        <div class="col-span-2">
          <InputText name="beneficiary_name" density="compact" label="Beneficiary name *" />
        </div>
        <div>
          <InputText name="account_number" density="compact" label="Account number *" />
        </div>
        <div>
          <InputText name="clabe" density="compact" label="CLABE" type="number" />
        </div>
        <div>
          <InputAutocomplete
            name="currency_id"
            label="Currency *"
            :items="catalogs.currencies"
            item-value="id"
            item-title="name"
            density="compact"
          />
        </div>
        <div>
          <InputText name="beneficiary_address" density="compact" label="Beneficiary address" />
        </div>
        <div>
          <InputText name="beneficiary_zip_code" density="compact" label="Zip code" />
        </div>
        <div>
          <InputText name="beneficiary_city" density="compact" label="City" />
        </div>
        <div>
          <InputAutocomplete
            name="country_id"
            label="Country"
            :items="catalogs.countries"
            item-value="id"
            item-title="name"
            density="compact"
          />
        </div>
        <div>
          <InputText name="aba" density="compact" label="ABA" />
        </div>
        <div>
          <InputText name="swift" density="compact" label="SWIFT" />
        </div>
        <div>
          <InputText name="iban" density="compact" label="IBAN" />
        </div>
        <div>
          <InputText name="beneficiary_email" density="compact" label="Beneficiary email" />
        </div>
        <div>
          <InputText name="beneficiary_phone" density="compact" label="Beneficiary phone" />
        </div>
        <div>
          <InputSwitch density="compact" name="is_default" label="Is default" class="mx-4" />
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
            <th class="text-left">Alias</th>
            <th class="text-left">Bank name</th>
            <th class="text-left">Beneficiary name</th>
            <th class="text-left">Beneficiary address</th>
            <th class="text-left">Country</th>
            <th class="text-left">Account number</th>
            <th class="text-left">Currency</th>
            <th class="text-left">Beneficiary email</th>
            <th class="text-left">Beneficiary phone</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in bankAccounts" :key="`beneficiary-bank-${index}`">
            <td>
              <div class="flex items-center gap-2">
                <EditButton :item="item" @click="editItem(item)" />
                <TrashButton :item="item" @click="showConfirmDelete" />
              </div>
            </td>
            <td>
              <div class="flex items-center gap-2">
                <v-chip color="yellow-darken-4" v-if="item.is_default" size="small"><v-icon>mdi-star</v-icon></v-chip>
                {{ item.name }}
              </div>
            </td>
            <td>{{ item.bank?.name }}</td>
            <td>{{ item.beneficiary_name }}</td>
            <td>{{ item.beneficiary_address }}</td>
            <td>{{ item.country?.name }}</td>
            <td>{{ item.account_number }}</td>
            <td>{{ item.currency?.name }}</td>
            <td>{{ item.beneficiary_email }}</td>
            <td>{{ item.beneficiary_phone }}</td>
          </tr>
        </tbody>
      </v-table>
    </v-card-text>
  </v-card>
</template>
<script setup lang="ts">
import { schema } from '~~/forms/supplierBank'
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

const bankAccounts = ref<any[]>([])

const { handleSubmit, setValues, resetForm } = useForm({
  validationSchema: schema,
  initialValues: {
    id: null,
  },
})

const showForm = ref(false)
const catalogs = ref<any>({
  banks: [],
  countries: [],
  currencies: [],
})

const toggle = () => {
  showForm.value = !showForm.value
  if (!showForm.value) {
    resetForm({
      values: {
        id: null,
        name: '',
        bank_id: undefined,
        beneficiary_name: '',
        account_number: '',
        clabe: '',
        currency_id: undefined,
        beneficiary_address: '',
        beneficiary_zip_code: '',
        beneficiary_city: '',
        country_id: undefined,
        aba: '',
        swift: '',
        iban: '',
        beneficiary_email: '',
        beneficiary_phone: '',
        is_default: false,
      },
    })
  }
}

const editItem = (item: any) => {
  showForm.value = true
  setValues({
    id: item.id,
    name: item.name,
    bank_id: item.bank_id,
    beneficiary_name: item.beneficiary_name,
    account_number: item.account_number,
    clabe: item.clabe,
    currency_id: item.currency_id,
    beneficiary_address: item.beneficiary_address,
    beneficiary_zip_code: item.beneficiary_zip_code,
    beneficiary_city: item.beneficiary_city,
    country_id: item.country_id,
    aba: item.aba,
    swift: item.swift,
    iban: item.iban,
    beneficiary_email: item.beneficiary_email,
    beneficiary_phone: item.beneficiary_phone,
    is_default: item.is_default,
  })
}

const onSuccess = async (values: any) => {
  try {
    loadingStore.start()
    await $api.beneficiaries.upsertBankAccount(props.id.toString(), values)
    snackbar.add({ type: 'success', text: 'Bank account updated' })
    toggle()
    await getData()
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

function onInvalidSubmit() {
  snackbar.add({ type: 'warning', text: 'Validate form before submit' })
}

const showConfirmDelete = async (item: any) => {
  const result = await confirm({
    title: 'Are you sure?',
    confirmationText: 'Update',
    content: 'Please confirm you want to delete or activate this bank account.',
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
      loadingStore.start()
      await $api.beneficiaries.deleteBankAccount(props.id.toString(), { ...item })
      snackbar.add({ type: 'success', text: 'Bank account updated' })
      await getData()
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

const getData = async () => {
  try {
    loadingStore.start()
    const response = await $api.beneficiaries.getBankAccounts(props.id.toString())
    bankAccounts.value = response
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const getCatalogs = async () => {
  try {
    loadingStore.start()
    const response = await $api.beneficiaries.formBankCatalogs()
    catalogs.value = response
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

onMounted(async () => {
  if (props.id) {
    await getCatalogs()
    await getData()
  }
})
</script>
