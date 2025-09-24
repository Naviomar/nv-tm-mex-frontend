<template>
  <div>
    <v-card>
      <v-card-text>
        <div class="grid grid-cols-2 gap-5">
          <v-card color="#EEEEEE">
            <v-card-title>Upload BofA transfers</v-card-title>
            <v-card-text>
              <div>Steps:</div>
              <ul class="ml-4 list-disc">
                <li>Download transfers layout <v-btn size="small" variant="outlined">Download layout</v-btn></li>
                <li>Upload the file to the system</li>
                <li>Review the data</li>
                <li>Confirm the data</li>
              </ul>
            </v-card-text>
            <v-card-actions>
              <v-btn color="primary">Start import</v-btn>
            </v-card-actions>
          </v-card>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>
