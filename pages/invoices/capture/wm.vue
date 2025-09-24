<template>
  <div>
    <v-btn color="slate" size="small" variant="outlined" text to="/invoices/capture" class="mb-4"
      >Back to capture invoices</v-btn
    >
    <v-container fluid>
      <v-row>
        <v-col cols="12" md="12">
          <InvoiceWmForm />
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>
