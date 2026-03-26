<template>
  <div>
    <v-container fluid>
      <v-btn @click="$router.back()" variant="outlined" size="small" class="mb-4">Back</v-btn>
      <v-card>
        <v-card-title>Demurrage Reports</v-card-title>
        <v-card-text>
          <div class="flex">
            <v-tabs v-model="tab" color="primary" direction="vertical">
              <v-tab prepend-icon="mdi-file-chart-outline" text="Estatus" value="option-1"></v-tab>
            </v-tabs>

            <v-tabs-window v-model="tab">
              <v-tabs-window-item value="option-1">
                <v-card flat>
                  <v-card-text>
                    <DemurrageReportStatusWidget />
                  </v-card-text>
                </v-card>
              </v-tabs-window-item>
            </v-tabs-window>
          </div>
        </v-card-text>
      </v-card>
    </v-container>
  </div>
</template>
<script setup lang="ts">
import { menuPermissions } from '~/utils/data/system'

definePageMeta({
  title: 'Demurrages Reports',
  layout: 'default',
})

const router = useRouter()
const { hasPermission } = useCheckUser()

// Check permissions and redirect if not authorized
if (!hasPermission(menuPermissions.MaritimeImportDemurragesReports)) {
  throw createError({
    statusCode: 403,
    statusMessage: 'Access denied: Insufficient permissions for demurrage reports'
  })
}

const tab = ref('option-1')
</script>
