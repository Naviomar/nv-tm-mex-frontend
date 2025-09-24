<template>
  <v-container fluid>
    <v-btn @click="router.back()" variant="outlined" size="small" class="mb-4">Back</v-btn>
    <div class="mt-0">
      <div class="text-xl">Maritime import Reference - Demurrages</div>
      <div>Here you can view demurrages if available and calculate demurrage days.</div>
    </div>
    <div class="pt-4">
      <DemurragesSeaImportCalc :id="referenciaId" />
    </div>
  </v-container>
</template>
<script setup lang="ts">
const route = useRoute()
const router = useRouter()

const referenciaId = route.params.id!.toString()
</script>
