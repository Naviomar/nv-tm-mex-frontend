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
            <v-icon v-bind="props" @click="toggleDetails">mdi mdi-account-details</v-icon>
          </template>

          <div class="">User permissions details</div>
        </v-tooltip>
      </div>
    </div>

    <!-- Details Modal -->
   <v-dialog v-model="showDetails" max-width="700" persistent scrollable>
      <v-card>
        <v-toolbar color="primary" density="compact">
          <v-toolbar-title>
            <v-icon class="mr-2">mdi-key-variant</v-icon>
            Edit Permissions: 
          </v-toolbar-title>
          <v-spacer />
          <v-btn icon @click="showDetails = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>
        <v-card-text class="pa-0" style="max-height: 60vh">
          <v-text-field
            
            prepend-inner-icon="mdi-magnify"
            placeholder="Search permissions..."
            density="compact"
            hide-details
            clearable
            class="ma-4"
            variant="outlined"
          />
          <v-list density="compact" class="py-0">
            <v-list-item
              class="border-b"
              v-for="(permission, index) in linkedPermissions" :key="`perm-${index}`"
            >
              <v-list-item-title></v-list-item-title>
              {{ permission.name }}
              <!--template #append>
                <TrashButton :item="permission" @click="unlinkPermission(permission)" />
              </template-->
            </v-list-item>
            <v-list-item >
              <v-list-item-title class="text-center text-grey py-4">
                No permissions match your search
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-card-text>
        <v-divider />
        <v-card-actions class="pa-4">
          <div class="text-caption text-grey">
             permission(s) selected
          </div>
          <v-spacer />
          <!--v-btn variant="text" @click="editPermissionsModal.show = false">Cancel</v-btn-->
          <v-btn color="primary" @click="showDetails = false">Close</v-btn>
          <v-btn color="primary" variant="flat" @click="" >
            Save Changes
          </v-btn>
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
})

const usersStore = useUsersStore()
const permissions = ref<any>([])
const linkedPermissions = ref<any>([])

const availablePermissions = computed(() => {
  
})

watch(
  () => props.id,
  async (id) => {
    if (id) {
      const response = (await $api.departments.getById(id)) as any
      linkedPermissions.value = response.permissions || []
    }
  },
  { immediate: true }
)

// Reactive states for tooltip and dialog
const showDetails = ref(false)

// Method to toggle the details modal
function toggleDetails() {
  showDetails.value = !showDetails.value
}


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
