<template>
  <div>
    <div>
      <div class="flex items-center text-base gap-2">
        <v-icon size="x-small">mdi-ship-wheel</v-icon>
        <div>Sea Export information #{{ referencia.reference_number }}</div>
      </div>
      <div class="text-lg font-bold">Past booking notifications</div>
      <v-table density="compact" class="border border-solid">
        <thead>
          <tr>
            <th class="font-bold!">Sent date</th>
            <th class="font-bold!">Subject</th>
            <th class="font-bold!">User</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!hasBookingNotys">
            <td colspan="3" class="text-center">No data</td>
          </tr>
          <tr v-if="hasBookingNotys" v-for="item in referencia.booking_notys" :key="`bkg-send-${item.id}`">
            <td>{{ formatDateString(item.created_at) }}</td>
            <td>{{ item.subject }}</td>
            <td>{{ item.creator?.name }}</td>
          </tr>
        </tbody>
      </v-table>
    </div>
    <v-card>
      <v-card-title>
        <div class="flex gap-2 items-center">
          <v-btn icon size="x-small" variant="tonal" color="primary" @click="getSeaExportDetails">
            <v-icon>mdi-sync</v-icon>
          </v-btn>
          Send booking confirmation
        </div>
      </v-card-title>
      <v-card-subtitle> Review the form to proceed </v-card-subtitle>
      <v-card-text>
        <div class="grid grid-cols-1 gap-2">
          <v-text-field v-model="form.shipper" density="compact" label="Shipper" />
          <v-text-field v-model="form.subject" density="compact" label="Subject" />
          <v-text-field v-model="form.emails" density="compact" label="Emails" hide-details />
          <div class="grid grid-cols-3 gap-2">
            <CustomerEmailsWidget
              v-if="hasReferencia"
              :customer-id="referencia.consignee_id"
              :notifys="customerNotifys"
              @fetched-emails="setCustomerEmails"
            />
          </div>
        </div>
        <div class="grid grid-cols-1 gap-2 py-4">
          <div class="font-bold">Body message</div>
          <div class="max-w-64">
            <v-autocomplete
              v-model="form.typeContainer"
              :items="[
                { text: 'Booking containers', value: 'booking_containers' },
                { text: 'Containers', value: 'containers' },
              ]"
              label="Rates multiply by"
              item-title="text"
              item-value="value"
              density="compact"
              hide-details
              @update:model-value="calculateRatesByContainer"
            />
          </div>

          <div class="text-sm">
            Select a language to show the body of the message. Note: Selecting a different language will lose the
            changes made.
          </div>
          <div class="grid grid-cols-2 gap-2 max-w-64">
            <v-btn size="small" color="blue-lighten-3" @click="changeBody('en')">English</v-btn>
            <v-btn size="small" color="blue-lighten-3" @click="changeBody('es')">Español</v-btn>
          </div>
          <div class="wang-editor-styles" style="border: 1px solid #ccc">
            <ClientOnly>
              <Toolbar
                :editor="editorRef"
                :defaultConfig="toolbarConfig"
                mode="default"
                style="border-bottom: 1px solid #ccc"
              />
              <Editor
                :defaultConfig="editorConfig"
                mode="default"
                v-model="valueHtml"
                style="height: 600px; overflow-y: hidden"
                @onCreated="handleCreated"
                @onChange="handleChange"
              />
            </ClientOnly>
          </div>
        </div>
      </v-card-text>
      <v-card-actions>
        <v-btn color="primary" @click="onClickSendBookingConfirmation"> Send booking confirmation </v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>
<script setup lang="ts">
import { mailNotifications } from '~/utils/data/systemData'
import { bookingConfirmationBody } from '~/utils/data/seaExportData'
const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()

const props = defineProps({
  id: {
    type: Number,
    required: true,
  },
})

const textoHtml = ref<any>('')
const showSendBookingConfirmation = ref(true)
const referencia = ref<any>({})
const valueHtml = ref('<p>Mensaje</p>')

const editorRef = ref<any>()
const toolbarConfig = {}
const editorConfig = { placeholder: 'ADTV' }

const selectedNames = ['SeaExportBookingConfirmation']

const customerNotifys = computed(() => {
  return mailNotifications.filter((notify) => selectedNames.includes(notify.short_name))
})

const handleCreated = (editor: any) => {
  editorRef.value = editor
}

const handleChange = (editor: any) => {
  // console.log('change:', editor.getHtml())
  valueHtml.value = editor.getHtml()
}

const form = ref<any>({
  typeContainer: 'booking_containers',
  shipper: null,
  subject: null,
  emails: null,
  message: null,
})

const hasReferencia = computed(() => Object.keys(referencia.value).length > 0)
const hasBookingNotys = computed(() => referencia.value?.booking_notys?.length > 0)
const totalBkgContainers = computed(() =>
  referencia.value?.bkg_containers?.reduce((acc: number, bkgContainer: any) => {
    return acc + parseFloat(bkgContainer.total)
  }, 0)
)
const totalContainers = computed(() => referencia.value?.containers.length)

const totalContainerByOption = computed(() => {
  if (form.value.typeContainer === 'booking_containers') {
    return totalBkgContainers.value
  } else {
    return totalContainers.value
  }
})

const calculateRatesByContainer = (type: string) => {
  if (type === 'booking_containers') {
    fillBodyWithData()
  } else {
    fillBodyWithData()
  }
}

const changeBody = (lang: string) => {
  if (lang === 'en') {
    textoHtml.value = bookingConfirmationBody.bodyEn
  } else {
    textoHtml.value = bookingConfirmationBody.bodyEs
  }
  editorRef.value?.setHtml(textoHtml.value)
  fillBodyWithData()
}

const setCustomerEmails = (emails: string) => {
  form.value.emails = emails
}

const fillBodyWithData = () => {
  const containers = referencia.value.bkg_containers?.map((container: any) => container.container_name).join(', ') || ''
  const totalWeightContainers = referencia.value.containers.reduce((acc: number, container: any) => {
    return acc + parseFloat(container.weight)
  }, 0)
  const totalBultosContainers = referencia.value.containers.reduce((acc: number, container: any) => {
    return acc + parseFloat(container.num_packages)
  }, 0)
  const poNum = referencia.value.po_num ? `P.O. ${referencia.value.po_num}` : ''

  const origin = referencia.value.origin?.name || ''
  const pol = referencia.value.pol?.name || ''
  const pod = referencia.value.pod?.name || ''
  const destination = referencia.value.destination?.name || ''

  // Dynamically adjust table headers and rows
  let headers = ''
  let row = ''

  if (origin) {
    headers += `<th colSpan="1" rowSpan="1" width="auto" style="border: 1px solid #ddd;">Origen</th>`
    row += `<td colSpan="1" rowSpan="1" width="auto" style="border: 1px solid #ddd;">${origin}</td>`
  }
  if (pol) {
    headers += `<th colSpan="1" rowSpan="1" width="auto" style="border: 1px solid #ddd;">POL</th>`
    row += `<td colSpan="1" rowSpan="1" width="auto" style="border: 1px solid #ddd;">${pol}</td>`
  }
  if (pod) {
    headers += `<th colSpan="1" rowSpan="1" width="auto" style="border: 1px solid #ddd;">POD</th>`
    row += `<td colSpan="1" rowSpan="1" width="auto" style="border: 1px solid #ddd;">${pod}</td>`
  }
  if (destination) {
    headers += `<th colSpan="1" rowSpan="1" width="auto" style="border: 1px solid #ddd;">Destino final</th>`
    row += `<td colSpan="1" rowSpan="1" width="auto" style="border: 1px solid #ddd;">${destination}</td>`
  }

  const tmp = JSON.parse(JSON.stringify(textoHtml.value))
  const body = tmp
    .replace('{po}', referencia.value.po_num || '')
    .replace('{shipper}', referencia.value.consignee?.name || '')
    .replace('{bkgline}', referencia.value.booking_number || '')
    .replace('{bkgtm}', referencia.value.booking_tm || '')
    .replace('{equipo}', containers)
    .replace('{peso}', totalWeightContainers.toString())
    .replace('{mercancia}', referencia.value.commodity || '')
    .replace('{bultos}', totalBultosContainers.toString())
    .replace('{bm}', `${referencia.value.voyage_discharge?.print_bl_name}`)
    .replace('{eta}', referencia.value.voyage_discharge?.eta_date || '')
    .replace('{fechaDocs}', referencia.value.doc_closing_date || '')
    .replace('{posicionamiento}', referencia.value.posicionamiento || '')
    .replace(
      '{costos}',
      referencia.value.export_charges
        .filter((exCharge: any) => exCharge.sell_amount != null && parseFloat(exCharge.sell_amount) > 0)
        .map((exCharge: any) => {
          const basis = exCharge.charge_type === 'B' ? 1 : totalContainerByOption.value
          return `<tr><td>${exCharge.charge?.name}</td><td>${formatToCurrency(
            (parseFloat(exCharge.sell_amount) + parseFloat(exCharge.sell_iva)) * basis
          )} ${getCurrencyName(exCharge.sell_currency_id)}</td><td>${
            exCharge.charge_type === 'B' ? 'BL' : 'Container'
          }</td><td>${exCharge.sell_type}</td></tr>`
        })
        .join('')
    )
    .replace(
      // Replace the dynamic table with adjusted headers and rows
      '{detail_movement_table}',
      `<table class="custom-table" style="width: auto; border: 1px solid #ddd; border-collapse: collapse;">
          <thead>
            <tr>${headers}</tr>
          </thead>
          <tbody>
            <tr>${row}</tr>
          </tbody>
      </table>`
    )

  editorRef.value?.setHtml(body)
}

const getSeaExportDetails = async () => {
  try {
    loadingStore.start()
    const response = (await $api.referenciasExport.getReferenciaById(props.id.toString())) as any
    referencia.value = response
    form.value.shipper = response.consignee?.name
    const poNum = response.po_num ? `P.O. ${response.po_num}` : ''
    form.value.subject = `Booking confirmation ${response.booking_tm} / ${response.booking_number} - ${response.voyage_discharge?.print_bl_name} ${poNum}`

    // editorRef.value?.setHtml(textoHtml.value)
    fillBodyWithData()
    snackbar.add({ type: 'success', text: 'Data loaded' })
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const onClickSendBookingConfirmation = async () => {
  try {
    loadingStore.start()
    const response = await $api.referenciasExport.sendBookingConfirmation(props.id.toString(), {
      shipper: form.value.shipper,
      subject: form.value.subject,
      emails: form.value.emails,
      message: valueHtml.value,
    })
    snackbar.add({ type: 'success', text: 'Booking confirmation sent successfully' })

    await getSeaExportDetails()
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

onMounted(async () => {
  // editorRef.value?.setHtml(textoHtml.value)
  textoHtml.value = bookingConfirmationBody.bodyEs
  await getSeaExportDetails()
})
</script>
