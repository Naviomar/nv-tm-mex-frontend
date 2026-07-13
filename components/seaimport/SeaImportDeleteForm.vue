<template>
  <div>
    <v-card>
      <v-card-title>Cancel {{ serviceType }} {{ serviceNumber }}</v-card-title>
      <v-card-text>
        <p class="text-base">
          In order to cancel a reference, the following requirements must be met for it to be available for deletion.
        </p>
        <div v-if="loading" class="flex justify-center py-4">
          <v-progress-circular indeterminate color="primary" />
        </div>
        <v-table v-else density="compact">
          <thead>
            <tr>
              <th class="text-left w-10">Check</th>
              <th class="text-left">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="check in validationChecks" :key="check.type">
              <td>
                <v-icon v-if="check.count === 0" color="green">mdi-check</v-icon>
                <v-icon v-else color="red">mdi-close</v-icon>
              </td>
              <td>{{ check.label }} <span v-if="check.count > 0" class="text-red font-bold">({{ check.count }})</span></td>
            </tr>
            <tr>
              <td>
                  
                  
              </td>
              <td>
                <v-textarea
                    v-model="form.reason"
                    name="reason"
                    label="Reason"
                    rows="5"
                    auto-grow
                  />
              </td>
            </tr>
          </tbody>
        </v-table>
        <div class="py-4">
          <v-btn color="red" :disabled="!canDelete" @click="deleteReference">
            <v-icon>mdi-delete-outline</v-icon>Cancel Ref#{{ serviceNumber }}
          </v-btn>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>
<script setup lang="ts">
const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()
const router = useRouter()

const form = ref<any>({
  reason: null as string | null,
})

const props = defineProps({
  id: {
    type: Number,
    required: true,
  },
  serviceType: {
    type: String,
    required: true,
  },
})

const referencia = ref<any>({})
const serviceNumber = computed(() => referencia.value?.reference_number)
const loading = ref(false)
const canDelete = ref(false)
const validationChecks = ref<any[]>([])

const deleteReference = async () => {   
  try {
    loadingStore.start()
    await $api.referencias.deleteReference(props.id.toString(), { body: { reason: form.value.reason, } })
    snackbar.add({ type: 'success', text: 'Reference deleted successfully' })

    router.push('/maritime/import')
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const getSeaImportDetails = async () => {
  try {
    loadingStore.start()
    const response = (await $api.referencias.getSeaImportIntermodalById(props.id.toString())) as any

    referencia.value = response.referencia
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const checkDeletable = async () => {
  try {
    loading.value = true
    const response = (await $api.referencias.checkDeletableSeaImport(props.id.toString())) as any
    canDelete.value = response.can_delete

    const allChecks = [
      { type: 'demurrages', label: 'Demurrages', count: 0 },
      { type: 'proformas_tm', label: 'Proformas TM', count: 0 },
      { type: 'proformas_wm', label: 'Proformas WM', count: 0 },
      { type: 'invoices_tm', label: 'Customer invoices (TM)', count: 0 },
      { type: 'invoices_wm', label: 'Customer invoices (WM)', count: 0 },
      { type: 'ff_notes', label: 'Freight forwarder notes (Credit/Debit)', count: 0 },
      { type: 'supplier_invoices', label: 'Supplier invoices', count: 0 },
      { type: 'line_invoice_refs', label: 'Freight line invoices', count: 0 },
      { type: 'arrival_notys', label: 'Arrival notifications', count: 0 },
      { type: 'revalidation', label: 'Revalidation', count: 0 },
    ]

    for (const check of allChecks) {
      const blocking = response.blocking_items?.find((b: any) => b.type === check.type)
      if (blocking) {
        check.count = blocking.count
      }
    }

    validationChecks.value = allChecks
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

await getSeaImportDetails()
await checkDeletable()
</script>
