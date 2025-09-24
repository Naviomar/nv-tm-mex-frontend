<template>
  <div>
    <h1 class="font-bold mb-2">Bank account form</h1>
    <div class="grid grid-cols-1 gap-4">
      <div class="">
        <div>
          <InputText density="compact" name="bank_name" label="Bank name *" />
        </div>
        <div>
          <InputText density="compact" name="type" label="Purpose *" hint="A description for the account" />
        </div>
        <div>
          <InputAutocomplete
            name="inv_type"
            density="compact"
            label="Invoiceable for *"
            :items="invoiceTypes"
            item-title="name"
            item-value="value"
          />
        </div>
        <div>
          <InputAutocomplete
            name="currency_id"
            :items="currencies"
            item-title="name"
            item-value="id"
            label="Currency"
            density="compact"
          />
        </div>
        <div>
          <InputText density="compact" type="number" name="account_number" label="Account number# *" />
        </div>
        <div>
          <InputText density="compact" type="text" name="clabe" label="CLABE *" />
        </div>
        <div>
          <InputTextArea density="compact" name="address" label="Full address *" />
        </div>
        <div>
          <InputText density="compact" type="number" name="zip_code" label="Zip code *" />
        </div>
        <div class="flex justify-center items-center">
          <v-btn class="mr-4" color="secondary" @click="emits('close')"> Cancel </v-btn>
          <v-btn color="primary" @click="save"> Save bank account </v-btn>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { schemaBankAccount } from '~~/forms/systemAccountForm'
import { currencies } from '~/utils/data/systemData'
const { $api, $notifications } = useNuxtApp()
const router = useRouter()
const snackbar = useSnackbar()

const props = defineProps({
  account: {
    type: Object,
    default: () => ({}),
    required: true,
  },
  editBankAccount: {
    type: Object,
    default: () => null,
  },
})

const payables = ['TM', 'WM', 'AA']
const invoiceTypes = [
  { name: 'TM', value: 'tm' },
  { name: 'WM', value: 'wm' },
]

const emits = defineEmits(['close', 'success'])

const { handleSubmit, values, errors, meta, setValues } = useForm({
  validationSchema: schemaBankAccount,
})

watch(
  () => props.editBankAccount,
  (value) => {
    if (value) {
      setValues(value)
    }
  },
  { immediate: true }
)

const onSuccess = async (values: any) => {
  const body = {
    ...values,
    system_account_id: props.account.id,
  }
  if (props.editBankAccount) {
    await $api.systemAccounts.updateBankAccount(props.account.id, body)
    snackbar.add({ type: 'success', text: 'Bank account updated successfully' })
  } else {
    await $api.systemAccounts.addBankAccount(body)
    snackbar.add({ type: 'success', text: 'Bank account added successfully' })
  }
  emits('success')
}

function onInvalidSubmit({ values, errors, results }: any) {
  snackbar.add({ type: 'error', text: 'Please fill in all required fields' })
}
const save = handleSubmit(onSuccess, onInvalidSubmit)
</script>
