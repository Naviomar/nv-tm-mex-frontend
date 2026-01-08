<template>
  <div>
    <div class="grid grid-cols-12 gap-4">
      <div class="col-span-6">
        <div>
          <InputText density="compact" name="name" label="Name *" />
          <v-btn color="primary" size="small" @click="searchChargesByName"> Search similar </v-btn>
          <div v-if="hasSimilarCharges" class="py-4 bg-slate-200 dark:bg-neutral-700 mb-4 border-dotted border-2">
            <div class="text-sm font-bold">Charges with similar name:</div>
            <div class="max-h-96 overflow-y-auto">
              <div v-for="charge in similars" :key="charge.id" class="p-1">{{ charge.name }} #{{ charge.id }}</div>
            </div>
          </div>
        </div>
        <div>
          <InputText density="compact" name="code" label="Code " />
        </div>

        <div>
          <InputAutocomplete
            density="compact"
            name="charge_entity_id"
            label="Entity"
            :items="chargeEntities"
            item-title="name"
            item-value="id"
            hint="Depending on the type of service where you can select the charge in the system."
          />
        </div>
        <div>
          <InputAutocomplete
            density="compact"
            name="services"
            label="Service(s)"
            :items="serviceTypes"
            item-title="name"
            item-value="id"
            multiple
            hint="Depending on the type of service where you can select the charge in the system."
          />
        </div>

        <div class="grid grid-cols-3 gap-2">
          <div class="col-span-2">
            <InputText density="compact" name="default_amount" label="Default amount *" />
          </div>
          <div>
            <InputAutocomplete
              density="compact"
              name="default_currency_id"
              label="Currency"
              :items="currencies"
              item-title="name"
              item-value="id"
            />
          </div>
        </div>

        <div>
          <InputCheckbox name="can_be_deleted" label="Can be deleted?" />
        </div>

        <div>
          <InputCheckbox name="is_for_free_format_cfdi" label="Is for Free Format CFDI?" />
        </div>

        <div class="flex justify-center items-center">
          <v-btn class="mr-4" color="secondary" to="/configuration/charges"> Cancel </v-btn>
          <v-btn color="primary" @click="validateBeforeCreate"> Save </v-btn>
        </div>
      </div>
      <div class="col-span-6">
        <div v-if="isSeaCharge" class="mb-4">
          <v-alert color="blue-grey-lighten-4">
            <v-alert-title>Sea charge options</v-alert-title>
            <div class="grid grid-cols-3 gap-2 mx-4">
              <div>
                <InputSwitch name="sea_is_import" density="compact" label="is Import" />
              </div>
              <div>
                <InputSwitch name="sea_is_export" density="compact" label="is Export" />
              </div>
              <div></div>
              <div>
                <InputSwitch name="is_local" density="compact" label="is local?" />
              </div>
              <div>
                <InputSwitch name="is_warranty_deposit" density="compact" label="is warranty deposit?" />
              </div>
              <div>
                <InputSwitch name="is_ocean_freight" density="compact" label="is OCF?" />
              </div>
            </div>
          </v-alert>
        </div>
        <div v-if="isAirCharge" class="mb-4">
          <v-alert color="blue-grey-lighten-4">
            <v-alert-title>Air charge options</v-alert-title>
            <div class="grid grid-cols-2 gap-2 mx-4">
              <div>
                <InputSwitch name="air_is_import" density="compact" label="is Import" />
              </div>
              <div>
                <InputSwitch name="air_is_export" density="compact" label="is Export" />
              </div>
               <div>
                <InputSwitch name="is_air_freight" density="compact" label="is Air Freight?" />
              </div>
            </div>
          </v-alert>
        </div>
      </div>
    </div>
    <SimilarItemsDialog v-model="showSimilarDialog" :similar-items="similars" @proceed="confirmCreate" />
  </div>
</template>
<script setup lang="ts">
import { serviceTypes, chargeEntities, currencies } from '~/utils/data/systemData'
import { schema } from '~~/forms/chargeForm'

const router = useRouter()
const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()

const similars = ref<any>([])
const showSimilarDialog = ref(false) // Controls dialog visibility
const hasSimilarCharges = computed(() => similars.value.length > 0)

const isSeaCharge = computed(() => values.services?.includes(1) || values.services?.includes(3))
const isAirCharge = computed(() => values.services?.includes(2) || values.services?.includes(3))

const { handleSubmit, values, errors, meta, setValues } = useForm({
  validationSchema: schema,
})

const confirmCreate = () => {
  saveCharge()
}

const onSuccess = async (values: any) => {
  const response = await $api.charges.create(values)

  snackbar.add({ type: 'success', text: 'Charge created' })
  router.push('/configuration/charges')
}

function onInvalidSubmit({ values, errors, results }: any) {
  snackbar.add({ type: 'warning', text: 'Validate form before submit' })
}

const saveCharge = handleSubmit(onSuccess, onInvalidSubmit)

const validateBeforeCreate = async () => {
  if (!values.name || values.name === '') {
    snackbar.add({ type: 'warning', text: 'Name is required' })
    return
  }
  await searchChargesByName()
  showSimilarDialog.value = true
}

const searchChargesByName = async () => {
  try {
    loadingStore.loading = true
    const body = {
      name: values.name,
    }
    const response = await $api.charges.searchByName(body)
    similars.value = response
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

onMounted(() => {
  setValues({
    default_amount: 0,
  })
})
</script>
