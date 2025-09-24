<template>
  <div>
    <div>
      <div class="text-lg font-bold">Past notifications</div>
      <v-table density="compact" class="border border-solid">
        <thead>
          <tr>
            <th class="font-bold!">Sent date</th>
            <th class="font-bold!">Sent by</th>
            <th class="font-bold!">Email(s) copied</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!hasAirImportNotys">
            <td colspan="3" class="text-center">No data</td>
          </tr>
          <tr v-if="hasAirImportNotys" v-for="item in referencia.arrival_notys" :key="`air-noty-${item.id}`">
            <td>{{ formatDateString(item.created_at) }}</td>
            <td>{{ item.creator?.name }}</td>
            <td>{{ item.mails }}</td>
          </tr>
        </tbody>
      </v-table>
    </div>
    <v-alert v-if="!canNotify" color="warning" density="compact" variant="tonal" class="my-4">
      <div class="text-lg font-bold">Cannot send notification</div>
      <div>Please select a customer agent in release information to enable the module.</div>
      <v-btn color="secondary" size="small" @click="getSeaExportDetails">Refresh</v-btn>
    </v-alert>
    <v-card v-if="canNotify">
      <v-card-title> Send notification </v-card-title>
      <v-card-subtitle> Review the form to proceed </v-card-subtitle>
      <v-card-text>
        <div class="mb-4">Notification will include all the information about the shipment and the booking.</div>
        <div class="grid grid-cols-1">
          <v-text-field v-model="form.emails" density="compact" label="Emails" hint="Comma separated" />
          <div class="grid grid-cols-3 mb-4">
            <v-btn size="small" color="secondary" @click="getCustomAgentEmails">Add custom agent email(s)</v-btn>
          </div>
          <v-textarea v-model="form.notes" density="compact" label="Additional notes" :rows="5" />
          <v-file-input v-model="form.attachments" multiple label="Attachments" />
        </div>
      </v-card-text>
      <v-card-actions>
        <v-btn color="primary" @click="onClickSenAirImportNotfy"> Send notification </v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>
<script setup lang="ts">
const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
})

const referencia = ref<any>(null)
const valueHtml = ref('<p>Mensaje</p>')

const form = ref<any>({
  shipper: null,
  subject: null,
  emails: null,
  message: null,
})

const hasAirImportNotys = computed(() => referencia.value?.arrival_notys?.length > 0)

const canNotify = computed(() => {
  // if (referencia.value?.release_agent_id == null) {
  //   return false
  // }
  return true
})

const getCustomAgentEmails = async () => {
  try {
    if (referencia.value.release_agent_id == null) {
      snackbar.add({ type: 'warning', text: 'Custom agent not selected, add emails manually' })
      return
    }
    loadingStore.start()
    const response = (await $api.customAgents.getEmails(referencia.value.release_agent_id)) as any
    if (response == null || response.length === 0) {
      snackbar.add({ type: 'warning', text: 'Custom agent has no emails' })
      return
    }
    // concat response.emails to form.emails
    if (form.value.emails) {
      form.value.emails += ', ' + response.join(', ')
    } else {
      form.value.emails = response.join(', ')
    }
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const getSeaExportDetails = async () => {
  try {
    loadingStore.start()
    const response = (await $api.airImport.getReferenceById(props.id.toString())) as any
    referencia.value = response
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const onClickSenAirImportNotfy = async () => {
  try {
    loadingStore.start()
    const response = await $api.airImport.sendNotify(props.id.toString(), {
      emails: form.value.emails,
      notes: form.value.notes,
      attachments: form.value.attachments,
    })
    snackbar.add({ type: 'success', text: 'Notification sent successfully' })

    form.value = {
      emails: null,
      notes: null,
      attachments: null,
    }
    await getSeaExportDetails()
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

await getSeaExportDetails()
</script>
