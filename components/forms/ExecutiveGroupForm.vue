<template>
  <div>
    <div class="grid grid-cols-12 gap-4">
      <div class="col-span-6">
        <div>
          <InputText name="name" label="Group name *" />
        </div>
        <div class="mb-4">
          <v-switch
            v-model="shareNotifications"
            color="primary"
            density="compact"
            hide-details
            label="Team members share notifications (alerts and emails of one reach the whole group)"
          />
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

const shareNotifications = ref(false)

const onSuccess = async (values: any) => {
  const response = await $api.executivesGroups.create({ ...values, share_notifications: shareNotifications.value })

  snackbar.add({ type: 'success', text: 'Executive group created' })
  router.push('/configuration/executives/groups')
}

function onInvalidSubmit({ values, errors, results }: any) {
  snackbar.add({ type: 'error', text: 'Form has errors' })
}

const save = handleSubmit(onSuccess, onInvalidSubmit)
</script>
