<template>
  <v-container fluid>
    <!-- Header -->
    <div class="d-flex align-center justify-space-between mb-6">
      <div class="d-flex align-center gap-3">
        <v-avatar color="primary" size="44" rounded="lg">
          <v-icon size="24" color="white">mdi-office-building-cog</v-icon>
        </v-avatar>
        <div>
          <div class="text-caption text-grey-darken-1 font-weight-medium text-uppercase tracking-wide">
            Administration
          </div>
          <h1 class="text-h5 font-weight-bold leading-tight">
            {{ currentDept ? currentDept.name : 'My Department' }}
          </h1>
        </div>
      </div>

      <!-- Department selector when multiple (chips instead of tabs) -->
      <div v-if="managedDepartments.length > 1" class="d-flex gap-2 flex-wrap justify-end">
        <v-chip
          v-for="dept in managedDepartments"
          :key="dept.id"
          :color="selectedDeptId === String(dept.id) ? 'primary' : undefined"
          :variant="selectedDeptId === String(dept.id) ? 'flat' : 'outlined'"
          class="cursor-pointer"
          @click="selectedDeptId = String(dept.id)"
        >
          <v-icon start size="small">mdi-office-building</v-icon>
          {{ dept.name }}
        </v-chip>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="d-flex justify-center py-16">
      <div class="text-center">
        <v-progress-circular indeterminate color="primary" size="48" />
        <div class="mt-3 text-caption text-grey">Loading department...</div>
      </div>
    </div>

    <!-- No departments -->
    <v-alert v-else-if="!loading && managedDepartments.length === 0" type="warning" variant="tonal" class="mt-4">
      <template #title>No department assigned</template>
      You are not assigned as administrator of any department. Contact IT to get your admin role linked to a department.
    </v-alert>

    <!-- Department form -->
    <DepartmentAdminForm
      v-else-if="selectedDeptId"
      :id="selectedDeptId"
    />
  </v-container>
</template>

<script setup lang="ts">
const { $api } = useNuxtApp()
const snackbar = useSnackbar()

definePageMeta({
  title: 'My Department',
  layout: 'default',
})

const loading = ref(true)
const managedDepartments = ref<any[]>([])
const selectedDeptId = ref<string | null>(null)

const currentDept = computed(() =>
  managedDepartments.value.find((d) => String(d.id) === selectedDeptId.value) ?? null
)

onMounted(async () => {
  try {
    loading.value = true
    const result = (await $api.departments.getMyManagedDepartments()) as any[]
    managedDepartments.value = result ?? []
    if (managedDepartments.value.length > 0) {
      selectedDeptId.value = String(managedDepartments.value[0].id)
    }
  } catch (e) {
    console.error(e)
    snackbar.add({ type: 'error', text: 'Error loading your managed departments.' })
  } finally {
    loading.value = false
  }
})
</script>
