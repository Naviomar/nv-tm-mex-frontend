<template>
  <div>
    <v-app class="rounded-md">
      <v-system-bar>
        <v-spacer></v-spacer>

        <v-icon>mdi-information-slab-circle-outline</v-icon>

        <div class="ml-1">1.0.0</div>
      </v-system-bar>
      <v-app-bar class="bg-indigo-darken-1">
        <v-app-bar-title>{{ appName }}</v-app-bar-title>
        <v-spacer></v-spacer>
      </v-app-bar>

      <v-main>
        <div class="mt-4"><slot></slot></div>
      </v-main>

      <v-footer name="footer" app class="bg-indigo-lighten-1"> @ {{ year }} </v-footer>
      <SnackbarApiErrors />
      <OverlayLoading />
    </v-app>
  </div>
</template>
<script lang="ts" setup>
const config = useRuntimeConfig()

const appName = computed(() => config.public.appName)

const year = new Date().getFullYear()
</script>
