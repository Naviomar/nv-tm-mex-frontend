<template>
  <div>
    <div class="grid grid-cols-12 gap-4 mb-2">
      <div class="col-span-6">
        <v-card color="">
          <v-card-text>
            <div>
              <InputAutocomplete
                density="compact"
                name="line_type"
                :items="[
                  { value: 'line', name: 'Freight Lines' },
                  { value: 'agent', name: 'Freight Agents' },
                ]"
                item-title="name"
                item-value="value"
                label="Type *"
              />
            </div>
            <div>
              <InputText density="compact" name="name" label="Name *" />
            </div>
            <div>
              <InputText density="compact" name="commercial_name" label="Commercial name *" />
            </div>
            <div>
              <InputText density="compact" name="contact_name" label="Contact Name" />
            </div>
            <div>
              <InputAutocomplete
                name="country_id"
                label="Country"
                :items="catalogs.countries"
                item-value="id"
                item-title="name"
                density="compact"
              />
            </div>
            <div>
              <InputTextArea density="compact" name="address" label="Address" />
            </div>
            <div>
              <InputText density="compact" name="zip_code" label="Zip code" />
            </div>
            <div>
              <InputText density="compact" name="amacarga_code" label="Amacarga Code" hint="For Amacarga purposes" />
            </div>

            <div class="flex justify-end items-center">
              <NuxtLink
                to="/configuration/lines"
                class="mr-4 inline-flex items-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700"
              >
                Cancel
              </NuxtLink>
              <button
                type="button"
                @click="validateBeforeCreate"
                class="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
              >
                Save
              </button>
            </div>
          </v-card-text>
        </v-card>
      </div>
      <div class="col-span-6">
        <LineBankForm :id="props.id" />

        <div class="mb-4">
          <LineAgentsConfig :line="values" @refresh="getData" />
        </div>

        <v-card class="mb-4">
          <v-card-title>
            <div class="flex justify-between">
              <div>Internal transit file(s)</div>
              <div>
                <button
                  type="button"
                  @click="toggleTransitFiles"
                  class="inline-flex items-center justify-center rounded-full bg-emerald-500 px-2 py-1 text-xs font-medium text-white shadow-sm hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1"
                >
                  +
                </button>
              </div>
            </div>
          </v-card-title>
          <v-card-text>
            <div v-if="formTransitFiles.show">
              <div class="grid grid-cols-2 gap-2">
                <div class="col-span-2">
                  <v-file-input
                    v-model="formTransitFiles.file"
                    name="attachment"
                    label="Attachment *"
                    density="compact"
                  />
                </div>
                <div class="col-span-2">
                  <div class="flex justify-end items-center">
                    <button
                      type="button"
                      @click="toggleTransitFiles"
                      class="mr-4 inline-flex items-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      @click="saveTransitFiles"
                      class="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <v-table density="compact">
              <thead>
                <tr>
                  <th class="text-left">Actions</th>
                  <th class="text-left">Attachment</th>
                  <th class="text-left">Created at</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(itfile, index) in line?.internal_transit_files" :key="`internal-file-${index}`">
                  <td>
                    <div class="flex gap-2">
                      <button
                        type="button"
                        class="inline-flex items-center justify-center rounded-full bg-red-500 px-2 py-1 text-xs font-medium text-white shadow-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                      >
                        ✕
                      </button>
                    </div>
                  </td>
                  <td><ButtonDownloadS3Object :s3Path="itfile.attachment" /></td>
                  <td>{{ formatDateString(itfile.created_at) }}</td>
                </tr>
              </tbody>
            </v-table>
          </v-card-text>
        </v-card>

        <div class="mb-4">
          <LineAddressForm :id="props.id!" />
        </div>

        <v-card class="mb-4">
          <v-card-title>
            <div class="flex justify-between items-center">
              <div class="flex items-center gap-2">
                <v-icon size="small">mdi-credit-card-multiple-outline</v-icon>
                Default Credit / Debit Notes
              </div>
              <v-btn icon size="x-small" :color="defaultNotes.showForm.value ? 'black' : 'success'" @click="defaultNotes.toggleForm">
                <v-icon v-if="defaultNotes.showForm.value">mdi-close</v-icon>
                <v-icon v-else>mdi-plus</v-icon>
              </v-btn>
            </div>
          </v-card-title>
          <v-card-text>
            <div v-if="defaultNotes.showForm.value" class="mb-4">
              <div class="font-bold mb-2">New default note</div>
              <div class="grid grid-cols-2 gap-2">
                <div>
                  <v-autocomplete
                    v-model="defaultNotes.form.value.impoExpo"
                    label="Direction *"
                    :items="[{ value: 'I', title: 'Import' }, { value: 'E', title: 'Export' }]"
                    item-value="value"
                    item-title="title"
                    variant="solo-filled"
                    density="compact"
                  />
                </div>
                <div>
                  <v-autocomplete
                    v-model="defaultNotes.form.value.type"
                    label="Type *"
                    :items="[{ value: 'C', title: 'Credit' }, { value: 'D', title: 'Debit' }]"
                    item-value="value"
                    item-title="title"
                    variant="solo-filled"
                    density="compact"
                  />
                </div>
                <div>
                  <v-autocomplete
                    v-model="defaultNotes.form.value.inbound"
                    label="Format *"
                    :items="[{ value: 0, title: 'From TM' }, { value: 1, title: 'From Agent' }]"
                    item-value="value"
                    item-title="title"
                    variant="solo-filled"
                    density="compact"
                  />
                </div>
                <div>
                  <v-autocomplete
                    v-model="defaultNotes.form.value.currency_id"
                    label="Currency *"
                    :items="currencies"
                    item-value="id"
                    item-title="name"
                    variant="solo-filled"
                    density="compact"
                  />
                </div>
                <div>
                  <v-text-field
                    v-model="defaultNotes.form.value.from_date"
                    type="date"
                    label="From date *"
                    density="compact"
                    variant="solo-filled"
                  />
                </div>
                <div>
                  <v-text-field
                    v-model="defaultNotes.form.value.to_date"
                    type="date"
                    label="To date (leave empty = open ended)"
                    density="compact"
                    variant="solo-filled"
                    clearable
                  />
                </div>
                <div>
                  <v-autocomplete
                    v-model="defaultNotes.form.value.party_type"
                    label="Party type *"
                    :items="[
                      { value: 'App\\Models\\Mexico\\FreightForwarder', title: 'Freight Forwarder' },
                      { value: 'App\\Models\\Mexico\\Consignee', title: 'Consignee' },
                    ]"
                    item-value="value"
                    item-title="title"
                    variant="solo-filled"
                    density="compact"
                    @update:model-value="defaultNotes.onPartyTypeChange"
                  />
                </div>
                <div>
                  <AGlobalSearch
                    :key="`party-search-${defaultNotes.form.value.party_type}`"
                    :onSearch="defaultNotes.form.value.party_type === 'App\\Models\\Mexico\\FreightForwarder' ? defaultNotes.searchFfs : defaultNotes.searchCustomers"
                    v-model="defaultNotes.form.value.party_id"
                    validate-key="party_id"
                    :label="defaultNotes.form.value.party_type === 'App\\Models\\Mexico\\FreightForwarder' ? 'Freight Forwarder *' : 'Consignee *'"
                    :set-items="defaultNotes.partyItems.value"
                    :set-item="defaultNotes.partyItem.value"
                  />
                </div>
              </div>

              <div class="mt-2">
                <div class="flex items-center gap-2 mb-1">
                  <v-btn icon="mdi-plus" size="x-small" color="success" @click="defaultNotes.addConcept"></v-btn>
                  <span class="font-bold text-sm">Concepts *</span>
                </div>
                <div
                  v-for="(concept, idx) in defaultNotes.form.value.concepts"
                  :key="`dn-concept-${idx}`"
                  class="grid grid-cols-3 gap-2 mb-1"
                >
                  <div class="col-span-2">
                    <v-autocomplete
                      v-model="concept.charge_id"
                      density="compact"
                      label="Charge *"
                      :items="catalogs.charges"
                      item-title="name"
                      item-value="id"
                      variant="solo-filled"
                    />
                  </div>
                  <div class="flex gap-2 items-center">
                    <v-text-field
                      v-model="concept.amount"
                      density="compact"
                      variant="solo-filled"
                      label="Amount *"
                      type="number"
                      prepend-inner-icon="mdi-currency-usd"
                    />
                    <v-btn color="red" variant="outlined" icon="mdi-delete-outline" size="x-small" @click="defaultNotes.removeConcept(idx)" />
                  </div>
                </div>
              </div>

              <div class="mt-2">
                <v-textarea
                  v-model="defaultNotes.form.value.notes"
                  label="Notes (will be copied to generated notes)"
                  density="compact"
                  variant="solo-filled"
                  rows="2"
                  auto-grow
                />
              </div>

              <div class="flex justify-end gap-2 mt-3">
                <v-btn color="grey" variant="outlined" @click="defaultNotes.toggleForm">Cancel</v-btn>
                <v-btn color="primary" @click="defaultNotes.save">Save default note</v-btn>
              </div>
            </div>

            <v-table density="compact">
              <thead>
                <tr>
                  <th>Actions</th>
                  <th>I/E</th>
                  <th>C/D</th>
                  <th>Format</th>
                  <th>Party</th>
                  <th>Currency</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Notes</th>
                  <th>Concepts</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in defaultNotes.items.value" :key="`dn-${index}`">
                  <td>
                    <v-btn color="red" icon="mdi-delete-outline" size="x-small" variant="outlined" @click="defaultNotes.remove(item)" />
                  </td>
                  <td>
                    <v-chip size="x-small" :color="item.impoExpo === 'I' ? 'blue' : 'orange'">{{ item.impoExpo === 'I' ? 'Import' : 'Export' }}</v-chip>
                  </td>
                  <td>
                    <v-chip size="x-small" :color="item.type === 'C' ? 'green' : 'red'">{{ item.type === 'C' ? 'Credit' : 'Debit' }}</v-chip>
                  </td>
                  <td class="whitespace-nowrap text-xs">{{ item.inbound ? 'From Agent' : 'From TM' }}</td>
                  <td class="whitespace-nowrap text-xs">
                    <div class="flex items-center gap-1">
                      <v-chip size="x-small" :color="item.party_type?.includes('Consignee') ? 'purple' : 'teal'">
                        {{ item.party_type?.includes('Consignee') ? 'Consignee' : 'FF' }}
                      </v-chip>
                      {{ item.party?.name }}
                    </div>
                  </td>
                  <td class="text-xs">{{ item.currency?.code ?? item.currency?.name }}</td>
                  <td class="whitespace-nowrap text-xs">{{ item.from_date }}</td>
                  <td class="whitespace-nowrap text-xs">{{ item.to_date ?? '∞' }}</td>
                  <td class="text-xs whitespace-nowrap">{{ item.notes ?? '—' }}</td>
                  <td class="text-xs">
                    <div v-for="(c, ci) in item.concepts" :key="`dn-c-${ci}`">{{ c.charge?.name }}: {{ formatToCurrency(c.amount) }}</div>
                  </td>
                </tr>
                <tr v-if="defaultNotes.items.value.length === 0">
                  <td colspan="10" class="text-center text-grey py-2 text-sm">No default notes configured</td>
                </tr>
              </tbody>
            </v-table>
          </v-card-text>
        </v-card>

        <div class="mb-4">
          <LineEmailsForm :line="values" @refresh="getData" />
        </div>

        <div class="mb-4">
          <LineContactsForm :line="line" @refresh="getData" />
        </div>

        <div class="mb-4">
          <LineNotesForm :line="values" />
        </div>
      </div>
    </div>

    <!-- Dialog -->
    <SimilarItemsDialog
      v-model="showSimilarDialog"
      :similar-items="similarItems"
      :current-name="values.name"
      @proceed="saveLine"
    />
  </div>
</template>
<script setup lang="ts">
import { currencies } from '@/utils/data/systemData'
import { schema } from '~~/forms/lineForm'

const { $api, $notifications } = useNuxtApp()
const confirm = $notifications.useConfirm()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()
const router = useRouter()
const route = useRoute()

const props = defineProps({
  id: {
    type: [String, Number],
    required: false,
  },
})

const id = route.params.id

// ---- Similares ----
const similarItems = ref<any>([])
const showSimilarDialog = ref(false)

const line = ref<any>({})

const { handleSubmit, values, errors, setValues } = useForm({
  validationSchema: schema,
})

const catalogs = ref({
  countries: [] as any,
  banks: [] as any,
  charges: [] as any,
})

const fetchSimilarLines = async () => {
  try {
    loadingStore.loading = true
    const body = { name: values.name }
    const response = await $api.lines.searchByName(body)
    const items = Array.isArray(response) ? response : []
    similarItems.value = id ? items.filter((item: any) => String(item.id) !== String(id)) : items
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

// Validar antes de guardar
const validateBeforeCreate = async () => {
  if (!values.name || values.name === '') {
    snackbar.add({ type: 'warning', text: 'Name is required' })
    return
  }
  await fetchSimilarLines()
  if (similarItems.value.length === 0) {
    saveLine()
    return
  }
  showSimilarDialog.value = true
}

const onSuccess = async (values: any) => {
  const body = {
    ...values,
  }
  await $api.lines.update(id!.toString(), body)

  snackbar.add({ type: 'success', text: 'Freight line updated' })
  router.push('/configuration/lines')
}

function onInvalidSubmit({ values, errors, results }: any) {
  snackbar.add({ type: 'warning', text: 'Validate form before submit' })
}

// composable for transit files
const useLineInternalTransitFiles = () => {
  const formTransitFiles = ref<any>({
    show: false,
    file: null,
  })

  const toggleTransitFiles = () => {
    formTransitFiles.value.show = !formTransitFiles.value.show
  }

  const saveTransitFiles = async () => {
    if (!formTransitFiles.value.file) {
      snackbar.add({ type: 'warning', text: 'Please select a file' })
      return
    }
    try {
      loadingStore.start()
      const body = {
        line_id: id,
        attachment: formTransitFiles.value.file,
      }
      const response = await $api.lines.saveInternalTransitFile(body)
      line.value.internal_transit_files.push(response)
      snackbar.add({ type: 'success', text: 'Internal transit file added' })
      toggleTransitFiles()
    } catch (e) {
      console.error(e)
    } finally {
      setTimeout(() => {
        loadingStore.stop()
      }, 250)
    }
  }

  return {
    formTransitFiles,
    toggleTransitFiles,
    saveTransitFiles,
  }
}

const { formTransitFiles, toggleTransitFiles, saveTransitFiles } = useLineInternalTransitFiles()

const useDefaultFfNotes = () => {
  const showForm = ref(false)
  const items = ref<any[]>([])
  const partyItems = ref<any[]>([])
  const partyItem = ref<any>(null)

  const emptyForm = () => ({
    impoExpo: null,
    type: null,
    inbound: 0,
    currency_id: null,
    from_date: null,
    to_date: null,
    party_type: null,
    party_id: null,
    notes: null,
    concepts: [{ charge_id: null, amount: null }],
  })

  const form = ref<any>(emptyForm())

  const toggleForm = () => {
    showForm.value = !showForm.value
    if (!showForm.value) form.value = emptyForm()
  }

  const onPartyTypeChange = () => {
    form.value.party_id = null
    partyItems.value = []
    partyItem.value = null
  }

  const searchFfs = async (params: any) => {
    try {
      return await $api.freightForwarders.searchFfs({ query: params })
    } catch {
      return []
    }
  }

  const searchCustomers = async (params: any) => {
    try {
      return await $api.consignees.searchConsignees({ query: params })
    } catch {
      return []
    }
  }

  const addConcept = () => {
    form.value.concepts.push({ charge_id: null, amount: null })
  }

  const removeConcept = (idx: number) => {
    form.value.concepts.splice(idx, 1)
  }

  const fetchItems = async () => {
    try {
      const res = await $api.lines.getDefaultFfNotes(route.params.id!.toString())
      items.value = Array.isArray(res) ? res : []
    } catch (e) {
      console.error(e)
    }
  }

  const save = async () => {
    const f = form.value
    if (!f.impoExpo || !f.type || f.inbound === null || !f.currency_id || !f.from_date || !f.party_type || !f.party_id) {
      snackbar.add({ type: 'warning', text: 'Please fill all required fields' })
      return
    }
    if (!f.concepts.length || f.concepts.some((c: any) => !c.charge_id || !c.amount)) {
      snackbar.add({ type: 'warning', text: 'Please add at least one concept with charge and amount' })
      return
    }
    try {
      loadingStore.start()
      await $api.lines.saveDefaultFfNote(route.params.id!.toString(), f)
      snackbar.add({ type: 'success', text: 'Default note saved' })
      await fetchItems()
      form.value = emptyForm()
      showForm.value = false
    } catch (e) {
      console.error(e)
      snackbar.add({ type: 'error', text: 'Error saving default note' })
    } finally {
      setTimeout(() => loadingStore.stop(), 250)
    }
  }

  const remove = async (item: any) => {
    const result = await confirm({
      title: 'Delete default note?',
      confirmationText: 'Yes, delete',
      content: 'This will not affect already created notes from this template.',
      dialogProps: { persistent: true, maxWidth: 500 },
      confirmationButtonProps: { color: 'error' },
    })
    if (!result) return
    try {
      loadingStore.start()
      await $api.lines.deleteDefaultFfNote(route.params.id!.toString(), item.id.toString())
      snackbar.add({ type: 'success', text: 'Default note deleted' })
      await fetchItems()
    } catch (e) {
      console.error(e)
    } finally {
      setTimeout(() => loadingStore.stop(), 250)
    }
  }

  return { showForm, form, items, partyItems, partyItem, toggleForm, onPartyTypeChange, searchFfs, searchCustomers, addConcept, removeConcept, save, remove, fetchItems }
}

const defaultNotes = useDefaultFfNotes()

const getLineCatalogs = async () => {
  const response = await $api.lines.getCatalogs()

  catalogs.value = response as any
}

const saveLine = handleSubmit(onSuccess, onInvalidSubmit)

const getData = async () => {
  try {
    loadingStore.start()
    await $api.lines.getById(route.params.id!.toString()).then((res: any) => {
      res.country_id = res?.country_id ?? res?.country?.id ?? null
      line.value = res
      setValues(res)
    })
    await defaultNotes.fetchItems()
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

await getLineCatalogs()
await getData()
</script>
