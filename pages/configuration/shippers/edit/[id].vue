<template>
  <v-container fluid>
    <v-btn color="slate" size="small" variant="outlined" to="/configuration/shippers" class="mb-4" @click="goBack"
      >Back</v-btn
    >
    <v-card>
      <v-card-title>
        <h3>Shipper (POL) / Consignee (POD outside Mexico) #{{ id }}</h3>
      </v-card-title>
      <v-card-text>
        <ShipperEditForm :id="id" />
      </v-card-text>
    </v-card>
  </v-container>
</template>
<script setup lang="ts">
const route = useRoute()
const router = useRouter()

const id = route.params.id!.toString()

const goBack = () => {
  router.back()
}
</script>
