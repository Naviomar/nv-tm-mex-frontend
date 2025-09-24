<template>
  <div>
    <v-tabs v-model="tab" bg-color="blue-lighten-4" class="tabs1" fixed-tabs>
      <v-tab prepend-icon="mdi-ship-wheel" text="Demurrage payment requests" value="inv-demurrages"></v-tab>
      <v-tab prepend-icon="mdi-ship-wheel" text="Detentions payment requests" value="inv-detentions"></v-tab>
    </v-tabs>

    <v-tabs-window v-model="tab">
      <v-tabs-window-item value="inv-demurrages">
        <v-card flat>
          <v-card-text>
            <RequestDemurragesTable />
          </v-card-text>
        </v-card>
      </v-tabs-window-item>
      <v-tabs-window-item value="inv-detentions">
        <v-card flat>
          <v-card-text>
            <RequestDetentionsTable />
          </v-card-text>
        </v-card>
      </v-tabs-window-item>
    </v-tabs-window>
  </div>
</template>
<script setup lang="ts">
const tab = ref('inv-demurrages')
</script>
