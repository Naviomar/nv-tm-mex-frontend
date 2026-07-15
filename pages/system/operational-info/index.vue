<template>
  <div class="operational-info-page">
    <v-container fluid class="pa-6">
      <!-- Header -->
      <div class="d-flex align-center ga-3 mb-6">
        <v-avatar color="indigo-darken-2" size="48" rounded="lg">
          <v-icon color="white" size="28">mdi-monitor-dashboard</v-icon>
        </v-avatar>
        <div>
          <h1 class="text-h4 font-weight-bold">Operational Info</h1>
          <p class="text-body-2 text-grey-darken-1 mb-0">Dashboard operativo y reporte diario</p>
        </div>
      </div>

      <v-tabs v-model="activeTab" color="indigo" class="mb-4">
        <v-tab value="dashboard">
          <v-icon start>mdi-view-dashboard-outline</v-icon>
          Dashboard
        </v-tab>
        <v-tab value="report">
          <v-icon start>mdi-file-document-edit-outline</v-icon>
          Reporte Diario
        </v-tab>
      </v-tabs>

      <v-window v-model="activeTab">
        <!-- ==================== DASHBOARD ==================== -->
        <v-window-item value="dashboard">
          <v-card variant="flat" rounded="xl" class="pa-4 mb-4 elevation-1">
            <v-row dense align="center">
              <v-col cols="6" md="3">
                <v-text-field v-model="dashboardFrom" type="date" label="Desde" density="comfortable" variant="outlined" hide-details />
              </v-col>
              <v-col cols="6" md="3">
                <v-text-field v-model="dashboardTo" type="date" label="Hasta" density="comfortable" variant="outlined" hide-details />
              </v-col>
              <v-col cols="12" md="2">
                <v-btn color="indigo" variant="flat" prepend-icon="mdi-refresh" :loading="opInfo.state.isDashboardLoading" @click="loadDashboard">
                  Actualizar
                </v-btn>
              </v-col>
            </v-row>
          </v-card>

          <template v-if="opInfo.state.dashboard">
            <!-- Salud de correos -->
            <div class="text-subtitle-1 font-weight-bold mb-2">Salud de correos</div>
            <v-row dense class="mb-6">
              <v-col cols="12" sm="6" md="3">
                <v-card variant="flat" rounded="xl" class="pa-4 elevation-1 metric-card metric-teal">
                  <div class="text-caption text-grey-darken-1 mb-1">Enviados hoy</div>
                  <div class="text-h4 font-weight-black text-teal-darken-2">{{ opInfo.state.dashboard.mail_health.sent_today }}</div>
                </v-card>
              </v-col>
              <v-col cols="12" sm="6" md="3">
                <v-card variant="flat" rounded="xl" class="pa-4 elevation-1 metric-card metric-red">
                  <div class="text-caption text-grey-darken-1 mb-1">Sin destinatario hoy</div>
                  <div class="text-h4 font-weight-black text-red-darken-2">{{ opInfo.state.dashboard.mail_health.no_recipient_today }}</div>
                </v-card>
              </v-col>
              <v-col cols="12" sm="6" md="3">
                <v-card variant="flat" rounded="xl" class="pa-4 elevation-1 metric-card metric-indigo">
                  <div class="text-caption text-grey-darken-1 mb-1">Total hoy</div>
                  <div class="text-h4 font-weight-black text-indigo-darken-2">{{ opInfo.state.dashboard.mail_health.total_today }}</div>
                </v-card>
              </v-col>
              <v-col cols="12" sm="6" md="3">
                <v-card variant="flat" rounded="xl" class="pa-4 elevation-1 metric-card metric-blue">
                  <div class="text-caption text-grey-darken-1 mb-1">Última hora</div>
                  <div class="text-h4 font-weight-black text-blue-darken-2">{{ opInfo.state.dashboard.mail_health.total_last_hour }}</div>
                </v-card>
              </v-col>
            </v-row>

            <!-- Alertas abiertas -->
            <div class="text-subtitle-1 font-weight-bold mb-2">Alertas abiertas</div>
            <v-row dense class="mb-6">
              <v-col cols="12" sm="6">
                <v-card variant="flat" rounded="xl" class="pa-4 elevation-1 metric-card metric-red">
                  <div class="text-caption text-grey-darken-1 mb-1">Total sin resolver</div>
                  <div class="text-h4 font-weight-black text-red-darken-2">{{ opInfo.state.dashboard.open_alerts.total_unresolved }}</div>
                </v-card>
              </v-col>
              <v-col cols="12" sm="6">
                <v-card variant="flat" rounded="xl" class="pa-4 elevation-1 metric-card metric-orange">
                  <div class="text-caption text-grey-darken-1 mb-1">Correo sin destinatario (TO)</div>
                  <div class="text-h4 font-weight-black text-orange-darken-2">{{ opInfo.state.dashboard.open_alerts.missing_recipient }}</div>
                </v-card>
              </v-col>
            </v-row>

            <!-- Facturación (reutiliza Usage Statistics) -->
            <div class="text-subtitle-1 font-weight-bold mb-2">Facturación e invoicing</div>
            <v-row dense class="mb-6">
              <v-col cols="6" md="3">
                <v-card variant="flat" rounded="xl" class="pa-4 elevation-1 metric-card metric-indigo">
                  <div class="text-caption text-grey-darken-1 mb-1">TM Facturas</div>
                  <div class="text-h5 font-weight-black">{{ sumValues(opInfo.state.dashboard.usage?.invoices?.tm?.invoice) }}</div>
                </v-card>
              </v-col>
              <v-col cols="6" md="3">
                <v-card variant="flat" rounded="xl" class="pa-4 elevation-1 metric-card metric-indigo">
                  <div class="text-caption text-grey-darken-1 mb-1">WM Facturas</div>
                  <div class="text-h5 font-weight-black">{{ sumValues(opInfo.state.dashboard.usage?.invoices?.wm?.invoice) }}</div>
                </v-card>
              </v-col>
              <v-col cols="6" md="3">
                <v-card variant="flat" rounded="xl" class="pa-4 elevation-1 metric-card metric-teal">
                  <div class="text-caption text-grey-darken-1 mb-1">Referencias Sea Import</div>
                  <div class="text-h5 font-weight-black">{{ sumValues(opInfo.state.dashboard.usage?.references?.sea_import) }}</div>
                </v-card>
              </v-col>
              <v-col cols="6" md="3">
                <v-card variant="flat" rounded="xl" class="pa-4 elevation-1 metric-card metric-teal">
                  <div class="text-caption text-grey-darken-1 mb-1">Referencias Air Import</div>
                  <div class="text-h5 font-weight-black">{{ sumValues(opInfo.state.dashboard.usage?.references?.air_import) }}</div>
                </v-card>
              </v-col>
            </v-row>
          </template>
          <v-skeleton-loader v-else type="card" />
        </v-window-item>

        <!-- ==================== REPORTE DIARIO ==================== -->
        <v-window-item value="report">
          <v-card variant="flat" rounded="xl" class="pa-4 mb-4 elevation-1">
            <v-row dense align="center">
              <v-col cols="6" md="3">
                <v-text-field v-model="reportDate" type="date" label="Fecha del reporte" density="comfortable" variant="outlined" hide-details />
              </v-col>
              <v-col cols="12" md="4" class="d-flex ga-2">
                <v-btn variant="outlined" color="indigo" prepend-icon="mdi-auto-fix" @click="applySuggestedValues">
                  Autocompletar sugeridos
                </v-btn>
                <v-btn color="indigo" variant="flat" prepend-icon="mdi-content-save" :loading="opInfo.state.isSaving" @click="onSaveReport">
                  Guardar
                </v-btn>
              </v-col>
            </v-row>
          </v-card>

          <v-card variant="flat" rounded="xl" class="pa-4 mb-6 elevation-1">
            <div class="text-subtitle-1 font-weight-bold mb-3">Envíos del día</div>
            <v-row dense>
              <v-col cols="6" md="3">
                <v-text-field v-model.number="form.total_invoices_sent" type="number" label="Total facturas enviadas" density="comfortable" variant="outlined" hide-details />
              </v-col>
              <v-col cols="6" md="3">
                <v-text-field v-model.number="form.clients_sent_count" type="number" label="Clientes a los que se envió" density="comfortable" variant="outlined" hide-details />
              </v-col>
            </v-row>
            <v-row dense class="mt-2">
              <v-col cols="12" md="6">
                <v-textarea v-model="form.incidents_detected" label="Incidencias detectadas" rows="3" density="comfortable" variant="outlined" hide-details />
              </v-col>
              <v-col cols="12" md="6">
                <v-textarea v-model="form.corrections_made" label="Correcciones realizadas" rows="3" density="comfortable" variant="outlined" hide-details />
              </v-col>
              <v-col cols="12" md="6">
                <v-textarea v-model="form.pending" label="Pendientes" rows="3" density="comfortable" variant="outlined" hide-details class="mt-2" />
              </v-col>
              <v-col cols="12" md="6">
                <v-textarea v-model="form.observations" label="Observaciones relevantes" rows="3" density="comfortable" variant="outlined" hide-details class="mt-2" />
              </v-col>
            </v-row>
          </v-card>

          <v-card variant="flat" rounded="xl" class="pa-4 mb-6 elevation-1">
            <div class="text-subtitle-1 font-weight-bold mb-3">Revisión histórica (desde 01-jul-2026)</div>
            <v-row dense>
              <v-col cols="6" md="3">
                <v-text-field v-model.number="form.references_reviewed" type="number" label="Referencias revisadas" density="comfortable" variant="outlined" hide-details />
              </v-col>
              <v-col cols="6" md="3">
                <v-text-field v-model.number="form.references_with_inconsistencies" type="number" label="Con inconsistencias" density="comfortable" variant="outlined" hide-details />
              </v-col>
              <v-col cols="6" md="3">
                <v-text-field v-model.number="form.references_corrected" type="number" label="Corregidas" density="comfortable" variant="outlined" hide-details />
              </v-col>
              <v-col cols="6" md="3">
                <v-text-field v-model.number="form.references_pending_validation" type="number" label="Pendientes por validar" density="comfortable" variant="outlined" hide-details />
              </v-col>
              <v-col cols="12">
                <v-textarea v-model="form.risks_identified" label="Riesgos identificados y acciones preventivas" rows="3" density="comfortable" variant="outlined" hide-details class="mt-2" />
              </v-col>
            </v-row>
          </v-card>

          <!-- Historial -->
          <v-card variant="flat" rounded="xl" class="elevation-1">
            <v-card-title class="pa-4 bg-grey-lighten-5 d-flex align-center">
              <v-icon color="indigo-darken-2" class="mr-2">mdi-history</v-icon>
              <span class="text-h6 font-weight-bold">Historial de reportes</span>
            </v-card-title>
            <v-table density="comfortable">
              <thead>
                <tr>
                  <th class="text-left">Fecha</th>
                  <th class="text-left">Facturas enviadas</th>
                  <th class="text-left">Incidencias</th>
                  <th class="text-left">Estado</th>
                  <th class="text-left">Actualizado por</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="row in opInfo.state.history"
                  :key="row.id"
                  class="history-row"
                  @click="reportDate = row.report_date"
                >
                  <td>{{ row.report_date }}</td>
                  <td>{{ row.total_invoices_sent ?? '—' }}</td>
                  <td class="text-truncate" style="max-width: 260px;">{{ row.incidents_detected || '—' }}</td>
                  <td>
                    <v-chip size="x-small" :color="row.status === 'submitted' ? 'success' : 'grey'" variant="flat">
                      {{ row.status }}
                    </v-chip>
                  </td>
                  <td>{{ row.updater?.name ?? row.creator?.name ?? '—' }}</td>
                </tr>
                <tr v-if="opInfo.state.history.length === 0">
                  <td colspan="5" class="text-center text-grey-darken-1 pa-6">Sin reportes capturados aún</td>
                </tr>
              </tbody>
            </v-table>
          </v-card>
        </v-window-item>
      </v-window>
    </v-container>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  title: 'Operational Info',
  layout: 'default',
})

const opInfo = useOperationalInfo()

const activeTab = ref('dashboard')

const today = () => new Date().toISOString().slice(0, 10)
const daysAgo = (n: number) => {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().slice(0, 10)
}

const dashboardFrom = ref(daysAgo(30))
const dashboardTo = ref(today())
const reportDate = ref(today())

const emptyForm = () => ({
  total_invoices_sent: null as number | null,
  clients_sent_count: null as number | null,
  incidents_detected: '' as string | null,
  corrections_made: '' as string | null,
  pending: '' as string | null,
  observations: '' as string | null,
  references_reviewed: null as number | null,
  references_with_inconsistencies: null as number | null,
  references_corrected: null as number | null,
  references_pending_validation: null as number | null,
  risks_identified: '' as string | null,
})

const form = reactive(emptyForm())

const sumValues = (obj?: Record<string, number>) => {
  if (!obj) return 0
  return Object.values(obj).reduce((sum: number, v: any) => sum + (Number(v) || 0), 0)
}

const loadDashboard = () => {
  opInfo.fetchDashboard(dashboardFrom.value, dashboardTo.value)
}

const loadReportForDate = async () => {
  await opInfo.fetchReportForDate(reportDate.value)
  const report = opInfo.state.currentReport
  Object.assign(form, emptyForm())
  if (report) {
    Object.keys(form).forEach((key) => {
      const k = key as keyof typeof form
      if (report[k] !== undefined) {
        ;(form as any)[k] = report[k]
      }
    })
  }
}

const applySuggestedValues = async () => {
  const suggested = await opInfo.fetchSuggestedValues(reportDate.value)
  if (!suggested) return
  if (suggested.total_invoices_sent !== undefined) {
    form.total_invoices_sent = suggested.total_invoices_sent
  }
  // El resto de campos quedan para que el equipo los valide y capture manualmente.
}

const onSaveReport = async () => {
  try {
    await opInfo.saveReport(reportDate.value, { ...form, status: 'draft' })
  } catch (e) {
    // El error ya se registra en el composable / apiErrorStore global
  }
}

watch(reportDate, () => {
  loadReportForDate()
})

onMounted(async () => {
  await Promise.all([loadDashboard(), loadReportForDate(), opInfo.fetchHistory()])
})
</script>

<style scoped>
.metric-card {
  border: 1px solid rgba(0, 0, 0, 0.08);
  position: relative;
  overflow: hidden;
}

.metric-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  opacity: 0.8;
}

.metric-teal::before { background: rgb(var(--v-theme-teal)); }
.metric-red::before { background: rgb(var(--v-theme-red)); }
.metric-indigo::before { background: rgb(var(--v-theme-indigo)); }
.metric-blue::before { background: rgb(var(--v-theme-blue)); }
.metric-orange::before { background: rgb(var(--v-theme-orange)); }

.history-row {
  cursor: pointer;
}

.history-row:hover {
  background: rgba(63, 81, 181, 0.04);
}
</style>
