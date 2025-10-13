<template>
  <div>
    <v-btn @click="searchAddresses" color="primary" size="small"> Show customer addresses </v-btn>
    <div v-if="showForm" class="absolute z-50 min-w-96 overflow-y-auto">
      <v-card class="mb-4" density="compact">
        <v-card-title>
          <div class="flex justify-between">
            <h3>Choose address</h3>
            <v-btn color="red" size="small" @click="showForm = false">Close</v-btn>
          </div>
        </v-card-title>
        <v-card-text>
          <v-table density="compact">
            <thead>
              <tr>
                <th class="text-left" width="50">Actions</th>
                <th class="text-left">Address</th>
                <th class="text-left">Date added</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="addresses.length === 0">
                <td colspan="3">No addresses found</td>
              </tr>
              <tr v-for="(address, index) in addresses" :key="`consignee-${index}`">
                <td>
                  <v-btn color="secondary" size="small" @click="emits('selected:address', fullAddress(address))"
                    >Choose</v-btn
                  >
                </td>
                <td>
                  <v-chip color="yellow-darken-4" v-if="address.is_default" size="small"
                    ><v-icon>mdi-star</v-icon></v-chip
                  >
                  {{ fullAddress(address) }}
                </td>
                <td>{{ formatDateString(address.created_at) }}</td>
              </tr>
            </tbody>
          </v-table>
        </v-card-text>
      </v-card>
    </div>
  </div>
</template>
<script setup lang="ts">
const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()

const props = defineProps({
  customerId: {
    type: [String, Number],
    required: true,
  },
})

const emits = defineEmits(['selected:address'])

const addresses = ref<any>([])
const showForm = ref(false)

const fullAddress = (address: any) => {
  return `${address.street} ${address.number} - ${address.neighborhood} ${address.city} ${address.state} ${address.country?.name}, ${address.zip_code}`
}

const searchAddresses = async () => {
  try {
    if (addresses.value.length > 0) {
      showForm.value = true
      return
    }
    loadingStore.start()
    const response = (await $api.consignees.getAddresses(props.customerId.toString())) as any

    addresses.value = response

    // if no address show snackbar
    if (addresses.value.length === 0) {
      snackbar.add({ type: 'warning', text: 'No addresses found' })
    }

    showForm.value = true

    if (addresses.value.length === 1) {
      emits('selected:address', fullAddress(addresses.value[0]))
    }
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}
</script>
