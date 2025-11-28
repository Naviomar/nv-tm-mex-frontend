<template>
  <div>
    <div class="grid grid-cols-12 gap-4">
      <div class="col-span-6">
        <div>
          <InputText variant="outlined" name="name" label="Bank Account Type name *" required />
        </div>
        <div>
          <InputAutocomplete
            name="currency_id"
            :items="currencies.data"
            item-title="name"
            item-value="id"
            label="Currency"
          />
        </div>
        <div class="flex justify-center items-center">
          <v-btn class="mr-4" color="secondary" to="/configuration/banks-accounts-types"> Cancel </v-btn>
          <v-btn color="primary" @click="save"> Save </v-btn>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { schema } from '~~/forms/bankAccountTypeForm'

const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const router = useRouter()
const loadingIndicator = useLoadingIndicator()
const loadingStore = useLoadingStore()

const { handleSubmit, values, errors, meta, handleReset } = useForm({
  validationSchema: schema,
})

const currencies = ref({
  data: [] as any,
  current_page: 0,
  page: 0,
  perPage: 10,
  last_page: 1,
})

const getCurrencies = async () => {
  try {
    loadingIndicator.start()
    loadingStore.loading = true
    const response = await $api.currencies.getCurrencies({
      query: {
        page: currencies.value.current_page,
        perPage: currencies.value.perPage,
      },
    })

    currencies.value = response as any
  } catch (e) {
    console.error(e)
  } finally {
    // timeout 1 second
    setTimeout(() => {
      loadingIndicator.finish()
      loadingStore.loading = false
    }, 200)
  }
}

await getCurrencies()

const onSuccess = async (values: any) => {
  await $api.bankAccountsTypes
    .create(values)
    .catch((e: any) => {
      console.error(e)
      snackbar.add({ type: 'error', text: 'Error creating bank account type' })
    })
    .then((response: any) => {
      snackbar.add({ type: 'success', text: 'Bank Account Type created' })
      router.push('/configuration/banks-accounts-types')
    })
}

function onInvalidSubmit({ values, errors, results }: any) {
  console.log(values) // current form values
  console.log(errors) // a map of field names and their first error message
  console.log(results) // a detailed map of field names and their validation results
  snackbar.add({ type: 'warning', text: 'Validate form before submit' })
}
const save = handleSubmit(onSuccess, onInvalidSubmit)
</script>
