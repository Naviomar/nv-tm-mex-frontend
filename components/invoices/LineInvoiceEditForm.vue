<template>
  <div v-if="lineInvoice">

    <!-- ── Section 1: Folio / PDF ─────────────────────────────────────────── -->
    <v-card class="mb-4" variant="outlined">
      <v-card-title class="d-flex align-center gap-2 text-body-1 font-weight-semibold pa-3 pb-0">
        <v-icon size="18">mdi-file-document-edit-outline</v-icon>
        Invoice data
        <v-chip v-if="!folioEditUsed" size="x-small" color="green" variant="tonal" class="ml-1">
          Free edit available
        </v-chip>
        <v-chip v-else size="x-small" color="grey" variant="tonal" class="ml-1">
          Edited {{ formatDateString(lineInvoice.first_folio_edit_at) }}
        </v-chip>
      </v-card-title>

      <v-card-text>
        <!-- ── First free edit ── -->
        <template v-if="!folioEditUsed">
          <v-alert type="info" variant="tonal" density="compact" class="mb-3 text-caption">
            You can edit the folio, serie, date and PDF once for free. After saving, any further changes will require authorization.
          </v-alert>

          <AGlobalSearch
            :onSearch="searchLines"
            v-model="folioForm.line_id"
            label="Freight line *"
            :set-id="folioForm.line_id"
            hide-details
            class="mb-3"
          />
          <div class="grid grid-cols-2 gap-2 mb-2">
            <v-text-field v-model="folioForm.serie" density="compact" label="Serie" hide-details />
            <v-text-field v-model="folioForm.folio" density="compact" label="Folio *" hide-details />
          </div>
          <v-text-field v-model="folioForm.invoice_date" density="compact" type="date" label="Invoice date *" class="mb-2" hide-details />

          <div class="mb-3">
            <div class="text-caption text-medium-emphasis mb-1">Current attachment</div>
            <ButtonDownloadS3Object :s3Path="lineInvoice.attachment" />
          </div>
          <v-file-input v-model="folioForm.file" density="compact" label="Replace PDF (optional)" class="mb-3" />

          <div class="d-flex justify-end">
            <v-btn color="primary" size="small" :loading="savingFolio" @click="saveFolioEdit">
              <v-icon start size="16">mdi-content-save-outline</v-icon>
              Save folio &amp; PDF
            </v-btn>
          </div>
        </template>

        <!-- ── Already edited: read-only + history ── -->
        <template v-else>
          <div class="grid grid-cols-2 gap-3 mb-3">
            <div>
              <div class="text-caption text-medium-emphasis">Freight line</div>
              <div class="text-body-2 font-weight-medium">{{ lineInvoice.line?.name ?? '—' }}</div>
            </div>
            <div>
              <div class="text-caption text-medium-emphasis">Serie - Folio</div>
              <div class="text-body-2 font-weight-medium">{{ lineInvoice.serie_folio }}</div>
            </div>
            <div>
              <div class="text-caption text-medium-emphasis">Invoice date</div>
              <div class="text-body-2 font-weight-medium">{{ formatDateOnlyString(lineInvoice.invoice_date) }}</div>
            </div>
            <div>
              <div class="text-caption text-medium-emphasis">PDF</div>
              <ButtonDownloadS3Object :s3Path="lineInvoice.attachment" />
            </div>
          </div>

          <!-- Original values history -->
          <v-expansion-panels variant="accordion" class="mb-3">
            <v-expansion-panel>
              <v-expansion-panel-title class="text-caption py-1">
                <v-icon size="14" class="mr-1">mdi-history</v-icon>
                Original values (before edit)
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <div class="text-caption">
                  <div>Serie: <strong>{{ lineInvoice.original_serie || '—' }}</strong> &nbsp;|&nbsp; Folio: <strong>{{ lineInvoice.original_folio || '—' }}</strong></div>
                  <div class="mt-1 d-flex align-center gap-2">
                    Original PDF:
                    <ButtonDownloadS3Object :s3Path="lineInvoice.original_attachment" />
                  </div>
                </div>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>

          <!-- PAW for authorized re-edit of folio -->
          <div class="d-flex align-center gap-3 flex-wrap">
            <span class="text-caption text-medium-emphasis">Need to change folio / PDF?</span>
            <ProcessAuthorizationWrapper
              process-name="invoices.lines.update"
              :request-key="String(lineInvoice.id)"
              label="Request edit authorization"
              :display-name="lineInvoice.serie_folio || `Line Invoice #${lineInvoice.id}`"
              @refresh="getData"
            >
              <template #auth>
                <v-btn size="small" color="primary" variant="tonal" @click="openAuthorizedEditDialog">
                  <v-icon start size="14">mdi-pencil-outline</v-icon>
                  Edit folio / PDF
                </v-btn>
              </template>
            </ProcessAuthorizationWrapper>
          </div>
        </template>
      </v-card-text>
    </v-card>

    <!-- ── Section 2: Linked services ────────────────────────────────────── -->
    <v-card class="mb-4" variant="outlined">
      <v-card-title class="text-body-1 font-weight-semibold pa-3 pb-0 d-flex align-center gap-2">
        <v-icon size="18">mdi-link-variant</v-icon>
        Linked services
      </v-card-title>
      <v-card-text class="pt-2">
        <!-- Request needed to modify charges -->
        <v-alert
          v-if="!hasActiveChargeAuth"
          type="warning"
          variant="tonal"
          density="compact"
          class="mb-3 text-caption"
        >
          To remove or add services, you need an active authorization for this invoice.
        </v-alert>

        <v-table density="compact">
          <thead>
            <tr>
              <th v-if="hasActiveChargeAuth" class="w-10">Actions</th>
              <th>Reference #</th>
              <th>Master BL</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Payments</th>
              <th>Status</th>
              <th>Created at</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(lineInvRef, index) in lineInvoice.refs" :key="`line-inv-ref-${index}`">
              <td v-if="hasActiveChargeAuth">
                <TrashButton :item="lineInvRef" @click="confirmDeleteLineInvoiceRef(lineInvRef)" />
              </td>
              <td class="whitespace-nowrap">{{ lineInvRef.referencia?.reference_number }}</td>
              <td>{{ lineInvRef.master_bl?.name }}</td>
              <td>{{ lineInvRef.tm_wm }}</td>
              <td>{{ formatToCurrency(lineInvRef.amount) }}</td>
              <td>
                <div v-for="(charge, idx) in lineInvRef.invoice?.charges" :key="`charge-${idx}`">
                  <div v-for="(payment, idx2) in charge.payments" :key="`payment-${idx2}`">
                    <v-chip color="blue" size="x-small" class="mb-1" @click="viewPayment(payment)">
                      <v-icon start size="12">mdi-eye-outline</v-icon>
                      #{{ payment.id }} {{ formatToCurrency(payment.amount) }}
                    </v-chip>
                  </div>
                </div>
              </td>
              <td>
                <v-chip :color="isPaid(lineInvRef) ? 'green' : 'red'" size="x-small">
                  {{ isPaid(lineInvRef) ? 'Paid' : 'Pending' }}
                </v-chip>
              </td>
              <td class="whitespace-nowrap">
                <UserInfoBadge :item="lineInvRef">
                  {{ formatDateString(lineInvRef.created_at) }}
                </UserInfoBadge>
              </td>
            </tr>
          </tbody>
        </v-table>

        <!-- PAW to get charge authorization (shown when no active auth) -->
        <div v-if="!hasActiveChargeAuth" class="mt-3 d-flex align-center gap-2">
          <ProcessAuthorizationWrapper
            process-name="invoices.lines.update"
            :request-key="String(lineInvoice.id)"
            label="Request authorization to modify services"
            :display-name="lineInvoice.serie_folio || `Line Invoice #${lineInvoice.id}`"
            @refresh="getData"
          />
        </div>
      </v-card-text>
    </v-card>

    <!-- ── Section 3: Add new services (only with active auth) ──────────── -->
    <v-card v-if="hasActiveChargeAuth" variant="outlined">
      <v-card-title class="text-body-1 font-weight-semibold pa-3 pb-0 d-flex align-center gap-2">
        <v-icon size="18">mdi-ship-wheel</v-icon>
        Add maritime services
      </v-card-title>
      <v-card-text>
        <div class="mb-3">
          <span class="text-caption">Press ENTER to add Master BL numbers to search</span>
          <v-text-field
            v-model="filters.masterBl"
            density="compact"
            label="Add master BL numbers"
            @keyup.enter="addMasterblToSearch"
          />
          <div v-if="filters.masterbls.length > 0" class="mb-2">
            <v-chip
              v-for="(bl, index) in filters.masterbls"
              :key="bl"
              closable
              size="small"
              class="mr-1 mb-1"
              @click:close="removeMasterblToSearch(index)"
            >{{ bl }}</v-chip>
            <v-btn color="primary" size="small" :loading="loadingStore.loading" class="mt-1" @click="searchReferences">
              Search sea references
            </v-btn>
          </div>
        </div>

        <v-alert
          v-if="referenciasFound.length > 0 && referenciasFoundSelected.length === 0"
          type="info" variant="tonal" density="compact" class="mb-2 text-caption"
        >
          Click a reference to add it to the invoice
        </v-alert>

        <div v-if="referenciasFound.length > 0" class="mb-3">
          <v-chip
            v-for="(ref, index) in referenciasFound"
            :key="`found-${index}`"
            color="green-darken-4"
            class="mr-1 mb-1"
            append-icon="mdi-plus"
            @click="addReferenciaToInvoice(ref)"
          >
            Ref #{{ ref.reference_number }}
          </v-chip>
        </div>

        <div v-if="referenciasFoundSelected.length > 0" class="mb-3">
          <div class="text-body-2 font-weight-bold mb-2">Services to add</div>
          <v-table density="compact" fixed-header>
            <thead>
              <tr>
                <th class="w-8">Remove</th>
                <th>Reference #</th>
                <th>Buy amount</th>
                <th>Amount *</th>
                <th>Currency</th>
                <th>Type *</th>
                <th>Payment concept</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(ref, index) in referenciasFoundSelected" :key="`sel-${index}`">
                <td>
                  <v-btn icon color="red" size="x-small" variant="text" @click="removeReferenciaFromInvoice(index)">
                    <v-icon>mdi-close</v-icon>
                  </v-btn>
                </td>
                <td>Ref #{{ ref.reference_number }}</td>
                <td>
                  {{ formatToCurrency(getBuyTotalRate(ref)) }}
                  <v-chip size="x-small">{{ ref.buy_rate_type }}</v-chip>
                </td>
                <td>
                  <v-text-field
                    v-model="ref.amount_invoice"
                    type="number"
                    density="compact"
                    hide-details
                    style="min-width:100px"
                    @update:model-value="checkMaxAmount($event, ref)"
                  />
                </td>
                <td>
                  <v-autocomplete
                    v-model="ref.currency_id"
                    density="compact"
                    :items="currencies"
                    item-title="name"
                    item-value="id"
                    readonly
                    variant="solo-filled"
                    hide-details
                    style="min-width:90px"
                  />
                </td>
                <td>
                  <v-autocomplete v-model="ref.type" :items="['TM', 'WM']" density="compact" hide-details style="min-width:80px" />
                </td>
                <td>
                  <v-autocomplete
                    v-model="ref.payment_concept_id"
                    :items="paymentConcepts"
                    item-title="name"
                    item-value="id"
                    density="compact"
                    clearable
                    hide-details
                    style="min-width:140px"
                  />
                </td>
              </tr>
            </tbody>
          </v-table>

          <div class="d-flex justify-end mt-3">
            <v-btn color="primary" size="small" :loading="savingRefs" @click="saveNewRefs">
              <v-icon start size="16">mdi-plus-circle-outline</v-icon>
              Add services to invoice
            </v-btn>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <!-- Authorized folio edit dialog -->
    <v-dialog v-model="authorizedEditDialog" max-width="550" persistent>
      <v-card>
        <v-card-title class="text-body-1 font-weight-semibold">
          <v-icon class="mr-2">mdi-pencil-outline</v-icon>
          Edit folio / PDF
        </v-card-title>
        <v-card-text>
          <AGlobalSearch
            :onSearch="searchLines"
            v-model="authorizedForm.line_id"
            label="Freight line *"
            :set-id="authorizedForm.line_id"
            hide-details
            class="mb-3"
          />
          <div class="grid grid-cols-2 gap-2 mb-2">
            <v-text-field v-model="authorizedForm.serie" density="compact" label="Serie" hide-details />
            <v-text-field v-model="authorizedForm.folio" density="compact" label="Folio *" hide-details />
          </div>
          <v-text-field v-model="authorizedForm.invoice_date" density="compact" type="date" label="Invoice date *" class="mb-2" hide-details />
          <div class="mb-2">
            <div class="text-caption text-medium-emphasis mb-1">Current PDF</div>
            <ButtonDownloadS3Object :s3Path="lineInvoice.attachment" />
          </div>
          <v-file-input v-model="authorizedForm.file" density="compact" label="Replace PDF (optional)" />
        </v-card-text>
        <v-card-actions class="pa-3 pt-0">
          <v-spacer />
          <v-btn size="small" @click="authorizedEditDialog = false">Cancel</v-btn>
          <v-btn size="small" color="primary" :loading="savingAuthorized" @click="saveAuthorizedEdit">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { currencies } from '@/utils/data/systemData'
const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const router = useRouter()
const loadingStore = useLoadingStore()
const { $notifications } = useNuxtApp()
const confirm = $notifications.useConfirm()

const props = defineProps<{ id: string }>()

const lineInvoice = ref<any>(null)
const referenciasFound = ref<any[]>([])
const referenciasFoundSelected = ref<any[]>([])
const paymentConcepts = ref<any[]>([])
const lineInvoicePaymentConceptNames = ['PAGO LC', 'PAGO FN', 'PAGO DM', 'PAGO DT']

const savingFolio = ref(false)
const savingRefs = ref(false)
const savingAuthorized = ref(false)
const authorizedEditDialog = ref(false)

// Active granted requests for invoices.lines.update on this invoice
const userRequests = ref<any[]>([])

// ── Authorization check ───────────────────────────────────────────────────────

const hasActiveChargeAuth = computed(() =>
  userRequests.value.some(
    (r: any) =>
      r.process_name === 'invoices.lines.update' &&
      r.request_key === String(props.id) &&
      r.status === 'granted' &&
      r.is_granted &&
      !r.used_at
  )
)

// ── Computed ──────────────────────────────────────────────────────────────────

const folioEditUsed = computed(() => !!lineInvoice.value?.first_folio_edit_at)

// ── Forms ─────────────────────────────────────────────────────────────────────

const folioForm = ref<any>({ line_id: null, serie: null, folio: null, invoice_date: null, file: null })
const authorizedForm = ref<any>({ line_id: null, serie: null, folio: null, invoice_date: null, file: null })
const filters = ref<any>({ masterBl: '', masterbls: [] })

// ── Helpers ───────────────────────────────────────────────────────────────────

const isPaid = (lineInvRef: any) => lineInvRef.invoice?.is_paid === 1

const viewPayment = (payment: any) => {
  if (payment.paymentable_type?.includes('BankMovement')) {
    router.push(`/transfers/global/view-${payment.paymentable_id}?focusPayable=${payment.id}`)
    return
  }
  snackbar.add({ type: 'error', text: 'Unknown payment type' })
}

const getBuyTotalRate = (referencia: any) => {
  const buyConcepts = (referencia.buy_rate_breakdown ?? []).concat(
    (referencia.export_charges ?? []).filter((c: any) => c.buy_owner === 'F').map((c: any) => ({ amount: c.buy_total }))
  )
  return buyConcepts.reduce((acc: number, r: any) => acc + parseFloat(r.amount), 0)
}

const checkMaxAmount = (value: any, ref: any) => {
  if (value > getBuyTotalRate(ref)) {
    snackbar.add({ type: 'error', text: 'Amount cannot exceed buy amount' })
    ref.amount_invoice = getBuyTotalRate(ref)
  }
}

const suggestPaymentConcept = (ref: any) => {
  const buys = ref.buy_rate_breakdown ?? []
  const exports = ref.export_charges ?? []
  let freight = 0, local = 0
  buys.forEach((c: any) => { if (c.type === 'F') freight++; else if (c.type === 'L') local++ })
  exports.forEach((c: any) => { if (c.buy_owner === 'F') freight++; else if (c.buy_owner === 'L') local++ })
  if (freight > local) return paymentConcepts.value.find((c: any) => c.name === 'PAGO FN')
  if (local > freight) return paymentConcepts.value.find((c: any) => c.name === 'PAGO LC')
  return null
}

// ── Lines search ──────────────────────────────────────────────────────────────

const searchLines = async (search: any) => {
  try {
    return await $api.lines.searchLines({ query: search })
  } catch {
    snackbar.add({ type: 'error', text: 'Error fetching freight lines' })
  }
}

// ── Load user requests to check active authorization ──────────────────────────

const syncAuth = async () => {
  try {
    userRequests.value = await ($api as any).authProcessRequests.getUserRequests()
  } catch { /* silent */ }
}

// Poll while there's a pending request for this invoice
const { startPolling } = useRequestPolling({
  processName: 'invoices.lines.update',
  requestKey: props.id,
  onStatusChange: async () => {
    await syncAuth()
  },
})

// ── Save folio (first free edit) ──────────────────────────────────────────────

const saveFolioEdit = async () => {
  if (!folioForm.value.folio) { snackbar.add({ type: 'error', text: 'Folio is required' }); return }
  if (!folioForm.value.invoice_date) { snackbar.add({ type: 'error', text: 'Invoice date is required' }); return }
  try {
    savingFolio.value = true
    const body = new FormData()
    body.append('id', lineInvoice.value.id)
    body.append('line_id', folioForm.value.line_id)
    body.append('folio', folioForm.value.folio)
    body.append('serie', folioForm.value.serie ?? '')
    body.append('invoice_date', folioForm.value.invoice_date)
    if (folioForm.value.file) body.append('file', folioForm.value.file instanceof File ? folioForm.value.file : folioForm.value.file[0])
    await ($api as any).linePayments.updateLineInvoice(body)
    snackbar.add({ type: 'success', text: 'Invoice updated. Free edit slot used.' })
    await getData()
  } catch (e: any) {
    snackbar.add({ type: 'error', text: e?.data?.message ?? 'Error updating invoice' })
  } finally {
    savingFolio.value = false
  }
}

// ── Save authorized folio edit ────────────────────────────────────────────────

const openAuthorizedEditDialog = () => {
  authorizedForm.value = {
    line_id: lineInvoice.value.line_id,
    serie: lineInvoice.value.serie,
    folio: lineInvoice.value.folio,
    invoice_date: lineInvoice.value.invoice_date,
    file: null,
  }
  authorizedEditDialog.value = true
}

const saveAuthorizedEdit = async () => {
  if (!authorizedForm.value.folio) { snackbar.add({ type: 'error', text: 'Folio is required' }); return }
  try {
    savingAuthorized.value = true
    const body = new FormData()
    body.append('id', lineInvoice.value.id)
    body.append('line_id', authorizedForm.value.line_id)
    body.append('folio', authorizedForm.value.folio)
    body.append('serie', authorizedForm.value.serie ?? '')
    body.append('invoice_date', authorizedForm.value.invoice_date)
    if (authorizedForm.value.file) body.append('file', authorizedForm.value.file instanceof File ? authorizedForm.value.file : authorizedForm.value.file[0])
    await ($api as any).linePayments.updateLineInvoiceAuthorized(body)
    snackbar.add({ type: 'success', text: 'Invoice updated' })
    authorizedEditDialog.value = false
    await getData()
    await syncAuth()
  } catch (e: any) {
    snackbar.add({ type: 'error', text: e?.data?.message ?? 'Error updating invoice' })
  } finally {
    savingAuthorized.value = false
  }
}

// ── Save new refs (requires active auth) ─────────────────────────────────────

const saveNewRefs = async () => {
  if (!hasActiveChargeAuth.value) {
    snackbar.add({ type: 'error', text: 'You need an active authorization to add services' }); return
  }
  if (referenciasFoundSelected.value.some((r: any) => !r.amount_invoice || r.amount_invoice == 0)) {
    snackbar.add({ type: 'error', text: 'Amount is required for all selected services' }); return
  }
  try {
    savingRefs.value = true
    const body = {
      id: lineInvoice.value.id,
      references: referenciasFoundSelected.value.map((r: any) => ({
        id: r.id,
        master_bls: r.master_bls,
        amount_invoice: r.amount_invoice,
        currency_id: r.currency_id,
        type: r.type,
        payment_concept_id: r.payment_concept_id,
      })),
    }
    await ($api as any).linePayments.updateLineInvoice(body)
    snackbar.add({ type: 'success', text: 'Services added to invoice' })
    referenciasFoundSelected.value = []
    referenciasFound.value = []
    filters.value.masterbls = []
    await getData()
  } catch (e: any) {
    snackbar.add({ type: 'error', text: e?.data?.message ?? 'Error adding services' })
  } finally {
    savingRefs.value = false
  }
}

// ── Delete ref (requires active auth) ────────────────────────────────────────

const confirmDeleteLineInvoiceRef = async (lineInvRef: any) => {
  if (!hasActiveChargeAuth.value) {
    snackbar.add({ type: 'error', text: 'You need an active authorization to remove services' }); return
  }
  const ok = await confirm({
    title: 'Are you sure?',
    content: 'Please confirm this action.',
    confirmationText: 'Yes, confirm',
    confirmationButtonProps: { color: 'primary' },
    dialogProps: { persistent: true, maxWidth: 500 },
  })
  if (ok) await deleteLineInvoiceRef(lineInvRef)
}

const deleteLineInvoiceRef = async (lineInvRef: any) => {
  try {
    loadingStore.loading = true
    await ($api as any).linePayments.removeLineInvoiceRef(lineInvRef)
    snackbar.add({ type: 'success', text: 'Service removed.' })
    await getData()
  } catch {
    snackbar.add({ type: 'error', text: 'Error removing service' })
  } finally {
    setTimeout(() => loadingStore.stop(), 250)
  }
}

// ── Search refs ───────────────────────────────────────────────────────────────

const addMasterblToSearch = () => {
  if (!filters.value.masterBl) return
  const bls = Array.from(new Set(filters.value.masterBl.replace(/\s/g, '').split(',')))
  bls.forEach((bl) => { if (!filters.value.masterbls.includes(bl)) filters.value.masterbls.push(bl) })
  filters.value.masterBl = ''
}

const removeMasterblToSearch = (index: number) => filters.value.masterbls.splice(index, 1)

const searchReferences = async () => {
  try {
    loadingStore.loading = true
    referenciasFound.value = []
    const response: any = await ($api as any).linePayments.searchSeaReferences(filters.value)
    if (!response.length) snackbar.add({ type: 'warning', text: 'No maritime services found' })
    referenciasFound.value = response
  } catch { /* handled by snackbar */ } finally {
    setTimeout(() => loadingStore.stop(), 250)
  }
}

const addReferenciaToInvoice = (ref: any) => {
  if (referenciasFoundSelected.value.find((r: any) => r.id === ref.id)) return
  const refData = JSON.parse(JSON.stringify(ref))
  refData.currency_id = currencies.find((c) => c.id === 2)!.id
  refData.payment_concept_id = suggestPaymentConcept(ref)?.id || null
  referenciasFoundSelected.value.push(refData)
}

const removeReferenciaFromInvoice = (index: number) => referenciasFoundSelected.value.splice(index, 1)

// ── Init ──────────────────────────────────────────────────────────────────────

const getData = async () => {
  try {
    loadingStore.loading = true
    const response: any = await ($api as any).linePayments.getLineInvoiceById(props.id)
    lineInvoice.value = response
    folioForm.value = {
      line_id: response.line_id,
      serie: response.serie,
      folio: response.folio,
      invoice_date: response.invoice_date,
      file: null,
    }
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => loadingStore.stop(), 250)
  }
}

await getData()
await syncAuth()

onMounted(async () => {
  try {
    const all: any = await ($api as any).charges.getAll()
    paymentConcepts.value = all.filter((c: any) => lineInvoicePaymentConceptNames.includes(c.name))
  } catch { /* silent */ }
  startPolling()
})
</script>
