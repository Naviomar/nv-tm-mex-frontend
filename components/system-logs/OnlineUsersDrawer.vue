<template>
  <v-navigation-drawer v-model="drawerModel" temporary location="right" width="380">
    <v-card flat class="h-full d-flex flex-column">
      <v-card-title class="d-flex align-center bg-teal-darken-1 text-white pa-4">
        <v-icon start>mdi-account-multiple</v-icon>
        Online Users
        <v-spacer />
        <v-chip color="white" variant="flat" size="small" class="font-weight-bold text-teal-darken-2">
          {{ users.length }}
        </v-chip>
        <v-btn icon="mdi-close" size="small" variant="text" class="ml-2" @click="drawerModel = false" />
      </v-card-title>

      <v-card-text class="flex-grow-1 overflow-y-auto pa-0">
        <v-list density="compact">
          <v-list-item
            v-for="user in sortedUsers"
            :key="user.id"
            :prepend-avatar="user.avatar || undefined"
            :title="user.name"
            :subtitle="user.email"
            class="border-b"
          >
            <template #prepend>
              <v-avatar :color="user.avatar ? undefined : 'teal-lighten-3'" size="40">
                <v-img v-if="user.avatar" :src="user.avatar" />
                <span v-else class="text-subtitle-2 font-weight-bold text-teal-darken-3">
                  {{ getInitials(user.name) }}
                </span>
              </v-avatar>
            </template>
            <template #append>
              <v-icon color="success" size="12">mdi-circle</v-icon>
            </template>
          </v-list-item>

          <v-list-item v-if="users.length === 0" class="text-center text-grey-darken-1">
            <div class="pa-8">
              <v-icon size="48" color="grey-lighten-1">mdi-account-off-outline</v-icon>
              <div class="text-body-2 mt-2">No users online</div>
            </div>
          </v-list-item>
        </v-list>
      </v-card-text>

      <v-card-actions class="pa-3 border-t">
        <v-spacer />
        <v-btn variant="text" @click="drawerModel = false">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import type { IOnlineUser } from '~/repository/modules/systemLogs'

const drawerModel = defineModel<boolean>({ default: false })

const props = defineProps<{
  users: IOnlineUser[]
}>()

const sortedUsers = computed(() => {
  return [...props.users].sort((a, b) => a.name.localeCompare(b.name))
})

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}
</script>
