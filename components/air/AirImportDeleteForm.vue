<template>
  <div>
    <v-card>
      <v-card-title>Cancel {{ serviceType }} {{ referencia?.reference_number }}</v-card-title>
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
          </tbody>
        </v-table>
        <div class="py-4">
          <v-btn color="red" :disabled="!canDelete" @click="deleteReference">
            <v-icon>mdi-delete-outline</v-icon>Cancel Ref#{{ referencia?.reference_number }}
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

const props = defineProps({
  id: {
    type: [Number, String],
    required: true,
  },
  serviceType: {
    type: String,
    required: true,
  },
})

const referencia = ref<any>({})
const loading = ref(false)
const canDelete = ref(false)
const validationChecks = ref<any[]>([])

const deleteReference = async () => {
  try {
    loadingStore.start()
    await $api.airImport.deleteReference(props.id.toString())
    snackbar.add({ type: 'success', text: 'Reference deleted successfully' })
    router.push('/air/import')
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const getDetails = async () => {
  try {
    loadingStore.start()
    const response = (await $api.airImport.getReferenceById(props.id.toString())) as any
    referencia.value = response
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
    const response = (await $api.airImport.checkDeletable(props.id.toString())) as any
    canDelete.value = response.can_delete

    const allChecks = [
      { type: 'invoices_tm', label: 'Customer invoices (TM)', count: 0 },
      { type: 'invoices_wm', label: 'Customer invoices (WM)', count: 0 },
      { type: 'ff_notes', label: 'Freight forwarder notes (Credit/Debit)', count: 0 },
      { type: 'supplier_invoices', label: 'Supplier invoices', count: 0 },
      { type: 'arrival_notys', label: 'Arrival notifications', count: 0 },
      { type: 'sent_releases', label: 'Revalidation', count: 0 },
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

await getDetails()
await checkDeletable()
</script>
