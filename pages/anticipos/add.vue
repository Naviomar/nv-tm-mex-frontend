<template>
  <div>
    <v-container fluid>
      <v-btn color="slate" size="small" variant="outlined" to="/anticipos" class="mb-4">Back to anticipos</v-btn>
      <v-row>
        <v-col cols="12" md="12">
          <v-card>
            <v-card-title>
              <h3>Request anticipo</h3>
            </v-card-title>
            <v-card-text>
              <AnticipoRequest />
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>
