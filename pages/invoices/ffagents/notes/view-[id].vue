<template>
  <v-container fluid>
    <v-btn color="slate" size="small" variant="outlined" to="/invoices/ffagents/notes" class="mb-4" @click="goBack"
      >Back to F.F. notes</v-btn
    >

    <v-card>
      <v-card-text>
        <FfAgentInvoiceNoteDetails :id="id" />
      </v-card-text>
    </v-card>
  </v-container>
</template>
<script setup lang="ts">
const route = useRoute()
const router = useRouter()

const id = route.params.id!.toString()

const goBack = () => {
  router.push('/invoices/ffagents/notes')
}

definePageMeta({
  title: 'TM - F.F. Agent invoices notes',
  layout: 'default',
})
</script>
