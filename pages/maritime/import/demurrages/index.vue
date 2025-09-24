<template>
  <v-container fluid>
    <v-btn @click="$router.back()" variant="outlined" size="small" class="mb-4">Back</v-btn>
    <v-card class="mb-4" color="">
      <v-card-title> Demurrage options </v-card-title>
      <v-card-text>
        <div class="flex gap-4">
          <v-btn v-if="false" color="primary" to="/maritime/import/demurrages/register-day"
            >Register day to vessel</v-btn
          >
          <div class="flex gap-2 flex-wrap">
            <v-btn color="primary" size="small" to="/maritime/import/demurrages/search">Search import references</v-btn>
            <v-btn color="green" size="small" to="/invoices/lines/demurrage-detentions">
              Demurrage & Detentions request payments</v-btn
            >
            <v-btn color="purple" size="small" to="/invoices/suppliers/cfdis/create">
              <v-icon>mdi-plus</v-icon> Add new supplier CFDI</v-btn
            >

            <v-btn color="lime" size="small" to="/maritime/import/demurrages/reports">
              <v-icon>mdi-chart-bell-curve</v-icon> Demurrage Reports</v-btn
            >
          </div>
        </div>
      </v-card-text>
    </v-card>

    <v-card v-if="false" class="mb-4" color="yellow1">
      <v-card-title> Reports </v-card-title>
      <v-card-text>
        <div class="flex gap-4">
          <v-btn color="primary" to="/maritime/import/demurrages/reports/general">Demurrages report</v-btn>
          <v-btn color="primary" to="/maritime/import/demurrages/reports/status">Demurrages status</v-btn>
          <v-btn color="primary" to="/maritime/import/demurrages/reports/control">Demurrages control</v-btn>
        </div>
      </v-card-text>
    </v-card>
  </v-container>
</template>
