<template>
  <div>
    <v-container fluid>
      <v-row>
        <v-col cols="12" md="8">
          <v-card>
            <v-card-title>
              <h3>Customer invoices modules</h3>
            </v-card-title>
            <v-card-text>
              <div class="grid grid-cols-2 gap-5">
                <v-card prepend-icon="mdi-ferry">
                  <template v-slot:title>Sea import references</template>
                  <v-card-text>Search sea import references</v-card-text>
                  <v-card-actions>
                    <v-btn color="primary" to="/invoices/search/sea-import">Go to module</v-btn>
                  </v-card-actions>
                </v-card>

                <v-card prepend-icon="mdi-ferry">
                  <template v-slot:title>Sea export references</template>
                  <v-card-text>Search sea export references</v-card-text>
                  <v-card-actions>
                    <v-btn color="primary" to="/invoices/search/sea-export">Go to module</v-btn>
                  </v-card-actions>
                </v-card>

                <v-card prepend-icon="mdi-airplane">
                  <template v-slot:title>Air import references</template>
                  <v-card-text>Search air import references</v-card-text>
                  <v-card-actions>
                    <v-btn color="primary" to="/invoices/search/air-import">Go to module</v-btn>
                  </v-card-actions>
                </v-card>

                <v-card prepend-icon="mdi-airplane">
                  <template v-slot:title>Air export references</template>
                  <v-card-text>Search air export references</v-card-text>
                  <v-card-actions>
                    <v-btn color="primary" to="/invoices/search/air-export">Go to module</v-btn>
                  </v-card-actions>
                </v-card>

                <v-card prepend-icon="mdi-invoice-multiple-outline">
                  <template v-slot:title>TM Invoices</template>
                  <v-card-text>Search inside TM</v-card-text>
                  <v-card-actions>
                    <v-btn color="primary" to="/invoices/search/tm">Go to module</v-btn>
                  </v-card-actions>
                </v-card>

                <v-card prepend-icon="mdi-invoice-multiple-outline">
                  <template v-slot:title>WM Invoices</template>
                  <v-card-text> Search inside WM</v-card-text>
                  <v-card-actions>
                    <v-btn color="primary" to="/invoices/search/wm">Go to module</v-btn>
                  </v-card-actions>
                </v-card>

                <v-card prepend-icon="mdi-invoice-multiple-outline">
                  <template v-slot:title>Credit notes</template>
                  <v-card-text> Search inside notes</v-card-text>
                  <v-card-actions>
                    <v-btn color="primary" to="/invoices/search/credit-notes">Go to module</v-btn>
                  </v-card-actions>
                </v-card>

                <v-card prepend-icon="mdi-invoice-multiple-outline">
                  <template v-slot:title>Free format</template>
                  <v-card-text>
                    An invoice from any customer, supplier, customs agent, freight forwarder not linked to any
                    service.</v-card-text
                  >
                  <v-card-actions>
                    <v-btn color="primary" to="/invoices/search/free-format">Go to module</v-btn>
                  </v-card-actions>
                </v-card>

                <v-card v-if="false">
                  <v-card-title>Tickets</v-card-title>
                  <v-card-text>Search inside tickets</v-card-text>
                  <v-card-actions>
                    <v-btn color="primary" to="/invoices/search/tickets">Go to module</v-btn>
                  </v-card-actions>
                </v-card>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>
<script setup lang="ts">
const darkMode = useDarkMode()
definePageMeta({
  title: 'Invoices',
  layout: 'default',
})
</script>
