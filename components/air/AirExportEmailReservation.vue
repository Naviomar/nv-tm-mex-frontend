<template>
  <div>
    <v-card class="mb-4">
      <v-card-title>
        <div class="flex items-center gap-2">
          <v-icon>mdi-email-outline</v-icon>
          <span>Email Reservation</span>
        </div>
      </v-card-title>
      <v-card-subtitle>Send reservation details via email</v-card-subtitle>
      <v-card-text>
        <div class="mb-4">
          <v-alert type="info" variant="tonal">
            <div class="text-sm">
              <strong>Phase 2 Feature:</strong> Email reservation functionality for China Cargo and EVA will be implemented in the next phase.
            </div>
          </v-alert>
        </div>

        <div class="grid grid-cols-1 gap-4">
          <div>
            <v-text-field
              v-model="emailData.to"
              label="To (Email Address)"
              density="compact"
              variant="outlined"
              type="email"
              hint="Enter recipient email address"
              disabled
            />
          </div>
          <div>
            <v-text-field
              v-model="emailData.cc"
              label="CC (Optional)"
              density="compact"
              variant="outlined"
              type="email"
              hint="Enter CC email addresses (comma separated)"
              disabled
            />
          </div>
          <div>
            <v-text-field
              v-model="emailData.subject"
              label="Subject"
              density="compact"
              variant="outlined"
              disabled
            />
          </div>
          <div>
            <v-textarea
              v-model="emailData.body"
              label="Message Body"
              density="compact"
              variant="outlined"
              rows="8"
              hint="Email message content"
              disabled
            />
          </div>
        </div>

        <div class="mt-4 flex gap-2">
          <v-btn color="primary" prepend-icon="mdi-email-send" disabled>
            Send Email
          </v-btn>
          <v-btn color="secondary" prepend-icon="mdi-eye" disabled>
            Preview Email
          </v-btn>
        </div>
      </v-card-text>
    </v-card>

    <v-card>
      <v-card-title>Reservation Details Preview</v-card-title>
      <v-card-text>
        <div v-if="reference" class="text-sm">
          <div class="grid grid-cols-2 gap-2 mb-2">
            <div><strong>Reference:</strong> {{ reference.reference_number }}</div>
            <div><strong>Master AWB:</strong> {{ reference.master_awb }}</div>
          </div>
          <div class="grid grid-cols-2 gap-2 mb-2">
            <div><strong>Airline:</strong> {{ reference.airline?.name }}</div>
            <div><strong>Origin:</strong> {{ reference.origin }}</div>
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div><strong>Destination:</strong> {{ reference.destination }}</div>
            <div><strong>Shipper:</strong> {{ reference.consignee?.name }}</div>
          </div>
        </div>
        <div v-else class="text-center text-grey">
          Loading reference data...
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  id: {
    type: String,
    required: true,
  },
  reference: {
    type: Object,
    default: null,
  },
})

const emailData = ref({
  to: '',
  cc: '',
  subject: `Reservation for ${props.reference?.reference_number || 'Reference'}`,
  body: '',
})
</script>

<style scoped>
/* Add any specific styles for email preview */
</style>
