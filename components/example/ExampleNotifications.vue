<template>
  <div>
    <v-btn color="red-darken-2" @click="snackbar = true"> Show notification </v-btn>

    <v-snackbar v-model="snackbar" color="blue-grey-darken-4" elevation="24" location="top">
      Mensaje de prueba

      <template v-slot:actions>
        <v-btn color="red" variant="text" @click="snackbar = false"> Close </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'

const snackbar = ref(false)
</script>
