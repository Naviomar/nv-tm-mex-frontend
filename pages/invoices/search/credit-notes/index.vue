<template>
  <v-container fluid>
    <v-btn color="slate" size="small" variant="outlined" to="/invoices/search" class="mb-4"
      >Back to invoices search</v-btn
    >

    <v-row>
      <v-col cols="12" md="12">
        <v-card>
          <v-card-title>
            <h3>Customer - Credit notes</h3>
          </v-card-title>
          <v-card-text>
            <div class="flex gap-3">
              <v-btn
                color="slate"
                size="small"
                variant="tonal"
                to="/invoices/capture/consignee/credit-note"
                class="mb-4"
                >Capture Credit note</v-btn
              >
            </div>
            <ConsigneeCreditNotesTable />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
