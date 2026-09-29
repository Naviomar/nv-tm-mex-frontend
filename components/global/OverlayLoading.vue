<template>
  <div>
    <ClientOnly>
      <v-overlay
        v-if="loadingStore.loading"
        :model-value="true"
        :persistent="true"
        :transition="false"
        class="align-center justify-center"
      >
        <v-progress-circular color="primary" indeterminate size="64"></v-progress-circular>
      </v-overlay>
    </ClientOnly>
  </div>
</template>
<script setup type="ts">
// El overlay se monta/desmonta con v-if y sin transición: alternar solo
// model-value en ráfaga (start/stop concurrentes o con setTimeout) puede
// interrumpir la transición de salida de Vuetify y dejar el spinner
// huérfano en el v-overlay-container aunque el overlay ya esté inactivo.
const loadingStore = useLoadingStore()
</script>
