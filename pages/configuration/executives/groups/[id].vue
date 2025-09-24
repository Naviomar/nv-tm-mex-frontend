<template>
  <v-container fluid>
    <v-btn
      color="slate"
      size="small"
      variant="outlined"
      to="/configuration/executives/groups"
      class="mb-4"
      @click="goBack"
      >Back to executive groups</v-btn
    >
    <v-card>
      <v-card-title>
        <h3>Executives in Group #{{ id }}</h3>
      </v-card-title>
      <v-card-text>
        <ExecutivesInGroupTable />
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
