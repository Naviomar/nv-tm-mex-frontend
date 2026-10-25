<template>
  <div v-if="canStart">
    <v-btn icon="mdi-account-eye-outline" variant="text" title="View as another user" @click="open = true" />

    <v-dialog v-model="open" max-width="560">
      <v-card>
        <v-card-title class="d-flex align-center ga-2">
          <v-icon color="primary">mdi-account-eye-outline</v-icon>
          View as another user
        </v-card-title>
        <v-card-text>
          <div class="text-body-2 text-medium-emphasis mb-3">You will see the system with their permissions and restrictions. It is read only.</div>
          <v-text-field
            v-model="search"
            density="compact"
            variant="outlined"
            label="Search by name or email"
            prepend-inner-icon="mdi-magnify"
            hide-details
            autofocus
            clearable
            @update:model-value="debouncedLoad"
          />
          <div v-if="loading" class="d-flex justify-center pa-6"><v-progress-circular indeterminate color="primary" /></div>
          <v-list v-else lines="two" density="comfortable" class="mt-2 view-as-list">
            <v-list-item
              v-for="item in users"
              :key="item.id"
              :title="item.name"
              :subtitle="item.email"
              :disabled="starting !== null"
              @click="choose(item)"
            >
              <template #append>
                <v-progress-circular v-if="starting === item.id" indeterminate size="20" width="2" />
                <div v-else class="d-flex flex-wrap justify-end ga-1">
                  <v-chip v-for="role in item.roles.slice(0, 2)" :key="role" size="x-small" variant="tonal">{{ role }}</v-chip>
                  <v-chip v-if="item.roles.length > 2" size="x-small" variant="tonal">+{{ item.roles.length - 2 }}</v-chip>
                </div>
              </template>
            </v-list-item>
            <div v-if="!users.length" class="text-center text-medium-emphasis pa-6">No users found.</div>
          </v-list>
        </v-card-text>
        <v-card-actions class="px-5 pb-4">
          <v-spacer />
          <v-btn variant="text" @click="open = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import type { IViewAsUser } from '~/repository/modules/viewAs'

const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const { canStart, start } = useViewAs()

const open = ref(false)
const search = ref('')
const users = ref<IViewAsUser[]>([])
const loading = ref(false)
const starting = ref<number | null>(null)

async function load() {
  loading.value = true
  try {
    users.value = (await $api.viewAs.users(search.value ?? '')).data ?? []
  } catch {
    snackbar.add({ type: 'error', text: 'Could not load the users' })
  } finally {
    loading.value = false
  }
}

let timer: ReturnType<typeof setTimeout> | null = null
function debouncedLoad() {
  if (timer) clearTimeout(timer)
  timer = setTimeout(load, 300)
}

async function choose(item: IViewAsUser) {
  starting.value = item.id
  try {
    await start(item)
  } catch (error: any) {
    starting.value = null
    snackbar.add({ type: 'error', text: error?.data?.message ?? 'Could not start the view' })
  }
}

watch(open, (value) => {
  if (value) load()
})
</script>

<style scoped>
.view-as-list {
  max-height: 50vh;
  overflow-y: auto;
}
</style>
