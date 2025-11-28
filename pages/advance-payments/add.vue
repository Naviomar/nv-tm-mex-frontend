<template>
  <v-container fluid>
    <v-btn color="slate" size="small" variant="outlined" to="/advance-payments" class="mb-4">Back</v-btn>
    <v-row>
      <v-col cols="12" md="12">
        <v-card>
          <v-card-title>
            <h3>Request an advance payment</h3>
          </v-card-title>
          <v-card-subtitle>Start adding at least one service to continue.</v-card-subtitle>
          <v-card-text>
            <AdvancePaymentCapture />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
