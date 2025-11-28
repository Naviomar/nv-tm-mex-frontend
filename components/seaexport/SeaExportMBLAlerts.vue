<template>
  <div>
    <div class="flex items-center text-base gap-2">
      <v-icon size="x-small">mdi-ship-wheel</v-icon>
      <div>Sea Export information #{{ referencia.reference_number }}</div>
    </div>
    <v-card>
      <v-card-title> Alerts module</v-card-title>
      <v-card-subtitle> Send alerts module</v-card-subtitle>
      <v-card-text>
        <div class="grid grid-cols-2 gap-2">
          <div class="flex flex-col gap-4">
            <v-card color="light-blue-lighten-4">
              <v-card-title> Draft BL logs</v-card-title>
              <v-card-text>
                <v-table density="compact" class="border border-solid">
                  <thead>
                    <tr>
                      <th class="font-bold!">Sent date</th>
                      <th class="font-bold!">Email(s)</th>
                      <th class="font-bold!">User</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-if="!hasDraftBls">
                      <td colspan="3" class="text-center">No data</td>
                    </tr>
                    <tr v-if="hasDraftBls" v-for="item in alerts.drafts" :key="`alert-draft-${item.id}`">
                      <td>{{ formatDateString(item.created_at) }}</td>
                      <td>{{ item.emails }}</td>
                      <td>{{ item.creator?.name }}</td>
                    </tr>
                  </tbody>
                </v-table>
              </v-card-text>
            </v-card>
            <v-card color="light-blue-lighten-4">
              <v-card-title> First pre-alert logs</v-card-title>
              <v-card-text>
                <v-table density="compact" class="border border-solid">
                  <thead>
                    <tr>
                      <th class="font-bold!">Sent date</th>
                      <th class="font-bold!">Email(s)</th>
                      <th class="font-bold!">User</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-if="!hasPreAlerts">
                      <td colspan="3" class="text-center">No data</td>
                    </tr>
                    <tr v-if="hasPreAlerts" v-for="item in alerts.prealerts" :key="`alert-pre-${item.id}`">
                      <td>{{ formatDateString(item.created_at) }}</td>
                      <td>{{ item.emails }}</td>
                      <td>{{ item.creator?.name }}</td>
                    </tr>
                  </tbody>
                </v-table>
              </v-card-text>
            </v-card>

            <v-card color="light-blue-lighten-4">
              <v-card-title> Final pre-alert logs</v-card-title>
              <v-card-text>
                <v-table density="compact" class="border border-solid">
                  <thead>
                    <tr>
                      <th class="font-bold!">Sent date</th>
                      <th class="font-bold!">Email(s)</th>
                      <th class="font-bold!">User</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-if="!hasFinalAlerts">
                      <td colspan="3" class="text-center">No data</td>
                    </tr>
                    <tr v-if="hasFinalAlerts" v-for="item in alerts.finals" :key="`alert-final-${item.id}`">
                      <td>{{ formatDateString(item.created_at) }}</td>
                      <td>{{ item.emails }}</td>
                      <td>{{ item.creator?.name }}</td>
                    </tr>
                  </tbody>
                </v-table>
              </v-card-text>
            </v-card>
          </div>
          <div>
            <div v-if="!hasBlType">
              <v-alert type="warning" density="compact">
                <v-icon>mdi-alert</v-icon> This reference does not have a BL type
              </v-alert>
            </div>
            <div v-if="hasBlType">
              <div class="grid grid-cols-1 gap-4">
                <div class="text-lg font-bold">BL Type: {{ referencia.bl_type }}</div>

                <div class="text-lg font-bold">Available actions</div>
                <v-btn color="primary" @click="onClickDraftBl">Send draft BL</v-btn>
                <v-btn v-if="!isBlTypeMaster" color="primary" @click="onClickPrealert">Send pre-alert</v-btn>
                <v-btn v-if="!isBlTypeMaster" color="primary" @click="onClickFinalAlert">Send final alert</v-btn>

              </div>

              <div class="font-bold text-base py-4">Setup Final BL attachments</div>
              <v-table density="compact">
                <thead>
                  <tr>
                    <th class="text-left">Master BL #</th>
                    <th class="text-left">Attachment</th>
                    <th class="text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in referencia.master_bls" :key="`mbl-${index}`">
                    <td>{{ item.name }}</td>
                    <td>
                      <div v-if="item.attachment">
                        <ButtonDownloadS3Object :s3Path="item.attachment" />
                      </div>
                      <div v-if="!item.attachment">Pending final BL attachment</div>
                    </td>
                    <td>
                      <div class="flex flex-col gap-2">
                        <v-file-input v-model="item.new_file" label="Add attachment" density="compact" hide-details />
                        <v-btn color="primary" size="small" @click="uploadMasterBlFile(item)"> Upload file </v-btn>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </v-table>

              <v-table density="compact">
                <thead>
                  <tr>
                    <th class="text-left">House BL #</th>
                    <th class="text-left">Attachment</th>
                    <th class="text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in referencia.house_bls" :key="`mbl-${index}`">
                    <td>{{ item.name }}</td>
                    <td>
                      <div v-if="item.attachment">
                        <ButtonDownloadS3Object :s3Path="item.attachment" />
                      </div>
                      <div v-if="!item.attachment">Pending final BL attachment</div>
                    </td>
                    <td>
                      <div class="flex flex-col gap-2">
                        <v-file-input v-model="item.new_file" label="Add attachment" density="compact" hide-details />
                        <v-btn color="primary" size="small" @click="uploadHouseBlFile(item)"> Upload file </v-btn>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </v-table>
            </div>
          </div>
        </div>
      </v-card-text>
    </v-card>
    <v-dialog v-model="draftBl.showDialog" max-width="800">
      <v-card>
        <v-card-title>Send draft BL</v-card-title>
        <v-card-text>
          <div v-if="!canSendDraftBl">
            <v-alert type="warning" density="compact">
              <v-icon>mdi-alert</v-icon> You can't send a draft BL yet. Missing requirements:
              {{ referencia.bl_type === 'master' ? 'Master BL attachment' : 'Print BL' }}
            </v-alert>
          </div>
          <div v-if="canSendDraftBl">
            <v-autocomplete
              v-model="draftBl.houseBls"
              label="Select a printed House BL"
              :items="printedHouseBls"
              item-title="name"
              item-value="id"
              density="compact"
              multiple
            />
            <v-textarea
              v-model="draftBl.emails"
              label="Customer emails"
              hint="Separate emails with commas"
              rows="3"
              density="compact"
              clearable
              hide-details
            />
            <CustomerEmailsWidget
              :customer-id="referencia.consignee_id"
              :notifys="customerNotifys"
              @fetched-emails="setDraftBlEmails"
            />

            <div class="font-bold">Body message</div>
            <div class="grid grid-cols-2 gap-2 max-w-64">
              <v-btn size="small" color="blue-lighten-3" @click="changeDraftBody('en')">English</v-btn>
              <v-btn size="small" color="blue-lighten-3" @click="changeDraftBody('es')">Español</v-btn>
            </div>
            <div style="border: 1px solid #ccc">
              <ClientOnly>
                <Toolbar
                  :editor="editorDraftRef"
                  :defaultConfig="toolbarConfig"
                  mode="default"
                  style="border-bottom: 1px solid #ccc"
                />
                <Editor
                  :defaultConfig="editorConfig"
                  mode="default"
                  v-model="draftBl.bodyHtml"
                  style="height: 500px"
                  @onCreated="handleDraftCreatedEditor"
                  @onChange="handleDraftChangeEditor"
                />
              </ClientOnly>
            </div>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-btn color="secondary" @click="draftBl.showDialog = false">Cancel</v-btn>
          <v-btn color="primary" @click="onClickDraftBl2">Send</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="preAlert.showDialog" max-width="800">
      <v-card>
        <v-card-title>Send pre-alert</v-card-title>
        <v-card-text>
          <v-autocomplete
            v-model="preAlert.houseBls"
            label="Select a printed house BLs"
            :items="printedHouseBls"
            item-title="name"
            item-value="id"
            density="compact"
            multiple
          />
          <v-textarea
            v-model="preAlert.emails"
            label="F.F. agent emails"
            hint="Separate emails with commas"
            rows="3"
            density="compact"
            clearable
          />
          <FFagentEmailsWidget :id="referencia.freight_forwarder_id" @fetched-emails="setPreAlertEmails" />

          <div class="font-bold">Body message</div>
          <div class="grid grid-cols-2 gap-2 max-w-64">
            <v-btn size="small" color="blue-lighten-3" @click="changePrealertBody('en')">English</v-btn>
            <v-btn size="small" color="blue-lighten-3" @click="changePrealertBody('es')">Español</v-btn>
          </div>
          <div style="border: 1px solid #ccc">
            <ClientOnly>
              <Toolbar
                :editor="editorPrealertRef"
                :defaultConfig="toolbarConfig"
                mode="default"
                style="border-bottom: 1px solid #ccc"
              />
              <Editor
                :defaultConfig="editorConfig"
                mode="default"
                v-model="preAlert.bodyHtml"
                style="height: 300px"
                @onCreated="handlePreAlertCreatedEditor"
                @onChange="handlePreAlertChangeEditor"
              />
            </ClientOnly>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-btn color="secondary" @click="preAlert.showDialog = false">Cancel</v-btn>
          <v-btn color="primary" @click="onClickPrealert2">Send</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="finalAlert.showDialog" max-width="800">
      <v-card>
        <v-card-title>Send Final Alert</v-card-title>
        <v-card-text v-if="!hasFinalMasterBlFile">
          <v-alert type="warning" density="compact">
            <v-icon>mdi-alert</v-icon> You can't send a final alert yet, you need to upload the final master BL file
          </v-alert>
        </v-card-text>
        <v-card-text v-if="hasFinalMasterBlFile">
          <v-textarea
            v-model="finalAlert.emails"
            label="F.F. agent emails"
            hint="Separate emails with commas"
            rows="3"
            density="compact"
            clearable
            hide-details
          />
          <FFagentEmailsWidget :id="referencia.freight_forwarder_id" @fetched-emails="setFinalAlertEmails" />

          <div class="font-bold">Body message</div>
          <div class="grid grid-cols-2 gap-2 max-w-64">
            <v-btn size="small" color="blue-lighten-3" @click="changeFinalAlertBody('en')">English</v-btn>
            <v-btn size="small" color="blue-lighten-3" @click="changeFinalAlertBody('es')">Español</v-btn>
          </div>
          <div style="border: 1px solid #ccc">
            <ClientOnly>
              <Toolbar
                :editor="editorFinalAlertRef"
                :defaultConfig="toolbarConfig"
                mode="default"
                style="border-bottom: 1px solid #ccc"
              />
              <Editor
                :defaultConfig="editorConfig"
                mode="default"
                v-model="finalAlert.bodyHtml"
                style="height: 300px"
                @onCreated="handleFinalAlertCreatedEditor"
                @onChange="handleFinalAlertChangeEditor"
              />
            </ClientOnly>
          </div>
          <div class="px-4 mt-2">
            Select F.F. agent notes from TM
            <v-autocomplete
              v-model="finalAlert.notes"
              :items="ffTmAgentNotes"
              :item-title="(row: any) => {
                return `#${row.id} - ${row.type === 'C' ? 'Credit' : 'Debit'} - ${formatToCurrency(row.amount_total)} - ${row.forwarder?.name}`
              }"
              item-value="id"
              label="F.F. agent notes"
              density="compact"
              multiple
              hide-detials
            />
          </div>
          <div class="px-4">
            Upload additional files (optional)
            <v-file-input
              v-model="finalAlert.attachments"
              density="compact"
              multiple
              label="Additional files"
              hide-detials
            />
          </div>
        </v-card-text>
        <v-card-actions>
          <v-btn color="secondary" @click="finalAlert.showDialog = false">Cancel</v-btn>
          <v-btn color="primary" @click="onClickFinalAlert2">Send</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script setup lang="ts">
import { mailNotifications } from '~/utils/data/systemData'
import { draftBlBody, preAlertBody, finalAlertBody } from '~/utils/data/seaExportData'
const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()

const props = defineProps({
  id: {
    type: [String, Number],
    required: true,
  },
})

const selectedNames = ['SeaExportAlertDraftBl']

const customerNotifys = computed(() => {
  return mailNotifications.filter((notify) => selectedNames.includes(notify.short_name))
})

const ffTmAgentNotes = ref<any>([])

const editorDraftRef = ref<any>()
const editorPrealertRef = ref<any>()
const editorFinalAlertRef = ref<any>()

const toolbarConfig = {}
const editorConfig = { placeholder: 'ADTV' }

const handleDraftCreatedEditor = (editor: any) => {
  editorDraftRef.value = editor
}

const handleDraftChangeEditor = (editor: any) => {
  // console.log('change:', editor.getHtml())
  // draftBlBodyHtml.value = editor.getHtml()
}

const handlePreAlertCreatedEditor = (editor: any) => {
  editorPrealertRef.value = editor
}

const handlePreAlertChangeEditor = (editor: any) => {
  // console.log('change:', editor.getHtml())
  // draftBlBodyHtml.value = editor.getHtml()
}

const handleFinalAlertCreatedEditor = (editor: any) => {
  editorFinalAlertRef.value = editor
}

const handleFinalAlertChangeEditor = (editor: any) => {
  // console.log('change:', editor.getHtml())
  // draftBlBodyHtml.value = editor.getHtml()
}

const referencia = ref<any>({})
const draftBlBodyHtml = ref<any>('')
const preAlertBodyHtml = ref<any>('')
const finalAlertBodyHtml = ref<any>('')

const alerts = ref<any>({
  drafts: [],
  prealerts: [],
  finals: [],
})

const draftBl = ref<any>({
  showDialog: false,
  houseBls: [],
  emails: '',
})

const preAlert = ref<any>({
  showDialog: false,
  houseBls: [],
  emails: '',
})

const finalAlert = ref<any>({
  showDialog: false,
  emails: '',
  notes: null,
  attachments: [],
})

const hasDraftBls = computed(() => alerts.value.drafts.length > 0)
const hasPreAlerts = computed(() => alerts.value.prealerts.length > 0)
const hasFinalAlerts = computed(() => alerts.value.finals.length > 0)

const hasPrintBl = computed(() => referencia.value.house_bls.some((item: any) => item.print_bl != null))
const hasBlType = computed(() => referencia.value.bl_type != null)
const isBlTypeMaster = computed(() => referencia.value.bl_type === 'master')
const hasMasterBlAttachment = computed(() => referencia.value.master_bls.some((item: any) => item.attachment != null))
const hasFinalMasterBlFile = computed(() => referencia.value.master_bls.every((item: any) => item.attachment != null))
const printedHouseBls = computed(() => referencia.value.house_bls.filter((item: any) => item.print_bl != null))

const canSendDraftBl = computed(() => {
  if (!hasBlType.value) return false
  if (referencia.value.bl_type === 'master' && !hasMasterBlAttachment.value) return false
  if (referencia.value.bl_type === 'house' && !hasPrintBl.value) return false
  return true
})

const onClickDraftBl = () => {
  draftBl.value.showDialog = true
  setTimeout(() => {
    draftBlBodyHtml.value = draftBlBody.bodyEs
    fillDraftBodyWithData()
  }, 200)
}

const onClickPrealert = () => {
  preAlert.value.showDialog = true
  setTimeout(() => {
    preAlertBodyHtml.value = preAlertBody.bodyEs
    fillPreAlertBodyWithData()
  }, 200)
}

const onClickFinalAlert = () => {
  finalAlert.value.showDialog = true
  setTimeout(() => {
    finalAlertBodyHtml.value = finalAlertBody.bodyEs
    fillFinalAlertBodyWithData()
  }, 200)
}

const setDraftBlEmails = (emails: string) => {
  draftBl.value.emails = emails
}

const setPreAlertEmails = (emails: string) => {
  preAlert.value.emails = emails
}

const setFinalAlertEmails = (emails: string) => {
  finalAlert.value.emails = emails
}

const changeDraftBody = (lang: string) => {
  if (lang === 'en') {
    draftBlBodyHtml.value = draftBlBody.bodyEn
  } else {
    draftBlBodyHtml.value = draftBlBody.bodyEs
  }
  editorDraftRef.value?.setHtml(draftBlBodyHtml.value)
  fillDraftBodyWithData()
}

const fillDraftBodyWithData = () => {
  const tmp = toRaw(draftBlBodyHtml.value)
  const body = tmp.replace('{departure_date}', referencia.value.departure_date)

  editorDraftRef.value?.setHtml(body)
}

const changePrealertBody = (lang: string) => {
  if (lang === 'en') {
    preAlertBodyHtml.value = preAlertBody.bodyEn
  } else {
    preAlertBodyHtml.value = preAlertBody.bodyEs
  }
  editorPrealertRef.value?.setHtml(preAlertBodyHtml.value)
  fillPreAlertBodyWithData()
}

const fillPreAlertBodyWithData = () => {
  const tmp = toRaw(preAlertBodyHtml.value)
  const body = tmp
    .replace('{departure_date}', referencia.value.voyage_discharge?.eta_date)
    .replace('{line_name}', referencia.value.line?.name)
    .replace('{shipper}', referencia.value.consignee?.name)
    .replace('{consignee}', referencia.value.shipper?.name)
    .replace('{housebls}', referencia.value.house_bls.map((item: any) => item.name).join(', '))
    .replace('{masterbls}', referencia.value.master_bls.map((item: any) => item.name).join(', '))

  editorPrealertRef.value?.setHtml(body)
}

const changeFinalAlertBody = (lang: string) => {
  if (lang === 'en') {
    finalAlertBodyHtml.value = finalAlertBody.bodyEn
  } else {
    finalAlertBodyHtml.value = finalAlertBody.bodyEs
  }
  editorFinalAlertRef.value?.setHtml(finalAlertBodyHtml.value)
  fillFinalAlertBodyWithData()
}

const fillFinalAlertBodyWithData = () => {
  const tmp = toRaw(finalAlertBodyHtml.value)
  const body = tmp
    .replace('{departure_date}', referencia.value.voyage_discharge?.eta_date)
    .replace('{line_name}', referencia.value.line?.name)
    .replace('{shipper}', referencia.value.consignee?.name)
    .replace('{consignee}', referencia.value.shipper?.name)
    .replace('{housebls}', referencia.value.house_bls.map((item: any) => item.name).join(', '))
    .replace('{masterbls}', referencia.value.master_bls.map((item: any) => item.name).join(', '))

  editorFinalAlertRef.value?.setHtml(body)
}

const uploadMasterBlFile = async (item: any) => {
  try {
    if (!item.new_file) {
      snackbar.add({ type: 'warning', text: 'Select a file to upload' })
      return
    }
    loadingStore.start()
    const body = {
      master_bl_id: item.id,
      attachment: item.new_file,
    }
    await $api.referenciasExport.uploadMasterBlFile(props.id.toString(), body)
    snackbar.add({ type: 'success', text: 'File uploaded successfully' })
    await getSeaExportAlerts()
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const uploadHouseBlFile = async (item: any) => {
  try {
    if (!item.new_file) {
      snackbar.add({ type: 'warning', text: 'Select a file to upload' })
      return
    }
    loadingStore.start()
    const body = {
      house_bl_id: item.id,
      attachment: item.new_file,
    }
    await $api.referenciasExport.uploadHouseBlFile(props.id.toString(), body)
    snackbar.add({ type: 'success', text: 'File uploaded successfully' })
    await getSeaExportAlerts()
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const onClickDraftBl2 = async () => {
  try {
    if (draftBl.value.houseBls.length === 0) {
      snackbar.add({ type: 'warning', text: 'Select at least one house BL' })
      return
    }
    loadingStore.start()
    const body = {
      houseBlIds: draftBl.value.houseBls,
      emails: draftBl.value.emails,
      body: editorDraftRef.value?.getHtml(),
    }
    await $api.referenciasExport.sendAlertDraftBl(props.id.toString(), body)

    snackbar.add({ type: 'success', text: 'Draft BL sent successfully' })

    await getSeaExportAlerts()
    draftBl.value.showDialog = false
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const onClickPrealert2 = async () => {
  try {
    if (preAlert.value.houseBls.length === 0) {
      snackbar.add({ type: 'warning', text: 'Select at least one house BL' })
      return
    }
    loadingStore.start()
    const body = {
      emails: preAlert.value.emails,
      houseBlIds: preAlert.value.houseBls,
      body: editorPrealertRef.value?.getHtml(),
    }
    const response = await $api.referenciasExport.sendPreAlert(props.id.toString(), body)

    snackbar.add({ type: 'success', text: 'Pre-alert sent successfully' })

    await getSeaExportAlerts()
    preAlert.value.showDialog = false
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const onClickFinalAlert2 = async () => {
  try {
    // TODO validar que se haya realizado el Print BL y zarpado el barco
    loadingStore.start()
    const body = {
      emails: finalAlert.value.emails,
      body: editorFinalAlertRef.value?.getHtml(),
      notes: finalAlert.value.notes,
      attachments: finalAlert.value.attachments,
    }
    await $api.referenciasExport.sendAlertFinal(props.id.toString(), body)

    snackbar.add({ type: 'success', text: 'Final Alert sent successfully' })

    await getSeaExportAlerts()
    finalAlert.value.showDialog = false
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const getSeaExportAlerts = async () => {
  try {
    loadingStore.start()
    const response = (await $api.referenciasExport.getAlerts(props.id.toString())) as any
    referencia.value = response

    alerts.value.drafts = response.export_alerts.filter((item: any) => item.type === 'draft')
    alerts.value.prealerts = response.export_alerts.filter((item: any) => item.type === 'pre')
    alerts.value.finals = response.export_alerts.filter((item: any) => item.type === 'final')

    ffTmAgentNotes.value = response.ff_notes.filter((item: any) => item.inbound === 0)
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

await getSeaExportAlerts()
</script>
