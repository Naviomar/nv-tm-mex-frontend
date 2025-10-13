<template>
  <div>
    <v-tabs v-model="tab" bg-color="blue-lighten-4" class="tabs1" fixed-tabs>
      <v-tab prepend-icon="mdi-ship-wheel" text="Maritime TM Invoices" value="inv-tm-sea"></v-tab>
      <v-tab prepend-icon="mdi-airplane" text="Air TM Invoices" value="inv-tm-air"></v-tab>
    </v-tabs>

    <v-tabs-window v-model="tab">
      <v-tabs-window-item value="inv-tm-sea">
        <v-card flat>
          <v-card-text>
            <InvoicesTmTable />
          </v-card-text>
        </v-card>
      </v-tabs-window-item>
      <v-tabs-window-item value="inv-tm-air">
        <v-card flat>
          <v-card-text>
            <InvoicesAirTmTable />
          </v-card-text>
        </v-card>
      </v-tabs-window-item>
    </v-tabs-window>
  </div>
</template>
<script setup lang="ts">
const tab = ref('inv-tm-sea')
</script>
