<template>
  <div class="relative">
    <!-- Content Slot -->
    <div class="flex gap-2 items-center">
      <div class="content-slot">
        <slot></slot>
      </div>

      <!-- Floating Button -->
      <div class="">
        <v-tooltip location="top">
          <template v-slot:activator="{ props }">
            <v-icon v-bind="props" @click="toggleDetails">mdi-account-question</v-icon>
          </template>

          <div class="">User details</div>
        </v-tooltip>
      </div>
    </div>

    <!-- Details Modal -->
    <v-dialog v-model="showDetails" max-width="400">
      <v-card color="">
        <v-card-title>
          <div class="flex gap-2 items-center">
            <v-icon>mdi-account-details</v-icon>
            <div class="font-bold">Users Information</div>
          </div>
        </v-card-title>
        <v-card-text>
          <v-list lines="three" density="compact">
            <v-list-item v-if="createdBy" :subtitle="createdBy.email" :title="createdBy.name">
              <template v-slot:prepend>
                <v-tooltip location="top">
                  <template v-slot:activator="{ props }">
                    <v-avatar v-bind="props">
                      <v-icon color="green">mdi-creation-outline</v-icon>
                    </v-avatar>
                  </template>
                  <div class="">Created by</div>
                </v-tooltip>
              </template>
              <template v-slot:subtitle="{ subtitle }">
                <div>{{ subtitle }}</div>
                <div class="italic text-xs font-bold">@ {{ formatDateString(item.created_at) }}</div>
              </template>
            </v-list-item>
            <v-list-item v-if="updatedBy" :subtitle="updatedBy.email" :title="updatedBy.name">
              <template v-slot:prepend>
                <v-tooltip location="top">
                  <template v-slot:activator="{ props }">
                    <v-avatar v-bind="props">
                      <v-icon color="amber">mdi-update</v-icon>
                    </v-avatar>
                  </template>
                  <div class="">Last updated by</div>
                </v-tooltip>
              </template>
              <template v-slot:subtitle="{ subtitle }">
                <div>{{ subtitle }}</div>
                <div class="italic text-xs font-bold">@ {{ formatDateString(item.updated_at) }}</div>
              </template>
            </v-list-item>
            <v-list-item
              v-if="deletedBy && props.item.deleted_at != null"
              :subtitle="deletedBy.email"
              :title="deletedBy.name"
            >
              <template v-slot:prepend>
                <v-tooltip location="top">
                  <template v-slot:activator="{ props }">
                    <v-avatar v-bind="props">
                      <v-icon color="red">mdi-delete-outline</v-icon>
                    </v-avatar>
                  </template>
                  <div class="">Deleted by</div>
                </v-tooltip>
              </template>
              <template v-slot:subtitle="{ subtitle }">
                <div>{{ subtitle }}</div>
                <div class="italic text-xs font-bold">@ {{ formatDateString(item.deleted_at) }}</div>
              </template>
            </v-list-item>
          </v-list>
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" size="x-small" @click="showDetails = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
const { $api } = useNuxtApp()

/**
 * Props for the component:
 * - `item`: Object containing the created_by and updated_by and deleted_by fields.
 */
const props = defineProps({
  item: {
    type: Object,
    default: () => null,
  },
  createdByKey: {
    type: String,
    default: 'created_by',
  },
})

const usersStore = useUsersStore()
const createdBy = computed(() => usersStore.getUserById(props.item?.[props.createdByKey]))
const updatedBy = computed(() => usersStore.getUserById(props.item?.updated_by))
const deletedBy = computed(() => usersStore.getUserById(props.item?.deleted_by))

// Reactive states for tooltip and dialog
const showDetails = ref(false)

// Method to toggle the details modal
function toggleDetails() {
  showDetails.value = !showDetails.value
}

onMounted(() => {
  usersStore.ensureUsers($api)
})
</script>

<style scoped>
/* Floating button styles */
.user-info-pin {
  position: fixed;
  bottom: 16px;
  left: 16px;
  z-index: 10;
  background-color: #6200ea;
  color: white;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: transform 0.3s ease;
  cursor: pointer;
}

/* Tooltip styles */
.tooltip {
  position: absolute;
  bottom: 50px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #333;
  color: white;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
}

/* Content slot container */
.content-slot {
  position: relative;
  z-index: 1;
}
</style>
