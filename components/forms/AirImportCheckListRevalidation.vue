<template>
  <div>
    <div class="text-center mb-2">
      <v-btn color="lime" size="small" @click="getAirReferenceChecklist">Consultar validaciones</v-btn>
    </div>
    <div v-if="checklist.pulledData" class="text-center mb-2 font-bold text-xl">
      <h2>{{ checklist.consignee }}</h2>
    </div>
    <table class="w-2/4 mx-auto">
      <thead>
        <tr class="bg-slate-100 text-left">
          <th class="p-2">Validación</th>
          <th class="p-2">Resultado</th>
        </tr>
      </thead>
      <tbody v-if="checklist.pulledData">
        <tr>
          <td class="p-2 font-medium">Fecha de consulta</td>
          <td class="p-2">
            {{
              new Intl.DateTimeFormat('es-MX', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              }).format(new Date())
            }}
          </td>
        </tr>

        <tr>
          <td class="p-2 font-medium">Referencia con crédito</td>
          <td class="p-2">
            <span :class="checklist.referencia_has_credit ? 'text-green-600 font-bold' : 'text-red-600 font-bold'">
              <span v-if="checklist.referencia_credito_vencido"> VENCIDO </span>
              <span v-if="!checklist.referencia_credito_vencido">
                {{ checklist.referencia_has_credit ? 'SI' : 'NO' }}
              </span>
            </span>
            <div v-if="checklist.referencia_credit_due_date" class="text-xs text-gray-500 dark:text-white">
              (vecimiento {{ checklist.referencia_credit_due_date }})
            </div>
          </td>
        </tr>

        <tr>
          <td class="p-2">
            <div class="font-medium">Cargos sin facturar</div>
            <div class="text-xs text-gray-500 dark:text-white">En la referencia</div>
          </td>
          <td class="p-2">
            <div v-if="checklist.referencia_has_credit">
              <span class="text-green-600 font-bold"> CRÉDITO </span>
            </div>
            <div v-if="!checklist.referencia_has_credit">
              <span
                :class="
                  checklist.sell_charges_pending_invoice?.length > 0
                    ? 'text-red-600 font-bold'
                    : 'text-green-600 font-bold'
                "
              >
                {{
                  checklist.sell_charges_pending_invoice?.length > 0
                    ? checklist.sell_charges_pending_invoice.length + ' cargos'
                    : 'NINGUNO'
                }}
              </span>
            </div>
          </td>
        </tr>

        <tr>
          <td class="p-2 font-medium">Facturas pendientes de esta referencia</td>
          <td class="p-2">
            <div v-if="checklist.referencia_has_credit">
              <span class="text-green-600 font-bold"> CRÉDITO </span>
            </div>
            <div v-if="!checklist.referencia_has_credit">
              <span
                :class="
                  checklist.unpaid_invoices_by_referencia?.length > 0
                    ? 'text-red-600 font-bold'
                    : 'text-green-600 font-bold'
                "
              >
                {{ checklist.unpaid_invoices_by_referencia?.length }} factura(s)
              </span>
              <v-icon
                v-if="checklist.unpaid_invoices_by_referencia?.length > 0"
                class="ml-2 cursor-pointer"
                size="18"
                @click="dialog.unpaidFacturas = true"
              >
                mdi-information-outline
              </v-icon>
            </div>
          </td>
        </tr>

        <tr>
          <td class="p-2 font-medium">Facturas aéreas de otras referencias</td>
          <td class="p-2">
            <span
              :class="
                checklist.unpaid_air_invoices_other_references?.length > 0
                  ? 'text-red-600 font-bold'
                  : 'text-green-600 font-bold'
              "
            >
              {{ checklist.unpaid_air_invoices_other_references?.length }} factura(s)
            </span>
            <v-icon
              v-if="checklist.unpaid_air_invoices_other_references?.length"
              class="ml-2 cursor-pointer"
              size="18"
              @click="dialog.unpaidOtherAirInvoices = true"
            >
              mdi-information-outline
            </v-icon>
          </td>
        </tr>

        <tr>
          <td class="p-2 font-medium">Facturas marítimas pendientes</td>
          <td class="p-2">
            <div v-if="checklist.skip_sea_invoice_validation">
              <span class="text-green-600 font-bold"> OMITIDO </span>
            </div>
            <div v-else>
              <span
                :class="
                  checklist.unpaid_sea_invoices?.length > 0 ? 'text-red-600 font-bold' : 'text-green-600 font-bold'
                "
              >
                {{ checklist.unpaid_sea_invoices?.length }} factura(s)
              </span>
              <v-icon
                v-if="checklist.unpaid_sea_invoices?.length"
                class="ml-2 cursor-pointer"
                size="18"
                @click="dialog.unpaidSeaInvoices = true"
              >
                mdi-information-outline
              </v-icon>
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="!checklist.pulledData" class="text-center">
      <p class="text-sm">No se han consultado validaciones.</p>
      <p class="text-xs">Presiona el botón "Consultar validaciones" para obtener los resultados.</p>
    </div>

    <div v-if="checklist.pulledData" class="text-center">
      <v-autocomplete
        v-model="form.agente"
        :items="checklist.agentes"
        item-title="short_name"
        item-value="short_name"
        label="Agente Aduanal"
        outlined
        class="w-2/4 mx-auto mt-4"
        hide-details
      />

      <v-textarea
        v-model="form.comments"
        label="Comentarios sobre la consulta"
        rows="3"
        outlined
        class="w-2/4 mx-auto mt-4"
        hide-details
      />
    </div>

    <div class="flex justify-center gap-2 my-4">
      <v-btn v-if="checklist.pulledData" color="primary" size="small" @click="save">
        <v-icon>mdi-content-save</v-icon>
        Save snapshot
      </v-btn>
      <v-btn v-if="hasSnapshots" color="purple" size="small" @click="downloadPdf">
        <v-icon>mdi-eye-outline</v-icon>
        Preview PDF
      </v-btn>
    </div>

    <v-alert
      v-if="checklist.pulledData && !hasSnapshots"
      type="warning"
      variant="outlined"
      class="mt-2"
      density="compact"
    >
      No hay snapshots guardados. Guarde el primero para poder descargar el formato.
    </v-alert>

    <v-dialog v-model="dialog.unpaidFacturas" max-width="600">
      <v-card>
        <v-card-title class="text-lg font-semibold"> Facturas pendientes de esta referencia </v-card-title>
        <v-card-text>
          <v-table density="compact">
            <thead>
              <tr>
                <th>Número</th>
                <th>Monto</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="invoice in checklist.unpaid_invoices_by_referencia" :key="`ref-unpaid-inv-${invoice.id}`">
                <td>{{ invoice.invoice_number ?? '—' }}</td>
                <td>{{ getCurrencyName(invoice.currency_id) }} {{ formatToCurrency(invoice.total) }}</td>
              </tr>
            </tbody>
          </v-table>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="flat" color="primary" @click="dialog.unpaidFacturas = false">Cerrar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="dialog.unpaidOtherAirInvoices" max-width="700">
      <v-card>
        <v-card-title class="text-lg font-semibold"> Facturas aéreas de otras referencias </v-card-title>
        <v-card-text>
          <v-table density="compact">
            <thead>
              <tr>
                <th>Referencia</th>
                <th>Número</th>
                <th>Monto</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="invoice in checklist.unpaid_air_invoices_other_references" :key="`air-inv-${invoice.id}`">
                <td>
                  {{
                    invoice.invoiceable.services
                      .map((service: any) => service.air_reference?.reference_number)
                      .join(', ')
                  }}
                </td>
                <td>{{ invoice.invoice_number ?? '—' }}</td>
                <td>{{ getCurrencyName(invoice.currency_id) }} {{ formatToCurrency(invoice.total) }}</td>
                <td>
                  <UserInfoBadge :item="invoice">
                    {{ formatDateString(invoice.created_at) }}
                  </UserInfoBadge>
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="flat" color="primary" @click="dialog.unpaidOtherAirInvoices = false">Cerrar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="dialog.unpaidSeaInvoices" max-width="700">
      <v-card>
        <v-card-title class="text-lg font-semibold"> Facturas marítimas pendientes de pago </v-card-title>
        <v-card-text>
          <v-table density="compact">
            <thead>
              <tr>
                <th>Referencia</th>
                <th>Número</th>
                <th>Monto</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="invoice in checklist.unpaid_sea_invoices" :key="`sea-inv-${invoice.id}`">
                <td>
                  {{
                    invoice.invoiceable.services
                      .map((service: any) => service.referencia?.reference_number)
                      .join(', ')
                  }}
                </td>
                <td>{{ invoice.invoice_number ?? '—' }}</td>
                <td>{{ getCurrencyName(invoice.currency_id) }} {{ formatToCurrency(invoice.total) }}</td>
                <td>
                  <UserInfoBadge :item="invoice">
                    {{ formatDateString(invoice.created_at) }}
                  </UserInfoBadge>
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="flat" color="primary" @click="dialog.unpaidSeaInvoices = false">Cerrar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="showPdfDialog" fullscreen>
      <v-card>
        <v-toolbar color="primary" dark>
          <v-btn icon @click="showPdfDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <v-toolbar-title>PDF Viewer</v-toolbar-title>
          <v-spacer></v-spacer>
        </v-toolbar>
        <v-card-text>
          <v-card class="mb-4" color="blue-lighten-4">
            <v-card-title class="text-lg font-semibold">Send Checklist via Email</v-card-title>
            <v-card-text>
              <div class="py-4">
                <v-textarea
                  v-model="formSend.emails"
                  rows="2"
                  placeholder="Enter emails separated by comma"
                  density="compact"
                  hide-details
                />
                <CustomerEmailsWidget
                  :customer-id="props.reference.consignee_id"
                  :notifys="customerNotifys"
                  :airport-id="props.reference.arrival_airport_id"
                  :custom-agent-id="props.reference.custom_agent_id"
                  @fetched-emails="setCustomerEmails"
                />

                <div class="mt-2">
                  <v-textarea
                    v-model="formSend.comments"
                    rows="3"
                    placeholder="Additional comments for the PDF"
                    density="compact"
                    hide-details
                  />
                </div>

                <div class="flex justify-end mt-2">
                  <v-btn color="blue-darken-4" size="small" @click="sendChecklist">
                    <v-icon>mdi-send-outline</v-icon>
                    Send checklist via email
                  </v-btn>
                </div>
              </div>
            </v-card-text>
          </v-card>
          <iframe :src="pdfUrl ?? ''" width="100%" height="100%" allowfullscreen></iframe>

          <object v-if="pdfUrl" :data="pdfUrl ?? ''" type="application/pdf" width="100%" height="100%">
            <p>Your browser does not support PDFs. Please download the PDF to view it.</p>
          </object>
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
  reference: {
    type: Object,
    required: true,
  },
})

const showPdfDialog = ref(false)
const pdfUrl = ref<string | null>(null)

const dialog = ref({
  unpaidFacturas: false,
  unpaidOtherAirInvoices: false,
  unpaidSeaInvoices: false,
})

const checklist = ref<any>({
  pulledData: false,
  referencia_has_credit: null,
  referencia_credit_due_date: null,
  sell_charges_pending_invoice: [],
  unpaid_invoices_by_referencia: [],
  unpaid_air_invoices_other_references: [],
  unpaid_sea_invoices: [],
  skip_sea_invoice_validation: false,
})

const form = ref({
  agente: null,
  comments: '',
})

const formSend = reactive<any>({
  emails: null,
  comments: null,
})

const hasSnapshots = computed(() => {
  return checklist.value.snapshots > 0
})

const selectedNames = ['AirImportChecklistNotify']
const customerNotifys = computed(() => {
  return mailNotifications.filter((notify) => selectedNames.includes(notify.short_name))
})

const setCustomerEmails = (emails: string) => {
  formSend.emails = emails
}

const sendChecklist = async () => {
  try {
    if (!formSend.emails) {
      snackbar.add({ type: 'error', text: 'Emails are required to send the checklist.' })
      return
    }
    loadingStore.loading = true

    const body = {
      air_reference_id: props.reference.id,
      emails: formSend.emails,
      comments: formSend.comments,
    }

    await $api.airImport.sendChecklistRevalidation(props.reference.id, body)
    snackbar.add({ type: 'success', text: 'Checklist sent successfully.' })

    showPdfDialog.value = false
    formSend.emails = null
    formSend.comments = null
  } catch (e) {
    console.error(e)
    snackbar.add({ type: 'error', text: 'Error sending checklist.' })
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const save = async () => {
  try {
    if (!form.value.agente) {
      snackbar.add({ type: 'error', text: 'Agente Aduanal es requerido.' })
      return
    }
    loadingStore.loading = true
    const hasCredito = checklist.value.referencia_has_credit
    const hasCreditValue = checklist.value.referencia_credito_vencido
      ? 'VENCIDO'
      : checklist.value.referencia_has_credit
      ? 'SI'
      : 'NO'
    const body = {
      air_reference_id: props.reference.id,
      comments: form.value.comments,
      agente: form.value.agente,
      renderedChecklist: {
        referencia_has_credit: hasCreditValue,
        referencia_credit_due_date: checklist.value.referencia_credit_due_date
          ? `${checklist.value.referencia_credit_due_date}`
          : null,
        sell_charges_pending_invoice: hasCredito
          ? 'CRÉDITO'
          : checklist.value.sell_charges_pending_invoice?.length > 0
          ? `${checklist.value.sell_charges_pending_invoice.length} cargos`
          : 'NINGUNO',
        unpaid_invoices_by_referencia: hasCredito
          ? 'CRÉDITO'
          : `${checklist.value.unpaid_invoices_by_referencia?.length || 0} factura(s)`,
        unpaid_air_invoices_other_references: `${checklist.value.unpaid_air_invoices_other_references?.length || 0} factura(s)`,
        unpaid_sea_invoices: checklist.value.skip_sea_invoice_validation
          ? 'OMITIDO'
          : `${checklist.value.unpaid_sea_invoices?.length || 0} factura(s)`,
      },
    }

    await $api.airImport.checklist(body)
    snackbar.add({ type: 'success', text: 'Checklist snapshot saved.' })

    await getAirReferenceChecklist()
  } catch (e) {
    console.error(e)
    snackbar.add({ type: 'error', text: 'Error saving checklist snapshot.' })
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const downloadPdf = async () => {
  try {
    loadingStore.loading = true
    const response = await $api.airImport.downloadChecklistPdf(props.reference.id)

    const blob = new Blob([response as any], { type: 'application/pdf' })

    pdfUrl.value = window.URL.createObjectURL(blob)

    showPdfDialog.value = true

    snackbar.add({ type: 'success', text: 'PDF download ready' })
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const getAirReferenceChecklist = async () => {
  try {
    loadingStore.loading = true
    const response = (await $api.airImport.getChecklistRevalidation(props.reference.id)) as any
    checklist.value = {
      pulledData: true,
      ...response,
    }

    form.value.agente = response.agente_aduanal
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.loading = false
    }, 250)
  }
}
</script>
