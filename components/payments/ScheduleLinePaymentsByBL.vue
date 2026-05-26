<template>
  <div>
    <v-card>
      <v-card-title>
        <h1 class="text-xl font-bold">Schedule BLs release payment</h1>
      </v-card-title>
      <v-card-text>
        <ul class="ml-4 list-disc">
          <li>
            Generate a report for the release of payment of BLs. Go to the
            <router-link to="/payments/lines/schedules/report-bls" class="text-blue-500"
              >Report for release payment BLs</router-link
            >
            page.
          </li>
        </ul>
        <div class="grid grid-cols-2 justify-center items-center gap-2 py-4">
          <div>
            <AGlobalSearch
              :onSearch="searchLines"
              v-model="form.line"
              itemTitle="name_type"
              return-object
              hide-details
              label="Freight line *"
            />

            <v-alert v-if="!lineBanks.length && form.line" density="compact" type="warning" variant="outlined">
              The selected freight line has no bank accounts. Go to freight line config to add at least one bank
              acccount. Go to
              <NuxtLink :to="`/configuration/lines/edit-${form.line.id}`" target="_blank" class="underline">
                <v-icon small>mdi-open-in-new</v-icon>
                Go to {{ form.line?.name }} configuration</NuxtLink
              >.
            </v-alert>
            <v-card class="my-2">
              <v-card-title> Select a bank account:</v-card-title>
              <v-card-text>
                <v-autocomplete
                  v-model="form.line_bank_id"
                  :items="lineBanks"
                  item-value="id"
                  item-title="full_account"
                  label="Bank Account *"
                  density="compact"
                />
              </v-card-text>
            </v-card>
            <v-file-input
              v-model="form.file"
              accept=".xlsx"
              density="compact"
              label="Import schedule file"
              prepend-icon="mdi-file-excel"
              placeholder="Select your file"
            />
            <div class="">
              <v-btn @click="previewScheduleFile" color="primary" size="small">Preview & Validate</v-btn>
            </div>
          </div>
          <div>
            <v-alert density="compact" type="info" variant="outlined">
              <div class="text-sm">
                <p>
                  <strong>Important to known:</strong>
                </p>
                <ul class="list-disc">
                  <li>
                    When the maritime service is for import, the purchase concept called "ocean freight" is considered
                    only.
                  </li>
                  <li>
                    When it is for maritime export, the concepts that are from the freight line and are marked as within
                    BL are considered only.
                  </li>
                  <li>The BLs must all belong to the same shipping line.</li>
                </ul>
              </div>
            </v-alert>
          </div>
        </div>

        <div class="mt-6">Import results:</div>
        <v-alert density="compact" type="warning" variant="outlined">
          If any error occurs during the import, it wont be registered the schedule into the system. Please fix the
          errors and try again.
        </v-alert>
        <v-table density="compact">
          <thead>
            <tr>
              <th class="text-left">¿Error?</th>
              <th class="text-left">Message</th>
              <th class="text-left">BL</th>
              <th class="text-left">Reference #</th>
              <th class="text-left">Amount scheduled</th>
              <th class="text-left">Pending</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(data, index) in imported" :key="`pay-data-${index}`">
              <td>
                <v-chip v-if="data.error" color="error" size="small">
                  <v-icon small>mdi-alert-circle-outline</v-icon>Error
                </v-chip>
                <v-chip v-if="!data.error" color="success" size="small">
                  <v-icon small>mdi-check-circle-outline</v-icon> Ok
                </v-chip>
              </td>
              <td>{{ data.message }}</td>
              <td>{{ data.bl }}</td>
              <td class="whitespace-nowrap">{{ data.referencia?.reference_number ?? '-' }}</td>
              <td class="whitespace-nowrap">{{ formatToCurrency(data.amount) }}</td>
              <td class="whitespace-nowrap">{{ formatToCurrency(data.pending_amount) }}</td>
            </tr>
          </tbody>
        </v-table>
      </v-card-text>
    </v-card>

    <!-- Preview Modal -->
    <v-dialog v-model="showPreviewModal" max-width="1400px" persistent>
      <v-card>
        <v-card-title class="bg-orange-darken-1 text-white">
          <span class="text-h6">Validate Payment Schedule</span>
          <v-spacer />
          <v-chip color="white" variant="tonal">
            {{ previewData.length }} BLs to process
          </v-chip>
        </v-card-title>
        <v-card-text class="pa-4">
          <v-alert type="info" variant="tonal" density="compact" class="mb-4">
            Please review the payment schedule data below. You cannot edit the values here. If everything is correct,
            click "Confirm & Process" to proceed. Otherwise, fix the Excel file and try again.
          </v-alert>

          <v-table density="compact" class="border">
            <thead>
              <tr class="bg-grey-lighten-4">
                <th class="text-left">Status</th>
                <th class="text-left">BL</th>
                <th class="text-left">Reference #</th>
                <th class="text-right">WM Pay</th>
                <th class="text-right">TM Pay</th>
                <th class="text-left">Add Locales</th>
                <th class="text-right">Compra $ Flete</th>
                <th class="text-right">Compra $ Locales</th>
                <th class="text-right">Amount Scheduled</th>
                <th class="text-right">Pending</th>
                <th class="text-right">Scheduled Total</th>
                <th class="text-left">Message</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(data, index) in previewData"
                :key="`preview-${index}`"
                :class="data.error ? 'bg-red-lighten-5' : ''"
              >
                <td>
                  <v-chip v-if="data.error" color="error" size="small">
                    <v-icon small>mdi-alert-circle-outline</v-icon> Error
                  </v-chip>
                  <v-chip v-else color="success" size="small">
                    <v-icon small>mdi-check-circle-outline</v-icon> Valid
                  </v-chip>
                </td>
                <td class="font-weight-medium">{{ data.bl }}</td>
                <td class="whitespace-nowrap">{{ data.reference_number ?? '-' }}</td>
                <td class="text-right whitespace-nowrap">{{ formatToCurrency(data.wm_pay) }}</td>
                <td class="text-right whitespace-nowrap">{{ formatToCurrency(data.tm_pay) }}</td>
                <td>
                  <v-chip :color="data.add_locales === 'si' ? 'success' : 'grey'" size="small" variant="tonal">
                    {{ data.add_locales === 'si' ? 'Yes' : 'No' }}
                  </v-chip>
                </td>
                <td class="text-right whitespace-nowrap">{{ formatToCurrency(data.compra_flete) }}</td>
                <td class="text-right whitespace-nowrap">{{ formatToCurrency(data.compra_locales) }}</td>
                <td class="text-right whitespace-nowrap font-weight-bold">{{ formatToCurrency(data.amount) }}</td>
                <td class="text-right whitespace-nowrap">{{ formatToCurrency(data.pending_amount) }}</td>
                <td class="text-right whitespace-nowrap">{{ formatToCurrency(data.scheduled_total) }}</td>
                <td class="text-caption text-grey-darken-1">{{ data.message }}</td>
              </tr>
            </tbody>
          </v-table>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn color="grey" variant="text" @click="showPreviewModal = false">Cancel</v-btn>
          <v-btn
            color="primary"
            @click="confirmSchedule"
            :disabled="previewData.some((d) => d.error)"
            prepend-icon="mdi-check-circle"
          >
            Confirm & Process
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script setup lang="ts">
const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()

const props = defineProps({
  impoExpo: {
    type: String,
    required: true,
  },
})

const catalogs = ref<any>({
  lines: [],
})

const form = reactive<any>({
  line: null,
  line_bank_id: null,
  line_id: null,
  file: null,
})

const imported = ref<any>([])
const showPreviewModal = ref(false)
const previewData = ref<any[]>([])

const lineBanks = computed(() => {
  // solo banks que tenga el currency_id = 2
  return form.line ? form.line.banks.filter((bank: any) => bank.currency_id === 2) : []
})

const formatToCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value)
}

const searchLines = async (search: any) => {
  try {
    const response = await $api.lines.searchLines({
      query: search,
    })
    return response
  } catch (error) {
    snackbar.add({
      type: 'error',
      text: 'Error fetching freight lines',
    })
  }
}

const previewScheduleFile = async () => {
  try {
    if (!form.file || !form.line || !form.line_bank_id) {
      snackbar.add({ type: 'warning', text: 'Please fill all required fields' })
      return
    }
    loadingStore.loading = true
    const body = {
      ...form,
      line_id: form.line.id,
      impoExpo: props.impoExpo,
    }
    const response = await $api.linePayments.previewScheduleFile(body)

    previewData.value = response as any[]
    showPreviewModal.value = true
  } catch (e) {
    console.error(e)
    snackbar.add({ type: 'error', text: 'Error previewing schedule file' })
  } finally {
    setTimeout(() => {
      loadingStore.loading = false
    }, 250)
  }
}

const confirmSchedule = async () => {
  try {
    loadingStore.loading = true
    const body = {
      ...form,
      line_id: form.line.id,
      impoExpo: props.impoExpo,
    }
    const response = await $api.linePayments.saveScheduleFile(body)

    imported.value = response as any
    showPreviewModal.value = false
    previewData.value = []

    snackbar.add({ type: 'success', text: 'File imported successfully' })
  } catch (e) {
    console.error(e)
    snackbar.add({ type: 'error', text: 'Error processing schedule file' })
  } finally {
    setTimeout(() => {
      loadingStore.loading = false
    }, 250)
  }
}

const getCatalogs = async () => {
  try {
    const response = await $api.linePayments.getCatalogs()
    catalogs.value = response
  } catch (e) {
    console.error(e)
  }
}

// watch if selected line has empty banks show snackbar warning
watch(
  () => form.line,
  (newLine) => {
    if (newLine && newLine.banks.length === 0) {
      snackbar.add({
        type: 'warning',
        text: 'Selected line has no bank accounts',
      })
    }
  }
)

await getCatalogs()
</script>
