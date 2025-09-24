<template>
  <div>
    <v-app class="rounded-md">
      <v-main>
        <div class=""><slot></slot></div>
      </v-main>

      <v-footer name="footer" app class="bg-primary"> @ {{ year }} </v-footer>
      <SnackbarApiErrors />
      <OverlayLoading />
    </v-app>
  </div>
</template>
<script lang="ts" setup>
const config = useRuntimeConfig()
const year = new Date().getFullYear()
</script>
