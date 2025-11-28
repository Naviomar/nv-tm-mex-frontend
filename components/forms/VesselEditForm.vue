<template>
  <div>
    <div class="grid grid-cols-12 gap-4 mb-2">
      <div class="col-span-6">
        <v-card color="">
          <v-card-text>
            <div>
              <InputAutocomplete
                name="line_id"
                density="compact"
                :items="catalogs.lines"
                item-title="name"
                item-value="id"
                label="Freight line *"
              />
            </div>
            <div>
              <InputText name="name" density="compact" label="Name *" />
            </div>

            <div class="flex justify-end items-center">
              <v-btn class="mr-4" color="secondary" to="/configuration/vessels"> Cancel </v-btn>
              <v-btn color="primary" @click="saveVessel"> Save </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { schema } from '~~/forms/vesselForm'

const router = useRouter()
const route = useRoute()
const { $api } = useNuxtApp()
const snackbar = useSnackbar()

const id = route.params.id

const { handleSubmit, values, errors, resetForm } = useForm({
  validationSchema: schema,
})

const catalogs = ref<any>({
  lines: [],
})

const onSuccess = async (values: any) => {
  console.log('click submit', values)
  const body = {
    ...values,
  }
  const response = await $api.vessels.update(id!.toString(), body)

  snackbar.add({ type: 'success', text: 'Vessel updated' })
  router.push('/configuration/vessels')
}

function onInvalidSubmit({ values, errors, results }: any) {
  snackbar.add({ type: 'warning', text: 'Validate form before submit' })
}

const getLineCatalogs = async () => {
  const response = await $api.vessels.getCatalogs()

  catalogs.value = response as any
  console.log(catalogs.value)
}

const saveVessel = handleSubmit(onSuccess, onInvalidSubmit)

await getLineCatalogs()

const response = (await $api.vessels.getById(route.params.id!.toString())) as any

resetForm({
  values: {
    id: response.id,
    line_id: parseInt(response.line_id),
    name: response.name,
  },
})
</script>
