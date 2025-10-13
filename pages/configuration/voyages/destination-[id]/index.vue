<template>
  <v-container fluid>
    <v-btn color="slate" size="small" variant="outlined" to="/configuration/voyages" class="mb-4"
      >Back to voyages</v-btn
    >
    <v-card>
      <v-card-title>
        <h3>Voyage details #{{ id }}</h3>
      </v-card-title>
      <v-card-text>
        <VoyageDestEditForm />
      </v-card-text>
    </v-card>
  </v-container>
</template>
<script setup lang="ts">
const route = useRoute()
const router = useRouter()

const id = route.params.id
</script>
