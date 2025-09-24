<template>
  <div>
    <v-container fluid>
      <v-row>
        <v-col cols="12" md="8">
          <v-card>
            <v-card-title>
              <h3>Admin Pack</h3>
            </v-card-title>
            <v-card-text>
              <div class="grid grid-cols-2 gap-5">
                <v-card>
                  <v-card-title>Export TM Invoices</v-card-title>
                  <v-card-text> Export pending TM invoices for CFDI link.</v-card-text>
                  <v-card-actions>
                    <v-btn color="primary" to="/adminpack/export-invoices">Go to module</v-btn>
                  </v-card-actions>
                </v-card>

                <v-card>
                  <v-card-title>Upload Zip File with CFDIs</v-card-title>
                  <v-card-text> Module to upload zip file.</v-card-text>
                  <v-card-actions>
                    <v-btn color="primary" to="/adminpack/upload-invoices-tm">Go to module</v-btn>
                  </v-card-actions>
                </v-card>

                <v-card>
                  <v-card-title>Zip files uploaded hisotry</v-card-title>
                  <v-card-text> View past zip files.</v-card-text>
                  <v-card-actions>
                    <v-btn color="primary" to="/adminpack/zip-file-jobs">Go to module</v-btn>
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
<script setup lang="ts">
definePageMeta({
  title: 'Admin Pack - Home',
  layout: 'default',
})
</script>
