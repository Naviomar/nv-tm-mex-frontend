<template>
  <v-container fluid>
    <v-btn color="slate" size="small" variant="outlined" class="mb-4" @click="$router.push('/configuration/vessels')"
      >Back to vessels</v-btn
    >
    <v-card>
      <v-card-title>
        <h3>Edit vessel</h3>
      </v-card-title>
      <v-card-text>
        <VesselEditForm />
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
