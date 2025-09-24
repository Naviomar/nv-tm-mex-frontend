<template>
  <v-container fluid>
    <v-btn @click="goBack" variant="outlined" size="small" class="mb-4">Back</v-btn>
    <div class="mt-0">
      <div class="text-xl">Register initial demurrages day</div>
      <div>Setting the initial date will initialize all the references and ther containers where apply.</div>
    </div>
    <div class="pt-4">
      <VoyageDestInitDemurrageDay :id="voyageDestId" />
    </div>
  </v-container>
</template>
<script setup lang="ts">
const route = useRoute()
const router = useRouter()

const voyageDestId = route.params.id!.toString()

const goBack = () => {
  router.push('/maritime/import/demurrages/register-day')
}
</script>
