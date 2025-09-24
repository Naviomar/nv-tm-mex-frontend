<script setup lang="ts">
const router = useRouter()

const goBack = () => {
  router.back()
}
</script>
<template>
  <v-container fluid>
    <v-btn color="slate" size="small" variant="outlined" to="/configuration/sea-regions" class="mb-4" @click="goBack"
      >Back to sea regions</v-btn
    >
    <v-card>
      <v-card-title>
        <h3>New sea region</h3>
      </v-card-title>
      <v-card-text>
        <SeaRegionForm />
      </v-card-text>
    </v-card>
  </v-container>
</template>
