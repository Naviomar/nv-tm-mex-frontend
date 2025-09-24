<template>
  <div>
    <VeeForm @submit="updateEtaClick" :validation-schema="schemaDestUpdateEta" ref="voyageDestUpdateEtaFormRef">
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
          <div class="bg-green-lighten-4 p-5 font-bold text-lg flex items-center">
            <v-icon>mdi-update</v-icon>Current ETA: {{ formatDateOnlyString(voyageDestination?.eta_date) }}
          </div>
          <div class="bg-green-lighten-3 p-5">
            <InputText name="new_eta_date" type="date" label="Select new ETA" @change="resetNewEtaOnBody" />
          </div>
          <div>
            <InputTextArea name="emails_internal" density="compact" label="Additional emails" />
          </div>
          <div>
            <InputText name="subject" density="compact" label="Subject *" />
          </div>
          <div v-if="false">
            <div class="flex gap-4">
              <v-btn size="small" color="amber" @click="setNewEtaOnBody">Set new ETA in body message</v-btn>
              <v-btn size="small" color="red" @click="resetBodyMessage">Reset body message</v-btn>
            </div>
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
                style="height: 600px; overflow-y: hidden"
                @onCreated="handleCreated"
                @onChange="handleChange"
              />
            </ClientOnly>
          </div>
          <div>
            <InputTextArea name="notes" density="compact" label="Internal notes" />
          </div>
          <div>
            <InputFile name="archivos" density="compact" label="Support files" :multiple="true" />
          </div>
          <div>
            <v-btn color="primary" @click="confirmUpdateEtaClick" :disabled="loadingStore.loading"
              >Update ETA & Notify</v-btn
            >
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
                    <td v-if="isImport">
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
          <v-card density="compact" color="light-blue-lighten-5" class="mb-4">
            <v-card-title>
              <div>ETA previous notification(s)</div>
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
import { updateEtaBody } from '~/utils/data/seaExportData'
import { schemaDestUpdateEta } from '~~/forms/voyageForm'
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

    await $api.voyages.updateDestinationEtaById(route.params.id!.toString(), body)
    snackbar.add({ type: 'success', text: 'ETA updated' })
    router.push('/configuration/voyages')
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const confirmUpdateEtaClick = async () => {
  const { valid } = await voyageDestUpdateEtaFormRef!.value!.validate()
  if (!valid) {
    snackbar.add({ type: 'error', text: 'Please fill all required fields' })
    return
  }
  const result = await confirm({
    title: 'Confirm update ETA',
    confirmationText: 'Yes update ETA and notify',
    content: 'Please confirm you want to update the ETA of this voyage destination.',
    dialogProps: {
      persistent: true,
      maxWidth: 500,
    },
    confirmationButtonProps: {
      color: 'primary',
    },
  })

  if (result) {
    voyageDestUpdateEtaFormRef?.value?.onSubmit()
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

await getData()

const fillBodyWithData = () => {
  const tmp = JSON.parse(JSON.stringify(updateEtaBody.bodyEs))
  const body = tmp
    .replace('{vessel}', voyageDestination.value.short_name)
    .replace('{port}', voyageDestination.value.pod?.name)
  editorRef.value?.setHtml(body)
  console.log('body:', body)
}

onMounted(() => {
  voyageDestUpdateEtaFormRef.value?.setValues({
    subject: `Update ETA ${voyageDestination.value.short_name}`,
  })
})
</script>
