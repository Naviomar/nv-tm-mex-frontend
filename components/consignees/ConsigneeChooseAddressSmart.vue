<template>
  <div>
    <v-card class="mb-4" density="compact">
      <v-card-title>
        <div class="flex justify-between">
          <h3>{{ consignee?.name }} - Choose address</h3>
          <v-btn color="red" size="small" @click="emit('close')">Close</v-btn>
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
            <tr v-for="(address, index) in consignee.addresses" :key="`consignee-${index}`">
              <td>
                <v-btn color="secondary" size="small" @click="emit('selected:address', address)">Choose</v-btn>
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
</template>
<script setup lang="ts">
const props = defineProps({
  consignee: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['close', 'selected:address'])

const fullAddress = (address: any) => {
  return `${address.street} ${address.number} - ${address.neighborhood} ${address.city} ${address.state} ${address.country?.name}, ${address.zip_code}`
}
</script>
