<template>
  <v-container fluid>
    <v-btn color="slate" size="small" variant="outlined" to="/configuration/customers" class="mb-4" @click="goBack"
      >Back to customers</v-btn
    >
    <v-card>
      <v-card-title>
        <h3>New customer</h3>
      </v-card-title>
      <v-card-text>
        <ConsigneeForm />
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
