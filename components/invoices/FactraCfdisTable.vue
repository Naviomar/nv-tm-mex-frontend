<template>
  <div>
    <v-card>
      <v-card-title>
        <div class="flex justify-between items-center flex-wrap">
          Supplier invoices (Factra incoming CFDIs)
          <v-btn color="primary" size="small" to="/invoices/suppliers/cfdis/create">
            <v-icon>mdi-plus</v-icon> Add new supplier CFDI</v-btn
          >
        </div>
      </v-card-title>
      <v-card-text>
        <div class="mb-4" @keyup.enter="onClickFilters">
          <div class="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div class="col-span-1">
              <v-text-field
                v-model="filters.invoiceDate"
                clearable
                type="date"
                density="compact"
                label="Invoice date"
                hide-details
              />
            </div>
            <div class="col-span-1">
              <v-text-field
                v-model="filters.startDate"
                clearable
                type="date"
                density="compact"
                label="Start date"
                hide-details
              />
            </div>
            <div class="col-span-1">
              <v-text-field
                v-model="filters.endDate"
                clearable
                type="date"
                density="compact"
                label="End date"
                hide-details
              />
            </div>
            <div class="col-span-2">
              <ASupplierSearch v-model="filters.supplierId" label="Supplier" hide-details />
            </div>
            <div class="col-span-1">
              <v-text-field
                v-model="filters.serie"
                clearable
                density="compact"
                label="Serie"
                hide-details
                @keyup.enter="getSupplierCfdis"
              />
            </div>
            <div class="col-span-1">
              <v-text-field
                v-model="filters.folio"
                clearable
                density="compact"
                label="Folio"
                hide-details
                @keyup.enter="getSupplierCfdis"
              />
            </div>
            <div class="col-span-2">
              <v-text-field
                v-model="filters.rfcEmisor"
                clearable
                density="compact"
                label="RFC Emisor"
                hide-details
                @keyup.enter="getSupplierCfdis"
              />
            </div>
            <div class="col-span-2">
              <v-text-field
                v-model="filters.uuid"
                clearable
                density="compact"
                label="CFDI UUID"
                hide-details
                @keyup.enter="getSupplierCfdis"
              />
            </div>
            <div class="col-span-1">
              <v-autocomplete
                v-model="filters.hasSupplier"
                density="compact"
                :items="[
                  { name: 'Yes', value: true },
                  { name: 'No', value: false },
                ]"
                item-title="name"
                item-value="value"
                hide-details
                label="Linked to supplier"
              />
            </div>
          </div>
          <div class="grid grid-cols-3 gap-4 py-4">
            <div class="">
              <v-autocomplete
                v-model="filters.serviceType"
                density="compact"
                :items="[
                  { name: 'Sea services', value: 'sea' },
                  { name: 'Air services', value: 'air' },
                ]"
                item-title="name"
                item-value="value"
                hide-details
                label="By service type"
              />
            </div>
            <div v-if="filters.serviceType" class="">
              <v-autocomplete
                v-model="filters.serviceYear"
                :prepend-icon="filters.serviceType == 'sea' ? 'mdi-ferry' : 'mdi-airplane'"
                :items="prefixYears"
                density="compact"
                label="Service Year"
              />
            </div>
            <div v-if="filters.serviceType" class="">
              <v-text-field
                v-model="filters.serviceNumbers"
                density="compact"
                label="Service number"
                hint="Separate multiple references with commas"
              />
            </div>
          </div>
          <div class="grid grid-cols-6 gap-4">
            <div class="col-span-2">
              <v-autocomplete
                v-model="filters.amountProvisioned"
                density="compact"
                :items="[
                  { name: 'Full amount', value: 1 },
                  { name: 'Partial amount', value: 2 },
                  { name: 'No amount', value: 3 },
                ]"
                item-title="name"
                item-value="value"
                hide-details
                label="Amount provisioned"
              />
            </div>
            <div class="col-span-2">
              <v-autocomplete
                v-model="filters.tipoComprobante"
                density="compact"
                :items="[
                  { name: 'Ingreso', value: 'I' },
                  { name: 'Egreso', value: 'E' },
                  { name: 'Traslado', value: 'T' },
                  { name: 'Nomina', value: 'N' },
                  { name: 'Pago', value: 'P' },
                ]"
                item-title="name"
                item-value="value"
                hide-details
                label="Tipo de comprobante"
              />
            </div>
            <div class="">
              <v-autocomplete
                v-model="filters.blockedAtEntry"
                density="compact"
                :items="[
                  { name: 'Blocked at entry', value: true },
                  { name: 'Not blocked at entry', value: false },
                ]"
                item-title="name"
                item-value="value"
                clearable
                hide-details
                label="Entry status"
              />
            </div>
            <div class="">
              <v-autocomplete
                v-model="filters.currencyId"
                density="compact"
                :items="currencies"
                item-title="name"
                item-value="id"
                hide-details
                label="By currency"
              />
            </div>
          </div>
          <div class="grid grid-cols-12 py-4">
            <div class="col-span-3">
              <v-text-field
                v-model="filters.ifolio"
                clearable
                density="compact"
                label="Add folios"
                hint="Press enter to add each folio"
                hide-details
                @keyup.enter="addFolio"
              />
            </div>
            <div class="col-span-6">
              <div v-if="filters.folios.length > 0" class="flex gap-2 px-2">Searching by folios:</div>
              <div class="flex gap-2 px-2">
                <v-chip v-for="(folio, index) in filters.folios" :key="`folio-${index}`" @click="removeFolio(Number(index))">
                  {{ folio }}
                  <v-icon>mdi-close</v-icon>
                </v-chip>
              </div>
            </div>
            <div class="col-span-3"></div>
          </div>
          <div class="grid grid-cols-1">
            <div class="flex gap-2">
              <v-btn size="small" color="secondary" @click="clearFilters"> Clear </v-btn>
              <v-btn size="small" color="primary" @click="onClickFilters"> Search </v-btn>
            </div>
          </div>
        </div>

        <div>
          <div class="flex gap-2 mb-4 border p-2">
            <v-btn color="green" size="small" variant="tonal" @click="requestCfdiPayments">
              Request payment module</v-btn
            >
          </div>
          <div class="flex gap-2 mb-4">
            <v-chip color="grey"><span class="inline-block w-5 h-5 bg-slate-200 mr-2"></span>Pending payment</v-chip>
            <v-chip color="orange"
              ><span class="inline-block w-5 h-5 bg-yellow-500 mr-2"></span>Payment requested</v-chip
            >
            <v-chip color="green"><span class="inline-block w-5 h-5 bg-green-500 mr-2"></span>Invoice paid</v-chip>
            <v-chip color="red"><span class="inline-block w-5 h-5 bg-red-500 mr-2"></span>Cancelled</v-chip>
          </div>
          <v-pagination
            v-model="supplierCfdis.current_page"
            :length="supplierCfdis.last_page"
            rounded="circle"
            density="compact"
            @update:model-value="onClickPagination"
          ></v-pagination>
          <v-table density="compact" fixed-header height="75vh">
            <thead>
              <tr>
                <th class="text-left">Actions</th>
                <th class="text-left">XML</th>
                <th class="text-left">Zip</th>
                <th class="text-left"># Req payment</th>
                <th class="text-left">Reissued</th>
                <th class="text-left">Serie-Folio</th>
                <th class="text-left">Emisor / Proveedor</th>
                <th class="text-left">Receptor</th>
                <th class="text-left">
                  T.C.
                  <v-tooltip text="Tipo de comprobante" color="primary">
                    <template v-slot:activator="{ props }">
                      <v-icon v-bind="props">mdi-help-circle-outline</v-icon>
                    </template>
                  </v-tooltip>
                </th>
                <th class="text-left">Estatus SAT</th>
                <th class="text-left">Total CFDI</th>
                <th class="text-left">Provisioned</th>
                <th class="text-left">Concepts</th>
                <th class="text-left">Invoice date</th>
                <th class="text-left">Created at</th>
                <th class="text-left">Last modified</th>
                <th class="text-left">Cancelled?</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(cfdi, index) in supplierCfdis.data"
                :key="`supplier-cfdi-${cfdi.id}`"
                :class="columnClass(cfdi)"
              >
                <td>
                  <!-- State 1: Invoice blocked due to late entry into Factra -->
                  <div v-if="isBlockedAtEntry(cfdi)" class="text-sm text-red-600 dark:text-red-300">
                    <v-icon size="small">mdi-lock</v-icon>
                    <small>{{ cfdi.blocked_at_entry_reason || 'This invoice is blocked because it was entered into Factra past the deadline.' }}</small>
                    <ProcessAuthorizationWrapper 
                        processName="supplier-work-past-date"
                        :requestKey="`${cfdi.id}`"
                        :displayName="cfdi.serie_folio || `Invoice ${cfdi.id}`"
                        label="Request"
                        >
                        <template #auth>
                            <div v-if="hasSupplierLinked(cfdi)" class="flex justify-center gap-2 mb-2">
                              <ViewButton :item="cfdi" @click="viewSupplierCfdi(cfdi)" />
                              <EditButton :item="cfdi" @click="editSupplierCfdi(cfdi)" />
                              <TrashButton v-if="!isTouched(cfdi)" :item="cfdi" @click="showConfirmDelete" />
                            </div>
                            <div v-if="!hasSupplierLinked(cfdi)" class="flex gap-2">
                              <v-btn color="green" size="small" variant="tonal" @click="syncSupplierCfdi(cfdi.id)">
                                <v-icon>mdi-sync</v-icon>
                              </v-btn>
                            </div>
                            <div class="mx-auto">
                              <LinkDeleteSupplierInvoice :supplierCfdi="cfdi" @refresh="getSupplierCfdis" />
                            </div>
                            <div v-if="cfdi.uuid && canValidateSat" class="flex justify-center mt-2">
                              <v-btn
                                size="x-small"
                                color="indigo"
                                variant="tonal"
                                :loading="cfdi._validatingSat === true"
                                @click="validateCfdiSatRow(cfdi)"
                              >
                                Validar SAT
                              </v-btn>
                            </div>
                        </template>
                    </ProcessAuthorizationWrapper>
                  </div>
                  <!-- State 2: Supplier credit days expired (invoice not blocked at entry) -->
                  <div v-else-if="isCreditExpired(cfdi)" class="text-sm text-orange-600 dark:text-orange-300">
                    <v-icon size="small">mdi-clock-alert</v-icon>
                    <small v-if="cfdi.supplier_credit_days === 0">
                      This invoice can only be processed on the same day (0 credit days).<br>
                      Invoice date: {{ new Date(cfdi.invoice_date).toLocaleDateString() }}
                    </small>
                    <small v-else>
                      The supplier's credit days have expired.<br>({{ cfdi.supplier_credit_days }} days from {{ new Date(cfdi.invoice_date).toLocaleDateString() }})
                    </small>
                    <ProcessAuthorizationWrapper 
                        processName="supplier-work-past-date"
                        :requestKey="`${cfdi.id}`"
                        :displayName="cfdi.serie_folio || `Invoice ${cfdi.id}`"
                        label="Request"
                        >
                        <template #auth>
                            <div v-if="hasSupplierLinked(cfdi)" class="flex justify-center gap-2 mb-2">
                              <ViewButton :item="cfdi" @click="viewSupplierCfdi(cfdi)" />
                              <EditButton :item="cfdi" @click="editSupplierCfdi(cfdi)" />
                              <TrashButton v-if="!isTouched(cfdi)" :item="cfdi" @click="showConfirmDelete" />
                            </div>
                            <div v-if="!hasSupplierLinked(cfdi)" class="flex gap-2">
                              <v-btn color="green" size="small" variant="tonal" @click="syncSupplierCfdi(cfdi.id)">
                                <v-icon>mdi-sync</v-icon>
                              </v-btn>
                            </div>
                            <div class="mx-auto">
                              <LinkDeleteSupplierInvoice :supplierCfdi="cfdi" @refresh="getSupplierCfdis" />
                            </div>
                            <div v-if="cfdi.uuid && canValidateSat" class="flex justify-center mt-2">
                              <v-btn
                                size="x-small"
                                color="indigo"
                                variant="tonal"
                                :loading="cfdi._validatingSat === true"
                                @click="validateCfdiSatRow(cfdi)"
                              >
                                Validar SAT
                              </v-btn>
                            </div>
                        </template>
                    </ProcessAuthorizationWrapper>
                  </div>
                  <!-- State 3: Invoice within credit days - user can process normally -->
                  <div v-else>
                    <div v-if="hasSupplierLinked(cfdi)" class="flex justify-center gap-2 mb-2">
                      <ViewButton :item="cfdi" @click="viewSupplierCfdi(cfdi)" />
                      <EditButton :item="cfdi" @click="editSupplierCfdi(cfdi)" />
                      <TrashButton v-if="!isTouched(cfdi)" :item="cfdi" @click="showConfirmDelete" />
                    </div>
                    <div v-if="!hasSupplierLinked(cfdi)" class="flex gap-2">
                      <v-btn color="green" size="small" variant="tonal" @click="syncSupplierCfdi(cfdi.id)">
                        <v-icon>mdi-sync</v-icon>
                      </v-btn>
                    </div>
                    <div class="mx-auto">
                      <LinkDeleteSupplierInvoice :supplierCfdi="cfdi" @refresh="getSupplierCfdis" />
                    </div>
                    <div v-if="cfdi.uuid && canValidateSat" class="flex justify-center mt-2">
                      <v-btn
                        size="x-small"
                        color="indigo"
                        variant="tonal"
                        :loading="cfdi._validatingSat === true"
                        @click="validateCfdiSatRow(cfdi)"
                      >
                        Validar SAT
                      </v-btn>
                    </div>
                  </div>
                </td>
                <td>
                  <ButtonDownloadS3Object2 :s3Path="cfdi.xml_attachment" />
                  <div v-if="cfdi.is_manual">
                    <v-chip color="amber" size="small">Manual CFDI</v-chip>
                  </div>
                </td>
                <td>
                  <ButtonDownloadS3Object2 :s3Path="cfdi.pdf_attachment" />
                </td>
                <td></td>
                <td>
                  <v-chip v-if="cfdi.parent_deleted" color="amber" size="small" variant="outlined"> Reissued </v-chip>
                </td>
                <td class="whitespace-nowrap">{{ `${cfdi.serie_folio}` }}</td>
                <td>
                  <v-icon v-if="cfdi.supplier_id != null" color="primary">mdi-link</v-icon>
                  <v-icon v-if="cfdi.supplier_id == null" color="red">mdi-link-off</v-icon>
                  <div>{{ cfdi.rfc_emisor }}</div>
                  <div>{{ cfdi.name_emisor }}</div>
                </td>
                <td>
                  <div>{{ cfdi.rfc_receptor }}</div>
                  <div>{{ cfdi.name_receptor }}</div>
                </td>
                <td>
                  <v-chip
                    :color="cfdi.tipo_comprobante === 'I' ? 'green' : cfdi.tipo_comprobante === 'E' ? 'red' : 'blue'"
                    class="text-white"
                    size="small"
                    variant="outlined"
                  >
                    {{ cfdi.tipo_comprobante_name }}
                  </v-chip>
                </td>
                <td>
                  <SatValidationStatus v-if="cfdi.uuid" :key="`sat-${cfdi.id}-${cfdi.sat_validated_at}`" :supplierCfdi="cfdi" :showValidateButton="false" />
                  <v-chip v-else color="grey" size="small" variant="tonal">N/A</v-chip>
                </td>
                <td class="whitespace-nowrap">
                  {{ formatToCurrency(cfdi.amount_cfdi) }} {{ getCurrencyName(cfdi.currency_id) }}
                </td>
                <td class="whitespace-nowrap">
                  {{ formatToCurrency(cfdi.amount_provisioned) }} {{ getCurrencyName(cfdi.currency_id) }}
                </td>
                <td class="whitespace-nowrap">
                  <div v-for="(cfdiInvoice, index) in cfdi.invoices" :key="`cfdi-invoice-${index}`">
                    <div>{{ cfdiInvoice.chargeable?.name }}</div>
                  </div>
                </td>
                <td>{{ formatDateOnlyString(cfdi.invoice_date) }}</td>
                <td>{{ formatDateString(cfdi.created_at) }}</td>
                <td>
                  <UserInfoBadge :item="cfdi">
                    {{ formatDateString(cfdi.updated_at) }}
                  </UserInfoBadge>
                </td>
                <td>{{ cfdi.deleted_at != null ? 'Yes' : 'No' }}</td>
              </tr>
            </tbody>
          </v-table>
          <v-pagination
            v-model="supplierCfdis.current_page"
            :length="supplierCfdis.last_page"
            rounded="circle"
            density="compact"
            @update:model-value="onClickPagination"
          ></v-pagination>

        </div>
      </v-card-text>
    </v-card>
  </div>
</template>
<script setup lang="ts">
import { currencies } from '@/utils/data/systemData'
import { permissions } from '@/utils/data/system'
import { useCheckUser } from '@/composables/useCheckUser'

const { $api, $notifications } = useNuxtApp()
const snackbar = useSnackbar()
const confirm = $notifications.useConfirm()
const router = useRouter()
const loadingStore = useLoadingStore()
const { hasPermission } = useCheckUser()

const filters = ref<any>({
  invoiceDate: '',
  startDate: '',
  endDate: '',
  supplierId: '',
  serie: '',
  folio: '',
  folios: [] as string[],
  ifolio: '',
  serviceType: null,
  serviceYear: null,
  serviceNumbers: null,
  tipoComprobante: '',
  rfcEmisor: '',
  uuid: '',
  currencyId: null,
  hasSupplier: null,
  amountProvisioned: null,
  blockedAtEntry: '',
})

const initialYear = 2022
const currentYear = new Date().getFullYear()
const maxYear = currentYear + 1

const isEnteredLate = (cfdi: any): boolean => {
  if (!cfdi.invoice_date || !cfdi.created_at) return false
  const invoiceDate = new Date(cfdi.invoice_date + 'T00:00:00')
  const lastDayOfMonth = new Date(invoiceDate.getFullYear(), invoiceDate.getMonth() + 1, 0)
  const entryDeadline = new Date(lastDayOfMonth)
  entryDeadline.setDate(entryDeadline.getDate() + 3)
  entryDeadline.setHours(23, 59, 59, 999)
  const createdAt = new Date(cfdi.created_at)
  return createdAt > entryDeadline
}

const isBlockedAtEntry = (cfdi: any): boolean => {
  if (cfdi.blocked_at_entry === true) return true
  return isEnteredLate(cfdi)
}

const isCreditExpired = (cfdi: any): boolean => {
  const creditDays = cfdi.supplier_credit_days ?? 0
  
  // If no supplier linked, we can't validate credit days
  if (!cfdi.supplier_id) {
    return false
  }

  const invoiceDate = new Date(cfdi.invoice_date + 'T00:00:00')
  const deadline = new Date(invoiceDate)
  
  // If credit days is 0, deadline is end of the same day
  // Otherwise, add credit days to the invoice date
  if (creditDays === 0) {
    deadline.setHours(23, 59, 59, 999)
  } else {
    deadline.setDate(deadline.getDate() + creditDays)
    deadline.setHours(23, 59, 59, 999)
  }

  const now = new Date()
  return now > deadline
}


const canProcessCfdi = (cfdi: any): boolean => {
  if (isBlockedAtEntry(cfdi)) return false
  if (isCreditExpired(cfdi)) return false
  return true
}

const prefixYears = computed(() => {
  const years = []
  for (let i = initialYear; i <= maxYear; i++) {
    // last two digits of the year
    const year = i.toString().slice(-2)
    years.push(`${year}`)
  }
  return years
})

const catalogs = ref<any>({
  charges: [],
})
const supplierCfdis = ref({
  data: [] as any,
  current_page: 1,
  page: 1,
  perPage: 10,
  last_page: 1,
})

const canValidateSat = computed(() => hasPermission(permissions.SupplierCfdiValidateSat))

const columnClass = (note: any) => {
  return {
    '': note.deleted_at == null,
    'bg-red-100! dark:bg-red-900!': note.deleted_at != null,
    'bg-yellow-100! dark:bg-yellow-900!': rfcReceptorNotTM(note),
  }
}

const validateCfdiSatRow = async (cfdi: any) => {
  try {
    cfdi._validatingSat = true
    const response = await $api.suppliers.validateCfdiSat(cfdi.id.toString())

    cfdi.sat_status = response.sat_status
    cfdi.sat_status_label = response.sat_status_label
    cfdi.sat_validated_at = response.sat_validated_at
    cfdi.sat_validator = response.sat_validator
    cfdi.is_sat_valid = response.is_sat_valid

    if (response.sat_status === 'Vigente') {
      snackbar.add({ type: 'success', text: `CFDI ${cfdi.serie_folio} está vigente en SAT` })
    } else if (response.sat_status === 'Cancelado') {
      snackbar.add({ type: 'error', text: `CFDI ${cfdi.serie_folio} está CANCELADO en SAT` })
    } else {
      snackbar.add({ type: 'warning', text: response.message || `Resultado SAT para CFDI ${cfdi.serie_folio}` })
    }
  } catch (e: any) {
    console.error(e)
    snackbar.add({ type: 'error', text: e?.response?.data?.message || 'Error al validar CFDI con SAT' })
  } finally {
    cfdi._validatingSat = false
  }
}

const requestCfdiPayments = () => {
  console.log('Requesting payment module')
  router.push('/invoices/suppliers/cfdis/request-payment')
}

const viewSupplierCfdi = (cfdi: any) => {
  // snackbar.add({ type: 'warning', text: 'Not implemented yet' })
  router.push(`/invoices/suppliers/cfdis/view-${cfdi.id}`)
}

const editSupplierCfdi = (cfdi: any) => {
  router.push(`/invoices/suppliers/cfdis/edit-${cfdi.id}`)
}

const showConfirmDelete = async (supplierCfdi: any) => {
  const result = await confirm({
    title: 'Are you sure?',
    confirmationText: 'Update',
    content: 'Please confirm you want to delete or restore it.',
    dialogProps: {
      persistent: true,
      maxWidth: 500,
    },
    confirmationButtonProps: {
      color: 'primary',
    },
  })

  if (result) {
    try {
      loadingStore.start()
      const response = await $api.suppliers.deleteCfdi(supplierCfdi.id)
      snackbar.add({ type: 'success', text: 'Supplier CFDI deleted' })
      await getSupplierCfdis()
    } catch (e) {
      console.error(e)
    } finally {
      setTimeout(() => {
        loadingStore.stop()
      }, 250)
    }
  }
}

const addFolio = () => {
  // check null, trim and add to folios and then unique it
  if (filters.value.ifolio != null && filters.value.ifolio.trim() !== '') {
    filters.value.folios.push(filters.value.ifolio.trim())
    filters.value.folios = filters.value.folios.filter(
      (value: any, index: any, self: any) => self.indexOf(value) === index
    )
    filters.value.ifolio = ''
  }
}

const removeFolio = (index: number) => {
  filters.value.folios.splice(index, 1)
}

const isTouched = (cfdi: any) => {
  return cfdi.amount_provisioned < cfdi.amount_cfdi
}

const rfcReceptorNotTM = (cfdi: any) => {
  return cfdi.rfc_receptor != 'TMU861110IP2'
}

const hasSupplierLinked = (cfdi: any) => {
  return cfdi.supplier_id != null
}

const syncSupplierCfdi = async (id: number) => {
  try {
    loadingStore.start()
    const body = {
      id: id,
    }
    const response = await $api.suppliers.syncSupplierCfdiSupplier(body)
    if (response.supplier_id != null) {
      snackbar.add({ type: 'success', text: 'Supplier CFDI synced' })
    } else {
      snackbar.add({ type: 'error', text: `Supplier with RFC ${response.rfc_emisor} not found` })
    }

    await getSupplierCfdis()
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const onClickFilters = async () => {
  // set current page to 1
  supplierCfdis.value.current_page = 1
  await getSupplierCfdis()
}

const onClickPagination = async (page: number) => {
  supplierCfdis.value.current_page = page
  await getSupplierCfdis()
}

const getSupplierCfdis = async () => {
  try {
    loadingStore.start()
    const response = await $api.suppliers.getFactraCfdis({
      query: {
        ...flattenArraysToCommaSeparatedString(filters.value),
        page: supplierCfdis.value.current_page,
      },
    })

    supplierCfdis.value = response as any
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const clearFilters = async () => {
  filters.value = {
    invoiceDate: '',
    startDate: '',
    endDate: '',
    supplierId: '',
    tipoComprobante: '',
    serie: '',
    folio: '',
    folios: [] as string[],
    ifolio: '',
    serviceType: null,
    serviceYear: null,
    serviceNumbers: null,
    rfcEmisor: '',
    uuid: '',
    currencyId: null,
    hasSupplier: null,
    amountProvisioned: null,
  }
  await getSupplierCfdis()
}

const getCatalogs = async () => {
  try {
    const response = await $api.suppliers.getFactraCfdisSearchFilters()
    catalogs.value = response
  } catch (e) {
    console.error(e)
  }
}
onMounted(async () => {
  await getSupplierCfdis()
  await getCatalogs()
})
</script>
