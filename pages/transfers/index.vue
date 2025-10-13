<template>
  <div>
    <v-container fluid>
      <v-row>
        <v-col cols="12" md="8">
          <v-card>
            <v-card-title>
              <h3>Transfers</h3>
            </v-card-title>
            <v-card-text>
              <div class="grid grid-cols-2 gap-5">
                <v-card color="#EEEEEE">
                  <v-card-title>BOFA & CHASE</v-card-title>
                  <v-card-text> Module for international transfers </v-card-text>
                  <v-card-actions>
                    <v-btn color="primary" to="/transfers/bofa-chase">Go to module</v-btn>
                  </v-card-actions>
                </v-card>

                <v-card color="#EEEEEE">
                  <v-card-title>HSBC</v-card-title>
                  <v-card-text> Module for national transfers </v-card-text>
                  <v-card-actions>
                    <v-btn color="primary" to="/transfers/hsbc">Go to module</v-btn>
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
