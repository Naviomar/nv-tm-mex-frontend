<template>
  <div class="m-4">
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 font-weight-bold mb-6">Usage Statistics</h1>
      </v-col>
    </v-row>

    <!-- Date Range Filter -->
    <v-row class="mb-6">
      <v-col cols="12" md="4">
        <v-text-field
          v-model="filters.startDate"
          type="date"
          label="Start Date"
          outlined
          dense
          hide-details
        ></v-text-field>
      </v-col>
      <v-col cols="12" md="4">
        <v-text-field
          v-model="filters.endDate"
          type="date"
          label="End Date"
          outlined
          dense
          hide-details
        ></v-text-field>
      </v-col>
      <v-col cols="12" md="4">
        <v-btn
          color="primary"
          @click="fetchStatistics"
          :loading="loading"
          block
        >
          <v-icon left>mdi-refresh</v-icon>
          Refresh
        </v-btn>
      </v-col>
    </v-row>

    <!-- References Statistics -->
    <!-- Daily Statistics -->
    <v-row class="mb-8">
      <v-col cols="12">
        <h2 class="text-h5 font-weight-bold mb-4">Daily Statistics</h2>
      </v-col>
      
      <!-- Maritime Import References -->
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title class="pb-2 d-flex justify-space-between align-center">
            <span class="text-h6">Maritime Import References</span>
            <v-btn
              size="small"
              variant="outlined"
              color="primary"
              @click="copyToExcel(getMaritimeImportData(), [{ title: 'Date', key: 'date' }, { title: 'Count', key: 'count' }], 'Maritime Import References')"
            >
              <v-icon left>mdi-content-copy</v-icon>
              Copy
            </v-btn>
          </v-card-title>
          <v-card-text>
            <v-data-table
              :headers="[{ title: 'Date', key: 'date' }, { title: 'Count', key: 'count' }]"
              :items="getMaritimeImportData()"
              :items-per-page="-1"
              class="elevation-1"
              density="compact"
              height="400"
              fixed-header
            >
              <template v-slot:item.date="{ item }">
                {{ formatDate(item.date) }}
              </template>
              <template v-slot:item.count="{ item }">
                <span class="text-blue-darken-1 font-weight-bold">{{ item.count || 0 }}</span>
              </template>
            </v-data-table>
            <!-- Total Row -->
            <v-divider></v-divider>
            <v-row class="pa-4 bg-grey-lighten-3">
              <v-col cols="6" class="font-weight-bold">TOTAL</v-col>
              <v-col cols="6" class="text-blue-darken-1 font-weight-bold">
                {{ getMaritimeImportData().reduce((sum, item) => sum + (item.count || 0), 0) }}
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Maritime Export References -->
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title class="pb-2 d-flex justify-space-between align-center">
            <span class="text-h6">Maritime Export References</span>
            <v-btn
              size="small"
              variant="outlined"
              color="primary"
              @click="copyToExcel(getMaritimeExportData(), [{ title: 'Date', key: 'date' }, { title: 'Count', key: 'count' }], 'Maritime Export References')"
            >
              <v-icon left>mdi-content-copy</v-icon>
              Copy
            </v-btn>
          </v-card-title>
          <v-card-text>
            <v-data-table
              :headers="[{ title: 'Date', key: 'date' }, { title: 'Count', key: 'count' }]"
              :items="getMaritimeExportData()"
              :items-per-page="-1"
              class="elevation-1"
              density="compact"
              height="400"
              fixed-header
            >
              <template v-slot:item.date="{ item }">
                {{ formatDate(item.date) }}
              </template>
              <template v-slot:item.count="{ item }">
                <span class="text-green-darken-1 font-weight-bold">{{ item.count || 0 }}</span>
              </template>
            </v-data-table>
            <!-- Total Row -->
            <v-divider></v-divider>
            <v-row class="pa-4 bg-grey-lighten-3">
              <v-col cols="6" class="font-weight-bold">TOTAL</v-col>
              <v-col cols="6" class="text-green-darken-1 font-weight-bold">
                {{ getMaritimeExportData().reduce((sum, item) => sum + (item.count || 0), 0) }}
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Air Import References -->
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title class="pb-2 d-flex justify-space-between align-center">
            <span class="text-h6">Air Import References</span>
            <v-btn
              size="small"
              variant="outlined"
              color="primary"
              @click="copyToExcel(getAirImportData(), [{ title: 'Date', key: 'date' }, { title: 'Count', key: 'count' }], 'Air Import References')"
            >
              <v-icon left>mdi-content-copy</v-icon>
              Copy
            </v-btn>
          </v-card-title>
          <v-card-text>
            <v-data-table
              :headers="[{ title: 'Date', key: 'date' }, { title: 'Count', key: 'count' }]"
              :items="getAirImportData()"
              :items-per-page="-1"
              class="elevation-1"
              density="compact"
              height="400"
              fixed-header
            >
              <template v-slot:item.date="{ item }">
                {{ formatDate(item.date) }}
              </template>
              <template v-slot:item.count="{ item }">
                <span class="text-blue-darken-1 font-weight-bold">{{ item.count || 0 }}</span>
              </template>
            </v-data-table>
            <!-- Total Row -->
            <v-divider></v-divider>
            <v-row class="pa-4 bg-grey-lighten-3">
              <v-col cols="6" class="font-weight-bold">TOTAL</v-col>
              <v-col cols="6" class="text-blue-darken-1 font-weight-bold">
                {{ getAirImportData().reduce((sum, item) => sum + (item.count || 0), 0) }}
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Air Export References -->
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title class="pb-2 d-flex justify-space-between align-center">
            <span class="text-h6">Air Export References</span>
            <v-btn
              size="small"
              variant="outlined"
              color="primary"
              @click="copyToExcel(getAirExportData(), [{ title: 'Date', key: 'date' }, { title: 'Count', key: 'count' }], 'Air Export References')"
            >
              <v-icon left>mdi-content-copy</v-icon>
              Copy
            </v-btn>
          </v-card-title>
          <v-card-text>
            <v-data-table
              :headers="[{ title: 'Date', key: 'date' }, { title: 'Count', key: 'count' }]"
              :items="getAirExportData()"
              :items-per-page="-1"
              class="elevation-1"
              density="compact"
              height="400"
              fixed-header
            >
              <template v-slot:item.date="{ item }">
                {{ formatDate(item.date) }}
              </template>
              <template v-slot:item.count="{ item }">
                <span class="text-green-darken-1 font-weight-bold">{{ item.count || 0 }}</span>
              </template>
            </v-data-table>
            <!-- Total Row -->
            <v-divider></v-divider>
            <v-row class="pa-4 bg-grey-lighten-3">
              <v-col cols="6" class="font-weight-bold">TOTAL</v-col>
              <v-col cols="6" class="text-green-darken-1 font-weight-bold">
                {{ getAirExportData().reduce((sum, item) => sum + (item.count || 0), 0) }}
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Daily Statistics -->
    <v-row class="mb-8">
      <v-col cols="12">
        <h2 class="text-h5 font-weight-bold mb-4">Daily Statistics</h2>
      </v-col>
      
      <!-- Maritime Import Charges -->
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title class="pb-2 d-flex justify-space-between align-center">
            <span class="text-h6">Maritime Import Charges</span>
            <v-btn
              size="small"
              variant="outlined"
              color="primary"
              @click="copyToExcel(getMaritimeImportChargesData(), [{ title: 'Date', key: 'date' }, { title: 'Count', key: 'count' }], 'Maritime Import Charges')"
            >
              <v-icon left>mdi-content-copy</v-icon>
              Copy
            </v-btn>
          </v-card-title>
          <v-card-text>
            <v-data-table
              :headers="[{ title: 'Date', key: 'date' }, { title: 'Count', key: 'count' }]"
              :items="getMaritimeImportChargesData()"
              :items-per-page="-1"
              class="elevation-1"
              density="compact"
              height="400"
              fixed-header
            >
              <template v-slot:item.date="{ item }">
                {{ formatDate(item.date) }}
              </template>
              <template v-slot:item.count="{ item }">
                <span class="text-blue-darken-1 font-weight-bold">{{ item.count || 0 }}</span>
              </template>
            </v-data-table>
            <!-- Total Row -->
            <v-divider></v-divider>
            <v-row class="pa-4 bg-grey-lighten-3">
              <v-col cols="6" class="font-weight-bold">TOTAL</v-col>
              <v-col cols="6" class="text-blue-darken-1 font-weight-bold">
                {{ getMaritimeImportChargesData().reduce((sum, item) => sum + (item.count || 0), 0) }}
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Maritime Export Charges -->
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title class="pb-2 d-flex justify-space-between align-center">
            <span class="text-h6">Maritime Export Charges</span>
            <v-btn
              size="small"
              variant="outlined"
              color="primary"
              @click="copyToExcel(getMaritimeExportChargesData(), [{ title: 'Date', key: 'date' }, { title: 'Count', key: 'count' }], 'Maritime Export Charges')"
            >
              <v-icon left>mdi-content-copy</v-icon>
              Copy
            </v-btn>
          </v-card-title>
          <v-card-text>
            <v-data-table
              :headers="[{ title: 'Date', key: 'date' }, { title: 'Count', key: 'count' }]"
              :items="getMaritimeExportChargesData()"
              :items-per-page="-1"
              class="elevation-1"
              density="compact"
              height="400"
              fixed-header
            >
              <template v-slot:item.date="{ item }">
                {{ formatDate(item.date) }}
              </template>
              <template v-slot:item.count="{ item }">
                <span class="text-green-darken-1 font-weight-bold">{{ item.count || 0 }}</span>
              </template>
            </v-data-table>
            <!-- Total Row -->
            <v-divider></v-divider>
            <v-row class="pa-4 bg-grey-lighten-3">
              <v-col cols="6" class="font-weight-bold">TOTAL</v-col>
              <v-col cols="6" class="text-green-darken-1 font-weight-bold">
                {{ getMaritimeExportChargesData().reduce((sum, item) => sum + (item.count || 0), 0) }}
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Air Import Charges -->
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title class="pb-2 d-flex justify-space-between align-center">
            <span class="text-h6">Air Import Charges</span>
            <v-btn
              size="small"
              variant="outlined"
              color="primary"
              @click="copyToExcel(getAirImportChargesData(), [{ title: 'Date', key: 'date' }, { title: 'Count', key: 'count' }], 'Air Import Charges')"
            >
              <v-icon left>mdi-content-copy</v-icon>
              Copy
            </v-btn>
          </v-card-title>
          <v-card-text>
            <v-data-table
              :headers="[{ title: 'Date', key: 'date' }, { title: 'Count', key: 'count' }]"
              :items="getAirImportChargesData()"
              :items-per-page="-1"
              class="elevation-1"
              density="compact"
              height="400"
              fixed-header
            >
              <template v-slot:item.date="{ item }">
                {{ formatDate(item.date) }}
              </template>
              <template v-slot:item.count="{ item }">
                <span class="text-orange-darken-1 font-weight-bold">{{ item.count || 0 }}</span>
              </template>
            </v-data-table>
            <!-- Total Row -->
            <v-divider></v-divider>
            <v-row class="pa-4 bg-grey-lighten-3">
              <v-col cols="6" class="font-weight-bold">TOTAL</v-col>
              <v-col cols="6" class="text-orange-darken-1 font-weight-bold">
                {{ getAirImportChargesData().reduce((sum, item) => sum + (item.count || 0), 0) }}
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Air Export Charges -->
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title class="pb-2 d-flex justify-space-between align-center">
            <span class="text-h6">Air Export Charges</span>
            <v-btn
              size="small"
              variant="outlined"
              color="primary"
              @click="copyToExcel(getAirExportChargesData(), [{ title: 'Date', key: 'date' }, { title: 'Count', key: 'count' }], 'Air Export Charges')"
            >
              <v-icon left>mdi-content-copy</v-icon>
              Copy
            </v-btn>
          </v-card-title>
          <v-card-text>
            <v-data-table
              :headers="[{ title: 'Date', key: 'date' }, { title: 'Count', key: 'count' }]"
              :items="getAirExportChargesData()"
              :items-per-page="-1"
              class="elevation-1"
              density="compact"
              height="400"
              fixed-header
            >
              <template v-slot:item.date="{ item }">
                {{ formatDate(item.date) }}
              </template>
              <template v-slot:item.count="{ item }">
                <span class="text-purple-darken-1 font-weight-bold">{{ item.count || 0 }}</span>
              </template>
            </v-data-table>
            <!-- Total Row -->
            <v-divider></v-divider>
            <v-row class="pa-4 bg-grey-lighten-3">
              <v-col cols="6" class="font-weight-bold">TOTAL</v-col>
              <v-col cols="6" class="text-purple-darken-1 font-weight-bold">
                {{ getAirExportChargesData().reduce((sum, item) => sum + (item.count || 0), 0) }}
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Payments Statistics -->
    <v-row class="mb-8">
      <v-col cols="12">
        <h2 class="text-h5 font-weight-bold mb-4">Daily Statistics</h2>
      </v-col>
      
      <!-- Captured Payments -->
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title class="pb-2 d-flex justify-space-between align-center">
            <span class="text-h6">Captured Payments</span>
            <v-btn
              size="small"
              variant="outlined"
              color="primary"
              @click="copyToExcel(getCapturedPaymentsData(), [{ title: 'Date', key: 'date' }, { title: 'Count', key: 'count' }], 'Captured Payments')"
            >
              <v-icon left>mdi-content-copy</v-icon>
              Copy
            </v-btn>
          </v-card-title>
          <v-card-text>
            <v-data-table
              :headers="[{ title: 'Date', key: 'date' }, { title: 'Count', key: 'count' }]"
              :items="getCapturedPaymentsData()"
              :items-per-page="-1"
              class="elevation-1"
              density="compact"
              height="400"
              fixed-header
            >
              <template v-slot:item.date="{ item }">
                {{ formatDate(item.date) }}
              </template>
              <template v-slot:item.count="{ item }">
                <span class="text-blue-darken-1 font-weight-bold">{{ item.count || 0 }}</span>
              </template>
            </v-data-table>
            <!-- Total Row -->
            <v-divider></v-divider>
            <v-row class="pa-4 bg-grey-lighten-3">
              <v-col cols="6" class="font-weight-bold">TOTAL</v-col>
              <v-col cols="6" class="text-blue-darken-1 font-weight-bold">
                {{ getCapturedPaymentsData().reduce((sum, item) => sum + (item.count || 0), 0) }}
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Applied Payments -->
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title class="pb-2 d-flex justify-space-between align-center">
            <span class="text-h6">Applied Payments</span>
            <v-btn
              size="small"
              variant="outlined"
              color="primary"
              @click="copyToExcel(getAppliedPaymentsData(), [{ title: 'Date', key: 'date' }, { title: 'Count', key: 'count' }], 'Applied Payments')"
            >
              <v-icon left>mdi-content-copy</v-icon>
              Copy
            </v-btn>
          </v-card-title>
          <v-card-text>
            <v-data-table
              :headers="[{ title: 'Date', key: 'date' }, { title: 'Count', key: 'count' }]"
              :items="getAppliedPaymentsData()"
              :items-per-page="-1"
              class="elevation-1"
              density="compact"
              height="400"
              fixed-header
            >
              <template v-slot:item.date="{ item }">
                {{ formatDate(item.date) }}
              </template>
              <template v-slot:item.count="{ item }">
                <span class="text-green-darken-1 font-weight-bold">{{ item.count || 0 }}</span>
              </template>
            </v-data-table>
            <!-- Total Row -->
            <v-divider></v-divider>
            <v-row class="pa-4 bg-grey-lighten-3">
              <v-col cols="6" class="font-weight-bold">TOTAL</v-col>
              <v-col cols="6" class="text-green-darken-1 font-weight-bold">
                {{ getAppliedPaymentsData().reduce((sum, item) => sum + (item.count || 0), 0) }}
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Invoices Statistics -->
    <v-row class="mb-8">
      <v-col cols="12">
        <h2 class="text-h5 font-weight-bold mb-4">Daily Statistics</h2>
      </v-col>
      
      <!-- TM Proforma Invoices -->
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title class="pb-2 d-flex justify-space-between align-center">
            <span class="text-h6">TM Proforma Invoices</span>
            <v-btn
              size="small"
              variant="outlined"
              color="primary"
              @click="copyToExcel(getProformaInvoicesData(), [{ title: 'Date', key: 'date' }, { title: 'Count', key: 'count' }], 'TM Proforma Invoices')"
            >
              <v-icon left>mdi-content-copy</v-icon>
              Copy
            </v-btn>
          </v-card-title>
          <v-card-text>
            <v-data-table
              :headers="[{ title: 'Date', key: 'date' }, { title: 'Count', key: 'count' }]"
              :items="getProformaInvoicesData()"
              :items-per-page="-1"
              class="elevation-1"
              density="compact"
              height="400"
              fixed-header
            >
              <template v-slot:item.date="{ item }">
                {{ formatDate(item.date) }}
              </template>
              <template v-slot:item.count="{ item }">
                <span class="text-orange-darken-1 font-weight-bold">{{ item.count || 0 }}</span>
              </template>
            </v-data-table>
            <!-- Total Row -->
            <v-divider></v-divider>
            <v-row class="pa-4 bg-grey-lighten-3">
              <v-col cols="6" class="font-weight-bold">TOTAL</v-col>
              <v-col cols="6" class="text-orange-darken-1 font-weight-bold">
                {{ getProformaInvoicesData().reduce((sum, item) => sum + (item.count || 0), 0) }}
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- TM Invoices -->
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title class="pb-2 d-flex justify-space-between align-center">
            <span class="text-h6">TM Invoices</span>
            <v-btn
              size="small"
              variant="outlined"
              color="primary"
              @click="copyToExcel(getTMInvoicesData(), [{ title: 'Date', key: 'date' }, { title: 'Count', key: 'count' }], 'TM Invoices')"
            >
              <v-icon left>mdi-content-copy</v-icon>
              Copy
            </v-btn>
          </v-card-title>
          <v-card-text>
            <v-data-table
              :headers="[{ title: 'Date', key: 'date' }, { title: 'Count', key: 'count' }]"
              :items="getTMInvoicesData()"
              :items-per-page="-1"
              class="elevation-1"
              density="compact"
              height="400"
              fixed-header
            >
              <template v-slot:item.date="{ item }">
                {{ formatDate(item.date) }}
              </template>
              <template v-slot:item.count="{ item }">
                <span class="text-blue-darken-1 font-weight-bold">{{ item.count || 0 }}</span>
              </template>
            </v-data-table>
            <!-- Total Row -->
            <v-divider></v-divider>
            <v-row class="pa-4 bg-grey-lighten-3">
              <v-col cols="6" class="font-weight-bold">TOTAL</v-col>
              <v-col cols="6" class="text-blue-darken-1 font-weight-bold">
                {{ getTMInvoicesData().reduce((sum, item) => sum + (item.count || 0), 0) }}
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Demurrages Statistics -->
    <v-row class="mb-8">
      <v-col cols="12">
        <h2 class="text-h5 font-weight-bold mb-4">Daily Statistics</h2>
      </v-col>
      
      <!-- Demurrages -->
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title class="pb-2 d-flex justify-space-between align-center">
            <span class="text-h6">Demurrages</span>
            <v-btn
              size="small"
              variant="outlined"
              color="primary"
              @click="copyToExcel(getDemurragesData(), [{ title: 'Date', key: 'date' }, { title: 'Count', key: 'count' }], 'Demurrages')"
            >
              <v-icon left>mdi-content-copy</v-icon>
              Copy
            </v-btn>
          </v-card-title>
          <v-card-text>
            <v-data-table
              :headers="[{ title: 'Date', key: 'date' }, { title: 'Count', key: 'count' }]"
              :items="getDemurragesData()"
              :items-per-page="-1"
              class="elevation-1"
              density="compact"
              height="400"
              fixed-header
            >
              <template v-slot:item.date="{ item }">
                {{ formatDate(item.date) }}
              </template>
              <template v-slot:item.count="{ item }">
                <span class="text-red-darken-1 font-weight-bold">{{ item.count || 0 }}</span>
              </template>
            </v-data-table>
            <!-- Total Row -->
            <v-divider></v-divider>
            <v-row class="pa-4 bg-grey-lighten-3">
              <v-col cols="6" class="font-weight-bold">TOTAL</v-col>
              <v-col cols="6" class="text-red-darken-1 font-weight-bold">
                {{ getDemurragesData().reduce((sum, item) => sum + (item.count || 0), 0) }}
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Detentions -->
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title class="pb-2 d-flex justify-space-between align-center">
            <span class="text-h6">Detentions</span>
            <v-btn
              size="small"
              variant="outlined"
              color="primary"
              @click="copyToExcel(getDetentionsData(), [{ title: 'Date', key: 'date' }, { title: 'Count', key: 'count' }], 'Detentions')"
            >
              <v-icon left>mdi-content-copy</v-icon>
              Copy
            </v-btn>
          </v-card-title>
          <v-card-text>
            <v-data-table
              :headers="[{ title: 'Date', key: 'date' }, { title: 'Count', key: 'count' }]"
              :items="getDetentionsData()"
              :items-per-page="-1"
              class="elevation-1"
              density="compact"
              height="400"
              fixed-header
            >
              <template v-slot:item.date="{ item }">
                {{ formatDate(item.date) }}
              </template>
              <template v-slot:item.count="{ item }">
                <span class="text-amber-darken-1 font-weight-bold">{{ item.count || 0 }}</span>
              </template>
            </v-data-table>
            <!-- Total Row -->
            <v-divider></v-divider>
            <v-row class="pa-4 bg-grey-lighten-3">
              <v-col cols="6" class="font-weight-bold">TOTAL</v-col>
              <v-col cols="6" class="text-amber-darken-1 font-weight-bold">
                {{ getDetentionsData().reduce((sum, item) => sum + (item.count || 0), 0) }}
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Payment Requests Statistics -->
    <v-row class="mb-8">
      <v-col cols="12">
        <h2 class="text-h5 font-weight-bold mb-4">Daily Statistics</h2>
      </v-col>
      
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title class="pb-2 d-flex justify-space-between align-center">
            <span class="text-h6">Supplier Payment Requests</span>
            <v-btn
              size="small"
              variant="outlined"
              color="primary"
              @click="copyToExcel(getSupplierPaymentsTableData(), [{ title: 'Date', key: 'date' }, { title: 'Count', key: 'count' }], 'Supplier Payment Requests')"
            >
              <v-icon left>mdi-content-copy</v-icon>
              Copy
            </v-btn>
          </v-card-title>
          <v-card-text>
            <v-data-table
              :headers="[{ title: 'Date', key: 'date' }, { title: 'Count', key: 'count' }]"
              :items="getSupplierPaymentsTableData()"
              :items-per-page="-1"
              class="elevation-1"
              density="compact"
              height="400"
              fixed-header
            >
              <template v-slot:item.date="{ item }">
                {{ formatDate(item.date) }}
              </template>
              <template v-slot:item.count="{ item }">
                <span class="text-purple-darken-1 font-weight-bold">{{ item.count }}</span>
              </template>
            </v-data-table>
            <!-- Total Row -->
            <v-divider></v-divider>
            <v-row class="pa-4 bg-grey-lighten-3">
              <v-col cols="6" class="font-weight-bold">TOTAL</v-col>
              <v-col cols="6" class="text-purple-darken-1 font-weight-bold">
                {{ getSupplierPaymentsTableData().reduce((sum, item) => sum + (item.count || 0), 0) }}
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card>
          <v-card-title class="pb-2 d-flex justify-space-between align-center">
            <span class="text-h6">FF/SOA Payment Requests</span>
            <v-btn
              size="small"
              variant="outlined"
              color="primary"
              @click="copyToExcel(getFFPaymentsTableData(), [{ title: 'Date', key: 'date' }, { title: 'Count', key: 'count' }], 'FF/SOA Payment Requests')"
            >
              <v-icon left>mdi-content-copy</v-icon>
              Copy
            </v-btn>
          </v-card-title>
          <v-card-text>
            <v-data-table
              :headers="[{ title: 'Date', key: 'date' }, { title: 'Count', key: 'count' }]"
              :items="getFFPaymentsTableData()"
              :items-per-page="-1"
              class="elevation-1"
              density="compact"
              height="400"
              fixed-header
            >
              <template v-slot:item.date="{ item }">
                {{ formatDate(item.date) }}
              </template>
              <template v-slot:item.count="{ item }">
                <span class="text-teal-darken-1 font-weight-bold">{{ item.count }}</span>
              </template>
            </v-data-table>
            <!-- Total Row -->
            <v-divider></v-divider>
            <v-row class="pa-4 bg-grey-lighten-3">
              <v-col cols="6" class="font-weight-bold">TOTAL</v-col>
              <v-col cols="6" class="text-teal-darken-1 font-weight-bold">
                {{ getFFPaymentsTableData().reduce((sum, item) => sum + (item.count || 0), 0) }}
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick } from 'vue'
import { useApiFactory } from '~/composables/apiFactory'

// API
const api = useApiFactory()

// State
const loading = ref(false)
const statistics = ref({
  references: {
    sea_import: {},
    sea_export: {},
    air_import: {},
    air_export: {}
  },
  charges: {},
  invoices: {},
  demurrages: {},
  payments: {},
  supplier_payments: {},
  ff_payments: {}
})

// Table headers
const tableHeaders = [
  { title: 'Date', key: 'date', sortable: true },
  { title: 'Import', key: 'sea_import', sortable: true },
  { title: 'Export', key: 'sea_export', sortable: true }
]

const airTableHeaders = [
  { title: 'Date', key: 'date', sortable: true },
  { title: 'Import', key: 'air_import', sortable: true },
  { title: 'Export', key: 'air_export', sortable: true }
]

const paymentHeaders = [
  { title: 'Date', key: 'date', sortable: true },
  { title: 'Captured', key: 'captured', sortable: true },
  { title: 'Applied', key: 'applied', sortable: true }
]

const invoiceHeaders = [
  { title: 'Date', key: 'date', sortable: true },
  { title: 'TM Proforma', key: 'tm_proforma', sortable: true },
  { title: 'TM Invoice', key: 'tm_invoice', sortable: true }
]

const demurrageHeaders = [
  { title: 'Date', key: 'date', sortable: true },
  { title: 'Demurrages', key: 'demurrages', sortable: true },
  { title: 'Detentions', key: 'detentions', sortable: true }
]

const filters = ref({
  startDate: '2025-01-01',
  endDate: new Date().toISOString().split('T')[0]
})

// Chart refs
const maritimeChart = ref(null)
const airChart = ref(null)
let maritimeChartInstance = null
let airChartInstance = null

// Computed
const hasMaritimeData = computed(() => {
  const seaImport = Object.keys(statistics.value.references?.sea_import || {}).length
  const seaExport = Object.keys(statistics.value.references?.sea_export || {}).length
  return seaImport > 0 || seaExport > 0
})

const hasAirData = computed(() => {
  const airImport = Object.keys(statistics.value.references?.air_import || {}).length
  const airExport = Object.keys(statistics.value.references?.air_export || {}).length
  return airImport > 0 || airExport > 0
})

const totalCharges = computed(() => {
  const charges = statistics.value.charges || {}
  return Object.values(charges).reduce((sum, type) => {
    return sum + Object.values(type).reduce((typeSum, count) => typeSum + count, 0)
  }, 0)
})

const totalInvoices = computed(() => {
  const invoices = statistics.value.invoices || {}
  return Object.values(invoices).reduce((sum, type) => {
    return sum + Object.values(type).reduce((typeSum, count) => typeSum + count, 0)
  }, 0)
})

const totalDemurrages = computed(() => {
  const demurrages = statistics.value.demurrages || {}
  return Object.values(demurrages).reduce((sum, count) => sum + count, 0)
})

const totalPayments = computed(() => {
  const payments = statistics.value.payments || {}
  return Object.values(payments).reduce((sum, count) => sum + count, 0)
})

// Methods
const fetchStatistics = async () => {
  loading.value = true
  try {
    const response = await api.statistics.usageStats({
      start_date: filters.value.startDate,
      end_date: filters.value.endDate
    })
    
    if (response.success) {
      statistics.value = response.data
      
      // Calculate totals for each reference type
      Object.keys(statistics.value.references).forEach(type => {
        const data = statistics.value.references[type]
        statistics.value.references[type].total = Object.values(data).reduce((sum, count) => sum + count, 0)
      })
    }
  } catch (error) {
    console.error('Error fetching statistics:', error)
  } finally {
    loading.value = false
  }
}

// Table data methods
// Maritime References - Separated
const getMaritimeImportData = () => {
  const seaImport = statistics.value.references?.sea_import || {}
  
  return Object.keys(seaImport)
    .filter(date => date && date !== 'Invalid Date' && !isNaN(new Date(date).getTime()))
    .sort((a, b) => new Date(a) - new Date(b))
    .map(date => ({
      date,
      count: seaImport[date] || 0
    }))
}

const getMaritimeExportData = () => {
  const seaExport = statistics.value.references?.sea_export || {}
  
  return Object.keys(seaExport)
    .filter(date => date && date !== 'Invalid Date' && !isNaN(new Date(date).getTime()))
    .sort((a, b) => new Date(a) - new Date(b))
    .map(date => ({
      date,
      count: seaExport[date] || 0
    }))
}

// Air References - Separated
const getAirImportData = () => {
  const airImport = statistics.value.references?.air_import || {}
  
  return Object.keys(airImport)
    .filter(date => date && date !== 'Invalid Date' && !isNaN(new Date(date).getTime()))
    .sort((a, b) => new Date(a) - new Date(b))
    .map(date => ({
      date,
      count: airImport[date] || 0
    }))
}

const getAirExportData = () => {
  const airExport = statistics.value.references?.air_export || {}
  
  return Object.keys(airExport)
    .filter(date => date && date !== 'Invalid Date' && !isNaN(new Date(date).getTime()))
    .sort((a, b) => new Date(a) - new Date(b))
    .map(date => ({
      date,
      count: airExport[date] || 0
    }))
}

// Maritime Charges - Separated
const getMaritimeImportChargesData = () => {
  const seaImport = statistics.value.charges?.sea_import || {}
  
  return Object.keys(seaImport)
    .filter(date => date && date !== 'Invalid Date' && !isNaN(new Date(date).getTime()))
    .sort((a, b) => new Date(a) - new Date(b))
    .map(date => ({
      date,
      count: seaImport[date] || 0
    }))
}

const getMaritimeExportChargesData = () => {
  const seaExport = statistics.value.charges?.sea_export || {}
  
  return Object.keys(seaExport)
    .filter(date => date && date !== 'Invalid Date' && !isNaN(new Date(date).getTime()))
    .sort((a, b) => new Date(a) - new Date(b))
    .map(date => ({
      date,
      count: seaExport[date] || 0
    }))
}

// Air Charges - Separated
const getAirImportChargesData = () => {
  const airImport = statistics.value.charges?.air_import || {}
  
  return Object.keys(airImport)
    .filter(date => date && date !== 'Invalid Date' && !isNaN(new Date(date).getTime()))
    .sort((a, b) => new Date(a) - new Date(b))
    .map(date => ({
      date,
      count: airImport[date] || 0
    }))
}

const getAirExportChargesData = () => {
  const airExport = statistics.value.charges?.air_export || {}
  
  return Object.keys(airExport)
    .filter(date => date && date !== 'Invalid Date' && !isNaN(new Date(date).getTime()))
    .sort((a, b) => new Date(a) - new Date(b))
    .map(date => ({
      date,
      count: airExport[date] || 0
    }))
}

// Payments - Separated
const getCapturedPaymentsData = () => {
  const captured = statistics.value.payments?.captured || {}
  
  return Object.keys(captured)
    .filter(date => date && date !== 'Invalid Date' && !isNaN(new Date(date).getTime()))
    .sort((a, b) => new Date(a) - new Date(b))
    .map(date => ({
      date,
      count: captured[date] || 0
    }))
}

const getAppliedPaymentsData = () => {
  const applied = statistics.value.payments?.applied || {}
  
  return Object.keys(applied)
    .filter(date => date && date !== 'Invalid Date' && !isNaN(new Date(date).getTime()))
    .sort((a, b) => new Date(a) - new Date(b))
    .map(date => ({
      date,
      count: applied[date] || 0
    }))
}

// Invoices - Separated
const getProformaInvoicesData = () => {
  const proforma = statistics.value.invoices?.tm?.proforma || {}
  
  return Object.keys(proforma)
    .filter(date => date && date !== 'Invalid Date' && !isNaN(new Date(date).getTime()))
    .sort((a, b) => new Date(a) - new Date(b))
    .map(date => ({
      date,
      count: proforma[date] || 0
    }))
}

const getTMInvoicesData = () => {
  const invoices = statistics.value.invoices?.tm?.invoice || {}
  
  return Object.keys(invoices)
    .filter(date => date && date !== 'Invalid Date' && !isNaN(new Date(date).getTime()))
    .sort((a, b) => new Date(a) - new Date(b))
    .map(date => ({
      date,
      count: invoices[date] || 0
    }))
}

// Demurrages & Detentions - Separated
const getDemurragesData = () => {
  const demurrages = statistics.value.demurrages?.demurrages || {}
  
  return Object.keys(demurrages)
    .filter(date => date && date !== 'Invalid Date' && !isNaN(new Date(date).getTime()))
    .sort((a, b) => new Date(a) - new Date(b))
    .map(date => ({
      date,
      count: demurrages[date] || 0
    }))
}

const getDetentionsData = () => {
  const detentions = statistics.value.demurrages?.detentions || {}
  
  return Object.keys(detentions)
    .filter(date => date && date !== 'Invalid Date' && !isNaN(new Date(date).getTime()))
    .sort((a, b) => new Date(a) - new Date(b))
    .map(date => ({
      date,
      count: detentions[date] || 0
    }))
}

// Legacy functions (kept for compatibility)
const getMaritimeTableData = () => {
  const seaImport = statistics.value.references?.sea_import || {}
  const seaExport = statistics.value.references?.sea_export || {}
  
  // Get all unique dates from both datasets
  const allDates = new Set([
    ...Object.keys(seaImport),
    ...Object.keys(seaExport)
  ])
  
  // Convert to array and sort ascending (oldest to newest)
  return Array.from(allDates)
    .filter(date => date && date !== 'Invalid Date' && !isNaN(new Date(date).getTime()))
    .sort((a, b) => new Date(a) - new Date(b))
    .map(date => ({
      date,
      sea_import: seaImport[date] || 0,
      sea_export: seaExport[date] || 0
    }))
}

const getAirTableData = () => {
  const airImport = statistics.value.references?.air_import || {}
  const airExport = statistics.value.references?.air_export || {}
  
  // Get all unique dates from both datasets
  const allDates = new Set([
    ...Object.keys(airImport),
    ...Object.keys(airExport)
  ])
  
  // Convert to array and sort ascending (oldest to newest)
  return Array.from(allDates)
    .filter(date => date && date !== 'Invalid Date' && !isNaN(new Date(date).getTime()))
    .sort((a, b) => new Date(a) - new Date(b))
    .map(date => ({
      date,
      air_import: airImport[date] || 0,
      air_export: airExport[date] || 0
    }))
}

const getMaritimeChargesTableData = () => {
  const seaImport = statistics.value.charges?.sea_import || {}
  const seaExport = statistics.value.charges?.sea_export || {}
  
  // Get all unique dates from both datasets
  const allDates = new Set([
    ...Object.keys(seaImport),
    ...Object.keys(seaExport)
  ])
  
  // Convert to array and sort ascending (oldest to newest)
  return Array.from(allDates)
    .filter(date => date && date !== 'Invalid Date' && !isNaN(new Date(date).getTime()))
    .sort((a, b) => new Date(a) - new Date(b))
    .map(date => ({
      date,
      sea_import: seaImport[date] || 0,
      sea_export: seaExport[date] || 0
    }))
}

const getAirChargesTableData = () => {
  const airImport = statistics.value.charges?.air_import || {}
  const airExport = statistics.value.charges?.air_export || {}
  
  // Get all unique dates from both datasets
  const allDates = new Set([
    ...Object.keys(airImport),
    ...Object.keys(airExport)
  ])
  
  // Convert to array and sort ascending (oldest to newest)
  return Array.from(allDates)
    .filter(date => date && date !== 'Invalid Date' && !isNaN(new Date(date).getTime()))
    .sort((a, b) => new Date(a) - new Date(b))
    .map(date => ({
      date,
      air_import: airImport[date] || 0,
      air_export: airExport[date] || 0
    }))
}

const getPaymentsTableData = () => {
  const captured = statistics.value.payments?.captured || {}
  const applied = statistics.value.payments?.applied || {}
  
  // Get all unique dates from both datasets
  const allDates = new Set([
    ...Object.keys(captured),
    ...Object.keys(applied)
  ])
  
  // Convert to array and sort ascending (oldest to newest)
  return Array.from(allDates)
    .filter(date => date && date !== 'Invalid Date' && !isNaN(new Date(date).getTime()))
    .sort((a, b) => new Date(a) - new Date(b))
    .map(date => ({
      date,
      captured: captured[date] || 0,
      applied: applied[date] || 0
    }))
}

const getInvoicesTableData = () => {
  const tmProforma = statistics.value.invoices?.tm?.proforma || {}
  const tmInvoice = statistics.value.invoices?.tm?.invoice || {}
  
  // Get all unique dates from both datasets
  const allDates = new Set([
    ...Object.keys(tmProforma),
    ...Object.keys(tmInvoice)
  ])
  
  // Convert to array and sort ascending (oldest to newest)
  return Array.from(allDates)
    .filter(date => date && date !== 'Invalid Date' && !isNaN(new Date(date).getTime()))
    .sort((a, b) => new Date(a) - new Date(b))
    .map(date => ({
      date,
      tm_proforma: tmProforma[date] || 0,
      tm_invoice: tmInvoice[date] || 0
    }))
}

const getDemurragesTableData = () => {
  const demurrages = statistics.value.demurrages?.demurrages || {}
  const detentions = statistics.value.demurrages?.detentions || {}
  
  // Get all unique dates from both datasets
  const allDates = new Set([
    ...Object.keys(demurrages),
    ...Object.keys(detentions)
  ])
  
  // Convert to array and sort ascending (oldest to newest)
  return Array.from(allDates)
    .filter(date => date && date !== 'Invalid Date' && !isNaN(new Date(date).getTime()))
    .sort((a, b) => new Date(a) - new Date(b))
    .map(date => ({
      date,
      demurrages: demurrages[date] || 0,
      detentions: detentions[date] || 0
    }))
}

const getSupplierPaymentsTableData = () => {
  const supplierPayments = statistics.value.supplier_payments || {}
  
  return Object.keys(supplierPayments)
    .filter(date => date && date !== 'Invalid Date' && !isNaN(new Date(date).getTime()))
    .sort((a, b) => new Date(a) - new Date(b))
    .map(date => ({
      date,
      count: supplierPayments[date] || 0
    }))
}

const getFFPaymentsTableData = () => {
  const ffPayments = statistics.value.ff_payments || {}
  
  return Object.keys(ffPayments)
    .filter(date => date && date !== 'Invalid Date' && !isNaN(new Date(date).getTime()))
    .sort((a, b) => new Date(a) - new Date(b))
    .map(date => ({
      date,
      count: ffPayments[date] || 0
    }))
}

const createCharts = () => {
  // Destroy existing charts
  if (maritimeChartInstance) {
    maritimeChartInstance.destroy()
  }
  if (airChartInstance) {
    airChartInstance.destroy()
  }

  // Create maritime chart
  if (maritimeChart.value && hasMaritimeData.value) {
    const ctx = maritimeChart.value.getContext('2d')
    maritimeChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: getSortedDates(statistics.value.references.sea_import, statistics.value.references.sea_export),
        datasets: [
          {
            label: 'Sea Import',
            data: getChartData(statistics.value.references.sea_import),
            borderColor: '#2196F3',
            backgroundColor: 'rgba(33, 150, 243, 0.1)',
            tension: 0.4
          },
          {
            label: 'Sea Export',
            data: getChartData(statistics.value.references.sea_export),
            borderColor: '#4CAF50',
            backgroundColor: 'rgba(76, 175, 80, 0.1)',
            tension: 0.4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1
            }
          }
        }
      }
    })
  }

  // Create air chart
  if (airChart.value && hasAirData.value) {
    const ctx = airChart.value.getContext('2d')
    airChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: getSortedDates(statistics.value.references.air_import, statistics.value.references.air_export),
        datasets: [
          {
            label: 'Air Import',
            data: getChartData(statistics.value.references.air_import),
            borderColor: '#FF9800',
            backgroundColor: 'rgba(255, 152, 0, 0.1)',
            tension: 0.4
          },
          {
            label: 'Air Export',
            data: getChartData(statistics.value.references.air_export),
            borderColor: '#9C27B0',
            backgroundColor: 'rgba(156, 39, 176, 0.1)',
            tension: 0.4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1
            }
          }
        }
      }
    })
  }
}

const getSortedDates = (data1, data2) => {
  const allDates = new Set([...Object.keys(data1), ...Object.keys(data2)])
  return Array.from(allDates).sort()
}

const getChartData = (data) => {
  const allDates = new Set([...Object.keys(data)])
  return Array.from(allDates).sort().map(date => data[date] || 0)
}

const formatNumber = (num) => {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k'
  }
  return num.toString()
}

// Lifecycle
onMounted(() => {
  // Load Chart.js dynamically
  if (typeof Chart === 'undefined') {
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js'
    script.onload = () => {
      fetchStatistics()
    }
    document.head.appendChild(script)
  } else {
    fetchStatistics()
  }
})

// Utility methods
const formatDate = (date) => {
  if (!date || date === 'Invalid Date') return 'N/A'
  try {
    // If already in YYYY-MM-DD format, return as-is to avoid timezone offset
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date
    const d = new Date(date)
    if (isNaN(d.getTime())) return 'N/A'
    // Use UTC getters to prevent local-timezone day shift
    const year = d.getUTCFullYear()
    const month = String(d.getUTCMonth() + 1).padStart(2, '0')
    const day = String(d.getUTCDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  } catch (error) {
    return 'N/A'
  }
}

const copyToExcel = (data, headers, title) => {
  // Create tab-separated content for Excel compatibility
  const csvHeaders = headers.map(h => h.title).join('\t')
  
  // Calculate totals row
  const totalsRow = []
  if (headers.length === 4) {
    // For 3-column tables (Date + 2 values)
    const total1 = data.reduce((sum, item) => sum + (item[headers[1].key] || 0), 0)
    const total2 = data.reduce((sum, item) => sum + (item[headers[2].key] || 0), 0)
    totalsRow.push('TOTAL', total1.toString(), total2.toString())
  } else if (headers.length === 3) {
    // For 2-column tables (Date + Count)
    const total = data.reduce((sum, item) => sum + (item[headers[1].key] || 0), 0)
    totalsRow.push('TOTAL', total.toString())
  }
  
  const csvRows = data.map(row => {
    return headers.map(header => {
      const value = row[header.key] || 0
      return value.toString()
    }).join('\t')
  }).join('\n')
  
  // Combine title, headers, data, and totals
  let csvContent = `${title}\n`
  csvContent += `${csvHeaders}\n`
  csvContent += `${csvRows}\n`
  if (totalsRow.length > 0) {
    csvContent += `${totalsRow.join('\t')}\n`
  }
  
  // Copy to clipboard
  navigator.clipboard.writeText(csvContent).then(() => {
    console.log(`Copied ${title} to clipboard`)
  }).catch(err => {
    console.error('Failed to copy:', err)
  })
}
</script>

<style scoped>
.chart-container {
  position: relative;
  height: 200px;
}
</style>
