<template>
  <v-container fluid>
    <v-btn color="slate" size="small" variant="outlined" class="mb-4" @click="goBack">Back</v-btn>
    <v-card>
      <v-card-title>
        <h3>New country</h3>
      </v-card-title>
      <v-card-text>
        <CountryForm />
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
