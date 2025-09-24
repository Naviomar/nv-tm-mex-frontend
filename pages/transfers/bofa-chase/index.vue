<template>
  <div>
    <v-container fluid>
      <v-btn color="slate" size="small" variant="outlined" to="/transfers" class="mb-4">Back to transfers</v-btn>
      <v-row>
        <v-col cols="12" md="12">
          <v-card>
            <v-card-title>
              <h3>BofA & CHASE Transfers</h3>
            </v-card-title>
            <v-card-text>
              <div class="flex gap-3">
                <v-btn color="slate" size="small" variant="tonal" to="/transfers/bofa-chase/upload" class="mb-4"
                  >Load transfers</v-btn
                >
                <v-btn color="slate" size="small" variant="tonal" to="/transfers/bofa-chase/reports" class="mb-4"
                  >Reports</v-btn
                >
              </div>
              <BankBOFAMovements />
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>
