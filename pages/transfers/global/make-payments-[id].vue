<template>
  <v-container fluid>
    <v-btn @click="router.back()" variant="outlined" size="small" class="mb-4">Back</v-btn>
    <BankMovementPaymentsSmart :id="id" />
  </v-container>
</template>
<script setup lang="ts">
const route = useRoute()
const router = useRouter()

const id = route.params.id!.toString()
</script>