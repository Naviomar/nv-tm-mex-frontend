<template>
  <v-container fluid>
    <SupplierCfdiModuleLinks />
    <v-card>
      <v-card-title>
        <h3>Supplier - Request payments</h3>
      </v-card-title>
      <v-card-text>
        <div class="flex gap-3">
          <v-btn
            color="cyan"
            size="small"
            to="/invoices/suppliers/cfdis/request-payment/new"
            class="mb-4"
            >Request new payment</v-btn
          >
        </div>
        <SupplierRequestPaymentsTable />
      </v-card-text>
    </v-card>
  </v-container>
</template>
