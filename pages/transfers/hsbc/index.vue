<template>
  <div>
    <v-container fluid>
      <v-btn color="slate" size="small" variant="outlined" text to="/transfers" class="mb-4">Back to transfers</v-btn>
      <v-row>
        <v-col cols="12" md="12">
          <v-card>
            <v-card-title>
              <h3>HSBC Transfers</h3>
            </v-card-title>
            <v-card-text>
              <div class="flex gap-3">
                <v-btn color="slate" size="small" variant="tonal" text to="/transfers/hsbc/upload" class="mb-4"
                  >Load transfers</v-btn
                >
                <v-btn color="slate" size="small" variant="tonal" text to="/transfers/hsbc/reports" class="mb-4"
                  >Reports</v-btn
                >
              </div>
              <BankHSBCMovements />
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>
