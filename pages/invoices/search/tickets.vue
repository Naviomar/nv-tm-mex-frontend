<template>
  <div>
    <v-btn color="slate" size="small" variant="outlined" text to="/invoices/search" class="mb-4"
      >Back to invoices search</v-btn
    >
    <v-container fluid>
      <v-row>
        <v-col cols="12" md="12">
          <v-card>
            <v-card-title>
              <h3>Tickets</h3>
            </v-card-title>
            <v-card-text>
              <div class="flex gap-3">
                <v-btn color="slate" size="small" variant="tonal" text to="/invoices/capture/ticket" class="mb-4"
                  >Capture ticket</v-btn
                >
              </div>
              <InvoiceTicketsTable />
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>
