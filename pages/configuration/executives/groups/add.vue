<template>
  <v-container fluid>
    <v-btn
      color="slate"
      size="small"
      variant="outlined"
      to="/configuration/executives/groups"
      class="mb-4"
      @click="goBack"
      >Back to groups</v-btn
    >
    <v-card>
      <v-card-title>
        <h3>New group name</h3>
      </v-card-title>
      <v-card-text>
        <ExecutiveGroupForm />
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
