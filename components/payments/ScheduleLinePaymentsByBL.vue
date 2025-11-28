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
              <v-btn @click="importScheduleFile" color="primary" size="small">Start import</v-btn>
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

const lineBanks = computed(() => {
  // solo banks que tenga el currency_id = 2
  return form.line ? form.line.banks.filter((bank: any) => bank.currency_id === 2) : []
})

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

const importScheduleFile = async () => {
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
    const response = await $api.linePayments.saveScheduleFile(body)

    imported.value = response as any

    snackbar.add({ type: 'success', text: 'File imported successfully' })
  } catch (e) {
    console.error(e)
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
