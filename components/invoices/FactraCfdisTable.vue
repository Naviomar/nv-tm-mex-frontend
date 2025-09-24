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
                <v-chip v-for="(folio, index) in filters.folios" :key="`folio-${index}`" @click="removeFolio(index)">
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
                :key="`supplier-cfdi-${index}`"
                :class="columnClass(cfdi)"
              >
                <td>
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
const { $api, $notifications } = useNuxtApp()
const snackbar = useSnackbar()
const confirm = $notifications.useConfirm()
const router = useRouter()
const loadingStore = useLoadingStore()

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
})

const initialYear = 2022
const currentYear = new Date().getFullYear()
const maxYear = currentYear + 1

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

const columnClass = (note: any) => {
  return {
    '': note.deleted_at == null,
    'bg-red-100! dark:bg-red-900!': note.deleted_at != null,
    'bg-yellow-100! dark:bg-yellow-900!': rfcReceptorNotTM(note),
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
