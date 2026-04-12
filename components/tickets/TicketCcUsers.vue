<template>
  <div class="ticket-cc-users">
    <!-- Toggle header -->
    <div class="d-flex align-center gap-1 px-3 py-1 border-b cc-header" @click="expanded = !expanded">
      <v-icon size="16" color="primary">mdi-account-multiple-plus-outline</v-icon>
      <span class="text-caption font-weight-medium">CC Users</span>
      <v-chip v-if="ccUsers.length" size="x-small" color="primary" variant="tonal" class="ml-1">
        {{ ccUsers.length }}
      </v-chip>
      <v-spacer />
      <v-icon size="16">{{ expanded ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
    </div>

    <!-- Expanded content -->
    <div v-if="expanded" class="pa-2">
      <!-- Current CC users -->
      <div v-if="ccUsers.length" class="d-flex flex-wrap gap-1 mb-2">
        <v-chip
          v-for="user in ccUsers"
          :key="user.id"
          size="small"
          variant="tonal"
          color="primary"
          closable
          @click:close="removeCcUser(user.id)"
        >
          <v-avatar start size="20" color="primary">
            <span class="text-white" style="font-size: 9px">{{ getInitials(user.name) }}</span>
          </v-avatar>
          {{ user.name }}
        </v-chip>
      </div>
      <div v-else class="text-caption text-medium-emphasis mb-2">No CC users</div>

      <!-- Search and add -->
      <v-autocomplete
        v-model="selectedUserId"
        :items="searchResults"
        :loading="searching"
        item-title="name"
        item-value="id"
        placeholder="Search user to add..."
        density="compact"
        variant="outlined"
        hide-details
        clearable
        no-filter
        class="cc-search"
        @update:search="onSearch"
        @update:model-value="onSelect"
      >
        <template #item="{ item, props: itemProps }">
          <v-list-item v-bind="itemProps">
            <template #prepend>
              <v-avatar size="28" color="primary" class="mr-2">
                <span class="text-white text-caption">{{ getInitials(item.raw.name) }}</span>
              </v-avatar>
            </template>
            <v-list-item-subtitle>{{ item.raw.email }}</v-list-item-subtitle>
          </v-list-item>
        </template>
      </v-autocomplete>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ICcUser } from '~/repository/modules/catalogs/requestCcUsers'

const props = defineProps<{
  ticketType: string
  ticketId: number
}>()

const { $api } = useNuxtApp()

const expanded = ref(false)
const ccUsers = ref<ICcUser[]>([])
const searchResults = ref<ICcUser[]>([])
const searching = ref(false)
const selectedUserId = ref<number | null>(null)
let searchTimeout: ReturnType<typeof setTimeout> | null = null

const loadCcUsers = async () => {
  try {
    ccUsers.value = await $api.requestCcUsers.getCcUsers(props.ticketType, props.ticketId)
  } catch {
    ccUsers.value = []
  }
}

const onSearch = (query: string) => {
  if (searchTimeout) clearTimeout(searchTimeout)
  if (!query || query.length < 2) {
    searchResults.value = []
    return
  }
  searchTimeout = setTimeout(async () => {
    searching.value = true
    try {
      const results = await $api.requestCcUsers.searchAvailableUsers(query)
      // Filter out users already in CC
      const existingIds = ccUsers.value.map((u) => u.id)
      searchResults.value = results.filter((u: ICcUser) => !existingIds.includes(u.id))
    } catch {
      searchResults.value = []
    } finally {
      searching.value = false
    }
  }, 300)
}

const onSelect = async (userId: number | null) => {
  if (!userId) return
  try {
    const res = await $api.requestCcUsers.addCcUsers(props.ticketType, props.ticketId, [userId])
    ccUsers.value = res.cc_users
  } catch (e) {
    console.error('Error adding CC user', e)
  }
  selectedUserId.value = null
  searchResults.value = []
}

const removeCcUser = async (userId: number) => {
  try {
    const res = await $api.requestCcUsers.removeCcUser(props.ticketType, props.ticketId, userId)
    ccUsers.value = res.cc_users
  } catch (e) {
    console.error('Error removing CC user', e)
  }
}

const getInitials = (name: string) => {
  return name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()
}

onMounted(() => {
  loadCcUsers()
})
</script>

<style scoped>
.cc-header {
  cursor: pointer;
  transition: background-color 0.2s;
  background: rgba(var(--v-theme-primary), 0.03);
}
.cc-header:hover {
  background: rgba(var(--v-theme-primary), 0.06);
}
.cc-search :deep(.v-field) {
  font-size: 0.8rem;
}
</style>
