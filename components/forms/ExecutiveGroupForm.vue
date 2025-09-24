<template>
  <div>
    <div class="grid grid-cols-12 gap-4">
      <div class="col-span-6">
        <div>
          <InputText name="name" label="Group name *" />
        </div>
        <div class="flex justify-center items-center">
          <v-btn class="mr-4" color="secondary" to="/configuration/executives/groups"> Cancel </v-btn>
          <v-btn color="primary" @click="save"> Save </v-btn>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { schema } from '~~/forms/executiveGroupForm'

const router = useRouter()
const { $api } = useNuxtApp()
const snackbar = useSnackbar()

const { handleSubmit, values, errors, meta, handleReset } = useForm({
  validationSchema: schema,
})

const onSuccess = async (values: any) => {
  console.log('click submit', values)
  const response = await $api.executivesGroups.create(values)

  snackbar.add({ type: 'success', text: 'Executive group created' })
  router.push('/configuration/executives/groups')
}

function onInvalidSubmit({ values, errors, results }: any) {
  snackbar.add({ type: 'error', text: 'Form has errors' })
}

const save = handleSubmit(onSuccess, onInvalidSubmit)
</script>
