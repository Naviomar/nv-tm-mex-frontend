<template>
  <div>
    <v-btn-toggle v-model="model.scope" mandatory density="compact" color="primary" variant="outlined" divided class="mb-3 flex-wrap">
      <v-btn value="all" prepend-icon="mdi-account-group">All users</v-btn>
      <v-btn v-if="catalogs.departments.length" value="departments" prepend-icon="mdi-domain">Departments</v-btn>
      <v-btn value="roles" prepend-icon="mdi-shield-account-outline">Roles</v-btn>
      <v-btn value="users" prepend-icon="mdi-account-outline">Users</v-btn>
    </v-btn-toggle>

    <v-autocomplete
      v-if="model.scope === 'departments'"
      v-model="model.department_ids"
      :items="catalogs.departments"
      item-title="name"
      item-value="id"
      label="Departments (sub-departments included)"
      multiple
      chips
      closable-chips
      density="comfortable"
      variant="outlined"
    />
    <v-autocomplete
      v-if="model.scope === 'roles'"
      v-model="model.role_ids"
      :items="catalogs.roles"
      item-title="name"
      item-value="id"
      label="Roles"
      multiple
      chips
      closable-chips
      density="comfortable"
      variant="outlined"
    />
    <v-autocomplete
      v-if="model.scope === 'users'"
      v-model="model.user_ids"
      :items="catalogs.users"
      :item-title="(u: any) => `${u.name} · ${u.email}`"
      item-value="id"
      label="Users"
      multiple
      chips
      closable-chips
      density="comfortable"
      variant="outlined"
    />

    <v-checkbox v-model="model.include_inactive" label="Include inactive users" density="compact" hide-details class="mb-2" />

    <div class="d-flex align-center ga-3">
      <v-btn size="small" variant="tonal" prepend-icon="mdi-account-search-outline" :loading="loading" :disabled="!ready" @click="loadPreview">
        Preview affected users
      </v-btn>
      <span v-if="preview" class="text-body-2">
        <strong>{{ preview.count }}</strong> user(s)
        <v-chip v-if="preview.includes_me" color="warning" size="x-small" class="ml-2">Includes you</v-chip>
      </span>
    </div>

    <v-expand-transition>
      <div v-if="preview && preview.users.length" class="preview-list tm-border rounded mt-2">
        <div v-for="u in preview.users" :key="u.id" class="d-flex align-center px-3 py-1 text-body-2">
          <span class="flex-grow-1">{{ u.name }} <span class="text-medium-emphasis">· {{ u.email }}</span></span>
          <v-chip v-if="!u.is_active" size="x-small" color="error" variant="tonal" class="ml-1">inactive</v-chip>
          <v-chip v-if="u.must_change_password" size="x-small" color="warning" variant="tonal" class="ml-1">must change pwd</v-chip>
          <v-chip v-if="u.two_factor_enabled" size="x-small" color="success" variant="tonal" class="ml-1">2FA</v-chip>
          <v-chip v-else-if="u.two_factor_required" size="x-small" color="primary" variant="tonal" class="ml-1">2FA required</v-chip>
        </div>
      </div>
    </v-expand-transition>
  </div>
</template>

<script setup lang="ts">
import type { SecurityTarget } from '~/repository/modules/accountSecurity'

const props = defineProps<{ catalogs: { departments: any[]; roles: any[]; users: any[] } }>()
const model = defineModel<SecurityTarget>({ required: true })
const emit = defineEmits<{ (e: 'preview', preview: any): void }>()

const { $api } = useNuxtApp()
const loading = ref(false)
const preview = ref<any>(null)

const ready = computed(() => {
  switch (model.value.scope) {
    case 'departments':
      return !!model.value.department_ids?.length
    case 'roles':
      return !!model.value.role_ids?.length
    case 'users':
      return !!model.value.user_ids?.length
    default:
      return true
  }
})

// Cualquier cambio de alcance invalida la vista previa anterior.
watch(model, () => {
  preview.value = null
  emit('preview', null)
}, { deep: true })

async function loadPreview() {
  loading.value = true
  try {
    preview.value = await $api.accountSecurity.preview(model.value)
    emit('preview', preview.value)
  } finally {
    loading.value = false
  }
}

defineExpose({ loadPreview, ready })
</script>

<style scoped>
.preview-list {
  max-height: 240px;
  overflow-y: auto;
}
</style>
