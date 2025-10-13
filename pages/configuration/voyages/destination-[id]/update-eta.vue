<template>
  <v-container fluid>
    <v-btn color="slate" size="small" variant="outlined" class="mb-4" @click="goBack">Back</v-btn>
    <v-card>
      <v-card-title>
        <h3>Process to Update ETA</h3>
      </v-card-title>
      <v-card-subtitle> Complete the form to update the ETA of the voyage destination </v-card-subtitle>
      <v-card-text>
        <VoyageDestUpdateEtaForm />
      </v-card-text>
    </v-card>
  </v-container>
</template>
<script setup lang="ts">
const route = useRoute()
const router = useRouter()

const id = route.params.id

const goBack = () => {
  router.back()
}
</script>
