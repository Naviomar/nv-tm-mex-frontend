<template>
  <div>
    <v-btn-toggle v-model="tab" mandatory density="comfortable" variant="outlined" color="primary" divided class="mb-4">
      <v-btn value="inv-demurrages" size="small">
        <v-icon start size="14">mdi-ship-wheel</v-icon>Demurrage payment requests
      </v-btn>
      <v-btn value="inv-detentions" size="small">
        <v-icon start size="14">mdi-ship-wheel</v-icon>Detentions payment requests
      </v-btn>
    </v-btn-toggle>

    <v-window v-model="tab">
      <v-window-item value="inv-demurrages">
        <RequestDemurragesTable />
      </v-window-item>
      <v-window-item value="inv-detentions">
        <RequestDetentionsTable />
      </v-window-item>
    </v-window>
  </div>
</template>
<script setup lang="ts">
const route = useRoute()
const router = useRouter()

const tab = ref(route.query.tab === 'inv-detentions' ? 'inv-detentions' : 'inv-demurrages')

watch(tab, (value) => {
  router.replace({ query: { ...route.query, tab: value } })
})
</script>
