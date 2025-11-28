<template>
  <v-container fluid>
    <div>
      <div class="flex items-center justify-between w-full">
        <div class="text-xl">Vessels configuration</div>
      </div>
    </div>
    <div class="pt-4">
      <v-tabs v-model="tab" bg-color="secondary" class="tabs1" fixed-tabs>
        <v-tab
          prepend-icon="mdi-ferry"
          active-class="bg-contrast-secondary"
          text="Freight line vessels"
          value="tab1"
        ></v-tab>
        <v-tab
          prepend-icon="mdi-text-long"
          active-class="bg-contrast-secondary"
          text="Vessel names"
          value="tab2"
        ></v-tab>
      </v-tabs>

      <v-tabs-window v-model="tab">
        <v-tabs-window-item value="tab1">
          <div class="py-4 px-1">
            <VesselsTable />
          </div>
        </v-tabs-window-item>
        <v-tabs-window-item value="tab2">
          <div class="py-4 px-1">
            <VesselNamesTable />
          </div>
        </v-tabs-window-item>
      </v-tabs-window>
    </div>
  </v-container>
</template>
<script setup lang="ts">
definePageMeta({
  title: 'Home',
  layout: 'default',
})

const tab = ref('tab1')
</script>
