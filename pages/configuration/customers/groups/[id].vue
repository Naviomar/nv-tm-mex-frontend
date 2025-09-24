<template>
  <v-container fluid>
    <v-btn
      color="slate"
      size="small"
      variant="outlined"
      to="/configuration/customers/groups"
      class="mb-4"
      @click="goBack"
      >Back to customer groups</v-btn
    >
    <v-card>
      <v-card-text>
        <ConsigneesInGroupTable />
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

definePageMeta({
  title: 'Customer groups #{{ id }}',
  layout: 'default',
})
</script>
