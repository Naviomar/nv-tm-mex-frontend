<template>
  <div>
    <v-card>
      <v-tabs v-model="currentTab" bg-color="secondary" fixed-tabs slider-color="gold" show-arrows>
        <v-tab text="Details" prepend-icon="mdi-book-open-page-variant" value="1"></v-tab>
        <v-tab text="Print Master" prepend-icon="mdi-printer-pos-outline" value="2"> </v-tab>
        <v-tab text="Print House" prepend-icon="mdi-printer-pos-outline" value="3"> </v-tab>
      </v-tabs>
      <v-card-text>
        <v-window v-model="currentTab">
          <v-window-item value="1">
            <AirExportEditForm :id="props.id" />
          </v-window-item>
          <v-window-item value="2">
            <AirExportPrintMasterAWB :id="props.id" />
          </v-window-item>
          <v-window-item value="3">
            <AirExportPrintHouseAwbTab v-if="currentTab === '3'" :id="props.id" />
          </v-window-item>
        </v-window>
      </v-card-text>
    </v-card>
  </div>
</template>
<script setup lang="ts">
const props = defineProps({
  id: {
    type: String,
    required: true,
  },
})

const currentTab = ref('1')
</script>
