<template>
  <div>
    <v-container fluid>
      <v-row>
        <v-col cols="12" md="12">
          <v-card>
            <v-card-title>
              <h3>Line Payments</h3>
            </v-card-title>
            <v-card-text>
              <div class="flex gap-3">
                <v-btn color="slate" size="small" variant="tonal" to="/payments/lines/add-maritime-import" class="mb-4"
                  >Add import maritime payment</v-btn
                >
                <v-btn color="slate" size="small" variant="tonal" to="/payments/lines/add-maritime-import" class="mb-4"
                  >Add export maritime payment</v-btn
                >
              </div>
              Line payments table component
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>
<script setup lang="ts">
definePageMeta({
  title: 'Home',
  layout: 'default',
})
</script>
