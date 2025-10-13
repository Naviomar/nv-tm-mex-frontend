<template>
  <v-container fluid>
    <v-btn color="slate" size="small" variant="outlined" class="mb-4" @click="goBack">Back to voyages</v-btn>
    <h1 class="text-xl font-bold">New voyage</h1>
    <v-card>
      <v-card-title>
        <h2 class="text-xl font-bold">Add voyage for import or export and add at least one origin/destination.</h2>
      </v-card-title>
      <v-card-text>
        <VoyageForm />
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
