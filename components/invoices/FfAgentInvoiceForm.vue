<template>
  <div>
    <v-card>
      <v-card-title>
        <h1 class="text-xl font-bold">Capture Freight Forwarder Agent invoice</h1>
      </v-card-title>
      <v-card-text>
        <div class="grid grid-cols-4 gap-2">
          <div class="col-span-3">
            <v-autocomplete
              v-model="form.format"
              density="compact"
              label="Select a type *"
              :items="[
                { value: 'inbound', name: 'From agent' }, // no
                { value: 'outbound', name: 'From TM' }, // yes
              ]"
              item-title="name"
              item-value="value"
              variant="solo-filled"
            />
            <v-alert color="grey-ligten-2" density="compact">
              <strong>From agent</strong>: Credit / Debit note from agent to us. <strong>From TM</strong>: Credit /
              Debit note from us to agent.
            </v-alert>
          </div>

          <div class="col-span-3">
            <div class="flex gap-2">
              <v-checkbox
                v-model="form.link_sea_ref"
                :disabled="referenciaLinked && form.link_air_ref"
                label="Link to Sea Reference"
                density="compact"
                hide-details
                @update:model-value="checkSeaRef"
              />
              <v-checkbox
                v-model="form.link_air_ref"
                :disabled="referenciaLinked && form.link_sea_ref"
                label="Link to Air Reference"
                density="compact"
                hide-details
                @update:model-value="checkAirRef"
              />
            </div>
            <v-card v-if="form.link_sea_ref" color="blue-grey-lighten-5" class="mb-6">
              <v-card-title>
                <div class="flex justify-between">
                  <div class="flex items-center gap-2">
                    <v-icon size="x-small">mdi-ship-wheel</v-icon>
                    <div>Search & link to Sea Ref</div>
                  </div>
                </div>
              </v-card-title>
              <v-card-text>
                <!-- // Posiblemente se necesite un componente para buscar y pagar facturas -->
                <div class="mb-4">
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <v-text-field v-model="filters.masterBl" density="compact" label="Search by Master BL" />
                      <v-btn color="success" @click="searchReferences('sea')">Search</v-btn>
                    </div>
                  </div>
                </div>
              </v-card-text>
            </v-card>

            <v-card v-if="form.link_air_ref" color="blue-grey-lighten-5" class="mb-6">
              <v-card-title>
                <div class="flex justify-between">
                  <div class="flex items-center gap-2">
                    <v-icon size="x-small">mdi-airplane</v-icon>
                    <div>Search & link to Air Ref</div>
                  </div>
                </div>
              </v-card-title>
              <v-card-text>
                <!-- // Posiblemente se necesite un componente para buscar y pagar facturas -->
                <div class="mb-4">
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <v-text-field v-model="filters.masterBl" density="compact" label="Search by Master AWB" />
                      <v-btn color="success" @click="searchReferences('air')">Search</v-btn>
                    </div>
                  </div>
                </div>
              </v-card-text>
            </v-card>

            <v-alert v-if="referenciaLinked" density="compact" variant="outlined" type="info" dense>
              <div>Service reference #{{ referenciaLinked.reference_number }} linked to invoice</div>
              <v-btn color="red" size="small" @click="referenciaLinked = null">Unlink Ref</v-btn>
            </v-alert>
          </div>
        </div>

        <div class="grid grid-cols-4 gap-2">
          <div class="col-span-3">
            <v-autocomplete
              v-model="form.type"
              density="compact"
              label="Credit / Debit *"
              :items="[{ name: 'Credit' }, { name: 'Debit' }]"
              item-title="name"
              item-value="name"
              variant="solo-filled"
            />
          </div>
          <div class="col-span-3">
            <AGlobalSearch
              v-model="form.forwarder_id"
              :onSearch="searchFfs"
              validate-key="forwarder_id"
              label="Freight Forwarder Agent *"
            />
            <div v-if="!isInbound">
              <v-text-field v-model="form.contacto_ff" density="compact" label="Contacto F.F." />
            </div>

            <div class="grid grid-cols-2 gap-2">
              <div v-if="isInbound">
                <v-text-field v-model="form.folio" density="compact" label="Folio *" />
              </div>
              <v-text-field
                v-if="false"
                v-model="form.invoice_date"
                density="compact"
                type="date"
                label="Invoice date"
              />
            </div>

            <div>
              <v-autocomplete
                v-model="form.currency_id"
                density="compact"
                label="Currency *"
                :items="currencies"
                item-title="name"
                item-value="id"
                variant="solo-filled"
              />
            </div>

            <div v-if="hasFormat">
              <div class="flex justify-start items-center mb-2">
                <div class="font-bold">Charges</div>
                <v-btn icon="mdi-plus" size="x-small" color="success" @click="addCharge"></v-btn>
              </div>

              <div v-for="(charge, index) in charges" :key="`charge-${index}`" class="grid grid-cols-6 gap-3">
                <div class="col-span-2">
                  <v-autocomplete
                    v-model="charge.charge_id"
                    density="compact"
                    label="Charge"
                    :items="catalogs.charges"
                    item-title="name"
                    item-value="id"
                    variant="solo-filled"
                  />
                </div>
                <div class="">
                  <v-text-field
                    v-model="charge.amount"
                    density="compact"
                    variant="solo-filled"
                    label="Amount"
                    clearable
                    prepend-inner-icon="mdi-currency-usd"
                  />
                </div>
                <div class="">
                  <v-btn
                    color="red"
                    variant="outlined"
                    icon="mdi-delete-outline"
                    size="x-small"
                    @click="removeCharge(index)"
                  >
                  </v-btn>
                </div>
              </div>
            </div>

            <div class="mt-2 text-lg font-bold">
              {{ totalAmount > 0 ? `Total amount: ${formatToCurrency(totalAmount)}` : 'No charges added' }}
            </div>

            <div v-if="isInbound">
              <v-file-input v-model="form.file" density="compact" label="Attachment" />
            </div>

            <v-textarea v-model="form.notes" density="compact" label="Additional notes" />

            <v-btn color="primary" @click="saveFfNote">Save</v-btn>
          </div>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>
<script setup lang="ts">
import { currencies } from '@/utils/data/systemData'
const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const router = useRouter()
const loadingStore = useLoadingStore()

const filters = ref<any>({
  masterBl: '',
})

const referenciaLinked = ref<any>(null)
const charges = ref<any>([])

const catalogs = ref<any>({
  forwarders: [],
  charges: [],
})

const form = ref<any>({
  forwarder_id: null,
  link_ref: false,
  folio: null,
  serie: null,
  invoice_date: null,
  format: null,
  type: null,
  contacto_ff: null,
  currency_id: null,
  amount: null,
  file: null,
})

const isInbound = computed(() => form.value.format === 'inbound')
const isOutbound = computed(() => form.value.format === 'outbound')
const hasFormat = computed(() => form.value.format != null)

const checkSeaRef = (value: boolean) => {
  if (value) {
    form.value.link_air_ref = false
  }
  referenciaLinked.value = null
}

const checkAirRef = (value: boolean) => {
  if (value) {
    form.value.link_sea_ref = false
  }
  referenciaLinked.value = null
}

const addCharge = () => {
  charges.value.push({
    charge_id: null,
    amount: 0,
  })
}

const removeCharge = (index: number) => {
  charges.value.splice(index, 1)
}

const totalAmount = computed(() => {
  let total = 0
  charges.value.forEach((charge: any) => {
    total += parseFloat(charge.amount)
  })
  return total
})

const searchFfs = async (params: any) => {
  try {
    const response = await $api.freightForwarders.searchFfs({
      query: params,
    })
    return response
  } catch (error) {
    snackbar.add({
      type: 'error',
      text: 'Error fetching freight forwarders',
    })
  }
}

const searchReferences = async (type: string) => {
  try {
    referenciaLinked.value = null
    loadingStore.start()
    const body = {
      ...flattenArraysToCommaSeparatedString(filters.value),
      type,
    }
    const response: any = await $api.freightForwarders.searchServiceReferenceByMasterBl(body)

    if (response.length <= 0) {
      snackbar.add({
        type: 'warning',
        text: 'No service reference found',
      })
      return
    }

    referenciaLinked.value = response
  } catch (error) {
    console.error(error)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const saveFfNote = async () => {
  try {
    if (!form.value.forwarder_id) {
      snackbar.add({
        type: 'error',
        text: 'Freight Forwarder Agent is required',
      })
      return
    }
    if (!form.value.format) {
      snackbar.add({
        type: 'error',
        text: 'Type is required',
      })
      return
    }
    // if total amount is zero, do not save
    if (totalAmount.value <= 0) {
      snackbar.add({
        type: 'error',
        text: 'Total amount cannot be zero',
      })
      return
    }
    loadingStore.start()

    let serviceType = null
    if (form.value.link_sea_ref) {
      serviceType = 'sea'
    } else if (form.value.link_air_ref) {
      serviceType = 'air'
    }
    const body = {
      ...form.value,
      service_type: serviceType,
      charges: charges.value,
      referencia_id: referenciaLinked.value?.id,
    }
    const response = await $api.freightForwarders.createFfNote(body)
    snackbar.add({
      type: 'success',
      text: 'F.F. Note created',
    })
    router.push('/invoices/ffagents/notes')
  } catch (error) {
    console.error(error)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const getCatalogs = async () => {
  const response = await $api.freightForwarders.getNotesFilters()
  catalogs.value = response as any
}

await getCatalogs()
</script>
