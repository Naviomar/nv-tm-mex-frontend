<template>
  <div>
    <v-tabs v-model="tab" bg-color="blue-lighten-4" class="tabs1" fixed-tabs>
      <v-tab prepend-icon="mdi-ship-wheel" text="Maritime WM Invoices" value="inv-wm-sea"></v-tab>
      <v-tab prepend-icon="mdi-airplane" text="Air WM Invoices" value="inv-wm-air"></v-tab>
    </v-tabs>

    <v-tabs-window v-model="tab">
      <v-tabs-window-item value="inv-wm-sea">
        <v-card flat>
          <v-card-text>
            <InvoicesWmTable />
          </v-card-text>
        </v-card>
      </v-tabs-window-item>
      <v-tabs-window-item value="inv-wm-air">
        <v-card flat>
          <v-card-text>
            <InvoicesAirWmTable />
          </v-card-text>
        </v-card>
      </v-tabs-window-item>
    </v-tabs-window>
  </div>
</template>
<script setup lang="ts">
const tab = ref('inv-wm-sea')
</script>
