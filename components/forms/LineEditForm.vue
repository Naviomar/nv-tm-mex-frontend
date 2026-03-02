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
            <div class="flex justify-between">
              <div>Automatic charges in references</div>
              <div>
                <button
                  type="button"
                  @click="automaticCharges.toggleForm"
                  class="inline-flex items-center justify-center rounded-full bg-emerald-500 px-2 py-1 text-xs font-medium text-white shadow-sm hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1"
                >
                  +
                </button>
              </div>
            </div>
          </v-card-title>
          <v-card-text>
            <div v-if="automaticCharges.form.value.show" class="">
              <div class="font-bold">Add new automatic charge</div>
              <div class="grid grid-cols-2 gap-2">
                <div class="col-span-1">
                  <v-text-field
                    v-model="automaticCharges.form.value.from_date"
                    type="date"
                    density="compact"
                    variant="solo-filled"
                  />
                </div>
                <div class="col-span-1">
                  <v-text-field
                    v-model="automaticCharges.form.value.to_date"
                    type="date"
                    density="compact"
                    variant="solo-filled"
                  />
                </div>
                <div class="col-span-2">
                  <v-autocomplete
                    v-model="automaticCharges.form.value.impoExpo"
                    label="Import/Export"
                    :items="[
                      { value: 'I', name: 'Import' },
                      { value: 'E', name: 'Export' },
                    ]"
                    item-value="value"
                    item-title="name"
                    variant="solo-filled"
                    density="compact"
                  />
                </div>
                <div class="col-span-2">
                  <v-autocomplete
                    v-model="automaticCharges.form.value.charge_type"
                    label="Charge type"
                    :items="[
                      { value: 'buy', name: 'Buy' },
                      { value: 'sell', name: 'Sell' },
                    ]"
                    item-value="value"
                    item-title="name"
                    variant="solo-filled"
                    density="compact"
                  />
                </div>
                <div class="col-span-2">
                  <v-autocomplete
                    v-model="automaticCharges.form.value.charge_id"
                    label="Charge"
                    :items="catalogs.charges"
                    item-value="id"
                    item-title="name"
                    variant="solo-filled"
                    density="compact"
                  />
                </div>
                <div class="col-span-2">
                  <v-text-field
                    v-model="automaticCharges.form.value.amount"
                    type="number"
                    density="compact"
                    variant="solo-filled"
                    name="amount"
                    label="Amount *"
                  />
                </div>
                <div class="col-span-2">
                  <v-autocomplete
                    v-model="automaticCharges.form.value.currency_id"
                    label="Currency"
                    :items="currencies"
                    item-value="id"
                    item-title="name"
                    variant="solo-filled"
                    density="compact"
                  />
                </div>
              </div>
              <div class="">
                <div class="flex justify-end items-center mb-4">
                  <button
                    type="button"
                    @click="automaticCharges.toggleForm"
                    class="mr-4 inline-flex items-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    @click="automaticCharges.save"
                    class="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>

            <v-table density="compact">
              <thead>
                <tr>
                  <th class="text-left">Actions</th>
                  <th class="text-left">I/E</th>
                  <th class="text-left">Type</th>
                  <th class="text-left">Charge</th>
                  <th class="text-left">Amount</th>
                  <th class="text-left">From</th>
                  <th class="text-left">To</th>
                  <th class="text-left">User</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in line.automatic_charges" :key="`auto-charge-${index}`">
                  <td>
                    <div class="flex gap-2">
                      <TrashButton :item="item" @click="showConfirmAutomaticCharge(item)" />
                    </div>
                  </td>
                  <td>{{ item.impoExpo }}</td>
                  <td>{{ item.charge_type }}</td>
                  <td class="whitespace-nowrap">{{ item.charge?.name }}</td>
                  <td class="whitespace-nowrap">{{ formatToCurrency(item.amount) }} {{ item.currency?.code }}</td>
                  <td class="whitespace-nowrap">{{ item.from_date }}</td>
                  <td class="whitespace-nowrap">{{ item.to_date }}</td>
                  <td class="whitespace-nowrap">
                    {{ item.creator?.name }}
                    @ {{ formatDateString(item.created_at) }}
                  </td>
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

const showConfirmAutomaticCharge = async (item: any) => {
  const result = await confirm({
    title: 'Are you sure?',
    confirmationText: 'Yes, I confirm',
    content: 'Please confirm this action.',
    dialogProps: {
      persistent: true,
      maxWidth: 500,
    },
    confirmationButtonProps: {
      color: 'primary',
    },
  })

  if (result) {
    try {
      loadingStore.start()
      const body = {
        ...item,
      }
      await $api.lines.deleteAutomaticCharge(route.params.id!.toString(), body)
      snackbar.add({ type: 'success', text: 'Automatic charge deleted' })
      await getData()
    } catch (e) {
      console.error(e)
    } finally {
      setTimeout(() => {
        loadingStore.stop()
      }, 250)
    }
  }
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

const useAutomaticCharges = () => {
  const form = ref<any>({
    show: false,
    from_date: null,
    to_date: null,
    impoExpo: null,
    charge_type: null,
    charge_id: null,
    amount: null,
    currency_id: null,
  })

  const toggleForm = () => {
    form.value.show = !form.value.show
  }

  const clearForm = () => {
    form.value.impoExpo = null
    form.value.charge_type = null
    form.value.charge_id = null
    form.value.amount = null
    form.value.currency_id = null
    form.value.from_date = null
    form.value.to_date = null

    form.value.show = false
  }

  const save = async () => {
    if (
      !form.value.impoExpo ||
      !form.value.charge_type ||
      !form.value.charge_id ||
      !form.value.amount ||
      !form.value.currency_id ||
      !form.value.from_date ||
      !form.value.to_date
    ) {
      snackbar.add({ type: 'warning', text: 'Please fill all fields' })
      return
    }
    try {
      loadingStore.start()
      const body = {
        line_id: id,
        ...form.value,
      }
      await $api.lines.saveAutomaticCharge(route.params.id!.toString(), body)
      snackbar.add({ type: 'success', text: 'Automatic charge added' })
      await getData()
      clearForm()
    } catch (e) {
      console.error(e)
    } finally {
      setTimeout(() => {
        loadingStore.stop()
      }, 250)
    }
  }

  return {
    form,
    toggleForm,
    save,
  }
}
const automaticCharges = useAutomaticCharges()

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
