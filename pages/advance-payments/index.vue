<template>
  <v-container fluid>
    <SupplierCfdiModuleLinks />

    <v-card>
      <v-card-title>
        <h3>Advance payments</h3>
      </v-card-title>
      <v-card-text>
        <div class="flex gap-3">
          <v-btn color="slate" size="small" variant="tonal" to="/advance-payments/add" class="mb-4"
            >Request advance payment</v-btn
          >
        </div>
        <AdvancePaymentsTable />
      </v-card-text>
    </v-card>
  </v-container>
</template>
