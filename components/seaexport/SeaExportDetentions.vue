<template>
  <div>
    <div class="flex items-center text-base gap-2">
      <v-icon size="x-small">mdi-ship-wheel</v-icon>
      <div>Sea Export information #{{ referencia.reference_number }}</div>
    </div>
    <v-card>
      <v-card-title> Detentions </v-card-title>
      <v-card-subtitle> Detentions control </v-card-subtitle>
      <v-card-text>
        <v-alert color="amber" type="info" density="compact">
          Once a container delay amount is recorded it can only be corrected through an approved request.
        </v-alert>

        <v-table density="compact">
          <thead>
            <tr>
              <th class="font-bold!">Has detentions?</th>
              <th class="font-bold!">Container</th>
              <th class="font-bold!">Type</th>
              <th class="font-bold!">Days</th>
              <th class="font-bold!">Line amount</th>
              <th class="font-bold!">Customer amount</th>
              <th class="font-bold!">Con IVA</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!hasContainers">
              <td colspan="6" class="text-center">No containers in reference</td>
            </tr>
            <tr v-if="hasContainers" v-for="refContainer in formContainers" :key="refContainer.id">
              <td>
                <div v-if="refContainer.container.detention == null" class="mb-2">
                  <v-chip color="secondary">Pending</v-chip>
                </div>
                <div v-if="refContainer.container.detention != null" class="mb-2">
                  <v-chip v-if="generateDetentions(refContainer.container.detention)" color="red">Yes</v-chip>
                  <v-chip v-if="!generateDetentions(refContainer.container.detention)" color="blue">No</v-chip>
                </div>

                <div>
                  <!-- A recorded detention is corrected through a request that carries the new values -->
                  <ProcessAuthorizationWrapper
                    v-if="generateDetentions(refContainer.container.detention)"
                    processName="sea-export-update-detentions"
                    :requestKey="`${props.id}:${refContainer.id}`"
                    label="Update detentions"
                    :displayName="`Ref. ${referencia.reference_number} / ${refContainer.container.container_number}`"
                    :initial-form-data="detentionFormData(refContainer)"
                    @refresh="getSeaExportDetails"
                  />
                </div>
              </td>
              <td>{{ refContainer.container.container_number }}</td>
              <td>{{ refContainer.container.container_type?.name }}</td>
              <td>
                <v-text-field v-model="refContainer.days" density="compact" type="number" label="Days passed" />
              </td>
              <td>
                <v-text-field
                  v-model="refContainer.amount_line"
                  density="compact"
                  type="number"
                  label="Line amount"
                  @blur="validateLineAmount(refContainer)"
                />
              </td>
              <td>
                <v-text-field
                  v-model="refContainer.amount_customer"
                  density="compact"
                  type="number"
                  label="Customer amount"
                />
              </td>
              <td>
                <v-checkbox v-model="refContainer.is_con_iva" density="compact" hide-details />
              </td>
            </tr>
          </tbody>
        </v-table>

        <v-btn color="primary" @click="onClickSaveDetentions"> Save detentions </v-btn>
      </v-card-text>
    </v-card>
  </div>
</template>
<script setup lang="ts">
const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()

const props = defineProps({
  id: {
    type: [String, Number],
    required: true,
  },
})

const referencia = ref<any>(null)
const formContainers = ref<any>([])

const hasContainers = computed(() => formContainers.value.length > 0)

const detentionFormData = (refContainer: any) => ({
  days: refContainer.container.detention?.days,
  amount_line: refContainer.container.detention?.amount_line,
  is_con_iva: refContainer.container.detention?.is_con_iva ?? true,
})

const validateLineAmount = (refContainer: any) => {
  if (parseFloat(refContainer.amount_line) >= parseFloat(refContainer.amount_customer)) {
    // refContainer.amount_line = refContainer.amount_customer
    snackbar.add({ type: 'warning', text: 'Line amount must be less than customer amount' })
  }
}

const generateDetentions = (detention: any) => {
  if (detention == null) {
    return false
  }
  return detention.days > 0 || detention.amount_line > 0 || detention.amount_customer > 0
}

const isValidValues = (detention: any) => {
  let isValid = detention.days !== '' && detention.amount_line !== '' && detention.amount_customer !== ''
  if (
    parseFloat(detention.amount_line) > 0 &&
    parseFloat(detention.amount_line) >= parseFloat(detention.amount_customer)
  ) {
    snackbar.add({ type: 'warning', text: 'Line amount must be less than customer amount' })
    isValid = false
  }
  return isValid && parseFloat(detention.amount_line) <= parseFloat(detention.amount_customer)
}

const onClickSaveDetentions = async () => {
  try {
    if (formContainers.value.some((container: any) => !isValidValues(container))) {
      snackbar.add({ type: 'error', text: 'Invalid values' })
      return
    }
    loadingStore.loading = true
    const body = {
      detentions: formContainers.value.map((container: any) => ({
        reference_container_id: container.id,
        days: container.days,
        amount_line: container.amount_line,
        amount_customer: container.amount_customer,
        is_con_iva: container.is_con_iva,
      })),
    }
    const response = await $api.referenciasExport.saveDetentions(props.id.toString(), body)

    snackbar.add({ type: 'success', text: 'Detentions updated' })

    getSeaExportDetails()
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const getSeaExportDetails = async () => {
  try {
    loadingStore.loading = true
    const response = (await $api.referenciasExport.getReferenciaById(props.id.toString())) as any
    referencia.value = response

    formContainers.value = response.containers.map((container: any) => ({
      id: container.id,
      container: container,
      days: container.detention?.days || 0,
      amount_line: container.detention?.amount_line || 0,
      amount_customer: container.detention?.amount_customer || 0,
      is_con_iva: container.detention?.is_con_iva ?? true,
    }))
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

await getSeaExportDetails()
</script>
