<template>
  <div>
    <v-dialog v-model="props.show" fullscreen>
      <v-card>
        <v-toolbar color="primary">
          <v-btn icon @click="closeDialog">
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <v-toolbar-title>Send arrival notification #{{ referencia.reference_number }}</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn variant="text" base-color="black" class="bg-[#d5a419]! font-bold!" @click="sendArrivalNotification">
              <v-icon>mdi-email-outline</v-icon>Send notification for #{{ referencia.reference_number }}
            </v-btn>
          </v-toolbar-items>
        </v-toolbar>
        <v-card-title>
          <span class="text-h1!">Sending arrival notification number #{{ countArrivalNotys }}</span>
        </v-card-title>
        <v-card-text>
          <div class="grid grid-cols-3 gap-4">
            <div class="col-span-1">TO: Consignee emails *</div>
            <div class="col-span-2 mb-2">
              <v-textarea
                v-model="form.consignee_emails"
                rows="2"
                placeholder="Enter emails separated by comma"
                density="compact"
                hide-details
              />
              <CustomerEmailsWidget
                :customer-id="referencia.consignee_id"
                :notifys="customerNotifys"
                @fetched-emails="setCustomerEmails"
              />
            </div>
          </div>
          <div
            v-if="isFromTracker"
            class="grid grid-cols-3 gap-4 bg-amber-200 dark:bg-amber-900 border-dashed border-2 border-amber-500 p-1"
          >
            <div class="col-span-3">
              <div class="font-bold">Tracker additional emails</div>
            </div>
            <div class="col-span-1">TO: Tracker customer emails *</div>
            <div class="col-span-2">
              <v-textarea
                v-model="form.tracker_customer_emails"
                rows="2"
                placeholder="Emails separated by comma"
                density="compact"
              />
            </div>
            <div class="col-span-1">TO: Tracker agent emails *</div>
            <div class="col-span-2">
              <v-textarea
                v-model="form.tracker_agent_emails"
                rows="2"
                placeholder="Emails separated by comma"
                density="compact"
              />
            </div>
          </div>
          <div class="grid grid-cols-3 gap-4">
            <div class="col-span-1">Additional notes</div>
            <div class="col-span-2">
              <v-textarea v-model="form.notes" density="compact" rows="3" placeholder="Additional notes to add" />
            </div>
            <div class="col-span-1">Attach files (optional)</div>
            <div class="col-span-2">
              <v-file-input
                v-model="form.files"
                density="compact"
                multiple
                counter
                label="Attach additional files (optional)"
              />
            </div>
            <div v-if="hasHouseBlsWithFile" class="col-span-3 grid grid-cols-3">
              <div class="col-span-1">Select House BL(s) to attach file</div>
              <div class="col-span-2">
                <v-select
                  v-model="form.house_bl_ids"
                  :items="houseBlsWithAttachment"
                  item-title="name"
                  item-value="id"
                  label="Select one or more House BL(s) to attach their files"
                  density="compact"
                  multiple
                  chips
                />
              </div>
            </div>
            <div v-if="hasInternalTransit" class="col-span-3 grid grid-cols-3">
              <div class="col-span-1"></div>
              <div class="col-span-2">
                <v-alert density="compact" type="warning" border="top" variant="tonal" elevation="2" colored>
                  <span>Reference has intenral transit, some additional files from line will be attached.</span>
                </v-alert>
              </div>
            </div>
            <div v-if="!hasArrivalNotys" class="col-span-1">Consignee Proforma TM & WM detail</div>
            <div v-if="!hasArrivalNotys" class="col-span-2">
              <div class="grid grid-cols-1 gap-1 mb-2">
                <div v-if="!hasTMConcepts">
                  <v-alert density="compact" type="warning" border="top" elevation="2" colored>
                    <span>There are no TM sell concepts to include in the proforma</span>
                  </v-alert>
                </div>
                <v-btn color="secondary" size="small" @click="previewProforma('tm')">Preview proforma TM</v-btn>
              </div>
              <div class="grid grid-cols-1 gap-1 mb-2">
                <div v-if="!hasWMConcepts">
                  <v-alert density="compact" type="warning" border="top" elevation="2" colored>
                    <span>There are no WM sell concepts to include in the proforma</span>
                  </v-alert>
                </div>
                <v-btn color="secondary" size="small" @click="previewProforma('wm')">Preview proforma WM</v-btn>
              </div>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-dialog v-model="proformaDialog.show" fullscreen>
      <v-card>
        <v-toolbar color="primary">
          <v-btn icon @click="closePreviewProforma">
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <v-toolbar-title>Proforma {{ proformaDialog.type }}</v-toolbar-title>
        </v-toolbar>
        <v-card-text>
          <object ref="pdfViewer" type="application/pdf" width="100%" height="100%"></object>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>
<script setup lang="ts">
import { mailNotifications } from '~/utils/data/systemData'
const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },
  referencia: {
    type: Object,
    required: true,
  },
})

const emits = defineEmits(['close', 'refresh'])

const selectedNames = ['SeaImportNotifyArrival']

const customerNotifys = computed(() => {
  return mailNotifications.filter((notify) => selectedNames.includes(notify.short_name))
})

const form = reactive({
  consignee_emails: '',
  tracker_customer_emails: '',
  tracker_agent_emails: '',

  notes: '',
  files: [],
  house_bl_ids: [],
  include_proforma: false,
  include_proforma_tm: true,
  include_proforma_wm: true,
})

const proformaDialog = ref<any>({ type: null, show: false })
const pdfViewer = ref<any>(null)

const isFromTracker = computed(() => {
  return props.referencia.source_system_id === 2
})

const hasHouseBlsWithFile = computed(() => {
  return props.referencia.house_bls.length > 0 && props.referencia.house_bls.some((bl: any) => bl.attachment)
})

const hasArrivalNotys = computed(() => {
  return props.referencia.arrival_notys.length > 0
})

const countArrivalNotys = computed(() => {
  return props.referencia.arrival_notys.length + 1
})

const houseBlsWithAttachment = computed(() => {
  return props.referencia.house_bls.filter((bl: any) => bl.attachment)
})

const hasInternalTransit = computed(() => {
  return props.referencia.internal_transit === 1
})

const hasTMConcepts = computed(() => {
  const hasTmCharges = props.referencia.charges.some((c: any) => c.inv_type === 'tm')
  const hasTmSellCharges = props.referencia.sell_rate_breakdown.some((c: any) => c.inv_type === 'tm')
  return hasTmCharges || hasTmSellCharges
})

const hasWMConcepts = computed(() => {
  const hasWmCharges = props.referencia.charges.some((c: any) => c.inv_type === 'wm')
  const hasWmSellCharges = props.referencia.sell_rate_breakdown.some((c: any) => c.inv_type === 'wm')
  return hasWmCharges || hasWmSellCharges
})

const previewProforma = async (type: string) => {
  proformaDialog.value.show = true
  proformaDialog.value.type = type
  try {
    loadingStore.start()

    const body = {
      proforma_type: type,
    }
    const response = await $api.referencias.showProforma(props.referencia.id, body)

    const blob = new Blob([response as any], { type: 'application/pdf' })
    const pdfUrl = URL.createObjectURL(blob)
    pdfViewer.value.data = pdfUrl

    snackbar.add({ type: 'success', text: 'Proforma generated' })
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const closePreviewProforma = () => {
  proformaDialog.value.show = false
}

const closeDialog = () => {
  emits('close')
}

const isValidForm = () => {
  return form.consignee_emails
}

const sendArrivalNotification = async () => {
  try {
    if (!isValidForm()) {
      snackbar.add({ type: 'error', text: 'Please fill all required fields' })
      return
    }
    loadingStore.start()

    const response = await $api.referencias.sendSeaImportNotifyArrival(props.referencia.id, form)

    snackbar.add({ type: 'success', text: 'Arrival notification sent successfully' })

    emits('refresh')
    emits('close')
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const setCustomerEmails = (emails: string) => {
  form.consignee_emails = emails
}

onMounted(() => {
  if (isFromTracker.value) {
    form.tracker_customer_emails = props.referencia.tracker_ref?.prealert_email
    form.tracker_agent_emails = props.referencia.tracker_ref?.prealert_email_agents
  }
})
</script>
