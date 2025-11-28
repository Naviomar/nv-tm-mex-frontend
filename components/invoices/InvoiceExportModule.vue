<template>
  <div>
    <div @keyup.enter="onClickFilters">
      <div class="font-bold mb-2">Filters</div>
      <div class="grid grid-cols-3 gap-4">
        <div>
          <v-text-field
            v-model="filters.invoice_number"
            type="text"
            density="compact"
            label="Invoice ID"
            hide-details
          />
        </div>
        <div>
          <v-text-field v-model="filters.from" type="date" density="compact" label="Date from" hide-details />
        </div>
        <div>
          <v-text-field v-model="filters.to" type="date" density="compact" label="Date to" hide-details />
        </div>
        <div>
          <v-autocomplete
            v-model="filters.cfdiOption"
            density="compact"
            label="Invoice type"
            clearable
            :items="[
              { value: 'withcfdi', name: 'Timbradas' },
              { value: 'withoutcfdi', name: 'Sin timbrar' },
              { value: 'all', name: 'Todas' },
            ]"
            item-title="name"
            item-value="value"
          />
        </div>
      </div>
      <div class="flex gap-5">
        <v-btn class="mx-4" color="secondary" @click="clearFilters"> Clear </v-btn>
        <v-btn color="primary" @click="onClickFilters"> Search </v-btn>
        <v-btn color="amber" @click="exportDataXlsx"><v-icon>mdi-microsoft-excel</v-icon> Export excel </v-btn>
      </div>
    </div>
    <div>
      <v-pagination
        v-model="invoices.current_page"
        :length="invoices.last_page"
        rounded="circle"
        density="compact"
        @update:model-value="onClickPagination"
      ></v-pagination>
      <v-table density="compact" fixed-header>
        <thead>
          <tr>
            <th class="text-left">Linked services</th>
            <th class="text-left">Type</th>
            <th class="text-left">Invoice date</th>
            <th class="text-left">Invoice #</th>
            <th class="text-left">Total</th>
            <th class="text-left">Charge(s)</th>
            <th class="text-left">Método de pago</th>
            <th class="text-left">Forma de pago</th>
            <th class="text-left">Moneda</th>
            <th class="text-left">RFC</th>
            <th class="text-left">Customer</th>
            <th class="text-left">UUID</th>
            <th class="text-left">XML / PDF</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(servInvoice, index) in invoices.data"
            :key="`bofa-${index}`"
            :class="{
              'dark:hover:bg-gray-700 hover:bg-slate-300': true,
              'bg-red-100! dark:bg-red-900!': servInvoice.deleted_at,
            }"
          >
            <td>
              <div v-if="servInvoice.is_free_format == 1">
                <v-chip size="small" color="primary"> Free format </v-chip>
              </div>
              <div v-if="servInvoice.is_free_format == 0" class="flex gap-2">
                <v-chip
                  v-for="(service, index) in servInvoice.services"
                  :key="`service-${index}`"
                  size="small"
                  color="primary"
                >
                  {{ getServiceName(service) }}
                </v-chip>
              </div>
            </td>
            <td>
              <v-chip size="xsmall" color="primary" class="px-4">
                {{ servInvoice.source }}
              </v-chip>
            </td>
            <td class="whitespace-nowrap">
              <UserInfoBadge :item="servInvoice">
                {{ formatDateString(servInvoice.created_at) }}
              </UserInfoBadge>
            </td>
            <td class="whitespace-nowrap">{{ servInvoice.invoice?.invoice_number }}</td>
            <td>{{ servInvoice.invoice?.currency?.code }} {{ formatToCurrency(servInvoice.invoice?.total || 0) }}</td>
            <td>
              <div v-for="(charge, index) in servInvoice.invoice?.charges" :key="`charge-${index}`">
                {{ formatToCurrency(charge.amount) }} - {{ charge.charge.name }}
              </div>
            </td>
            <td>
              {{ servInvoice.metodo_pago }}
            </td>
            <td>
              {{ servInvoice.forma_pago }}
            </td>
            <td>
              {{ servInvoice.invoice?.currency?.code }}
            </td>
            <td>
              {{ servInvoice.rfc }}
            </td>
            <td>
              <div v-if="servInvoice.consignee">
                {{ servInvoice.consignee.name }}
              </div>
              <div v-if="servInvoice.partyable">
                {{ servInvoice.partyable.name }}
              </div>
            </td>
            <td>
              {{ servInvoice.uuid || 'CFDI pendiente' }}
            </td>
            <td>
              <div>
                <ButtonDownloadS3Object2 :s3Path="servInvoice.xml_attachment" label="Download XML" />

                <ButtonDownloadS3Object2 :s3Path="servInvoice.pdf_attachment" label="Download PDF" />
              </div>
            </td>
          </tr>
        </tbody>
      </v-table>
      <v-pagination
        v-model="invoices.current_page"
        :length="invoices.last_page"
        rounded="circle"
        density="compact"
        @update:model-value="onClickPagination"
      ></v-pagination>
    </div>
  </div>
</template>

<script setup lang="ts">
const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()

const filters = ref({
  invoice_number: '',
  from: '',
  to: '',
  cfdiOption: 'withoutcfdi',
})
const invoices = ref({
  data: [] as any,
  current_page: 1,
  page: 1,
  last_page: 1,
})

const clearFilters = async () => {
  filters.value = {
    invoice_number: '',
    from: '',
    to: '',
    cfdiOption: 'withoutcfdi',
  }
  getInvoices()
}

const onClickFilters = async () => {
  // set current page to 1
  invoices.value.current_page = 1
  await getInvoices()
}

const onClickPagination = async (page: number) => {
  invoices.value.current_page = page
  await getInvoices()
}

const getServiceName = (service: any) => {
  if (service.referencia) {
    return service.referencia.reference_number
  }
  if (service.air_reference) {
    return service.air_reference.reference_number
  }
}

const getInvoices = async () => {
  try {
    loadingStore.loading = true
    const response = await $api.invoices.getInvoicesExport({
      query: {
        page: invoices.value.current_page,
        ...flattenArraysToCommaSeparatedString(filters.value),
      },
    })

    invoices.value = response as any
    console.log(invoices)
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const exportDataXlsx = async () => {
  try {
    // if filters.cfdiOption is 'all' or 'withcfdi' alert the user that the export contain invoices with cfdi
    if (filters.value.cfdiOption === 'all' || filters.value.cfdiOption === 'withcfdi') {
      snackbar.add({ type: 'warning', text: 'The export will contain invoices with CFDI' })
    }
    loadingStore.loading = true

    const response = await $api.invoices.exportDataXlsx({
      query: {
        ...flattenArraysToCommaSeparatedString(filters.value),
      },
    })

    const blob = new Blob([response], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    const link = document.createElement('a')
    link.href = window.URL.createObjectURL(blob)
    link.download = 'invoicesTm.xlsx'
    link.click()
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}
</script>
