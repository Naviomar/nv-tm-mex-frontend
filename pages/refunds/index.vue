<template>
  <v-container fluid>
    <v-card>
      <v-card-title>
        <h3>Refunds</h3>
      </v-card-title>
      <v-card-text>
        <div class="flex gap-3">
          <v-btn color="slate" size="small" variant="tonal" to="/refunds/add" class="mb-4">Request refund</v-btn>
        </div>
        <RefundsTable />
      </v-card-text>
    </v-card>
  </v-container>
</template>
