<template>
  <div>
    <v-btn color="slate" size="small" variant="outlined" to="/invoices/search/wm" class="mb-4"
      >Back to WM invoices</v-btn
    >
    <v-container fluid>
      <v-row>
        <v-col cols="12" md="12">
          <v-card>
            <v-card-title>
              <h3>SOA - WM Invoices report</h3>
            </v-card-title>
            <v-card-text>
              <SoaWmInvoicesReport />
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>
