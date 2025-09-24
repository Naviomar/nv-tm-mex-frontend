<template>
  <div>
    <v-container fluid>
      <v-row>
        <v-col cols="12" md="8">
          <v-card>
            <v-card-title>
              <h3>Capture invoices</h3>
            </v-card-title>
            <v-card-text>
              <div class="grid grid-cols-2 gap-5">
                <v-card>
                  <v-card-title>TM Invoices</v-card-title>
                  <v-card-text>Capture TM invoices</v-card-text>
                  <v-card-actions>
                    <v-btn color="primary" to="/invoices/capture/tm">Go to module</v-btn>
                  </v-card-actions>
                </v-card>

                <v-card>
                  <v-card-title>WM Invoices</v-card-title>
                  <v-card-text>Capture WM invoices</v-card-text>
                  <v-card-actions>
                    <v-btn color="primary" to="/invoices/capture/wm">Go to module</v-btn>
                  </v-card-actions>
                </v-card>

                <v-card>
                  <v-card-title>Free format TM</v-card-title>
                  <v-card-text>Capture free format TM invoice</v-card-text>
                  <v-card-actions>
                    <v-btn color="primary" to="/invoices/capture/tm-free-format">Go to module</v-btn>
                  </v-card-actions>
                </v-card>

                <v-card>
                  <v-card-title>Free format WM</v-card-title>
                  <v-card-text>Capture free format WM invoice</v-card-text>
                  <v-card-actions>
                    <v-btn color="primary" to="/invoices/capture/wm-free-format">Go to module</v-btn>
                  </v-card-actions>
                </v-card>

                <v-card>
                  <v-card-title>Tickets</v-card-title>
                  <v-card-text>Capture tickets</v-card-text>
                  <v-card-actions>
                    <v-btn color="primary" to="/invoices/capture/ticket">Go to module</v-btn>
                  </v-card-actions>
                </v-card>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>
