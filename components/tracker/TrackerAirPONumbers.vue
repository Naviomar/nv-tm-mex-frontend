<template>
  <div>
    <div v-if="hasPos">
      <v-btn color="primary" size="small" @click="viewOrders">View tracker purchase orders</v-btn>
    </div>
    <v-dialog v-model="showDialog" max-width="800px">
      <v-card>
        <v-card-title>Tracker purchase orders</v-card-title>
        <v-card-text>
          <v-table density="compact">
            <thead>
              <tr>
                <th class="text-left">PO Number</th>
                <th class="text-left">Shipper</th>
                <th class="text-left">Bultos</th>
                <th class="text-left">Weight</th>
                <th class="text-left">Volume</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(pos, index) in props.trackerPos" :key="`t-po-${index}`">
                <td>{{ pos.porder }}</td>
                <td>{{ pos.shipper }}</td>
                <td>{{ pos.bultos }}</td>
                <td>{{ pos.weight }}</td>
                <td>{{ pos.volume }}</td>
              </tr>
            </tbody>
          </v-table>
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" @click="showDialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script setup lang="ts">
const props = defineProps({
  trackerPos: {
    type: Array as any,
    required: false,
    default: [],
  },
})

const hasPos = computed(() => props.trackerPos.length > 0)

const showDialog = ref(false)

const viewOrders = () => {
  showDialog.value = true
}
</script>
