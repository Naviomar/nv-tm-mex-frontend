<template>
  <v-container fluid>
    <v-card>
      <v-card-title>
        <h1 class="text-xl font-bold">Invoices - Freight lines</h1>
      </v-card-title>
      <v-card-text>
        <div class="grid grid-cols-2 gap-5">
          <v-card>
            <v-card-title>Freight line invoices</v-card-title>
            <v-card-text>View and capture invoices</v-card-text>
            <v-card-actions>
              <v-btn to="/invoices/lines/notes" color="primary"> Go to freight line invoices </v-btn>
            </v-card-actions>
          </v-card>

          <v-card>
            <v-card-title>Freight line demurrages & detentions</v-card-title>
            <v-card-text>View demurrages and detentions.</v-card-text>
            <v-card-actions>
              <v-btn to="/invoices/lines/demurrage-detentions" color="primary"> Go to module </v-btn>
            </v-card-actions>
          </v-card>

          <v-card>
            <v-card-title>Freight line credit notes</v-card-title>
            <v-card-text>View and capture credit notes</v-card-text>
            <v-card-actions>
              <v-btn to="/invoices/lines/credit-notes" color="primary"> Go to module </v-btn>
            </v-card-actions>
          </v-card>
        </div>
      </v-card-text>
    </v-card>
  </v-container>
</template>
<script setup lang="ts">
const darkMode = useDarkMode()
definePageMeta({
  title: 'TM - Line invoices',
  layout: 'default',
})
</script>
