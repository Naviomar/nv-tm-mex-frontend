<template>
  <v-card class="reports-shell" elevation="2" rounded="lg">
    <div class="shell-layout">
      <!-- Department rail -->
      <div class="dept-rail">
        <div class="dept-rail-title">Departments</div>
        <v-list density="comfortable" nav class="dept-list">
          <v-list-item
            v-for="dept in departments"
            :key="dept.key"
            :active="dept.key === activeDeptKey"
            :base-color="dept.key === activeDeptKey ? dept.color : undefined"
            rounded="lg"
            @click="selectDept(dept.key)"
          >
            <template #prepend>
              <v-icon :color="dept.color">{{ dept.icon }}</v-icon>
            </template>
            <v-list-item-title>{{ dept.title }}</v-list-item-title>
            <template #append>
              <v-chip
                v-if="visibleReportsForDept(dept).length"
                size="x-small"
                :color="dept.color"
                variant="flat"
              >{{ visibleReportsForDept(dept).length }}</v-chip>
              <v-chip v-else size="x-small" color="grey" variant="tonal">soon</v-chip>
            </template>
          </v-list-item>
        </v-list>
      </div>

      <!-- Content -->
      <div class="dept-content">
        <Transition name="dept-swap" mode="out-in">
          <div v-if="activeDept" :key="activeDept.key">
            <div v-if="visibleReports.length" class="content-inner">
              <v-tabs
                v-model="activeReportKey"
                :color="activeDept.color"
                show-arrows
                class="report-tabs mb-4"
              >
                <v-tab
                  v-for="report in visibleReports"
                  :key="report.key"
                  :value="report.key"
                  class="text-none"
                >
                  <v-icon start size="18">{{ report.icon }}</v-icon>
                  {{ report.title }}
                </v-tab>
              </v-tabs>

              <div class="report-panel">
                <Transition name="panel-fade" mode="out-in">
                  <component :is="resolvedComponent" v-if="resolvedComponent" :key="activeReport?.key" />
                </Transition>
              </div>
            </div>

            <ComingSoon
              v-else
              :title="activeDept.title"
              :icon="activeDept.icon"
              :color="activeDept.color"
            />
          </div>
        </Transition>
      </div>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import {
  SeaImportReports,
  ImportRepoReport,
  ProfitsGralReport,
  CobranzaReport,
  PaymentsHistoryReport,
  MovementPaymentsReport,
  CustomerInvoicesReport,
  ChargesPendingInvoiceReport,
  ExecutiveReport,
} from '#components'
import { REPORT_DEPARTMENTS, type ReportDept } from './departments'
import { useCheckUser } from '~/composables/useCheckUser'

const { hasPermission } = useCheckUser()

const departments = computed(() =>
  REPORT_DEPARTMENTS.filter(dept => {
    if (dept.reports.length === 0) return true
    return dept.reports.some(r => !r.permission || hasPermission(r.permission))
  })
)

const visibleReports = computed(() =>
  activeDept.value?.reports.filter(r => !r.permission || hasPermission(r.permission)) ?? []
)

const visibleReportsForDept = (dept: ReportDept) =>
  dept.reports.filter(r => !r.permission || hasPermission(r.permission))

// Explicit map from the component name used in departments.ts to the actual
// component. Importing from '#components' is the Nuxt-supported way to reference
// auto-imported components in <script>, avoiding string-based resolution failures.
const componentMap: Record<string, any> = {
  SeaImportReports,
  ImportRepoReport,
  ProfitsGralReport,
  CobranzaReport,
  PaymentsHistoryReport,
  MovementPaymentsReport,
  CustomerInvoicesReport,
  ChargesPendingInvoiceReport,
  ExecutiveReport,
}

const activeDeptKey = ref<string>(departments.value[0]?.key ?? '')
const activeReportKey = ref<string>(departments.value[0]?.reports[0]?.key ?? '')

const activeDept = computed(() => departments.value.find(d => d.key === activeDeptKey.value) ?? null)
const activeReport = computed(() =>
  visibleReports.value.find(r => r.key === activeReportKey.value) ?? visibleReports.value[0] ?? null
)

// Nuxt auto-imported components don't resolve from a plain string in <component :is>,
// so resolve the name to the actual component definition.
const resolvedComponent = computed(() => {
  const name = activeReport.value?.component
  return name ? componentMap[name] ?? null : null
})

const selectDept = (key: string) => {
  activeDeptKey.value = key
  const dept = departments.value.find(d => d.key === key)
  activeReportKey.value = dept?.reports[0]?.key ?? ''
}
</script>

<style scoped>
.reports-shell {
  overflow: hidden;
}
.shell-layout {
  display: flex;
  min-height: 640px;
}
.dept-rail {
  width: 252px;
  flex-shrink: 0;
  border-right: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  padding: 18px 12px;
  background: linear-gradient(
    180deg,
    rgba(var(--v-theme-on-surface), 0.025) 0%,
    rgba(var(--v-theme-on-surface), 0.005) 100%
  );
}
.dept-rail-title {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  color: rgba(var(--v-theme-on-surface), 0.5);
  padding: 4px 12px 12px;
}

/* Rail items: animated accent bar + smooth hover lift */
.dept-list :deep(.v-list-item) {
  position: relative;
  margin-bottom: 4px;
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1),
    background-color 0.25s ease;
  overflow: visible;
}
.dept-list :deep(.v-list-item)::before {
  content: '';
  position: absolute;
  left: -12px;
  top: 50%;
  transform: translateY(-50%) scaleY(0);
  width: 4px;
  height: 60%;
  border-radius: 0 4px 4px 0;
  background: currentColor;
  transition: transform 0.28s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.dept-list :deep(.v-list-item--active)::before {
  transform: translateY(-50%) scaleY(1);
}
.dept-list :deep(.v-list-item:not(.v-list-item--active):hover) {
  transform: translateX(3px);
}
.dept-list :deep(.v-list-item__prepend > .v-icon) {
  transition: transform 0.28s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.dept-list :deep(.v-list-item--active .v-list-item__prepend > .v-icon) {
  transform: scale(1.15);
}

.dept-content {
  flex: 1;
  min-width: 0;
  padding: 22px 26px;
}
.report-tabs {
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

/* Department swap transition */
.dept-swap-enter-active,
.dept-swap-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.dept-swap-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.dept-swap-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* Report panel swap transition */
.panel-fade-enter-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.panel-fade-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}
.panel-fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.panel-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

@media (max-width: 960px) {
  .shell-layout {
    flex-direction: column;
  }
  .dept-rail {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  }
  .dept-list :deep(.v-list-item)::before {
    display: none;
  }
}
</style>
