<template>
  <div>
    <ClientOnly>
      <v-overlay
        v-if="hasLoading"
        :model-value="loadingStore.loading"
        :persistent="true"
        class="align-center justify-center"
      >
        <v-progress-circular color="primary" indeterminate size="64"></v-progress-circular>
      </v-overlay>
    </ClientOnly>
  </div>
</template>
<script setup type="ts">
const loadingStore = useLoadingStore()

const hasLoading = computed(() => loadingStore.loading != null)
</script>
