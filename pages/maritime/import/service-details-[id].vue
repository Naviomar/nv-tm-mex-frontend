<template>
  <v-container fluid>
    <v-btn color="slate" size="small" variant="outlined" @click="goBack"> <v-icon>mdi-arrow-left</v-icon> Back </v-btn>
    <v-card>
      <v-card-text>
        <SeaImportViewDetails :id="id" />
      </v-card-text>
    </v-card>
  </v-container>
</template>
<script setup lang="ts">
const route = useRoute()
const router = useRouter()

const id = route.params.id!.toString()

definePageMeta({
  title: `View Maritime Reference #`,
  layout: 'default',
})

const goBack = () => {
  router.go(-1)
}
</script>
