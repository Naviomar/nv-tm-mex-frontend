<template>
  <v-container fluid>
    <v-btn color="slate" size="small" variant="outlined" to="/configuration/notifications-types" class="mb-4"
      >Back to notifications types</v-btn
    >
    <v-card>
      <v-card-title>
        <h3>New Notification Type</h3>
      </v-card-title>
      <v-card-text>
        <NotificationTypeForm />
      </v-card-text>
    </v-card>
  </v-container>
</template>
