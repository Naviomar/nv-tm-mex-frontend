<template>
  <v-container fluid>
    <BankMovementDetails :id="id" />
  </v-container>
</template>
<script setup lang="ts">
const route = useRoute()
const id = route.params.id!.toString()
</script>
