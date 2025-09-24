<template>
  <div>
    <div class="flex items-center text-base gap-2">
      <v-icon size="x-small">mdi-ship-wheel</v-icon>
      <div>Sea Export information #{{ referencia.reference_number }}</div>
    </div>
    <v-card>
      <v-card-title> House BL selection</v-card-title>
      <v-card-text>
        <v-autocomplete
          v-model="form.houseBl"
          :items="referencia.house_bls"
          item-title="name"
          return-object
          density="compact"
          label="Choose House BL"
          @update:model-value="onUpdateHouseBl"
        />
        <v-btn color="primary" size="small" class="mr-4" @click="onClickAddHouseBl"> Add house BL </v-btn>
        <v-btn v-if="form.houseBl" size="small" color="error" @click="onClickRemoveHouseBl">
          Remove {{ form.houseBl.name }}</v-btn
        >
      </v-card-text>
    </v-card>
    <v-card v-if="form.houseBl">
      <v-card-title> Print BL for {{ form.houseBl.name }}</v-card-title>
      <v-card-text>
        <div v-if="hasPrintInfo" class="flex gap-4 mb-4">
          <v-btn color="primary" @click="onClickPreviewHouseBl('preview')"> Preview BL format </v-btn>
          <v-btn color="primary" @click="onClickPreviewHouseBl('print')">Version for printer </v-btn>
        </div>
        <div class="grid grid-cols-3 gap-2">
          <v-autocomplete
            v-model="formPrint.printout"
            :items="catalogs.printouts"
            item-title="name"
            item-value="value"
            density="compact"
            label="Printout"
          />
          <v-autocomplete
            v-model="formPrint.totals"
            :items="catalogs.totales"
            item-title="name"
            item-value="value"
            density="compact"
            label="Totals"
          />
          <v-autocomplete
            v-model="formPrint.elsewhere"
            :items="catalogs2.countries"
            item-title="name"
            item-value="name"
            density="compact"
            label="Else where"
          />
        </div>
        <div class="grid grid-cols-3 gap-2">
          <v-autocomplete
            v-model="formPrint.bl_type"
            :items="catalogs.blTypes"
            item-title="name"
            item-value="value"
            density="compact"
            label="BL type"
          />
        </div>
        <div class="grid grid-cols-2 gap-2 mb-4">
          <div>
            <v-textarea v-model="formPrint.shipper" label="Shipper" density="compact" :rows="5" counter class="mb-4" />

            <v-textarea
              v-model="formPrint.consignee"
              label="Consignee"
              density="compact"
              :rows="5"
              counter
              class="mb-4"
            />

            <v-textarea
              v-model="formPrint.notify_party"
              label="Notify party / intermediate consignee (Name and address)"
              density="compact"
              :rows="5"
              counter
              class="mb-4"
            />

            <div class="grid grid-cols-2 gap-2">
              <div class="col-span-2">
                <v-text-field
                  v-model="formPrint.carrier"
                  density="compact"
                  readonly
                  label="Export carrier (Vessel, voyage & flag)"
                  hint="Inherited from reference"
                />
              </div>
              <v-text-field v-model="formPrint.pol" density="compact" label="POL" readonly />

              <div>
                <v-text-field v-model="formPrint.pod" density="compact" label="POD" readonly />
              </div>
              <div class="col-span-2">
                <v-text-field v-model="formPrint.transhipment_to" density="compact" label="For trans-shipmet to" />
              </div>
            </div>
          </div>
          <div>
            <div class="grid grid-cols-2 gap-2">
              <v-text-field v-model="formPrint.house_bl" density="compact" label="Booking number" />
              <v-text-field v-model="formPrint.booking_tm" density="compact" label="BL No." />
            </div>

            <v-textarea
              v-model="formPrint.export_references"
              label="Export references"
              density="compact"
              :rows="5"
              counter
              class="mb-4"
            />

            <v-textarea
              v-model="formPrint.delivery_contact"
              label="To obtain delivery contact"
              density="compact"
              :rows="5"
              counter
              class="mb-4"
            />

            <v-text-field
              v-model="formPrint.routing_instructions"
              label="Place of receipt"
              density="compact"
              class="mb-4"
            />

            <v-text-field
              v-model="formPrint.final_destination"
              label="Place of delivery"
              density="compact"
              class="mb-4"
            />
          </div>
        </div>

        <!-- Containers Table -->
        <div class="p-3">
          <div class="font-bold text-lg">Containers section</div>
          <div class="grid grid-cols-3 py-4">
            <v-autocomplete
              v-model="formPrint.containers"
              density="compact"
              :items="availableContainers"
              item-title="container_number"
              item-value="id"
              return-object
              multiple
              label="Select containers to print BL"
              @update:model-value="onUpdateContainer"
            >
              <template v-slot:item="{ item, props }">
                <v-list-item
                  v-bind="props"
                  :title="`${item.title} ${item.raw.deleted_at ? '(Eliminado)' : ''}`"
                  :disabled="item.raw.deleted_at != null"
                ></v-list-item>
              </template>
            </v-autocomplete>
          </div>
          <div class="font-bold">Selected containers</div>
          <v-table density="compact">
            <thead>
              <tr>
                <th>Actions</th>
                <th>Number</th>
                <th>Desciption of packages and goods</th>
                <th>Gross weight</th>
                <th>Measurement</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="container in formPrint.containers" :key="`cont-${container.id}`">
                <td>
                  <v-btn
                    icon="mdi-delete-outline"
                    size="x-small"
                    variant="outlined"
                    color="red"
                    @click="onClickRemoveContainer(container)"
                  >
                  </v-btn>
                </td>
                <td>
                  <v-textarea v-model="container.marks_numbers" density="compact" label="Marks and Numbers" />
                </td>
                <td>
                  <v-textarea
                    v-model="container.packages_goods"
                    density="compact"
                    label="Description of packages and goods"
                  />
                </td>
                <td>
                  <v-text-field v-model="container.gross_weight" type="number" density="compact" label="Gross weight" />
                </td>
                <td>
                  <v-text-field v-model="container.measurement" type="number" density="compact" label="Measurement" />
                </td>
              </tr></tbody
          ></v-table>
        </div>

        <!-- Charges Table -->
        <div class="my-2 p-3">
          <div class="font-bold text-lg">Charges section</div>
          <div class="grid grid-cols-3 py-4">
            <v-autocomplete
              v-model="formPrint.charges"
              density="compact"
              :items="availableCharges"
              :item-title="(row : any) => `${row.charge?.name} - $${row.sell_amount} ${row.sell_type}`"
              return-object
              multiple
              label="Select charges to print BL"
            />
          </div>
          <div class="font-bold">Selected charges</div>
          <v-table density="compact">
            <thead>
              <tr>
                <th>Actions</th>
                <th>Concept</th>
                <th>Amount</th>
                <th>F/D BL</th>
                <th>PP/CC</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="charge in formPrint.charges" :key="`charge-${charge.id}`">
                <td>
                  <v-btn
                    icon="mdi-delete-outline"
                    size="x-small"
                    variant="outlined"
                    color="red"
                    @click="onClickRemoveCharge(charge)"
                  >
                  </v-btn>
                </td>
                <td>
                  {{ charge.charge?.name }}
                </td>
                <td>
                  {{ formatToCurrency(charge.sell_amount) }}
                </td>
                <td>
                  {{ charge.fuera_dentro_bl == 'F' ? 'Fuera BL' : 'Dentro BL' }}
                </td>
                <td>
                  <v-autocomplete
                    v-model="charge.sell_type"
                    :items="[
                      { value: 'P', name: 'PP' },
                      { value: 'C', name: 'CC' },
                    ]"
                    item-title="name"
                    item-value="value"
                    density="compact"
                    label="PP/CC"
                  />
                </td>
              </tr></tbody
          ></v-table>
        </div>
      </v-card-text>
      <div v-if="hasPrintInfo" class="flex gap-4">
        <v-btn color="primary" @click="onClickPreviewHouseBl('preview')"> Preview BL format </v-btn>
        <v-btn color="primary" @click="onClickPreviewHouseBl('print')">Version for printer </v-btn>
      </div>

      <v-card-actions>
        <DraggableDiv>
          <div class="text-center font-bold p-2">Ref #{{ referencia.reference_number }}</div>
          <v-btn color="primary" @click="onClickSavePrintBlInfo"> Save Print BL information </v-btn>
        </DraggableDiv>
      </v-card-actions>
    </v-card>
    <v-dialog v-model="previewBl.show" fullscreen>
      <v-card>
        <v-toolbar color="primary">
          <v-btn icon @click="previewBl.show = !previewBl.show">
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <v-toolbar-title>Preview Print BL</v-toolbar-title>
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
const loadingStore = useLoadingStore()
const snackbar = useSnackbar()

const props = defineProps({
  id: {
    type: Number,
    required: true,
  },
})

const referencia = ref<any>({})
const houseBlSelected = ref<any>(null)
const pdfViewer = ref<any>(null)
const servicePrints = ref<any>([])

const form = ref<any>({
  houseBl: null,
})

const previewBl = ref<any>({
  show: false,
})

const catalogs2 = ref<any>({
  countries: [],
})

const formPrint = ref<any>({
  bill_lading: null,
  printout: null,
  totals: null,
  office: null,
  elsewhere: null,
  bl_format: null,
  bl_type: null,
  shipper: null,
  consignee: null,
  notify_party: null,
  export_references: null,
  booking_tm: null,
  house_bl: null,
  forwarding_agent: null,
  carrier: null,
  origin: null,
  delivery_contact: null,
  routing_instructions: null,
  final_destination: null,
  transhipment_to: null,
  pod: null,
  containers: [],
  charges: [],
})

const catalogs = ref<any>({
  printouts: [
    { name: 'Fletado', value: 'fletado' },
    { name: 'As agreed', value: 'agreed' },
    { name: 'Freight collect', value: 'freightcollect' },
  ],
  office: [
    { name: 'Altamira', value: 'altamira' },
    { name: 'Monterrey', value: 'monterrey' },
  ],
  blFormats: [
    { name: 'General description (one sheet) - containers (annexed sheets)', value: 'format1' },
    { name: 'Description and containers (original format)', value: 'format2' },
  ],
  blTypes: [
    { name: 'Copy', value: 'copy' },
    { name: 'Original', value: 'original' },
  ],
  totales: [
    { name: 'First page', value: 'first' },
    { name: 'Second page', value: 'second' },
  ],
})

const availableContainers = ref<any>([])
const availableCharges = ref<any>([])

const hasPrintInfo = computed(() => {
  if (houseBlSelected.value == null) {
    return false
  }
  return houseBlSelected.value.print_bl != null
})

const getSeaExportPrintEnvelope = computed(() => {
  if (servicePrints.value.length === 0) {
    return 'No printable information found'
  }
  return servicePrints.value.find((s: any) => s.type === 'me')?.envelope
})

const getSeaExportDetails = async () => {
  try {
    loadingStore.start()
    const response = (await $api.referenciasExport.getReferenciaById(props.id.toString())) as any
    referencia.value = response
    availableContainers.value = response.all_containers
    availableCharges.value = response.export_charges.filter((c: any) => c.is_sell === 1)
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const getCatalogs = async () => {
  try {
    loadingStore.start()
    const response = (await $api.countries.getAll()) as any
    catalogs2.value.countries = response
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const getServicePrints = async () => {
  try {
    if (referencia.value.consignee == null) {
      return
    }
    servicePrints.value = []
    loadingStore.start()
    const response = (await $api.servicePrints.getByCustomerId(referencia.value.consignee?.id)) as any
    servicePrints.value = response
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const onClickAddHouseBl = async () => {
  try {
    loadingStore.start()
    await $api.referenciasExport.addHouseBl(props.id.toString())
    await getSeaExportDetails()
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const onClickRemoveHouseBl = async () => {
  try {
    loadingStore.start()
    const body = {
      house_bl_id: form.value.houseBl.id,
    }
    await $api.referenciasExport.removeHouseBl(props.id.toString(), body)
    snackbar.add({ type: 'success', text: 'House BL removed' })

    form.value.houseBl = null
    await getSeaExportDetails()
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const onClickPreviewHouseBl = async (type: string) => {
  try {
    previewBl.value.show = true
    loadingStore.start()

    const body = {
      print_bl_id: houseBlSelected.value.print_bl?.id,
      type: type,
    }

    const response = await $api.referenciasExport.previewPrintBl(props.id.toString(), body)
    // console.log('response', response)
    const blob = new Blob([response as any], { type: 'application/pdf' })
    const pdfUrl = URL.createObjectURL(blob)

    pdfViewer.value.data = pdfUrl
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const onClickRemoveContainer = (container: any) => {
  const index = formPrint.value.containers.findIndex((c: any) => c.id === container.id)
  if (index !== -1) {
    formPrint.value.containers.splice(index, 1)
  }
}

const onUpdateContainer = (containers: any) => {
  formPrint.value.containers.forEach((c: any) => {
    if (c.marks_numbers == null || c.marks_numbers === '') {
      c.marks_numbers = `${c.container_number} ${c.container_type?.name} \n Seal: `
    }
    if (c.gross_weight == null || c.gross_weight === '') {
      c.gross_weight = c.weight
    }

    if (c.measurement == null || c.measurement === '') {
      c.measurement = c.volume
    }

    if (c.packages_goods == null || c.packages_goods === '') {
      c.packages_goods = c.notes
    }
  })
}

const onClickRemoveCharge = (charge: any) => {
  const index = formPrint.value.charges.findIndex((c: any) => c.id === charge.id)
  if (index !== -1) {
    formPrint.value.charges.splice(index, 1)
  }
}

const getConsigeeAddress = () => {
  if (referencia.value.shipper?.address == null) {
    return 'No address found'
  }
  return `${referencia.value.shipper.address} \n ${referencia.value.shipper.state} \n ${referencia.value.shipper.city} \n ${referencia.value.shipper.zip_code}`
}

const getShipperAddress = () => {
  if (referencia.value.consignee?.address == null) {
    return 'No address found'
  }
  return `${referencia.value.consignee.address.full_address}`
}

const getNotifyAddress = () => {
  if (referencia.value.notify?.address == null) {
    return 'No address found'
  }
  return `${referencia.value.notify.address} \n ${referencia.value.notify.state} \n ${referencia.value.notify.city} \n ${referencia.value.notify.zip_code}`
}

const getFfAddress = () => {
  if (referencia.value.freight_forwarder?.address == null) {
    return 'No address found'
  }
  return `${referencia.value.freight_forwarder.address} \n ${referencia.value.freight_forwarder.state} \n ${referencia.value.freight_forwarder.city} \n ${referencia.value.freight_forwarder.zip_code}`
}

const fillFormForPrintBl = () => {
  // Si no se ha impreso el BL
  if (houseBlSelected.value.print_bl === null) {
    const consigneeAddress = getConsigeeAddress()
    const shipperAddress = getShipperAddress()
    const notifyAdress = getNotifyAddress()
    const ffAddress = getFfAddress()
    formPrint.value.shipper = getSeaExportPrintEnvelope.value
    formPrint.value.consignee = `${referencia.value.shipper?.name} \n ${consigneeAddress}`
    formPrint.value.notify_party = `${referencia.value.notify?.name} \n ${notifyAdress}`
    formPrint.value.house_bl = houseBlSelected.value.name
    formPrint.value.booking_tm = referencia.value.booking_tm
    formPrint.value.pol = referencia.value.pol.name
    formPrint.value.pod = referencia.value.pod.name
    formPrint.value.routing_instructions = referencia.value.origin?.name
    formPrint.value.final_destination = referencia.value.destination?.name
    formPrint.value.delivery_contact = `${referencia.value.freight_forwarder?.name} \n ${ffAddress}`
    formPrint.value.carrier = referencia.value.voyage_discharge?.print_bl_name

    formPrint.value.containers = []
    formPrint.value.charges = []
  }

  formPrint.value.booking_tm = referencia.value.booking_tm
  formPrint.value.house_bl = houseBlSelected.value.name

  if (houseBlSelected.value.print_bl != null) {
    formPrint.value.bill_lading = houseBlSelected.value.print_bl.bill_lading
    formPrint.value.printout = houseBlSelected.value.print_bl.printout
    formPrint.value.totals = houseBlSelected.value.print_bl.totals
    formPrint.value.office = houseBlSelected.value.print_bl.office
    formPrint.value.elsewhere = houseBlSelected.value.print_bl.elsewhere
    formPrint.value.bl_format = houseBlSelected.value.print_bl.bl_format
    formPrint.value.bl_type = houseBlSelected.value.print_bl.bl_type
    formPrint.value.shipper = houseBlSelected.value.print_bl.shipper
    formPrint.value.consignee = houseBlSelected.value.print_bl.consignee
    formPrint.value.notify_party = houseBlSelected.value.print_bl.notify_party
    formPrint.value.export_references = houseBlSelected.value.print_bl.export_references

    formPrint.value.forwarding_agent = houseBlSelected.value.print_bl.forwarding_agent
    formPrint.value.carrier = houseBlSelected.value.print_bl.carrier
    formPrint.value.origin = houseBlSelected.value.print_bl.origin
    formPrint.value.delivery_contact = houseBlSelected.value.print_bl.delivery_contact
    formPrint.value.routing_instructions = houseBlSelected.value.print_bl.routing_instructions
    formPrint.value.final_destination = houseBlSelected.value.print_bl.final_destination
    formPrint.value.transhipment_to = houseBlSelected.value.print_bl.transhipment_to

    formPrint.value.pod = houseBlSelected.value.print_bl.pod
    formPrint.value.pol = houseBlSelected.value.print_bl.pol ?? referencia.value.pol.name
    formPrint.value.containers = houseBlSelected.value.print_bl.print_containers?.map((c: any) => ({
      ...c.reference_container,
      marks_numbers: c.marks_numbers,
      packages_goods: c.packages_goods,
      gross_weight: c.gross_weight,
      measurement: c.measurement,
    }))
    formPrint.value.charges = houseBlSelected.value.print_bl.print_charges?.map((c: any) => ({
      ...c.reference_charge,
      sell_type: c.sell_type,
    }))
  }
}

const onClickSavePrintBlInfo = async () => {
  try {
    loadingStore.start()
    const response = await $api.referenciasExport.savePrintBlInfo(
      props.id.toString(),
      houseBlSelected.value.id,
      formPrint.value
    )
    snackbar.add({ type: 'success', text: 'Print BL information saved' })

    await getSeaExportDetails()
    form.value.houseBl = null
    houseBlSelected.value = null
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const onUpdateHouseBl = async (houseBl: any) => {
  console.log('onUpdate HouseBl', houseBl)
  try {
    houseBlSelected.value = null
    loadingStore.start()
    const response = (await $api.referenciasExport.getHouseBlPrint(props.id.toString(), houseBl.id)) as any
    houseBlSelected.value = response

    if (houseBlSelected.value.print_bl == null) {
      snackbar.add({ type: 'warning', text: 'House BL not printed yet' })
    }

    fillFormForPrintBl()
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

onMounted(async () => {
  await getSeaExportDetails()
  await getCatalogs()
  await getServicePrints()
})
</script>
