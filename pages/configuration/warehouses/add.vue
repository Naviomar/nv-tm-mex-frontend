<template>
  <v-container fluid>
    <v-btn color="slate" size="small" variant="outlined" to="/configuration/warehouses" class="mb-4" @click="goBack"
      >Back to warehouses</v-btn
    >
    <v-card>
      <v-card-title>
        <h3>New warehouse</h3>
      </v-card-title>
      <v-card-text>
        <WarehouseForm />
      </v-card-text>
    </v-card>
  </v-container>
</template>
<script setup lang="ts">
const router = useRouter()

definePageMeta({
  title: 'Config Warehouses',
  layout: 'default',
})

const goBack = () => {
  router.back()
}
</script>
