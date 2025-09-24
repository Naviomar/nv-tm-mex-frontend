<template>
  <div>
    <div class="z-1010 right-0">
      <v-btn color="orange-lighten-2" size="small" @click="toggleSupportDialog">
        <v-icon>mdi-help-circle-outline</v-icon>
      </v-btn>
    </div>
    <v-dialog v-model="supportAssist.show" fullscreen>
      <v-card>
        <v-toolbar color="primary">
          <v-btn icon @click="closeDialog">
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <v-toolbar-title>Request Assist</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn variant="text" @click="sendReqAssist"> Send request </v-btn>
          </v-toolbar-items>
        </v-toolbar>
        <v-card-title> Assist Form </v-card-title>
        <v-card-text>
          <v-alert type="info" density="compact" class="mb-4" variant="outlined">
            Use this form to request assistance with a specific part of the system. Your message will be reviewed by a
            support team member who can take action or guide you. Please describe your issue clearly and attach any
            useful evidence. <br /><br />
            <strong>Important:</strong> Make sure you are on the exact page or module where you need assistance before
            submitting this request. This helps us better understand and resolve your issue.
          </v-alert>

          <v-row no-gutters>
            <v-col v-if="false" cols="12">
              <v-text-field v-model="form.user_agent" label="User agent *" readonly density="compact" />
            </v-col>
            <v-col cols="12">
              <v-text-field v-model="form.current_route" label="Current route *" readonly density="compact" />
            </v-col>
            <v-col cols="12">
              <v-textarea v-model="form.message" label="Describa la ayuda que necesita *" counter density="compact" />
            </v-col>
            <v-col cols="12">
              <v-file-input
                v-model="form.attachments"
                multiple
                label="Adjunte soportes a su solicitud"
                counter
                density="compact"
              />
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>
<script lang="ts" setup>
const { $api } = useNuxtApp()
const loadingStore = useLoadingStore()
const snackbar = useSnackbar()
const route = useRoute()
const { fireworks, simpleConfetti } = useConfetti()

const supportAssist = ref<any>({
  show: false,
})

const form = ref<any>({
  user_agent: '',
  current_route: '',
  message: '',
  attachments: [],
})

const toggleSupportDialog = () => {
  supportAssist.value.show = !supportAssist.value.show
  form.value.current_route = route.fullPath
  form.value.user_agent = navigator.userAgent
}

const closeDialog = () => {
  supportAssist.value.show = false
}

const sendReqAssist = async () => {
  try {
    if (!form.value.message) {
      snackbar.add({ type: 'error', text: 'Please fill all required fields' })
      return
    }
    loadingStore.loading = true
    const response = await $api.requestAssistances.sendRequestAssist(form.value)
    snackbar.add({ type: 'success', text: 'Request assistance created' })

    form.value = {
      user_agent: '',
      current_route: '',
      message: '',
      attachments: [],
    }

    // useConfetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } })
    fireworks()

    closeDialog()
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const testClick = () => {
  fireworks()
}
</script>
