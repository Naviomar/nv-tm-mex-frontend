<template>
  <div>
    <v-card>
      <v-card-text>
        <div class="grid grid-cols-2 gap-5">
          <div>
            <v-card >
              <v-card-title>Upload bank movements</v-card-title>
              <v-card-text>
                <div>Steps:</div>
                <ul class="ml-4 list-disc">
                  <li>Select the bank account to inject movements</li>
                  <li>Review the data & confirmation</li>
                  <li>
                    <v-btn size="x-small" color="blue" variant="tonal" @click="onClickDownloadLayout"
                      >Download layout</v-btn
                    >
                  </li>
                </ul>

                <v-divider></v-divider>

                <div class="mt-4">Select a bank account to inject movements:</div>
                <v-btn size="x-small" color="green" variant="tonal" class="mb-4" @click="viewBankAccounts"
                  >View bank accounts</v-btn
                >
                <v-autocomplete
                  v-model="form.bank_account_id"
                  :items="bankAccounts"
                  item-title="bank_account"
                  item-value="id"
                  label="Bank account"
                  density="compact"
                  @update:model-value="getBankMovements"
                />
                <div class="">
                  <v-file-input
                    v-model="form.archivo"
                    density="compact"
                    label="Select a file to upload"
                    accept=".xlsx,.csv"
                    show-size
                    show-file-size
                    show-file-name
                  />
                </div>
              </v-card-text>
              <v-card-actions>
                <v-btn color="primary" @click="onClickStartImport">Start import</v-btn>
              </v-card-actions>
            </v-card>
          </div>
          <div>
            <v-card v-if="form.bank_account_id" color="yellow1">
              <v-card-title>Latest 50 movements added</v-card-title>
              <v-card-text>
                <v-skeleton-loader v-if="loadingStore.loading" type="table" />
                <v-alert v-if="form.latest_movements.length === 0" color="warning" dense>No movements found</v-alert>
                <v-table v-if="form.latest_movements.length > 0" density="compact">
                  <thead>
                    <tr>
                      <th class="text-left">Date added</th>
                      <th class="text-left">Description</th>
                      <th class="text-left">Amount</th>
                      <th class="text-left">Created by</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="movement in form.latest_movements" :key="`b-mov-${movement.id}`">
                      <td>{{ formatDateString(movement.created_at) }}</td>
                      <td>{{ movement.description }}</td>
                      <td>{{ formatToCurrency(movement.amount) }}</td>
                      <td>{{ movement.creator?.name }}</td>
                    </tr>
                  </tbody>
                </v-table>
              </v-card-text>
            </v-card>
          </div>
        </div>

        <v-divider></v-divider>

        <div class="grid grid-cols-1 py-4">
          <v-card v-if="results.hasResults" color="#EEEEEE">
            <v-card-title>Import results</v-card-title>
            <v-card-text>
              <v-alert color="success" dense>Bank movements uploaded successfully</v-alert>
              <v-alert v-if="results.data.length === 0" color="warning" dense>No movements found</v-alert>

              <div v-if="results.data.length > 0" v-for="(sheet, index) in results.data" :key="`sheet-${index}`">
                <div v-if="sheet.newValues.length > 0">
                  <h1 class="text-xl font-bold">New bank movements added</h1>
                  <v-table density="compact">
                    <thead>
                      <tr>
                        <th class="text-left">Account number</th>
                        <th class="text-left">Date</th>
                        <th class="text-left">Time</th>
                        <th class="text-left">Amount</th>
                        <th class="text-left">Description</th>
                        <th class="text-left">Reference</th>
                        <th class="text-left w-64">Text</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(newMovement, index) in sheet.newValues" :key="`b-mov-${index}`">
                        <td>{{ newMovement.account_number }}</td>
                        <td>{{ formatDateOnlyString(newMovement.movement_date) }}</td>
                        <td>{{ newMovement.movement_time }}</td>
                        <td>{{ formatToCurrency(newMovement.amount) }}</td>
                        <td>{{ newMovement.description }}</td>
                        <td>{{ newMovement.reference }}</td>
                        <td>{{ newMovement.text }}</td>
                      </tr>
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colspan="5" class="text-right font-bold!">Total new movements</td>
                        <td colspan="2" class="font-bold!">{{ sheet.newValues.length }}</td>
                      </tr>
                    </tfoot></v-table
                  >
                </div>

                <div v-if="sheet.errors.length > 0">
                  <h1 class="text-xl font-bold">Errors</h1>
                  <v-table density="compact">
                    <thead>
                      <tr>
                        <th class="text-left">Account number</th>
                        <th class="text-left">Date</th>
                        <th class="text-left">Time</th>
                        <th class="text-left">Amount</th>
                        <th class="text-left">Description</th>
                        <th class="text-left">Reference</th>
                        <th class="text-left w-64">Text</th>
                        <th class="text-left">Error msg</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(errorMov, index) in sheet.errors" :key="`b-error-mov-${index}`" class="bg-red">
                        <td>{{ errorMov.movement.account_number }}</td>
                        <td>{{ formatDateOnlyString(errorMov.movement.movement_date) }}</td>
                        <td>{{ errorMov.movement.movement_time }}</td>
                        <td>{{ formatToCurrency(errorMov.movement.amount) }}</td>
                        <td>{{ errorMov.movement.description }}</td>
                        <td>{{ errorMov.movement.reference }}</td>
                        <td>{{ errorMov.movement.text }}</td>
                        <td>{{ errorMov.error }}</td>
                      </tr>
                    </tbody>
                    <tfoot>
                      <tr class="bg-red">
                        <td colspan="7" class="text-right font-bold!">Total errors</td>
                        <td class="font-bold!">{{ sheet.errors.length }}</td>
                      </tr>
                    </tfoot>
                  </v-table>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </div>
      </v-card-text>
    </v-card>

    <v-dialog v-model="previewDialog.show" max-width="1200" persistent>
      <v-card>
        <v-card-title class="bg-blue-darken-1 text-white">
          Confirm BofA payments to upload
        </v-card-title>
        <v-card-text class="pt-4">
          <v-skeleton-loader v-if="previewDialog.loading" type="table" />
          <div v-if="!previewDialog.loading">
            <v-alert type="warning" variant="tonal" density="compact" class="mb-4">
              <div class="font-weight-medium">Please verify that the Reference column is correct for each payment before uploading.</div>
              <div class="text-caption mt-1">If this file was created from a CSV export, we recommend uploading it in Excel (.xlsx) format instead to avoid reference parsing issues.</div>
            </v-alert>

            <div v-if="previewDialog.movements.length > 0">
              <h3 class="text-h6 mb-2">
                <v-icon color="green" class="mr-1">mdi-check-circle</v-icon>
                Valid payments ({{ previewDialog.movements.length }})
              </h3>
              <v-table density="compact" class="border">
                <thead>
                  <tr class="bg-green-lighten-4">
                    <th class="text-left" style="width: 40px">
                      <v-checkbox
                        v-model="previewDialog.selectAll"
                        hide-details
                        density="compact"
                        @update:model-value="onToggleSelectAll"
                      />
                    </th>
                    <th class="text-left" style="min-width: 140px">Date</th>
                    <th class="text-left">Amount</th>
                    <th class="text-left">Direction</th>
                    <th class="text-left">Account Name</th>
                    <th class="text-left">Data Type</th>
                    <th class="text-left">BAI Code</th>
                    <th class="text-left">Description</th>
                    <th class="text-left bg-yellow-lighten-3">Reference</th>
                    <th class="text-left w-64">Text</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="movement in previewDialog.movements"
                    :key="`prev-mov-${movement.row_index}`"
                  >
                    <td>
                      <v-checkbox
                        :model-value="previewDialog.selectedIndices.includes(movement.row_index)"
                        hide-details
                        density="compact"
                        @update:model-value="onToggleRow(movement.row_index, $event)"
                      />
                    </td>
                    <td>{{ formatDateOnlyString(movement.movement_date) }}</td>
                    <td>{{ formatToCurrency(movement.amount) }}</td>
                    <td>
                      <v-chip
                        :color="movement.movement === 'deposit' ? 'green' : 'red'"
                        size="x-small"
                        variant="tonal"
                      >
                        {{ movement.movement }}
                      </v-chip>
                    </td>
                    <td class="text-caption">{{ movement.account_name || '-' }}</td>
                    <td class="text-caption">{{ movement.data_type || '-' }}</td>
                    <td class="text-caption">{{ movement.bai_code || '-' }}</td>
                    <td>{{ movement.description }}</td>
                    <td class="bg-yellow-lighten-4 font-weight-medium">{{ movement.reference }}</td>
                    <td class="text-truncate" style="max-width: 200px">{{ movement.text }}</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr class="bg-green-lighten-4">
                    <td colspan="8" class="text-right font-weight-bold">
                      Selected: {{ previewDialog.selectedIndices.length }} / {{ previewDialog.movements.length }}
                    </td>
                    <td colspan="2" class="font-weight-bold">
                      Total: {{ formatToCurrency(selectedTotalAmount) }}
                    </td>
                  </tr>
                </tfoot>
              </v-table>
            </div>

            <div v-if="previewDialog.errors.length > 0" class="mt-4">
              <h3 class="text-h6 mb-2">
                <v-icon color="red" class="mr-1">mdi-alert-circle</v-icon>
                Errors ({{ previewDialog.errors.length }})
              </h3>
              <v-alert type="warning" variant="tonal" density="compact" class="mb-2">
                These payments cannot be uploaded and are not selectable.
              </v-alert>
              <v-table density="compact" class="border">
                <thead>
                  <tr class="bg-red-lighten-4">
                    <th class="text-left" style="width: 40px"></th>
                    <th class="text-left">Date</th>
                    <th class="text-left">Amount</th>
                    <th class="text-left">Description</th>
                    <th class="text-left">Reference</th>
                    <th class="text-left w-64">Text</th>
                    <th class="text-left">Error</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(err, index) in previewDialog.errors"
                    :key="`prev-err-${index}`"
                    class="bg-red-lighten-5"
                  >
                    <td>
                      <v-checkbox disabled hide-details density="compact" />
                    </td>
                    <td>{{ err.movement?.movement_date ? formatDateOnlyString(err.movement.movement_date) : '-' }}</td>
                    <td>{{ err.movement?.amount ? formatToCurrency(err.movement.amount) : '-' }}</td>
                    <td>{{ err.movement?.description || '-' }}</td>
                    <td>{{ err.movement?.reference || '-' }}</td>
                    <td class="text-truncate" style="max-width: 200px">{{ err.movement?.text || '-' }}</td>
                    <td class="text-red font-weight-medium">{{ err.error }}</td>
                  </tr>
                </tbody>
              </v-table>
            </div>
          </div>
        </v-card-text>
        <v-card-actions class="px-4 pb-4">
          <v-spacer />
          <v-btn variant="text" @click="onCancelPreview">Cancel</v-btn>
          <v-btn
            color="primary"
            :disabled="previewDialog.selectedIndices.length === 0 || previewDialog.loading"
            @click="onConfirmUpload"
          >
            <v-icon start>mdi-upload</v-icon>
            Confirm upload ({{ previewDialog.selectedIndices.length }})
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script setup lang="ts">
import { systemLayouts } from '~/utils/data/system'
const { $api } = useNuxtApp()
const loadingStore = useLoadingStore()
const snackbar = useSnackbar()
const router = useRouter()
const darkMode = useDarkMode()

const bankAccounts = ref<any>([])
const form = ref({
  bank_account_id: null,
  latest_movements: [] as any[],
  archivo: [] as any[],
})

const results = ref<any>({
  hasResults: false,
  data: [],
})

const previewDialog = ref({
  show: false,
  loading: false,
  movements: [] as any[],
  errors: [] as any[],
  selectedIndices: [] as number[],
  selectAll: false,
})

const selectedTotalAmount = computed(() => {
  return previewDialog.value.movements
    .filter((m: any) => previewDialog.value.selectedIndices.includes(m.row_index))
    .reduce((sum: number, m: any) => sum + Number(m.amount), 0)
})

const onClickStartImport = async () => {
  if (!form.value.bank_account_id) {
    snackbar.add({
      type: 'error',
      text: 'Please select a bank account to inject movements.',
    })
    return
  }
  if (!form.value.archivo || form.value.archivo.length === 0) {
    snackbar.add({
      type: 'error',
      text: 'Please select a file to upload.',
    })
    return
  }

  await previewUpload()
}

onMounted(async () => {
  await getBankAccounts()
})

const getBankAccounts = async () => {
  try {
    loadingStore.loading = true
    const response = await $api.systemAccounts.getAllBankAccounts()

    bankAccounts.value = response as any
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const viewBankAccounts = () => {
  router.push('/system/bank-accounts')
}

const onClickDownloadLayout = async () => {
  try {
    loadingStore.loading = true

    const response = await $api.aws.downloadS3Object(systemLayouts.bankMovements.path)

    const url = URL.createObjectURL(response as any)
    const a = document.createElement('a')
    a.href = url

    a.download = systemLayouts.bankMovements.filename
    document.body.appendChild(a)
    a.click()

    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.loading = false
    }, 100)
  }
}

const getBankMovements = async () => {
  try {
    if (!form.value.bank_account_id) {
      snackbar.add({
        type: 'error',
        text: 'Please select a bank account to inject movements.',
      })
      return
    }
    loadingStore.loading = true
    const response = await $api.bankMovements.getBankAccountLatestMovements(form.value.bank_account_id)

    form.value.latest_movements = response as any
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const previewUpload = async () => {
  try {
    previewDialog.value.loading = true
    const body = {
      bank_account_id: form.value.bank_account_id,
      archivo: form.value.archivo,
    }
    const response = await $api.bankMovements.previewUpload(body)
    const data = response as any

    if (data.is_bofa) {
      previewDialog.value.movements = data.movements || []
      previewDialog.value.errors = data.errors || []
      previewDialog.value.selectedIndices = []
      previewDialog.value.selectAll = false
      previewDialog.value.show = true
    } else {
      await uploadBankMovements()
    }
  } catch (e) {
    console.error(e)
    snackbar.add({ type: 'error', text: 'Error previewing file' })
  } finally {
    previewDialog.value.loading = false
  }
}

const onToggleSelectAll = (checked: boolean) => {
  if (checked) {
    previewDialog.value.selectedIndices = previewDialog.value.movements.map((m: any) => m.row_index)
  } else {
    previewDialog.value.selectedIndices = []
  }
}

const onToggleRow = (rowIndex: number, checked: boolean) => {
  if (checked) {
    if (!previewDialog.value.selectedIndices.includes(rowIndex)) {
      previewDialog.value.selectedIndices.push(rowIndex)
    }
  } else {
    previewDialog.value.selectedIndices = previewDialog.value.selectedIndices.filter((idx: number) => idx !== rowIndex)
  }
  previewDialog.value.selectAll =
    previewDialog.value.selectedIndices.length === previewDialog.value.movements.length
}

const onCancelPreview = () => {
  previewDialog.value.show = false
  previewDialog.value.movements = []
  previewDialog.value.errors = []
  previewDialog.value.selectedIndices = []
}

const onConfirmUpload = async () => {
  previewDialog.value.show = false
  await uploadBankMovements(previewDialog.value.selectedIndices)
}

const uploadBankMovements = async (selectedIndices?: number[]) => {
  try {
    results.value.hasResults = false
    loadingStore.loading = true
    const body = {
      bank_account_id: form.value.bank_account_id,
      archivo: form.value.archivo,
    }
    const response = await $api.bankMovements.uploadBankMovements(body, selectedIndices)

    snackbar.add({ type: 'success', text: 'Bank movements uploaded successfully' })

    results.value.hasResults = true
    results.value.data = response

    await getBankMovements()
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}
</script>
