<template>
  <v-container fluid>
    <v-btn color="slate" size="small" variant="outlined" to="/configuration/suppliers" class="mb-4"
      >Back to suppliers</v-btn
    >
    <v-card>
      <v-card-title>
        <h3>New supplier</h3>
      </v-card-title>
      <v-card-text>
        <SupplierForm />
      </v-card-text>
    </v-card>
  </v-container>
</template>
<script setup lang="ts">
const router = useRouter()
</script>
