<template>
  <v-container fluid>
    <v-btn color="slate" size="small" variant="outlined" class="mb-4" @click="$router.back()">Back</v-btn>
    <ContainerDetails :id="id" />
  </v-container>
</template>
<script setup lang="ts">
const route = useRoute()
const id = route.params.id.toString()
</script>
