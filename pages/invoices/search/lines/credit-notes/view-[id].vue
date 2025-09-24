<template>
  <div>
    <!-- TODO parece que esta vista nose usa pero tiene pago de line credit notes -->
    <v-btn color="slate" size="small" variant="outlined" class="mb-4" @click="$router.back()">Back</v-btn>
    <LineCreditNoteDetails :id="id" />
  </div>
</template>
<script setup lang="ts">
const route = useRoute()

const id = route.params.id.toString()
</script>
