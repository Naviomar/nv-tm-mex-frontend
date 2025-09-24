<template>
  <div>
    <v-btn @click="openDialog" color="primary" size="x-small">Proof of Delivery</v-btn>
    <v-dialog v-model="form.showDialog" max-width="600">
      <v-card>
        <v-card-title>
          <span class="headline">Proof of Delivery - container #{{ containerName }}</span>
        </v-card-title>
        <v-card-text>
          <v-table density="compact">
            <thead>
              <tr>
                <th class="text-left">Attachments</th>
                <th class="text-left">Date / By</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>File</td>
                <td>2021-09-01 / John Doe</td>
              </tr>
            </tbody>
          </v-table>
          <div class="flex flex-col gap-2 py-4">
            <v-file-input label="Upload file" density="compact" multiple hide-details />
            <v-btn color="blue-darken-1">Upload</v-btn>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue-darken-1" @click="form.showDialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script setup lang="ts">
const props = defineProps({
  container: {
    type: Object as any,
    required: true,
  },
})

const containerName = ref(props.container?.container_number)

const form = reactive({
  showDialog: false,
})

const openDialog = () => {
  form.showDialog = true
}
</script>
