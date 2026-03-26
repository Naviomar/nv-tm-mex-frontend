<template>
  <v-container fluid>
    <v-btn @click="router.back()" variant="outlined" size="small" class="mb-4">Back</v-btn>
    <div class="flex items-center gap-2">
      <v-icon>mdi-counter</v-icon>
      <h1 class="text-xl font-bold">Demurrages - Import Maritime</h1>
    </div>
    <div class="pt-4">
      <DemurrageSeaImportTable />
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { menuPermissions } from '~/utils/data/system'

definePageMeta({
  title: 'Demurrages Import - Maritime',
  layout: 'default',
})

const router = useRouter()
const { hasPermission } = useCheckUser()

// Check permissions and redirect if not authorized
if (!hasPermission(menuPermissions.MaritimeImportDemurragesSearch)) {
  throw createError({
    statusCode: 403,
    statusMessage: 'Access denied: Insufficient permissions for demurrage search'
  })
}
</script>
