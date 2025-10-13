<template>
  <v-container fluid>
    <v-btn color="slate" size="small" variant="outlined" to="/refunds" class="mb-4">Back to refunds</v-btn>
    <v-row>
      <v-col cols="12" md="12">
        <v-card>
          <v-card-title>
            <h3>Request a refund</h3>
          </v-card-title>
          <v-card-subtitle>Start adding at least one reference to continue.</v-card-subtitle>
          <v-card-text>
            <RefundCapture />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
