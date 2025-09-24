<template>
  <div>
    <h1 class="font-bold mb-2">System account form</h1>
    <div class="grid grid-cols-12 gap-4">
      <div class="col-span-6">
        <div>
          <InputText density="compact" name="name" label="Name *" />
        </div>
        <div>
          <InputText density="compact" name="tax_number" label="TAX ID *" />
        </div>
        <div>
          <InputTextArea density="compact" name="address" label="Full address *" />
        </div>
        <div>
          <InputText density="compact" type="number" name="zip_code" label="Zip code *" />
        </div>
        <div class="flex justify-center items-center">
          <v-btn class="mr-4" color="secondary" @click="emits('close')"> Cancel </v-btn>
          <v-btn color="primary" @click="save"> Save </v-btn>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { schema } from '~~/forms/systemAccountForm'

const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const router = useRouter()

const emits = defineEmits(['close'])

const { handleSubmit, values, errors, meta, handleReset } = useForm({
  validationSchema: schema,
})

const onSuccess = async (values: any) => {
  const response = await $api.systemAccounts.create(values)

  snackbar.add({ type: 'success', text: 'System account created' })
  emits('close')
}

function onInvalidSubmit({ values, errors, results }: any) {
  snackbar.add({ type: 'error', text: 'Please fill all required fields' })
}
const save = handleSubmit(onSuccess, onInvalidSubmit)
</script>
