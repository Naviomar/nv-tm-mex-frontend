<template>
  <div>
    <div class="flex justify-between items-center">
      <h2 class="text-lg font-semibold">Options</h2>
      <div class="flex items-center space-x-2">
        <v-btn color="info" @click="printMasterAwb">Preview Master AWB</v-btn>
        <v-btn color="primary" @click="printMasterAwbDraft">Preview Master AWB print version</v-btn>
      </div>
    </div>
    <div>
      <div class="flex gap-2 mb-4">
        <v-btn size="small" color="green" @click="getData">Refresh data</v-btn>
        <v-btn v-if="hasAwbForm" size="small" color="amber" @click="startAgainMasterAwb">Reset format</v-btn>
      </div>

      <div class="font-bold">Print Master AWB Form</div>
      <v-card class="my-4 overflow-y-auto" variant="outlined">
        <v-card-title class="font-bold!"> Header </v-card-title>
        <v-card-text>
          <div class="grid grid-cols-3 gap-2">
            <div>
              <v-textarea
                v-model="form.shipper"
                bg-color="amber-lighten-4"
                :rows="3"
                density="compact"
                label="Shipper’s Name and Address:"
                counter
                auto-grow
              />
              <SearchCustomerAddresses
                v-if="false"
                :customerId="airReference.consignee?.id"
                @selected:address="setShipperAddress"
              />
            </div>
            <v-textarea
              v-model="form.airline"
              bg-color="amber-lighten-4"
              :rows="3"
              density="compact"
              label="Airline:"
              counter
              auto-grow
            />
            <v-textarea
              v-model="form.consignee"
              bg-color="amber-lighten-4"
              :rows="3"
              density="compact"
              label="Consignee's Name and Address:"
              counter
              auto-grow
            />
            <v-textarea
              v-model="form.accounting_info"
              bg-color="amber-lighten-4"
              :rows="3"
              density="compact"
              label="Accounting Information:"
              counter
              auto-grow
            />
            <v-textarea
              v-model="form.issuing_carrier"
              bg-color="amber-lighten-4"
              :rows="3"
              density="compact"
              label="Issuing carrier's Agent Name and City:"
              counter
              auto-grow
            />

            <v-text-field
              v-model="form.agent_iata_code"
              bg-color="amber-lighten-4"
              density="compact"
              label="Agent's IATA Code"
            />
          </div>
        </v-card-text>
      </v-card>

      <v-card class="my-4" variant="outlined">
        <v-card-title class="font-bold!"> Route </v-card-title>
        <v-card-text>
          <div class="grid grid-cols-4 gap-2">
            <v-text-field
              v-model="form.airport_departure"
              bg-color="amber-lighten-4"
              density="compact"
              label="Departure airport"
            />
            <v-text-field
              v-model="form.start_flight"
              bg-color="amber-lighten-4"
              density="compact"
              label="Start Flight No."
            />

            <v-text-field
              v-model="form.airport_destination"
              bg-color="amber-lighten-4"
              density="compact"
              label="Destination airport"
            />
            <v-text-field
              v-model="form.end_flight"
              bg-color="amber-lighten-4"
              density="compact"
              label="End Flight No."
            />

            <v-text-field v-model="form.to_arrival" bg-color="amber-lighten-4" density="compact" label="TO" />
            <v-text-field
              v-model="form.first_carrier"
              bg-color="amber-lighten-4"
              density="compact"
              label="By first carrier"
            />
          </div>
          <div class="grid grid-cols-4 gap-2">
            <v-text-field v-model="form.to_2" bg-color="amber-lighten-4" density="compact" label="TO 2" />
            <v-text-field v-model="form.by_2" bg-color="amber-lighten-4" density="compact" label="By 2" />
            <v-text-field v-model="form.to_3" bg-color="amber-lighten-4" density="compact" label="TO 3" />
            <v-text-field v-model="form.by_3" bg-color="amber-lighten-4" density="compact" label="By 3" />
          </div>
        </v-card-text>
      </v-card>

      <v-card class="my-4" variant="outlined">
        <v-card-title class="font-bold!"> Cargo </v-card-title>
        <v-card-text>
          <div class="grid grid-cols-5 gap-2">
            <v-text-field v-model="form.currency" bg-color="amber-lighten-4" density="compact" label="Currency" />
            <v-autocomplete
              v-model="form.chgs"
              bg-color="amber-lighten-4"
              density="compact"
              label="CHGS"
              :items="['PP', 'CC']"
            />
            <v-text-field
              v-model="form.value_carriage"
              bg-color="amber-lighten-4"
              density="compact"
              label="Declared value for carriage"
            />
            <v-text-field
              v-model="form.value_customs"
              bg-color="amber-lighten-4"
              density="compact"
              label="Declared value for customs"
            />
            <v-text-field
              v-model="form.insurance"
              bg-color="amber-lighten-4"
              density="compact"
              label="Amount of insurance"
            />
          </div>
          <div class="grid grid-cols-1 gap-2">
            <v-textarea
              v-model="form.handling_info"
              bg-color="amber-lighten-4"
              :rows="3"
              density="compact"
              label="Handling Information:"
              counter
              auto-grow
            />
          </div>
          <div class="grid grid-cols-4 gap-2">
            <v-text-field
              v-model="form.num_packages"
              bg-color="amber-lighten-4"
              density="compact"
              label="No of peices RCP"
            />
            <v-text-field
              v-model="form.gross_weight"
              bg-color="amber-lighten-4"
              density="compact"
              label="Gross weight"
            />
            <v-text-field v-model="form.rate_class" bg-color="amber-lighten-4" density="compact" label="Rate class" />
            <v-text-field
              v-model="form.commodity_item"
              bg-color="amber-lighten-4"
              density="compact"
              label="Commodity item No."
            />
            <v-text-field
              v-model="form.chargeable_weight"
              bg-color="amber-lighten-4"
              density="compact"
              label="Chargeable weight"
              @blur="updatedChargeableWeight"
            />
            <v-text-field
              v-model="form.rate_charge"
              bg-color="amber-lighten-4"
              density="compact"
              label="Rate / Charge"
            />
            <v-text-field v-model="form.total" bg-color="amber-lighten-4" density="compact" label="Total" />
          </div>
          <div class="grid grid-cols-1 gap-2">
            <v-textarea
              v-model="form.nature_goods"
              bg-color="amber-lighten-4"
              :rows="6"
              density="compact"
              label="Nature and quantity of goods (Incl. dimensions or volume)"
              counter
              auto-grow
            />
          </div>
        </v-card-text>
      </v-card>

      <v-card class="my-4" variant="outlined">
        <v-card-title class="font-bold!"> Totals </v-card-title>
        <v-card-text>
          <div class="grid grid-cols-3 gap-2">
            <v-autocomplete
              v-model="form.tax_charge"
              density="compact"
              label="TAX"
              :items="buyCharges"
              :item-title="(row: any) => `${row.charge.name} - $${row.buy_amount}`"
              return-object
              hint="Select a charge to update TAX amount"
              @update:model-value="setTax"
            />
            <v-autocomplete
              v-model="form.total_due_agent_charges"
              density="compact"
              label="Total other charges due agent"
              :items="buyCharges"
              :item-title="(row: any) => `${row.charge.name} - $${row.buy_amount}`"
              return-object
              hint="Select one or more charges to update other charges due agent"
              multiple
              @update:model-value="setDueAgent"
            />
            <v-autocomplete
              v-model="form.total_due_carrier_charges"
              density="compact"
              label="Total other charges due carrier"
              :items="buyCharges"
              :item-title="(row: any) => `${row.charge.name} - $${row.buy_amount}`"
              return-object
              hint="Select one or more charges to update other charges due carrier"
              multiple
              @update:model-value="setDueCarrier"
            />
          </div>
          <div class="grid grid-cols-3 gap-2">
            <v-text-field v-model="form.tax" bg-color="amber-lighten-4" density="compact" label="TAX to print" />
            <v-text-field
              v-model="form.total_due_agent"
              bg-color="amber-lighten-4"
              density="compact"
              label="Total other charges due agent to print"
            />
            <v-text-field
              v-model="form.total_due_carrier"
              bg-color="amber-lighten-4"
              density="compact"
              label="Total other charges due carrier to print"
            />
          </div>
          <div class="grid grid-cols-3 gap-2">
            <div>
              <div class="font-bold">Other charges to print</div>
              <v-autocomplete
                v-model="form.add_other_charge"
                density="compact"
                label="Charges"
                :items="buyCharges"
                :item-title="(row: any) => `${row.charge.name} - $${row.buy_amount}`"
                return-object
                hide-details
              />
              <v-btn color="primary" size="small" @click="addOtherCharge">Add charge</v-btn>
            </div>
            <div class="col-span-2">
              <div class="font-bold">Other charges</div>
              <v-table density="compact">
                <thead>
                  <tr>
                    <th class="w-12"></th>
                    <th>Charge</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(charge, index) in form.other_charges" :key="`other-charge-${index}`">
                    <td>
                      <v-btn icon size="x-small" color="red" @click="removeOtherCharge(index)">
                        <v-icon>mdi-close</v-icon>
                      </v-btn>
                    </td>
                    <td>{{ charge.charge_name }}</td>
                    <td>
                      <v-text-field
                        v-model="charge.charge_amount"
                        bg-color="amber-lighten-4"
                        density="compact"
                        type="number"
                        label="Amount"
                        hide-details
                      />
                    </td>
                  </tr>
                </tbody>
              </v-table>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </div>
    <v-btn color="primary" @click="saveMasterAwbPrintInfo">Save changes</v-btn>

    <v-dialog v-model="showPdfDialog" fullscreen>
      <v-card>
        <v-toolbar color="primary">
          <v-btn icon @click="closePdfDialog">
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <v-toolbar-title>Preview Master AWB</v-toolbar-title>
          <v-spacer></v-spacer>
        </v-toolbar>
        <v-card-text>
          <object ref="pdfViewer" type="application/pdf" width="100%" height="100%"></object>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>
<script setup lang="ts">
const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
})

const form = ref<any>({
  shipper: '',
  consignee: '',
  airline: '',
  accounting_info: 'PLS NOTIFY TO THE SAME',
  issuing_carrier: 'Transporte Multimodal S.A. de C.V.',
  agent_iata_code: '86-1-3989/0001',
  airport_departure: '',
  start_flight: '',
  airport_destination: '',
  end_flight: '',
  to_arrival: '',
  first_carrier: '',
  to_2: '',
  by_2: '',
  to_3: '',
  by_3: '',
  currency: 'USD',
  chgs: '',
  insurance: '',
  value_carriage: 'N.V.D.',
  value_customs: 'N.C.V.',
  handling_info: '',
  num_packages: '',
  gross_weight: '',
  rate_class: '',
  commodity_item: '',
  chargeable_weight: '',
  rate_charge: '',
  total: '',
  nature_goods: 'CONSOLIDATION AS PER ATTACHED CARGO MANIFEST',
  tax: '',
  total_due_agent: '',
  total_due_carrier: '',
  add_other_charge: null,
  other_charges: [],
})

const airReference = ref<any>({})
const showPdfDialog = ref(false)
const pdfViewer = ref<any>(null)

const previewFile = (file: any) => {
  showPdfDialog.value = true
  const fileReader = new FileReader()
  fileReader.onload = () => {
    pdfViewer.value!.data = fileReader.result
  }
  fileReader.readAsDataURL(file)
}

const closePdfDialog = () => {
  showPdfDialog.value = false
  pdfViewer.value!.data = null
}

const buyCharges = computed(() => {
  return airReference.value?.charges?.filter((charge: any) => charge.buy_amount != null)
})

const hasAwbForm = computed(() => {
  return airReference.value.print_mawb != null
})

const setTax = (airCharge: any) => {
  form.value.tax = airCharge.buy_amount
}

const setDueAgent = (airCharges: any) => {
  form.value.total_due_agent = airCharges.reduce((acc: number, charge: any) => acc + parseFloat(charge.buy_amount), 0)
}

const setDueCarrier = (airCharges: any) => {
  form.value.total_due_carrier = airCharges.reduce((acc: number, charge: any) => acc + parseFloat(charge.buy_amount), 0)
}

const updatedChargeableWeight = () => {
  form.value.total = (parseFloat(form.value.rate_charge) * parseFloat(form.value.chargeable_weight)).toFixed(2)
}

const saveMasterAwbPrintInfo = async () => {
  try {
    loadingStore.start()
    await $api.airExport.saveMasterAwbPrintInfo(props.id, form.value)
    snackbar.add({ type: 'success', text: 'Master AWB print info saved' })
    await getData()
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const printMasterAwbDraft = async () => {
  loadingStore.start()
  try {
    const response = await $api.airExport.printMasterAwbDraft(props.id)
    previewFile(response)
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const printMasterAwb = async () => {
  loadingStore.start()
  try {
    const response = await $api.airExport.printMasterAwb(props.id)
    previewFile(response)
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const addOtherCharge = () => {
  if (form.value.add_other_charge) {
    form.value.other_charges.push({
      id: null,
      charge_name: form.value.add_other_charge.charge_name,
      charge_amount: form.value.add_other_charge.buy_amount,
    })
    form.value.add_other_charge = null
  }
}
const removeOtherCharge = (index: number) => {
  form.value.other_charges.splice(index, 1)
}

const setShipperAddress = (address: any) => {
  form.value.shipper = `${airReference.value.consignee?.name}\n${address}`
}

const getTotalGrossWeight = (): number => {
  return airReference.value.house_awbs.reduce(
    (acc: number, houseAwb: any) =>
      acc + houseAwb.cbms.reduce((acc: number, cbm: any) => acc + parseFloat(cbm.gross_weight), 0),
    0
  )
}

const getTotalChargeableWeight = (): number => {
  const total = airReference.value.house_awbs.reduce(
    (acc: number, houseAwb: any) =>
      acc + houseAwb.cbms.reduce((acc: number, cbm: any) => acc + parseFloat(cbm.chargeable_weight), 0),
    0
  )

  return total < getTotalGrossWeight() ? getTotalGrossWeight() : total
}

const getTotalNumPackages = () => {
  return airReference.value.house_awbs.reduce(
    (acc: number, houseAwb: any) =>
      acc + houseAwb.cbms.reduce((acc: number, cbm: any) => acc + parseFloat(cbm.num_packages), 0),
    0
  )
}

const getFirstDepartureAirport = () => {
  if (airReference.value.transits.length === 0) return ''
  return airReference.value.transits[0].departure_airport?.code
}

const getFirstArrivalAirport = () => {
  if (airReference.value.transits.length === 0) return ''
  return airReference.value.transits[0].arrival_airport?.code
}

const getSecondArrivalAirport = () => {
  if (airReference.value.transits.length < 2) return ''
  return airReference.value.transits[1].arrival_airport?.code
}

const getThirdArrivalAirport = () => {
  if (airReference.value.transits.length < 3) return ''
  return airReference.value.transits[2].arrival_airport?.code
}

const getFirstFlightNumber = () => {
  if (airReference.value.transits.length === 0) return ''
  return airReference.value.transits[0].flight_number
}

const getLastDestinationAirport = () => {
  if (airReference.value.transits.length === 0) return ''
  return airReference.value.transits[airReference.value.transits.length - 1].arrival_airport?.full_name
}

const getLastFlightNumber = () => {
  if (airReference.value.transits.length === 0) return ''
  return airReference.value.transits[airReference.value.transits.length - 1].flight_number
}

const getLastDestination = () => {
  if (airReference.value.transits.length === 0) return ''
  return airReference.value.transits[airReference.value.transits.length - 1].destination
}

const setInitialValues = () => {
  const airlineFull = `${airReference.value.airline?.name || ''}\n${
    airReference.value.airline?.address || 'No address'
  }`
  form.value.shipper =
    (airReference.value.origin_ff?.name || '') +
    '\n' +
    (airReference.value.origin_ff?.address || '') +
    '\n' +
    (airReference.value.origin_ff?.state || '') +
    '\n' +
    (airReference.value.origin_ff?.zip_code || '')
  form.value.consignee = airReference.value.destination_ff?.name
  form.value.issuing_carrier = airReference.value.origin_ff?.name

  form.value.airline = airlineFull
  form.value.airport_departure = getFirstDepartureAirport()
  form.value.start_flight = getFirstFlightNumber()
  form.value.airport_destination = getLastDestinationAirport()
  form.value.end_flight = getLastFlightNumber()
  form.value.to_arrival = getFirstArrivalAirport()
  form.value.first_carrier = airReference.value.airline?.name || ''
  form.value.to_2 = getSecondArrivalAirport()
  form.value.by_2 = getSecondArrivalAirport() != '' ? airReference.value.airline?.code : ''
  form.value.to_3 = getThirdArrivalAirport()
  form.value.by_3 = getThirdArrivalAirport() != '' ? airReference.value.airline?.code : ''

  form.value.num_packages = getTotalNumPackages()
  form.value.gross_weight = getTotalGrossWeight()
  form.value.rate_class = airReference.value.rate_class
  form.value.rate_charge = airReference.value.rate
  form.value.chargeable_weight = getTotalChargeableWeight()
  form.value.total = (parseFloat(airReference.value.rate || '0') * getTotalChargeableWeight()).toFixed(2)
  form.value.handling_info = `*** PLS NOTIFY TO CONSGNEE UPON ARRIVAL / *** HANDLE WITH CARE \n *** NO DANGEROUS GOODS ***`
}

const startAgainMasterAwb = async () => {
  try {
    loadingStore.start()
    const response = (await $api.airExport.restartMasterAwbPrint(props.id)) as any

    airReference.value = response

    if (airReference.value.print_mawb) {
      form.value = airReference.value.print_mawb
    } else {
      setInitialValues()
    }
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const getData = async () => {
  try {
    loadingStore.start()
    const response = (await $api.airExport.getReferenceById(props.id)) as any

    airReference.value = response

    if (airReference.value.print_mawb) {
      form.value = { ...airReference.value.print_mawb, other_charges: response.print_mawb.charges }
    } else {
      setInitialValues()
    }
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

await getData()
</script>
