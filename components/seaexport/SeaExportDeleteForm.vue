<template>
  <div>
    <v-card>
      <v-card-title>Cancel {{ serviceType }} {{ referencia.reference_number }}</v-card-title>
      <v-card-text>
        <p class="text-base">
          In order to cancel a reference, the following requirements must be met for it to be available for deletion.
          (Phase 2)
        </p>
        <v-table density="compact">
          <thead>
            <tr>
              <th class="text-left w-10">Check</th>
              <th class="text-left">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <v-icon color="green">mdi-check</v-icon>
                <v-icon color="red">mdi-close</v-icon>
              </td>
              <td>Customer invoices</td>
            </tr>
            <tr>
              <td>
                <v-icon color="green">mdi-check</v-icon>
                <v-icon color="red">mdi-close</v-icon>
              </td>
              <td>Freight line invoices</td>
            </tr>
            <tr>
              <td>
                <v-icon color="green">mdi-check</v-icon>
                <v-icon color="red">mdi-close</v-icon>
              </td>
              <td>Supplier invoices</td>
            </tr>
          </tbody>
          <div class="py-4">
            <v-btn color="red" @click="deleteReference">
              <v-icon>mdi-delete-outline</v-icon>Cancel Ref#{{ referencia.reference_number }}
            </v-btn>
          </div>
        </v-table>
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

const deleteReference = async () => {
  try {
    loadingStore.start()
    await $api.referencias.deleteReference(props.id.toString())
    snackbar.add({ type: 'success', text: 'Reference deleted successfully' })

    router.push('/maritime/export')
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

