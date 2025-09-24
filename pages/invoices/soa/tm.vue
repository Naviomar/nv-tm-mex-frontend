<template>
  <div>
    <v-btn color="slate" size="small" variant="outlined" to="/invoices/search/tm" class="mb-4"
      >Back to TM invoices</v-btn
    >
    <v-container fluid>
      <v-row>
        <v-col cols="12" md="12">
          <v-card>
            <v-card-title>
              <h3>SOA - TM Invoices report</h3>
            </v-card-title>
            <v-card-text>
              <SoaTmInvoicesReport />
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>
