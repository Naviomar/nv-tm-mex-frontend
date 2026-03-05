<template>
  <div class="d-flex align-center ga-2 cursor-pointer" @click="$emit('click')">
    <v-chip color="teal" size="small" variant="tonal">
      <v-icon start size="14">mdi-account-multiple</v-icon>
      {{ users.length }} online
    </v-chip>
    <div class="d-flex" style="margin-left: 4px;">
      <v-tooltip v-for="u in displayUsers" :key="u.id" :text="u.name" location="bottom">
        <template #activator="{ props }">
          <v-avatar v-bind="props" size="28" color="teal-lighten-4" class="online-avatar" style="margin-left: -6px; border: 2px solid white;">
            <span class="text-caption font-weight-bold text-teal-darken-2">{{ getInitials(u.name) }}</span>
          </v-avatar>
        </template>
      </v-tooltip>
      <v-avatar v-if="extraCount > 0" size="28" color="grey-lighten-2" style="margin-left: -6px; border: 2px solid white;">
        <span class="text-caption font-weight-bold text-grey-darken-1">+{{ extraCount }}</span>
      </v-avatar>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { IOnlineUser } from '~/repository/modules/systemLogs'

const props = defineProps<{
  users: IOnlineUser[]
}>()

defineEmits<{
  (e: 'click'): void
}>()

const maxDisplay = 5

const displayUsers = computed(() => props.users.slice(0, maxDisplay))
const extraCount = computed(() => Math.max(0, props.users.length - maxDisplay))

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}
</script>

<style scoped>
.online-avatar {
  transition: transform 0.15s ease;
  cursor: default;
}
.online-avatar:hover {
  transform: scale(1.15);
  z-index: 1;
}
</style>
