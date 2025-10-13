<template>
  <div>
    <v-container fluid>
      <v-row>
        <v-col cols="12" md="12">
          <v-card variant="flat">
            <v-card-title>
              <h3>Supplier Invoices</h3>
            </v-card-title>
            <v-card-text>
              <div class="flex gap-3">
                <v-btn color="slate" size="small" to="/payments/suppliers/invoices/add" class="mb-4"
                  >Capture invoice</v-btn
                >
                <v-btn color="slate" size="small" to="/payments/suppliers/invoices/request-payments" class="mb-4"
                  >Solicitud de pago (masivo)</v-btn
                >
              </div>
              <SupplierInvoicesTable />
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>
