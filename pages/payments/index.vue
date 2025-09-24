<template>
  <div>
    <v-container fluid>
      <v-row>
        <v-col cols="12" md="12">
          <v-card>
            <v-card-title>
              <h3>Payments</h3>
            </v-card-title>
            <v-card-text>
              <div class="flex gap-3">
                <v-btn color="slate" size="small" variant="tonal" to="/payments/add" class="mb-4"
                  >Capture payment</v-btn
                >
              </div>
              <PaymentsTable />
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>
