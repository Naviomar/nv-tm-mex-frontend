<template>
  <div>
    <div class="z-1010 right-0">
      <v-btn color="red" size="small" @click="toggleSupportDialog">
        <v-icon>mdi-bug-outline</v-icon>
      </v-btn>
    </div>
    <v-dialog v-model="suppotDialog.show" fullscreen>
      <v-card>
        <v-toolbar color="primary">
          <v-btn icon @click="closeDialog">
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <v-toolbar-title>IT - Support ticket</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn variant="text" @click="sendSupportTicket"> Send ticket </v-btn>
          </v-toolbar-items>
        </v-toolbar>
        <v-card-title> IT - Support Form </v-card-title>
        <v-card-text>
          <div class="z-10 flex items-center justify-center mb-4 md:mb-2">
            <div
              class="group relative mx-auto flex max-w-fit flex-row items-center justify-center rounded-2xl bg-white/40 dark:bg-black/40 px-4 py-1.5 text-sm font-medium shadow-[inset_0_-8px_10px_#8fdfff1f] backdrop-blur-xs transition-shadow duration-500 ease-out [--bg-size:300%] hover:shadow-[inset_0_-5px_10px_#8fdfff3f]"
            >
              <div
                class="absolute inset-0 block h-full w-full animate-gradient bg-linear-to-r from-[#ffaa40]/50 via-[#9c40ff]/50 to-[#ffaa40]/50 dark:from-[#ff6f91]/50 dark:via-[#61dafb]/50 dark:to-[#ff6f91]/50 bg-[length:var(--bg-size)_100%] p-[1px] [mask-composite:subtract]! [border-radius:inherit] [mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)]"
              ></div>
              😊<span class="ml-2"></span>
              <span
                class="inline animate-gradient bg-linear-to-r from-[#ffaa40] via-[#9c40ff] to-[#ffaa40] dark:from-[#ff6f91] dark:via-[#61dafb] dark:to-[#ff6f91] bg-[length:var(--bg-size)_100%] bg-clip-text text-transparent"
              >
                Hola! Para poder ayudarte mejor, cuéntanos en detalle el problema que encontraste en el sistema. Toda
                evidencia, como capturas de pantalla o ejemplos, nos será muy útil para resolverlo más rápido. ¡Gracias
                por tu ayuda!
              </span>
            </div>
          </div>

          <v-row no-gutters>
            <v-col cols="12">
              <v-text-field v-model="form.user_agent" label="User agent *" disabled density="compact" />
            </v-col>
            <v-col cols="12">
              <v-text-field v-model="form.current_route" label="Current route *" disabled density="compact" />
            </v-col>
            <v-col cols="12">
              <div class="grid grid-cols-3 gap-4">
                <v-autocomplete
                  v-model="form.priority"
                  label="Priority *"
                  density="compact"
                  :items="ticketCatalogs.priorities"
                  item-title="name"
                  item-value="value"
                />
                <v-autocomplete
                  v-model="form.severity"
                  label="Severity level *"
                  density="compact"
                  :items="ticketCatalogs.severities"
                  item-title="name"
                  item-value="value"
                />
                <v-autocomplete
                  v-model="form.category"
                  label="Ticket Category/Type *"
                  density="compact"
                  :items="ticketCatalogs.categories"
                  item-title="name"
                  item-value="value"
                />
              </div>
            </v-col>
            <v-col cols="12">
              <v-autocomplete
                v-model="form.subject"
                label="Motivo - Módulo *"
                density="compact"
                :items="ticketCatalogs.modules"
                item-title="name"
                item-value="value"
              />
            </v-col>
            <v-col cols="12">
              <v-textarea v-model="form.message" label="Describa a detalle el problema *" counter density="compact" />
            </v-col>
            <v-col cols="12">
              <div>
                Proporcionar campos o instrucciones de cómo reproducir el problema paso a paso. Esto ayuda a los
                desarrolladores a comprender el contexto del problema más rápidamente.
              </div>
              <v-textarea v-model="form.steps" label="Pasos para reproducir el caso *" counter density="compact" />
            </v-col>
            <v-col cols="12">
              <v-file-input
                v-model="form.attachments"
                multiple
                label="Adjunte soportes como tomas de pantalla / evidencias"
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
import { ticketCatalogs } from '~/utils/data/systemData'
const { $api } = useNuxtApp()
const loadingStore = useLoadingStore()
const snackbar = useSnackbar()
const route = useRoute()
const { fireworks, simpleConfetti } = useConfetti()

const suppotDialog = ref<any>({
  show: false,
})

const form = ref<any>({
  user_agent: '',
  current_route: '',
  priority: '',
  severity: '',
  category: '',
  subject: '',
  message: '',
  attachments: [],
})

const toggleSupportDialog = () => {
  suppotDialog.value.show = !suppotDialog.value.show
  form.value.current_route = route.fullPath
  form.value.user_agent = navigator.userAgent
}

const closeDialog = () => {
  suppotDialog.value.show = false
}

const sendSupportTicket = async () => {
  try {
    if (
      !form.value.priority ||
      !form.value.severity ||
      !form.value.category ||
      !form.value.subject ||
      !form.value.message
    ) {
      snackbar.add({ type: 'error', text: 'Please fill all required fields' })
      return
    }
    loadingStore.loading = true
    const response = await $api.supportTi.sendTicket(form.value)
    snackbar.add({ type: 'success', text: 'Support ticket sent successfully' })

    form.value = {
      user_agent: '',
      current_route: '',
      priority: '',
      severity: '',
      category: '',
      subject: '',
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
