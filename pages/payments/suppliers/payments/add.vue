<template>
  <div>
    <v-container fluid>
      <v-btn color="slate" size="small" variant="outlined" to="/payments/suppliers/payments" class="mb-4"
        >Back to supplier payments</v-btn
      >
      <v-row>
        <v-col cols="12" md="12">
          <v-card>
            <v-card-title>
              <h3>Capture supplier payment</h3>
            </v-card-title>
            <v-card-text>
              <CaptureSupplierPaymentForm />
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>
