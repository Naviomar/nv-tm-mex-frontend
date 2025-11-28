<template>
  <div>
    <v-btn icon v-if="$vuetify.theme.name !== 'dark'" @click="darkMode.toggleTheme">
      <v-icon class="mr-1" color="">mdi-theme-light-dark</v-icon>
    </v-btn>
    <v-btn icon v-if="$vuetify.theme.name === 'dark'" @click="darkMode.toggleTheme">
      <v-icon color="white">mdi-theme-light-dark</v-icon>
    </v-btn>
  </div>
</template>
<script setup lang="ts">
const darkMode = useDarkMode()
</script>
