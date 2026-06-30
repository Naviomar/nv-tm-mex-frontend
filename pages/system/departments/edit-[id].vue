<template>
  <v-container fluid>
    <div class="mb-4">
      <v-btn color="slate" size="small" variant="tonal" prepend-icon="mdi-arrow-left" class="mb-4" @click="goBack">Back</v-btn>
      <div class="d-flex align-center gap-3">
        <v-avatar color="primary" size="48" rounded="lg">
          <v-icon size="26" color="white">mdi-office-building-cog</v-icon>
        </v-avatar>
        <div>
          <div class="text-h5 font-weight-bold">Edit department</div>
          <div class="text-caption text-grey-darken-1">Department #{{ id }}</div>
        </div>
      </div>
    </div>
    <DepartmentForm :id="id" />
  </v-container>
</template>
<script setup lang="ts">
const route = useRoute()
const router = useRouter()

const id = route.params.id!.toString()

const goBack = () => {
  router.back()
}
</script>
