<template>
  <v-container fluid>
    <div>
      <div class="flex items-center justify-between w-full">
        <div class="text-xl">Notification types</div>
        <Can permission="notifications-types-create">
          <v-btn color="primary" to="/configuration/notifications-types/add"> Add Notification Type </v-btn>
        </Can>
      </div>
    </div>
    <div class="pt-4">
      <NotificationTypeTable />
    </div>
  </v-container>
</template>
