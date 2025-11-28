<template>
  <div>
    <v-btn color="slate" size="small" variant="outlined" to="/invoices/capture" class="mb-4"
      >Back to capture invoices</v-btn
    >
    <v-container fluid>
      <v-row>
        <v-col cols="12" md="12">
          <InvoiceTmForm />
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>
