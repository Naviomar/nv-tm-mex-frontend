<template>
  <div>
    <VeeForm @submit="updateEtaClick" :validation-schema="schemaDestNotifyPort" ref="voyageDestUpdateEtaFormRef">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="">
          <div class="grid grid-cols-2 font-bold text-lg">
            <div>Line:</div>
            <div>
              {{ voyageDestination.voyage?.vessel?.line?.name }}
            </div>
            <div>Vessel:</div>
            <div>
              {{ voyageDestination.voyage?.vessel?.name }}
            </div>
            <div>Voyage:</div>
            <div>
              {{ voyageDestination.voyage?.name }}
            </div>
            <div>POD:</div>
            <div>
              {{ voyageDestination.pod?.name }}
            </div>
            <!-- Agregar Impo Expo -->
          </div>

          <div>
            <InputText name="subject" density="compact" label="Subject *" />
          </div>
          <div>
            <InputTextArea name="emails_port" density="compact" label="Notify Port emails" />
          </div>
          <div class="wang-editor-styles py-4" style="border: 1px solid #ccc">
            <ClientOnly>
              <Toolbar
                :editor="editorRef"
                :defaultConfig="toolbarConfig"
                mode="default"
                style="border-bottom: 1px solid #ccc"
              />
              <Editor
                :defaultConfig="editorConfig"
                mode="default"
                v-model="valueHtml"
                style="height: 300px; overflow-y: hidden"
                @onCreated="handleCreated"
                @onChange="handleChange"
              />
            </ClientOnly>
            <v-alert type="info" density="compact"> Selected references will be included in the notification. </v-alert>
          </div>
          <div class="py-4">
            <v-btn color="primary" type="submit" :disabled="loadingStore.loading">Send notification to port</v-btn>
          </div>
        </div>
        <div class="">
          <v-card density="compact" color="light-blue-lighten-4" class="mb-4">
            <v-card-title>
              <div>Sea references linked</div>
            </v-card-title>
            <v-card-text>
              <div v-if="referencias.length <= 0">There are no references linked with this voyage destination.</div>
              <v-btn v-if="isImport" @click="selectAll" size="x-small" color="primary" class="mb-4">Select all</v-btn>

              <div>Related services in this voyage - destination</div>
              <v-table v-if="referencias" density="compact">
                <thead>
                  <tr>
                    <th v-if="isImport">Actions</th>
                    <th class="text-left">Customer</th>
                    <th class="text-left">Reference #</th>
                    <th class="text-left">Created</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in referencias" :key="`voy-dest-eta-${index}`">
                    <td v-if="isImport" class="whitespace-nowrap">
                      <v-checkbox v-model="item.selected" label="Select" hide-details />
                    </td>
                    <td>{{ item.consignee?.name }}</td>
                    <td>{{ item.reference_number }}</td>
                    <td>{{ formatDateString(item.created_at) }}</td>
                  </tr>
                </tbody>
              </v-table>
            </v-card-text>
          </v-card>
          <v-card v-if="false" density="compact" color="light-blue-lighten-5" class="mb-4">
            <v-card-title>
              <div>Previous notification(s)</div>
            </v-card-title>
            <v-card-text>
              <div v-if="voyageDestination.change_etas.length <= 0">No notifications</div>
              <v-table v-if="voyageDestination.change_etas" density="compact">
                <thead>
                  <tr>
                    <th class="text-left">Prev ETA</th>
                    <th class="text-left">New ETA</th>
                    <th class="text-left">Notes</th>
                    <th class="text-left">Date</th>
                    <th class="text-left">User</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in voyageDestination.change_etas" :key="`voy-dest-eta-${index}`">
                    <td>{{ item.eta_date }}</td>
                    <td>{{ item.new_eta_date }}</td>
                    <td>{{ item.notes }}</td>
                    <td>{{ formatDateString(item.created_at) }}</td>
                    <td>{{ item.creator.name }}</td>
                  </tr>
                </tbody>
              </v-table>
            </v-card-text>
          </v-card>
        </div>
      </div>
    </VeeForm>
  </div>
</template>
<script setup lang="ts">
import { notifyPort } from '~/utils/data/seaExportData'
import { schemaDestNotifyPort } from '~~/forms/voyageForm'
import VeeForm from '@/components/global/VeeForm.vue'

const router = useRouter()
const route = useRoute()
const { $api, $notifications } = useNuxtApp()
const snackbar = useSnackbar()
const confirm = $notifications.useConfirm()
const loadingStore = useLoadingStore()

const valueHtml = ref('<p>Mensaje</p>')
const editorRef = ref<any>()
const toolbarConfig = {}
const editorConfig = { placeholder: 'ADTV' }

const emailPorts: any = {
  MXZLO: ['jorge.contreras@naviomar.com', 'beatriz.centeno@naviomar.com'],
  MXVER: ['raul.gutierrez@naviomar.com'],
  MXLZC: ['juany.avendano@naviomar.com', 'victor.gasca@naviomar.com'],
}

const handleCreated = (editor: any) => {
  editorRef.value = editor
  fillBodyWithData()
}

const handleChange = (editor: any) => {
  // console.log('change:', editor.getHtml())
  valueHtml.value = editor.getHtml()
}

const voyageDestUpdateEtaFormRef = ref<InstanceType<typeof VeeForm> | null>(null)

const voyageDestination = ref<any>({ change_etas: [] as any[] })
const referencias = ref<any>([])

const isImport = computed(() => {
  return voyageDestination.value?.voyage?.impoExpo === 'I'
})

const selectAll = () => {
  referencias.value = referencias.value.map((ref: any) => {
    ref.selected = !ref.selected
    return ref
  })
}

const setNewEtaOnBody = () => {
  if (!voyageDestUpdateEtaFormRef.value?.values.new_eta_date) {
    snackbar.add({ type: 'error', text: 'Please select a new ETA date' })
    return
  }
  const newEta = voyageDestUpdateEtaFormRef.value?.values.new_eta_date
  const body = valueHtml.value.replaceAll('{new_eta_date}', `${newEta}`)
  editorRef.value?.setHtml(body)
}

const resetBodyMessage = () => {
  fillBodyWithData()
}

const resetNewEtaOnBody = () => {
  resetBodyMessage()
  setNewEtaOnBody()
}

const updateEtaClick = async (values: any) => {
  try {
    // if not selected any reference show warning
    if (referencias.value.filter((ref: any) => ref.selected === true).length <= 0) {
      snackbar.add({ type: 'warning', text: 'Please select at least one reference' })
      return
    }

    loadingStore.start()
    let selectedRefs = referencias.value.filter((ref: any) => ref.selected === true) || []
    if (!isImport.value) {
      selectedRefs = referencias.value
    }

    const body = {
      ...values,
      body: valueHtml.value,
    }

    // add selected references
    body.referencias = selectedRefs.map((ref: any) => ref.id) || []

    await $api.voyages.notifyPortByDestinationId(route.params.id!.toString(), body)
    snackbar.add({ type: 'success', text: 'Notification sent.' })
    router.push('/configuration/voyages')
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const getData = async () => {
  try {
    loadingStore.start()
    const response = await $api.voyages.getDestinationEtasById(route.params.id!.toString())
    voyageDestination.value = response

    await getReferencias()
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const getReferencias = async () => {
  try {
    loadingStore.start()
    const response = await $api.voyages.getDestiantionReferenciasById(route.params.id!.toString())
    referencias.value = response
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const fillBodyWithData = () => {
  const tmp = JSON.parse(JSON.stringify(notifyPort.bodyEs))
  const body = tmp.replace('{port}', voyageDestination.value.pod?.name)
  editorRef.value?.setHtml(body)
}

onMounted(() => {
  voyageDestUpdateEtaFormRef.value?.setValues({
    ...voyageDestUpdateEtaFormRef.value?.values,
    subject: `${voyageDestination.value.voyage?.vessel?.line?.name} ${voyageDestination.value.pod?.name} - ${voyageDestination.value.print_bl_name} - ${voyageDestination.value.eta_date} - REF.: CARTA GARANTIA / CREDITO`,
    emails_port: emailPorts[voyageDestination.value.pod?.code].join(', '),
  })
})

await getData()
</script>
