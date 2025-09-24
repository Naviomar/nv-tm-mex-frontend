<template>
  <div>
    <VeeForm @submit="saveCharge" :validation-schema="schema">
      <div class="grid grid-cols-12 gap-4">
        <div class="col-span-6">
          <div>
            <InputFile density="compact" name="file" label="Logo *" />
          </div>
          <div>
            <InputText density="compact" name="name" label="Name *" />
          </div>
          <div>
            <InputText density="compact" name="code" label="Code *" />
          </div>
          <div>
            <InputText density="compact" name="prefix" label="Prefix *" />
          </div>

          <div>
            <InputAutocomplete
              density="compact"
              name="country_id"
              label="Country"
              :items="catalogs.countries"
              item-title="name"
              item-value="id"
            />
          </div>

          <div>
            <InputTextArea density="compact" name="address" label="Address" />
          </div>
          <div>
            <InputText density="compact" name="zip_code" label="Zip code" />
          </div>

          <div class="flex justify-center items-center">
            <v-btn class="mr-4" color="secondary" to="/configuration/airlines"> Cancel </v-btn>
            <v-btn color="primary" type="submit"> Save </v-btn>
          </div>
        </div>
      </div>
    </VeeForm>
  </div>
</template>
<script setup lang="ts">
import { schema } from '~/forms/airlineForm'

const router = useRouter()
const { $api } = useNuxtApp()
const loadingStore = useLoadingStore()
const snackbar = useSnackbar()

const catalogs = ref<any>({
  countries: [],
})

const saveCharge = async (values: any) => {
  const response = await $api.airlines.create(values)

  snackbar.add({ type: 'success', text: 'Airline created' })
  router.push('/configuration/airlines')
}

const getCatalogs = async () => {
  try {
    loadingStore.start()
    const response = await $api.airlines.getFormCatalogs()

    catalogs.value = response
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

await getCatalogs()
</script>
