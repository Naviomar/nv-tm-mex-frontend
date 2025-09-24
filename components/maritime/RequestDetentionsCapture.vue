<template>
  <div>
    <v-card class="mb-4">
      <v-card-title>
        <h1 class="font-bold">Request detentions payment to freight line</h1>
      </v-card-title>
      <v-card-text>
        <div class="grid grid-cols-3 justify-center gap-4 py-4">
          <div class="col-span-1">
            <div class="font-bold text-base">Start searching by Master BLs or container numbers</div>
            <div class="mb-4">
              <v-autocomplete
                v-model="form.type"
                :items="types"
                item-title="text"
                item-value="value"
                label="Select an option to search"
                hide-details
                density="compact"
              />
            </div>
            <v-textarea
              v-model="form.inputNumbers"
              density="compact"
              label="Multiline search"
              placeholder="Enter numbers separated by new line"
              rows="5"
              hide-details
            />
            <v-btn @click="addNumbers" size="small" color="primary">
              <div class="flex gap-2">
                <v-icon>mdi-plus</v-icon>
                <div>Add numbers to search</div>
              </div>
            </v-btn>
          </div>
          <div class="col-span-2">
            <div class="font-bold text-base">{{ countBls }} {{ typeName }} to search:</div>
            <v-list density="compact" max-width="400" class="p-0!">
              <v-list-item
                v-for="(bl, index) in form.numbers"
                :key="`num-${index}`"
                :title="`${typeName}: ${bl}`"
                density="compact"
                class="p-0!"
              >
                <template v-slot:prepend>
                  <v-icon variant="text" size="small">mdi-file-document-outline</v-icon>
                </template>
                <template v-slot:append>
                  <v-btn
                    color="red-lighten-1"
                    icon="mdi-close"
                    variant="text"
                    size="small"
                    @click="removeBl(bl)"
                  ></v-btn>
                </template>
              </v-list-item>
            </v-list>
            <div class="py-4">
              <v-btn @click="searchForDemurrages" color="primary">Start search</v-btn>
            </div>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <v-card>
      <v-card-title>
        <h1 class="font-bold">Service containers found</h1>
      </v-card-title>
      <v-card-text>
        <v-btn color="purple" size="x-small" @click="selectAll">Select all</v-btn>
        <v-table>
          <thead>
            <tr>
              <th></th>
              <th>MBL</th>
              <th>Container</th>
              <th class="bg-orange-500!">Freight line detentions</th>
              <th>Vessel</th>
              <th>Service #</th>
              <th>Customer</th>
              <th>ETD</th>
              <th>ATA</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(refContainer, index) in refContainers" :key="`result-bl-${index}`">
              <td>
                <div>
                  <v-checkbox
                    v-model="refContainer.selected"
                    hide-details
                    :disabled="!hasLineDetentionsAvailable(refContainer)"
                  />
                </div>
              </td>
              <td>{{ refMasterBl(refContainer.referencia) }}</td>
              <td class="whitespace-nowrap">
                {{ refContainer.container_number }} {{ refContainer.container_type?.name }}
              </td>
              <td class="bg-orange-500 whitespace-nowrap">
                <div v-if="!refContainer.detention">No detentions initiated</div>
                <div v-if="refContainer.detention?.req_detention_container">Already requested</div>
                <div v-if="!hasLineDetentionsAvailable(refContainer)">
                  <div>No detentions to pay</div>
                </div>
                <div v-if="hasLineDetentionsAvailable(refContainer)">
                  <div>Pending to pay: {{ formatToCurrency(getLinePayDetentions(refContainer)) }}</div>
                </div>
              </td>
              <td>{{ refContainer.referencia?.voyage_discharge?.name }}</td>
              <td class="whitespace-nowrap">{{ refContainer.referencia?.reference_number }}</td>
              <td>{{ refContainer.referencia?.consignee?.name }}</td>
              <td class="whitespace-nowrap">{{ refContainer.referencia?.voyage_discharge?.eta_date }}</td>
              <td class="whitespace-nowrap">{{ refContainer.referencia?.voyage_discharge?.arrival_date }}</td>
            </tr>
          </tbody>
        </v-table>

        <div v-if="hasSelected" class="py-4">
          <div class="grid grid-cols-1 gap-2">
            <div>
              <SystemSelectBankAccount v-model="reqForm.origin_bank" />
            </div>
          </div>
          <div class="font-bold text-lg my-4">Total to pay: {{ formatToCurrency(totalAmountSelected) }}</div>
          <div class="grid grid-cols-2 gap-2">
            <AGlobalSearch :onSearch="searchLines" v-model="reqForm.line_id" label="Freight line *" />
            <LineSelectBankAccount v-model="reqForm.line_bank" :id="reqForm.line_id" />
          </div>
          <div class="grid grid-cols-3 gap-2">
            <v-autocomplete
              v-model="reqForm.inv_type"
              :items="['tm', 'wm']"
              density="compact"
              label="Invoice type *"
              readonly
            />
          </div>

          <div class="grid grid-cols-2 gap-2 mb-4">
            <div v-if="reqForm.origin_bank" class="">
              <v-card>
                <v-card-title>System bank account selected:</v-card-title>
                <v-card-text>
                  <div class="grid grid-cols-2 gap-2">
                    <div class="font-bold">Bank:</div>
                    <div>{{ reqForm.origin_bank?.bank_account }}</div>

                    <div>Account number:</div>
                    <div>
                      {{ reqForm.origin_bank?.account_number }} -
                      {{ getCurrencyName(reqForm.origin_bank?.currency_id) }}
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </div>
            <div v-if="reqForm.line_bank" class="">
              <v-card>
                <v-card-title>Line bank account selected:</v-card-title>
                <v-card-text>
                  <div class="grid grid-cols-[auto_auto] gap-1">
                    <div class="font-bold">Bank:</div>
                    <div>
                      <v-chip color="yellow-darken-4" v-if="reqForm.line_bank?.is_default" size="x-small"
                        ><v-icon>mdi-star</v-icon></v-chip
                      >
                      {{ reqForm.line_bank?.bank?.name }} - alias ({{ reqForm.line_bank?.name }})
                    </div>

                    <div>Account number:</div>
                    <div>
                      {{ reqForm.line_bank?.account_number }} -
                      {{ getCurrencyName(reqForm.line_bank?.currency_id) }}
                    </div>

                    <div>Beneficiary:</div>
                    <div>{{ reqForm.line_bank?.beneficiary_name }}</div>

                    <div>Address:</div>
                    <div>{{ reqForm.line_bank?.beneficiary_address }}</div>
                    <div>ABA:</div>
                    <div>{{ reqForm.line_bank?.aba }}</div>

                    <div>SWIFT:</div>
                    <div>{{ reqForm.line_bank?.swift }}</div>

                    <div>IBAN:</div>
                    <div>{{ reqForm.line_bank?.iban }}</div>
                  </div>
                </v-card-text>
              </v-card>
            </div>
          </div>

          <v-btn color="primary" size="small" @click="requestPayDetention">Create request payment</v-btn>
        </div>

      </v-card-text>
    </v-card>
  </div>
</template>
<script setup lang="ts">
const { $api } = useNuxtApp()
const loadingStore = useLoadingStore()
const snackbar = useSnackbar()
const router = useRouter()

const form = ref<any>({
  type: 'master',
  inputNumbers: '',
  numbers: [],
})

const reqForm = ref<any>({
  line_id: null,
  line_bank: null,
  origin_bank: null,
  inv_type: null,
  serie: null,
  folio: null,
  invoice_date: null,
})

const refContainers = ref<any>([])

const types = [
  { text: 'Master BL', value: 'master' },
  { text: 'Container number', value: 'container' },
]

const countBls = computed(() => form.value.numbers.length)
const typeName = computed(() => types.find((t: any) => t.value === form.value.type)?.text)

const addNumbers = () => {
  let numbers = form.value.inputNumbers.split('\n').map((num: string) => num.trim())
  // remove empty
  numbers = numbers.filter((bl: string) => bl.length > 0)
  form.value.numbers = [...form.value.numbers, ...numbers]
  // unique
  form.value.numbers = Array.from(new Set(form.value.numbers))
  form.value.inputNumbers = ''
}
const removeBl = (bl: string) => {
  form.value.numbers = form.value.numbers.filter((b: string) => b !== bl)
}

const selectAll = () => {
  refContainers.value.forEach((refContainer: any) => {
    if (hasLineDetentionsAvailable(refContainer)) {
      refContainer.selected = true
    }
  })

  // if no select show snackbar
  if (refContainers.value.filter((refContainer: any) => refContainer.selected).length === 0) {
    snackbar.add({ type: 'warning', text: 'No services to select' })
  }
}

const hasSelected = computed(() => {
  return refContainers.value.filter((refContainer: any) => refContainer.selected).length > 0
})

const totalAmountSelected = computed(() => {
  return refContainers.value
    .filter((refContainer: any) => refContainer.selected)
    .reduce((acc: number, refContainer: any) => acc + getLinePayDetentions(refContainer), 0)
})

const refMasterBl = (referencia: any) => {
  return referencia.master_bls.map((bl: any) => bl.name).join(', ')
}

const hasLineDetentionsAvailable = (refContainer: any) => {
  // Sum all requested amounts from req_detention_containers
  const totalRequested =
    refContainer.detention.req_detention_containers?.reduce(
      (acc: number, req: any) => acc + parseFloat(req.amount) + (parseFloat(req.amount_iva) || 0),
      0
    ) || 0

  // Compute the available amount
  const totalDetention = parseFloat(refContainer.detention.amount_line)
  const availableAmount = totalDetention - totalRequested

  return availableAmount > 0
}

const getLinePayDetentions = (refContainer: any) => {
  // Total Detention Cost
  const totalDetention = parseFloat(refContainer.detention.amount_line)

  // Total already requested
  const totalRequested =
    refContainer.detention.req_detention_containers?.reduce(
      (acc: number, req: any) => acc + parseFloat(req.amount) + (parseFloat(req.amount_iva) || 0),
      0
    ) || 0

  // Return available amount
  return Math.max(0, totalDetention - totalRequested)
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

const searchForDemurrages = async () => {
  try {
    // if empty show warning
    if (form.value.numbers.length === 0) {
      snackbar.add({ type: 'warning', text: 'Please add BLs to search for report' })
      return
    }
    refContainers.value = []
    loadingStore.start()
    const body = {
      type: form.value.type,
      numbers: form.value.numbers,
    }
    const response = (await $api.maritimeDetentions.searchServicesToRequest(body)) as any
    response.forEach((refContainer: any) => {
      refContainer.selected = false
    })
    refContainers.value = response
    if (response.length === 0) {
      snackbar.add({ type: 'info', text: 'No services found.' })
    }
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const requestPayDetention = async () => {
  try {
    if (!reqForm.value.line_id) {
      snackbar.add({ type: 'warning', text: 'Please select a freight line' })
      return
    }
    if (!reqForm.value.line_bank) {
      snackbar.add({ type: 'warning', text: 'Please select a bank account for the freight line' })
      return
    }
    if (!reqForm.value.origin_bank) {
      snackbar.add({ type: 'warning', text: 'Please select a bank account for the payment' })
      return
    }
    if (!reqForm.value.inv_type) {
      snackbar.add({ type: 'warning', text: 'The origin bank does not have if TM or WM.' })
      return
    }
    if (!hasSelected) {
      snackbar.add({ type: 'warning', text: 'Select at least one service container to pay' })
      return
    }

    loadingStore.start()
    const body = {
      ...reqForm.value,
      reference_containers: refContainers.value
        .filter((refContainer: any) => refContainer.selected)
        .map((refContainer: any) => refContainer.id),
    }
    const response = (await $api.maritimeDetentions.requestDetentionPayment(body)) as any

    snackbar.add({ type: 'success', text: 'Request payment detentions created' })
    refContainers.value = []
    router.push(`/invoices/search/lines/detentions/req-pay-view-${response.id}`)
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

watch(
  () => reqForm.value.origin_bank,
  (value) => {
    if (value) {
      reqForm.value.inv_type = value.inv_type
    }
  }
)
</script>
