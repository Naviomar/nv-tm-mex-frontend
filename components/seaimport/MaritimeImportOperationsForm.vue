<template>
  <div>
    <v-card>
      <v-tabs v-model="currentTab" bg-color="secondary" class="tabs1" fixed-tabs slider-color="gold" show-arrows>
        <v-tab text="Details" prepend-icon="mdi-book-open-page-variant" value="1"></v-tab>
        <v-tab text="Intermodal" prepend-icon="mdi-truck-cargo-container" value="2"> </v-tab>
        <v-tab text="Cancel" prepend-icon="mdi-delete-outline" value="3"> </v-tab>
      </v-tabs>
      <v-card-text>
        <v-window v-model="currentTab">
          <v-window-item value="1">
            <MaritimeImportEditForm :id="props.id.toString()" />
          </v-window-item>
          <v-window-item value="2">
            <SeaImportIntermodalForm :id="props.id" />
          </v-window-item>
          <v-window-item value="3">
            <SeaImportDeleteForm :id="props.id" serviceType="sea-import" />
          </v-window-item>
        </v-window>
      </v-card-text>
    </v-card>
  </div>
</template>
<script setup lang="ts">
const props = defineProps({
  id: {
    type: Number,
    required: true,
  },
})

const currentTab = ref('1')
</script>
