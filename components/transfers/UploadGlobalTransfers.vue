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
                    accept=".xlsx"
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

  await uploadBankMovements()
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

const uploadBankMovements = async () => {
  try {
    results.value.hasResults = false
    loadingStore.loading = true
    const body = {
      bank_account_id: form.value.bank_account_id,
      archivo: form.value.archivo,
    }
    const response = await $api.bankMovements.uploadBankMovements(body)

    snackbar.add({ type: 'success', text: 'Bank movements uploaded successfully' })

    results.value.hasResults = true
    results.value.data = response
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}
</script>
