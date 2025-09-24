<template>
  <div>
    <div class="mb-4" @keyup.enter="onClickFilters">
      <div class="grid grid-cols-12 gap-2">
        <div class="col-span-2">
          <v-autocomplete v-model="filters.year" :items="prefixYears" density="compact" label="Year" />
        </div>
        <div class="col-span-2">
          <v-text-field
            v-model="filters.referencia"
            density="compact"
            label="Add reference #"
            hint="Separate multiple references with commas"
            @keyup.enter="addReferencia"
          />
        </div>
        <div class="col-span-2">
          <v-text-field v-model="filters.masterBl" density="compact" label="Master BL" />
        </div>
        <div class="col-span-2">
          <v-text-field v-model="filters.houseBl" density="compact" label="House BL" />
        </div>
        <div class="col-span-4">
          <AGlobalSearch
            v-model="filters.consignee_id"
            :onSearch="searchCustomers"
            validate-key="consignee_id"
            label="Customer"
          />
        </div>
        <div class="col-span-2">
          <v-text-field v-model="filters.containerNumber" density="compact" label="Container #" />
        </div>
        <div class="col-span-2">
          <v-text-field v-model="filters.bookingNum" density="compact" label="Booking number" />
        </div>
        <div class="col-span-2">
          <v-autocomplete
            v-model="filters.hasTmInvoices"
            density="compact"
            :items="[
              { text: 'Yes', value: 1 },
              { text: 'No', value: 0 },
            ]"
            item-title="text"
            item-value="value"
            label="Has TM invoices"
          />
        </div>
        <div class="col-span-2">
          <v-autocomplete
            v-model="filters.hasWmInvoices"
            density="compact"
            :items="[
              { text: 'Yes', value: 1 },
              { text: 'No', value: 0 },
            ]"
            item-title="text"
            item-value="value"
            label="Has WM invoices"
          />
        </div>
        <div class="col-span-2">
          <v-autocomplete
            density="compact"
            label="Status"
            v-model="filters.deleted_status"
            :items="deletedStatus"
            item-title="name"
            item-value="value"
            hide-details
          />
        </div>
      </div>
      <div v-if="filters.referencias.length > 0">
        <div>Filter by reference(s)</div>
        <div class="flex gap-2">
          <v-chip
            v-for="(ref, index) in filters.referencias"
            :key="`ref-search-${ref}`"
            closable
            @click:close="removeReferencia(index)"
          >
            {{ ref }}
          </v-chip>
        </div>
      </div>
      <div class="flex">
        <v-btn class="mx-4" color="secondary" @click="clearFilters"> Clear </v-btn>
        <v-btn color="primary" @click="onClickFilters"> Search </v-btn>
      </div>
    </div>
    <v-card>
      <v-card-text>
        <v-pagination
          v-model="references.current_page"
          :length="references.last_page"
          rounded="circle"
          density="compact"
          @update:model-value="onClickPagination"
        ></v-pagination>
        <v-table density="compact" fixed-header height="75vh">
          <thead>
            <tr>
              <th class="text-left" width="50">Actions</th>
              <th class="text-left"># Reference</th>
              <th class="text-left">Consignee</th>
              <th class="text-left">Master BL(s)</th>
              <th class="text-left">House BL(s)</th>
              <th class="text-left">Container(s)</th>
              <th class="text-left">Sell concepts</th>
              <th class="text-left">TM invoice(s)</th>
              <th class="text-left">WM invoices(s)</th>
              <th class="text-left">Date</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(item, index) in references.data"
              :key="`reference-${index}`"
              :class="{
                'dark:hover:bg-gray-700 hover:bg-slate-300': true,
                'bg-red-100! dark:bg-red-900!': item.deleted_at,
              }"
            >
              <td>
                <v-btn
                  variant="text"
                  icon="mdi-eye-outline"
                  color="blue-lighten-2"
                  density="compact"
                  @click="viewMaritimeReference(item)"
                ></v-btn>
              </td>
              <td class="whitespace-nowrap">{{ item.reference_number }}</td>
              <td>{{ item.consignee?.name }}</td>
              <td>
                <div class="flex flex-col gap-1">
                  <v-chip
                    v-for="(bl, index) in item.master_bls"
                    :key="`master-bl-${index}`"
                    size="small"
                    color="primary"
                  >
                    {{ bl.name }}
                  </v-chip>
                </div>
              </td>
              <td>
                <div class="flex flex-col gap-1">
                  <v-chip v-for="(bl, index) in item.house_bls" :key="`house-bl-${index}`" size="small" color="primary">
                    {{ bl.name }}
                  </v-chip>
                </div>
              </td>
              <td>
                <div class="flex flex-col gap-1">
                  <v-chip
                    v-for="(container, index) in item.containers"
                    :key="`container-${index}`"
                    size="small"
                    color="primary"
                  >
                    {{ container.container_number }}
                  </v-chip>
                </div>
              </td>
              <td>
                <div v-if="item.export_charges?.length <= 0">
                  <v-chip size="small" variant="elevated" color="error">No concepts</v-chip>
                </div>
                <div v-if="getSellExportCharges(item).length > 0" class="flex flex-col gap-1 mb-2">
                  <v-chip
                    v-for="(charge, index) in getSellExportCharges(item)"
                    :key="`charge-${index}`"
                    size="small"
                    :color="charge.invoice_charge ? 'primary' : 'error'"
                    variant="flat"
                  >
                    <v-icon>{{ charge.invoice_charge ? 'mdi-link' : 'mdi-link-off' }}</v-icon> {{ charge.charge?.name }}
                  </v-chip>
                </div>
              </td>
              <td>
                <div v-if="item.invoice_tms?.length <= 0">
                  <v-chip size="small" color="error">No TM invoices</v-chip>
                </div>
                <div v-if="item.invoice_tms?.length > 0">
                  <v-chip
                    v-for="(invoice, index) in item.invoice_tms"
                    :key="`tm-invoice-${index}`"
                    size="small"
                    color="primary"
                  >
                    #{{ invoice.invoice.invoice_number }} {{ invoiceType(invoice) }}
                  </v-chip>
                </div>
              </td>
              <td>
                <div v-if="item.invoice_wms?.length <= 0">
                  <v-chip size="small" color="error">No WM invoices</v-chip>
                </div>
                <div v-if="item.invoice_wms?.length > 0">
                  <v-chip
                    v-for="(invoice, index) in item.invoice_wms"
                    :key="`wm-invoice-${index}`"
                    size="small"
                    color="primary"
                  >
                    #{{ invoice.invoice.invoice_number }} {{ invoiceType(invoice) }}
                  </v-chip>
                </div>
              </td>
              <td class="whitespace-nowrap">
                <UserInfoBadge :item="item">
                  {{ formatDateString(item.created_at) }}
                </UserInfoBadge>
              </td>
            </tr>
          </tbody>
        </v-table>
        <v-pagination
          v-model="references.current_page"
          :length="references.last_page"
          rounded="circle"
          density="compact"
          @update:model-value="onClickPagination"
        ></v-pagination>
        <div class="text-xs">
          Showing {{ references.from }} to {{ references.to }} from {{ references.total }} total records
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>
<script setup lang="ts">
import { prefixYears } from '~/utils/date'
import { deletedStatus } from '@/utils/data/systemData'
import { flattenArraysToCommaSeparatedString } from '~/utils/formatters'
const { $api } = useNuxtApp()
const loadingStore = useLoadingStore()
const snackbar = useSnackbar()

const emits = defineEmits(['view:reference'])

const catalogs = ref({
  consignees: [] as any,
  freights: [] as any,
  vessels: [] as any,
  voyages: [] as any,
  lines: [] as any,
})

const filters = ref({
  year: '',
  referencia: '',
  referencias: [] as any,
  masterBl: '',
  houseBl: '',
  consignee_id: '',
  hasTmInvoices: null,
  hasWmInvoices: null,
  containerNumber: '',
  bookingNum: '',
  line_id: '',
  deleted_status: '',
})

const references = ref<any>({
  data: [],
  current_page: 1,
  page: 1,
  last_page: 1,
})

const getSellExportCharges = (item: any) => {
  return item.export_charges.filter((charge: any) => charge.is_sell === 1)
}

const addReferencia = () => {
  if (filters.value.referencia) {
    // split by comma and remove empty spaces
    filters.value.referencia = filters.value.referencia.replace(/\s/g, '')
    const refs = Array.from(new Set(filters.value.referencia.split(','))).filter((ref) => ref !== '')
    // remove duplicates in refs array using set

    refs.forEach((ref) => {
      filters.value.referencias.push(ref)
    })
    filters.value.referencias = [...new Set(filters.value.referencias)]
    filters.value.referencia = ''
  }
}

const removeReferencia = (index: number) => {
  filters.value.referencias.splice(index, 1)
}

const onClickFilters = async () => {
  // set current page to 1
  references.value.current_page = 1
  await getSeaExportReferences()
}

const onClickPagination = async (page: number) => {
  references.value.current_page = page
  await getSeaExportReferences()
}

const getSeaExportReferences = async () => {
  try {
    loadingStore.loading = true
    const response = await $api.invoices.getSeaExportReferencias({
      query: {
        page: references.value.current_page,
        ...flattenArraysToCommaSeparatedString(filters.value),
      },
    })

    references.value = response as any
  } catch (e) {
    console.error(e)
  } finally {
    // timeout 1 second
    loadingStore.stop()
  }
}

const invoiceType = (invoice: any) => {
  if (invoice.is_proforma == 1) {
    return 'Proforma'
  }
  return 'Invoice'
}

const searchCustomers = async (search: any) => {
  try {
    const response = await $api.consignees.searchConsignees({
      query: search,
    })
    return response
  } catch (error) {
    snackbar.add({
      type: 'error',
      text: 'Error fetching consignees',
    })
  }
}

const getSeaImportFilters = async () => {
  const response = await $api.referencias.getSeaImportFilters()

  catalogs.value = response as any
}

await getSeaImportFilters()
await getSeaExportReferences()

const clearFilters = async () => {
  filters.value = {
    year: '',
    referencia: '',
    referencias: [],
    masterBl: '',
    houseBl: '',
    consignee_id: '',
    hasTmInvoices: null,
    hasWmInvoices: null,
    containerNumber: '',
    bookingNum: '',
    line_id: '',
    deleted_status: '',
  }
  await getSeaExportReferences()
}

const viewMaritimeReference = (item: any) => {
  console.log(item)
  emits('view:reference', item)
}
</script>
