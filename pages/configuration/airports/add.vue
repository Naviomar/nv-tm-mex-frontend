<template>
  <v-container fluid>
    <v-btn color="slate" size="small" variant="outlined" to="/configuration/airports" class="mb-4" @click="goBack"
      >Back to airports</v-btn
    >
    <v-card>
      <v-card-title>
        <h3>New airport</h3>
      </v-card-title>
      <v-card-text>
        <AirportForm />
      </v-card-text>
    </v-card>
  </v-container>
</template>
<script setup lang="ts">
const router = useRouter()

definePageMeta({
  title: 'Config Airports',
  layout: 'default',
})

const goBack = () => {
  router.back()
}
</script>
