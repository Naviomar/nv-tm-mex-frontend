<template>
  <div>
    <v-card variant="flat" class="mb-4 rounded-lg" bg-color="grey-lighten-5">
      <v-card-text class="pb-2">
        <div class="grid grid-cols-6 gap-4">
          <div class="col-span-2">
            <v-text-field
              density="compact"
              label="Name"
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              hide-details
              v-model="filters.name"
              @keyup.enter="getDepartments"
            />
          </div>
          <div class="col-span-2">
            <v-autocomplete
              density="compact"
              label="Status"
              variant="outlined"
              v-model="filters.deleted_status"
              :items="deletedStatus"
              item-title="name"
              item-value="value"
              @keyup.enter="getDepartments"
              hide-details
            />
          </div>
        </div>
        <div class="flex gap-2 mt-3">
          <v-btn color="secondary" variant="outlined" @click="clearFilters">Clear</v-btn>
          <v-btn color="primary" prepend-icon="mdi-magnify" @click="getDepartments">Search</v-btn>
        </div>
      </v-card-text>
    </v-card>

    <div v-if="departments.data.length > 0" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      <v-card
        v-for="(department, index) in departments.data"
        :key="`department-${index}`"
        variant="flat"
        class="department-card rounded-lg"
        :class="{ 'department-card--deleted': department.deleted_at }"
      >
        <v-card-text>
          <div class="d-flex align-start justify-space-between">
            <div class="d-flex align-center gap-3">
              <v-avatar color="primary" size="44" rounded="lg">
                <v-icon size="22" color="white">mdi-office-building</v-icon>
              </v-avatar>
              <div>
                <div class="text-subtitle-1 font-weight-bold leading-tight">{{ department.name }}</div>
                <UserInfoBadge :item="department">
                  <span class="text-caption text-grey-darken-1">{{ formatDateString(department.created_at) }}</span>
                </UserInfoBadge>
              </div>
            </div>
            <v-chip v-if="department.deleted_at" size="x-small" color="error" variant="flat">Deleted</v-chip>
          </div>

          <div class="text-body-2 text-grey-darken-2 mt-3 department-card__description">
            {{ department.description || 'No description provided.' }}
          </div>

          <v-divider class="my-3" />

          <div class="d-flex align-center justify-space-between">
            <v-chip size="small" variant="tonal" color="primary" prepend-icon="mdi-account-group">
              {{ department.users_count }} {{ department.users_count === 1 ? 'user' : 'users' }}
            </v-chip>
            <div class="d-flex gap-2">
              <div v-if="whoRolEdit(department.name) === 'true'">
                <EditButton :item="department" @click="editDepartments(department)" />
              </div>
              <div v-if="whoRolDelete(department.name) === 'true'">
                <TrashButton :item="department" @click="showConfirmDelete" />
              </div>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </div>

    <v-card v-else variant="flat" class="rounded-lg" bg-color="grey-lighten-5">
      <v-card-text class="text-center py-12">
        <v-icon size="48" color="grey-lighten-1">mdi-office-building-outline</v-icon>
        <div class="mt-3 text-grey-darken-1 font-weight-medium">No departments found.</div>
        <div class="text-caption text-grey-darken-1 mt-1">Adjust your filters or add a new department.</div>
      </v-card-text>
    </v-card>

    <div class="d-flex justify-center mt-4">
      <v-pagination
        v-model="departments.current_page"
        :length="departments.last_page"
        rounded="circle"
        density="compact"
        @update:model-value="onClickPagination"
      ></v-pagination>
    </div>
  </div>
</template>
<script setup lang="ts">
import { deletedStatus } from '@/utils/data/systemData'
const { $api, $notifications } = useNuxtApp()
const snackbar = useSnackbar()
const confirm = $notifications.useConfirm()
const loadingStore = useLoadingStore()
const router = useRouter()
const { user } = useCheckUser()

const filters = ref<any>({
  name: '',
  airlineId: null,
  deleted_status: null,
})

const departments = ref<any>({
  data: [],
  current_page: 1,
  page: 1,
  perPage: 25,
  last_page: 1,
})

const whoRolEdit = (nameDep: any): string => {
  var canEdit = 'false';
  var allRol = user.value?.roles
  var idRol = 0
  //console.log("name:",nameDep)
  //console.log("---roles---",user.value?.roles);

  for(var i=0; i<allRol.length; i++){
    idRol = allRol[i].id
    //console.log("all:",idRol)

    if(idRol === 1){
      canEdit = 'true';
    }

    if(nameDep === 'Sea Import' && idRol === 4){
      canEdit = 'true';
    }

    if(nameDep === 'Sea Export' && idRol === 5){
      canEdit = 'true';
    }

    if(nameDep === 'Air Import' && idRol === 6){
      canEdit = 'true';
    }

    if(nameDep === 'Air Export' && idRol === 7){
      canEdit = 'true';
    }

    if(nameDep === 'Finance' && idRol === 8){
      canEdit = 'true';
    }

    if(nameDep === 'Accounting' && idRol === 9){
      canEdit = 'true';
    }

    if(nameDep === 'IT' && idRol === 10){
      canEdit = 'true';
    }

    if(nameDep === 'Billing' && idRol === 11){
      canEdit = 'true';
    }
  }

  return canEdit;
}

const whoRolDelete = (nameDep: any): string => {
  var canDelete = 'false';
  var allRolDel = user.value?.roles
  var idRolDel = 0
  //console.log("name:",nameDep)
  //console.log("---roles---",user.value?.roles);

  for(var i=0; i<allRolDel.length; i++){
    idRolDel = allRolDel[i].id
    //console.log("all:",idRolDel)

    if(idRolDel === 1){
      canDelete = 'true';
    }
  }

  return canDelete;
}

const onClickPagination = async (page: number) => {
  departments.value.current_page = page
  await getDepartments()
}

const viewDepartments = (department: any) => {
  router.push(`/system/departments/view-${department.id}`)
}

const editDepartments = async (department: any) => {
  router.push(`/system/departments/edit-${department.id}`)
}

const showConfirmDelete = async (department: any) => {
  const result = await confirm({
    title: 'Are you sure?',
    confirmationText: 'Update',
    content: 'Please confirm you want to delete or restore it.',
    dialogProps: {
      persistent: true,
      maxWidth: 500,
    },
    confirmationButtonProps: {
      color: 'primary',
    },
  })

  if (result) {
    try {
      loadingStore.start()
      await $api.departments.delete(department.id)
      snackbar.add({ type: 'success', text: 'Department deleted' })
      await getDepartments()
    } catch (e) {
      console.error(e)
    } finally {
      setTimeout(() => {
        loadingStore.stop()
      }, 250)
    }
  }
}

const getDepartments = async () => {
  try {
    loadingStore.start()
    const response = await $api.departments.getDepartments({
      query: {
        page: departments.value.current_page,
        perPage: departments.value.perPage,
        ...flattenArraysToCommaSeparatedString(filters.value),
      },
    })

    departments.value = response as any
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const clearFilters = async () => {
  filters.value = {
    name: '',
    airlineId: null,
    deleted_status: null,
  }
  await getDepartments()
}

onMounted(async () => {
  await getDepartments()
})
</script>
<style scoped>
.department-card {
  transition: box-shadow 0.2s ease, transform 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}
.department-card:hover {
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}
.department-card--deleted {
  opacity: 0.75;
  background-color: rgba(var(--v-theme-error), 0.04);
}
.department-card__description {
  min-height: 2.5em;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
