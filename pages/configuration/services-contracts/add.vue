<template>
  <v-container fluid>
    <v-btn
      color="slate"
      size="small"
      variant="outlined"
      to="/configuration/services-contracts"
      class="mb-4"
      @click="goBack"
      >Back to services contracts</v-btn
    >
    <v-card>
      <v-card-title>
        <h3>New service contract</h3>
      </v-card-title>
      <v-card-text>
        <ServiceContractForm />
      </v-card-text>
    </v-card>
  </v-container>
</template>
<script setup lang="ts">
const router = useRouter()

const goBack = () => {
  router.back()
}
</script>
