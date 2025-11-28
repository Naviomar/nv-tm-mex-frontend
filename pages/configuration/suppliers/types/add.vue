<template>
  <v-container fluid>
    <v-btn color="slate" size="small" variant="outlined" to="/configuration/suppliers/types" class="mb-4">Back</v-btn>
    <v-card>
      <v-card-title>
        <h3>New supplier type</h3>
      </v-card-title>
      <v-card-text>
        <SupplierTypeForm />
      </v-card-text>
    </v-card>
  </v-container>
</template>
<script setup lang="ts">
const router = useRouter()
</script>
