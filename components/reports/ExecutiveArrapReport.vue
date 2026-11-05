<template>
  <div class="report-container">
    <v-card elevation="0" class="report-card">
      <!-- Header -->
      <div class="report-header">
        <div class="header-content d-flex justify-space-between align-center flex-wrap gap-4">
          <div class="header-left d-flex align-center gap-3">
            <div class="icon-wrapper">
              <v-icon color="white" size="28">mdi-account-tie</v-icon>
            </div>
            <div class="header-text">
              <h2 class="report-title">Reporte Ejecutivo ARRAP & Niveles de Carga por Cliente</h2>
              <p class="report-subtitle">
                Análisis de TEUs, Venta, Compra y Margen por Ejecutivo y Niveles de Carga por Cliente (Ordenado de Mayor a Menor)
              </p>
            </div>
          </div>
          <div class="header-actions d-flex gap-2 align-center">
            <v-menu location="bottom end">
              <template #activator="{ props }">
                <v-btn
                  color="white"
                  variant="flat"
                  class="text-primary font-weight-bold"
                  prepend-icon="mdi-file-excel"
                  append-icon="mdi-chevron-down"
                  :loading="exporting"
                  v-bind="props"
                >
                  Exportar Excel
                </v-btn>
              </template>
              <v-list density="compact" class="py-1">
                <v-list-subheader class="text-caption font-weight-bold text-primary">
                  REPORTE POR EJECUTIVO
                </v-list-subheader>
                <v-list-item @click="downloadExcel(true, 'executives')">
                  <template #prepend>
                    <v-icon color="success" size="20">mdi-table-multiple</v-icon>
                  </template>
                  <v-list-item-title class="font-weight-medium">Ejecutivos - Libro Completo (7 Pestañas)</v-list-item-title>
                  <v-list-item-subtitle class="text-caption">Consolidado General + Marítimo (Total, Impo, Expo) + Aéreo (Total, Impo, Expo)</v-list-item-subtitle>
                </v-list-item>
                <v-list-item @click="downloadExcel(false, 'executives')">
                  <template #prepend>
                    <v-icon color="primary" size="20">mdi-table</v-icon>
                  </template>
                  <v-list-item-title class="font-weight-medium">Ejecutivos - Solo Vista Actual</v-list-item-title>
                  <v-list-item-subtitle class="text-caption">Pestaña única según filtro seleccionado</v-list-item-subtitle>
                </v-list-item>

                <v-divider class="my-1" />

                <v-list-subheader class="text-caption font-weight-bold text-teal">
                  NIVELES DE CARGA POR CLIENTE
                </v-list-subheader>
                <v-list-item @click="downloadExcel(true, 'clients')">
                  <template #prepend>
                    <v-icon color="teal" size="20">mdi-domain</v-icon>
                  </template>
                  <v-list-item-title class="font-weight-medium">Clientes (Niveles de Carga) - Libro Completo (7 Pestañas)</v-list-item-title>
                  <v-list-item-subtitle class="text-caption">Desglose de niveles de carga por cliente en los 7 modos de servicio</v-list-item-subtitle>
                </v-list-item>
                <v-list-item @click="downloadExcel(false, 'clients')">
                  <template #prepend>
                    <v-icon color="info" size="20">mdi-package-variant-closed-check</v-icon>
                  </template>
                  <v-list-item-title class="font-weight-medium">Clientes (Niveles de Carga) - Solo Vista Actual</v-list-item-title>
                  <v-list-item-subtitle class="text-caption">Pestaña única de niveles de carga por cliente</v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-menu>
          </div>
        </div>
      </div>

      <v-card-text class="pa-6">
        <!-- Filters Section -->
        <div class="filters-section mb-6">
          <div class="d-flex justify-space-between align-center mb-3">
            <div class="filters-title">
              <v-icon color="primary" size="20" class="mr-2">mdi-filter-outline</v-icon>
              <span class="font-weight-bold">Filtros del Reporte</span>
            </div>
          </div>

          <!-- Banner Informativo Explícito sobre Datos y Reglas de Negocio -->
          <v-alert
            type="info"
            variant="tonal"
            class="mb-4 text-body-2"
            density="compact"
            icon="mdi-information-outline"
          >
            <div class="d-flex flex-column gap-1">
              <div>
                <strong>Grupo LIVERPOOL y Suburbia:</strong> Agrupa de forma explícita a todas sus divisiones y empresas:
                <em>Distribuidora Liverpool S.A. de C.V., Suburbia S. de R.L. de C.V., Moda Joven Sfera México S.A. de C.V. e Importadora Globastic S.A. de C.V.</em>
              </div>
              <div>
                <strong>Operaciones Multimodales (Marítimo + Aéreo):</strong> Integra de forma homologada tanto el tráfico marítimo (TEUs y contenedores) como el tráfico aéreo (guías y despachos), permitiendo ver el <strong>Consolidado General</strong> o desglosar por modo y servicio (Impo/Expo).
              </div>
              <div>
                <strong>Criterio de Ordenamiento:</strong> Los ejecutivos se ordenan estrictamente de <strong>Mayor a Menor</strong> según volumen generado.
              </div>
              <div>
                <strong>Monitoreo de Rendimiento:</strong> Se incluyen obligatoriamente los ejecutivos con <strong>0 operaciones</strong> para identificar claramente a quienes no están generando operaciones o ingresos en el período.
              </div>
              <div>
                <strong>Consolidación Histórica:</strong> Integra automáticamente la base histórica TM1 (Enero a Junio 2026) con la base operativa TM2 (Julio 2026 en adelante) para un análisis anual 100% completo y unificado.
              </div>
              <div>
                <strong>Moneda Oficial:</strong> Todas las cifras monetarias (Venta, Compra y Profit) están expresadas y calculadas en <strong>Dólares Americanos (USD)</strong>.
              </div>
            </div>
          </v-alert>

          <v-row>
            <v-col cols="12" md="3">
              <v-text-field
                v-model="filters.fromDate"
                type="date"
                label="Fecha Desde"
                density="compact"
                hide-details
                variant="outlined"
                prepend-inner-icon="mdi-calendar-start"
              />
            </v-col>

            <v-col cols="12" md="3">
              <v-text-field
                v-model="filters.toDate"
                type="date"
                label="Fecha Hasta"
                density="compact"
                hide-details
                variant="outlined"
                prepend-inner-icon="mdi-calendar-end"
              />
            </v-col>

            <v-col cols="12" md="3">
              <v-autocomplete
                v-model="filters.executive_id"
                :items="executivesList"
                item-title="name"
                item-value="id"
                label="Filtrar por Ejecutivo"
                density="compact"
                hide-details
                clearable
                variant="outlined"
                prepend-inner-icon="mdi-account-tie"
                auto-select-first
              />
            </v-col>

            <v-col cols="12" md="3">
              <v-select
                v-model="filters.service_type"
                :items="serviceTypeOptions"
                item-title="label"
                item-value="value"
                label="Tipo Servicio"
                density="compact"
                hide-details
                clearable
                variant="outlined"
                prepend-inner-icon="mdi-map-marker-path"
              />
            </v-col>
          </v-row>

          <v-row class="mt-4">
            <v-col cols="12" class="d-flex justify-end gap-2 align-center flex-wrap">
              <v-btn
                variant="text"
                size="small"
                color="primary"
                prepend-icon="mdi-database-clock-outline"
                @click="setTestDataRange"
              >
                Año con datos (2025)
              </v-btn>
              <v-btn
                variant="outlined"
                color="grey"
                prepend-icon="mdi-filter-off"
                @click="clearFilters"
              >
                Limpiar Filtros
              </v-btn>
              <v-btn
                color="primary"
                prepend-icon="mdi-magnify"
                :loading="loadingData"
                @click="fetchReportData"
              >
                Consultar Datos
              </v-btn>
            </v-col>
          </v-row>
        </div>

        <!-- KPI Summary Cards -->
        <div v-if="summary" class="kpi-grid mb-6">
          <v-card class="kpi-card" elevation="0">
            <div class="kpi-body">
              <div class="kpi-icon-wrapper" :class="summary.volume_label === 'KG' ? 'kpi-teal' : 'kpi-blue'">
                <v-icon :color="summary.volume_label === 'KG' ? '#0d9488' : '#2563eb'" size="24">
                  {{ summary.volume_label === 'KG' ? 'mdi-airplane-takeoff' : 'mdi-package-variant-closed' }}
                </v-icon>
              </div>
              <div class="kpi-info">
                <span class="kpi-label">Total {{ summary.volume_label || 'TEUs' }}</span>
                <span class="kpi-value" :class="summary.volume_label === 'KG' ? 'text-teal' : 'text-primary'">{{ formatNumber(summary.total_teus) }}</span>
                <span class="kpi-subtext">{{ summary.volume_label === 'KG' ? 'Kilos operados (Aéreo)' : 'Volumen total operado' }}</span>
              </div>
            </div>
          </v-card>

          <v-card class="kpi-card" elevation="0">
            <div class="kpi-body">
              <div class="kpi-icon-wrapper kpi-green">
                <v-icon color="#16a34a" size="24">mdi-currency-usd</v-icon>
              </div>
              <div class="kpi-info">
                <span class="kpi-label">Total Venta (USD)</span>
                <span class="kpi-value text-success">${{ formatCurrencyMxn(summary.total_sell) }}</span>
                <span class="kpi-subtext">Facturación clientes (USD)</span>
              </div>
            </div>
          </v-card>

          <v-card class="kpi-card" elevation="0">
            <div class="kpi-body">
              <div class="kpi-icon-wrapper kpi-orange">
                <v-icon color="#ea580c" size="24">mdi-cash-minus</v-icon>
              </div>
              <div class="kpi-info">
                <span class="kpi-label">Total Compra (USD)</span>
                <span class="kpi-value text-warning">${{ formatCurrencyMxn(summary.total_buy) }}</span>
                <span class="kpi-subtext">Costos navieras / proveedores (USD)</span>
              </div>
            </div>
          </v-card>

          <v-card class="kpi-card" elevation="0">
            <div class="kpi-body">
              <div class="kpi-icon-wrapper kpi-purple">
                <v-icon color="#9333ea" size="24">mdi-chart-line</v-icon>
              </div>
              <div class="kpi-info">
                <div class="d-flex justify-space-between align-center">
                  <span class="kpi-label">Profit Total (USD)</span>
                  <v-chip size="x-small" color="purple" variant="flat">{{ summary.margin_percent }}%</v-chip>
                </div>
                <span class="kpi-value text-purple">${{ formatCurrencyMxn(summary.total_profit) }}</span>
                <span class="kpi-subtext">Margen global {{ summary.margin_percent }}%</span>
              </div>
            </div>
          </v-card>

          <v-card class="kpi-card" elevation="0">
            <div class="kpi-body">
              <div class="kpi-icon-wrapper kpi-teal">
                <v-icon color="#0d9488" size="24">mdi-account-group</v-icon>
              </div>
              <div class="kpi-info">
                <span class="kpi-label">Ejecutivos</span>
                <div class="d-flex align-center gap-1">
                  <span class="kpi-value text-teal">{{ summary.active_executives }}</span>
                  <span class="text-caption text-grey">activos</span>
                  <span class="text-caption text-grey">/</span>
                  <span class="kpi-value text-error">{{ summary.zero_executives }}</span>
                  <span class="text-caption text-grey">sin {{ summary.volume_label || 'TEUs' }}</span>
                </div>
                <span class="kpi-subtext">Total {{ summary.total_executives }} evaluados</span>
              </div>
            </div>
          </v-card>
        </div>

        <!-- Segmented Quick Operation Selector & Desglose Banner -->
        <div v-if="summary" class="d-flex flex-column gap-3 mb-4">
          <div class="d-flex justify-space-between align-center flex-wrap gap-2">
            <!-- Mode filter buttons -->
            <div class="d-flex align-center flex-wrap gap-2">
              <span class="text-caption font-weight-bold text-grey-darken-1 mr-1">VISTA RÁPIDA:</span>

              <v-btn
                size="small"
                :variant="!filters.service_type ? 'flat' : 'outlined'"
                :color="!filters.service_type ? 'primary' : 'grey-darken-1'"
                class="text-capitalize font-weight-bold"
                prepend-icon="mdi-layers-triple-outline"
                @click="setServiceType(null)"
              >
                🌐 Consolidado General (TODO)
              </v-btn>

              <v-btn
                size="small"
                :variant="filters.service_type === 'sea' ? 'flat' : 'outlined'"
                :color="filters.service_type === 'sea' ? 'primary' : 'grey-darken-1'"
                class="text-capitalize font-weight-medium"
                prepend-icon="mdi-ferry"
                @click="setServiceType('sea')"
              >
                🚢 Marítimo Todo
              </v-btn>

              <v-btn
                size="small"
                :variant="filters.service_type === 'sea_impo' ? 'flat' : 'outlined'"
                :color="filters.service_type === 'sea_impo' ? 'info' : 'grey-darken-1'"
                class="text-capitalize font-weight-medium"
                prepend-icon="mdi-arrow-down-bold-circle-outline"
                @click="setServiceType('sea_impo')"
              >
                Marítimo Impo
              </v-btn>

              <v-btn
                size="small"
                :variant="filters.service_type === 'sea_expo' ? 'flat' : 'outlined'"
                :color="filters.service_type === 'sea_expo' ? 'secondary' : 'grey-darken-1'"
                class="text-capitalize font-weight-medium"
                prepend-icon="mdi-arrow-up-bold-circle-outline"
                @click="setServiceType('sea_expo')"
              >
                Marítimo Expo
              </v-btn>

              <v-divider vertical class="mx-1 my-1" />

              <v-btn
                size="small"
                :variant="filters.service_type === 'air' ? 'flat' : 'outlined'"
                :color="filters.service_type === 'air' ? 'teal' : 'grey-darken-1'"
                class="text-capitalize font-weight-medium"
                prepend-icon="mdi-airplane-takeoff"
                @click="setServiceType('air')"
              >
                ✈️ Aéreo Todo
              </v-btn>

              <v-btn
                size="small"
                :variant="filters.service_type === 'air_impo' ? 'flat' : 'outlined'"
                :color="filters.service_type === 'air_impo' ? 'info' : 'grey-darken-1'"
                class="text-capitalize font-weight-medium"
                prepend-icon="mdi-arrow-down-bold-circle-outline"
                @click="setServiceType('air_impo')"
              >
                Aéreo Impo
              </v-btn>

              <v-btn
                size="small"
                :variant="filters.service_type === 'air_expo' ? 'flat' : 'outlined'"
                :color="filters.service_type === 'air_expo' ? 'secondary' : 'grey-darken-1'"
                class="text-capitalize font-weight-medium"
                prepend-icon="mdi-arrow-up-bold-circle-outline"
                @click="setServiceType('air_expo')"
              >
                Aéreo Expo
              </v-btn>
            </div>

            <!-- Active mode badge -->
            <div class="d-flex align-center gap-2">
              <v-chip
                size="small"
                :color="activeModeColor"
                variant="tonal"
                class="font-weight-medium"
              >
                <v-icon start size="14">{{ activeModeIcon }}</v-icon>
                Vista actual: {{ activeModeLabel }}
              </v-chip>
              <v-btn
                v-if="filters.service_type"
                size="x-small"
                variant="text"
                color="primary"
                prepend-icon="mdi-refresh"
                @click="setServiceType(null)"
              >
                Ver Consolidado
              </v-btn>
            </div>
          </div>

          <!-- Operative Breakdown Cards: Marítimo & Aéreo -->
          <v-row v-if="summary?.service_breakdown" class="mt-1" dense>
            <!-- 🚢 Marítimo Breakdown Card -->
            <v-col cols="12" md="6">
              <v-card
                variant="outlined"
                class="pa-3 rounded-lg"
                :class="{'border-primary bg-blue-lighten-5': filters.service_type === 'sea' || filters.service_type === 'sea_impo' || filters.service_type === 'sea_expo'}"
              >
                <div class="d-flex align-center justify-space-between mb-2">
                  <div class="d-flex align-center gap-2">
                    <v-icon color="primary" size="20">mdi-ferry</v-icon>
                    <span class="font-weight-bold text-subtitle-2 text-primary">OPERACIÓN MARÍTIMA</span>
                  </div>
                  <v-btn
                    size="x-small"
                    variant="tonal"
                    color="primary"
                    prepend-icon="mdi-filter"
                    @click="setServiceType('sea')"
                  >
                    Ver Todo Marítimo
                  </v-btn>
                </div>

                <div class="d-flex align-center justify-space-between flex-wrap gap-2 mb-2">
                  <div>
                    <span class="text-caption text-grey">Volumen: </span>
                    <strong class="text-primary">{{ formatNumber(summary.service_breakdown.sea_total?.teus ?? 0) }} TEUs</strong>
                  </div>
                  <div>
                    <span class="text-caption text-grey">Venta: </span>
                    <strong>${{ formatCurrencyMxn(summary.service_breakdown.sea_total?.sell ?? 0) }}</strong>
                  </div>
                  <div>
                    <span class="text-caption text-grey">Profit: </span>
                    <strong class="text-success">${{ formatCurrencyMxn(summary.service_breakdown.sea_total?.profit ?? 0) }} ({{ summary.service_breakdown.sea_total?.margin_percent ?? 0 }}%)</strong>
                  </div>
                </div>

                <!-- Sub-chips Impo & Expo -->
                <div class="d-flex align-center gap-2 pt-1 border-t flex-wrap">
                  <v-chip
                    size="x-small"
                    color="info"
                    variant="flat"
                    class="cursor-pointer font-weight-medium"
                    @click="setServiceType('sea_impo')"
                  >
                    IMPO: {{ formatNumber(summary.service_breakdown.sea_impo?.teus ?? 0) }} TEUs | ${{ formatCurrencyMxn(summary.service_breakdown.sea_impo?.sell ?? 0) }} | Profit: ${{ formatCurrencyMxn(summary.service_breakdown.sea_impo?.profit ?? 0) }}
                  </v-chip>
                  <v-chip
                    size="x-small"
                    color="secondary"
                    variant="flat"
                    class="cursor-pointer font-weight-medium"
                    @click="setServiceType('sea_expo')"
                  >
                    EXPO: {{ formatNumber(summary.service_breakdown.sea_expo?.teus ?? 0) }} TEUs | ${{ formatCurrencyMxn(summary.service_breakdown.sea_expo?.sell ?? 0) }}
                  </v-chip>
                </div>
              </v-card>
            </v-col>

            <!-- ✈️ Aéreo Breakdown Card -->
            <v-col cols="12" md="6">
              <v-card
                variant="outlined"
                class="pa-3 rounded-lg"
                :class="{'border-teal bg-teal-lighten-5': filters.service_type === 'air' || filters.service_type === 'air_impo' || filters.service_type === 'air_expo'}"
              >
                <div class="d-flex align-center justify-space-between mb-2">
                  <div class="d-flex align-center gap-2">
                    <v-icon color="teal" size="20">mdi-airplane-takeoff</v-icon>
                    <span class="font-weight-bold text-subtitle-2 text-teal">OPERACIÓN AÉREA</span>
                  </div>
                  <v-btn
                    size="x-small"
                    variant="tonal"
                    color="teal"
                    prepend-icon="mdi-filter"
                    @click="setServiceType('air')"
                  >
                    Ver Todo Aéreo
                  </v-btn>
                </div>

                <div class="d-flex align-center justify-space-between flex-wrap gap-2 mb-2">
                  <div>
                    <span class="text-caption text-grey">Peso / Volumen: </span>
                    <strong class="text-teal">{{ formatNumber(summary.service_breakdown.air_total?.kg ?? 0) }} KG</strong>
                    <span class="text-caption text-grey ml-1">({{ formatNumber(summary.service_breakdown.air_total?.count ?? 0) }} guías)</span>
                  </div>
                  <div>
                    <span class="text-caption text-grey">Venta: </span>
                    <strong>${{ formatCurrencyMxn(summary.service_breakdown.air_total?.sell ?? 0) }}</strong>
                  </div>
                  <div>
                    <span class="text-caption text-grey">Profit: </span>
                    <strong class="text-success">${{ formatCurrencyMxn(summary.service_breakdown.air_total?.profit ?? 0) }} ({{ summary.service_breakdown.air_total?.margin_percent ?? 0 }}%)</strong>
                  </div>
                </div>

                <!-- Sub-chips Impo & Expo -->
                <div class="d-flex align-center gap-2 pt-1 border-t flex-wrap">
                  <v-chip
                    size="x-small"
                    color="info"
                    variant="flat"
                    class="cursor-pointer font-weight-medium"
                    @click="setServiceType('air_impo')"
                  >
                    IMPO: {{ formatNumber(summary.service_breakdown.air_impo?.kg ?? 0) }} KG | ${{ formatCurrencyMxn(summary.service_breakdown.air_impo?.sell ?? 0) }} | Profit: ${{ formatCurrencyMxn(summary.service_breakdown.air_impo?.profit ?? 0) }}
                  </v-chip>
                  <v-chip
                    size="x-small"
                    color="secondary"
                    variant="flat"
                    class="cursor-pointer font-weight-medium"
                    @click="setServiceType('air_expo')"
                  >
                    EXPO: {{ formatNumber(summary.service_breakdown.air_expo?.kg ?? 0) }} KG | ${{ formatCurrencyMxn(summary.service_breakdown.air_expo?.sell ?? 0) }}
                  </v-chip>
                </div>
              </v-card>
            </v-col>
          </v-row>
        </div>

        <!-- Main Content Area: Tabs for Charts and Table -->
        <v-card elevation="0" class="panel-card">
          <v-tabs v-model="activeTab" color="primary" density="comfortable" show-arrows>
            <v-tab value="charts">
              <v-icon start>mdi-chart-bar</v-icon>
              Gráficas por Ejecutivo
            </v-tab>
            <v-tab value="table">
              <v-icon start>mdi-table</v-icon>
              Tabla por Ejecutivo ({{ executivesRows.length }})
            </v-tab>
            <v-tab value="clients_charts">
              <v-icon start color="teal">mdi-chart-box-outline</v-icon>
              Gráficas Niveles de Carga por Cliente ({{ clientsSummary?.active_clients || 0 }})
            </v-tab>
            <v-tab value="clients_table">
              <v-icon start color="teal">mdi-domain</v-icon>
              Reporte Niveles de Carga por Cliente ({{ clientsRows.length }})
            </v-tab>
          </v-tabs>

          <v-divider />

          <!-- Loading Spinner -->
          <div v-if="loadingData" class="d-flex flex-column align-center justify-center py-12">
            <v-progress-circular indeterminate color="primary" size="48" />
            <span class="mt-3 text-caption text-grey">Calculando datos analíticos del reporte...</span>
          </div>

          <!-- Tab Content: Charts -->
          <div v-else-if="activeTab === 'charts'" class="pa-4">
            <v-row>
              <!-- Chart 1: Ranking TEUs por Ejecutivo (Mayor a Menor) -->
              <v-col cols="12" lg="7">
                <v-card variant="outlined" class="chart-box pa-4">
                  <div class="d-flex justify-space-between align-center mb-2 flex-wrap gap-2">
                    <div>
                      <h4 class="text-subtitle-1 font-weight-bold">
                        <v-icon size="18" color="primary" class="mr-1">mdi-podium</v-icon>
                        Ranking de {{ summary?.volume_label || 'TEUs' }} por Ejecutivo (Mayor a Menor)
                      </h4>
                      <p class="text-caption text-grey">
                        Incluye todos los ejecutivos y visibiliza a quiénes tienen 0 {{ summary?.volume_label || 'TEUs' }}
                      </p>
                    </div>
                    <div class="d-flex align-center gap-1">
                      <v-tooltip text="Exportar gráfica como imagen PNG" location="top">
                        <template #activator="{ props }">
                          <v-btn
                            v-bind="props"
                            size="small"
                            variant="text"
                            color="primary"
                            icon="mdi-download"
                            density="comfortable"
                            @click="exportChartImage('chart-ranking-box', `ranking-ejecutivos-${summary?.volume_label || 'teus'}`)"
                          />
                        </template>
                      </v-tooltip>
                      <v-tooltip text="Ampliar gráfica en modal grande" location="top">
                        <template #activator="{ props }">
                          <v-btn
                            v-bind="props"
                            size="small"
                            variant="tonal"
                            color="primary"
                            prepend-icon="mdi-arrow-expand-all"
                            class="text-capitalize font-weight-medium"
                            @click="openChartModal('ranking')"
                          >
                            Ampliar
                          </v-btn>
                        </template>
                      </v-tooltip>
                    </div>
                  </div>
                  <div id="chart-ranking-box">
                    <client-only>
                      <apexchart
                        type="bar"
                        :height="chartRankingHeight"
                        :options="rankingChartOptions"
                        :series="rankingChartSeries"
                      />
                      <template #fallback>
                        <v-skeleton-loader type="image" height="350" />
                      </template>
                    </client-only>
                  </div>
                </v-card>
              </v-col>

              <!-- Chart 2: Tendencia Mensual (Financiera / Volumen) -->
              <v-col cols="12" lg="5">
                <v-card variant="outlined" class="chart-box pa-4 mb-4">
                  <div class="d-flex justify-space-between align-center mb-2 flex-wrap gap-2">
                    <div>
                      <h4 class="text-subtitle-1 font-weight-bold">
                        <v-icon size="18" :color="trendMode === 'financial' ? 'success' : 'info'" class="mr-1">
                          {{ trendMode === 'financial' ? 'mdi-cash-trend' : 'mdi-chart-areaspline' }}
                        </v-icon>
                        {{ trendMode === 'financial' ? 'Tendencia Financiera' : 'Tendencia de Volumen' }}
                      </h4>
                      <p class="text-caption text-grey">
                        {{ trendMode === 'financial' ? 'Venta vs Compra vs Profit real (USD)' : `Volumen total de ${summary?.volume_label || 'TEUs'} mes a mes` }}
                      </p>
                    </div>
                    <div class="d-flex align-center gap-2 flex-wrap">
                      <v-btn-toggle
                        v-model="trendMode"
                        mandatory
                        density="compact"
                        variant="outlined"
                        color="primary"
                      >
                        <v-btn value="financial" size="x-small">Finanzas ($ USD)</v-btn>
                        <v-btn value="volume" size="x-small">{{ summary?.volume_label || 'TEUs' }}</v-btn>
                      </v-btn-toggle>
                      <v-tooltip text="Exportar gráfica como imagen PNG" location="top">
                        <template #activator="{ props }">
                          <v-btn
                            v-bind="props"
                            size="small"
                            variant="text"
                            color="primary"
                            icon="mdi-download"
                            density="comfortable"
                            @click="exportChartImage('chart-trend-box', `tendencia-${trendMode}`)"
                          />
                        </template>
                      </v-tooltip>
                      <v-tooltip text="Ampliar gráfica en modal grande" location="top">
                        <template #activator="{ props }">
                          <v-btn
                            v-bind="props"
                            size="small"
                            variant="tonal"
                            color="primary"
                            prepend-icon="mdi-arrow-expand-all"
                            class="text-capitalize font-weight-medium"
                            @click="openChartModal('trend')"
                          >
                            Ampliar
                          </v-btn>
                        </template>
                      </v-tooltip>
                    </div>
                  </div>
                  <div id="chart-trend-box">
                    <client-only>
                      <apexchart
                        v-if="trendMode === 'financial'"
                        type="area"
                        height="230"
                        :options="financialTrendChartOptions"
                        :series="financialTrendChartSeries"
                      />
                      <apexchart
                        v-else
                        type="area"
                        height="230"
                        :options="trendChartOptions"
                        :series="trendChartSeries"
                      />
                      <template #fallback>
                        <v-skeleton-loader type="image" height="230" />
                      </template>
                    </client-only>
                  </div>
                </v-card>

                <!-- Chart 3: Comparativa Financiera Top Ejecutivos (Venta, Compra, Profit) -->
                <v-card variant="outlined" class="chart-box pa-4">
                  <div class="d-flex justify-space-between align-center mb-2 flex-wrap gap-2">
                    <div>
                      <h4 class="text-subtitle-1 font-weight-bold">
                        <v-icon size="18" color="success" class="mr-1">mdi-cash-multiple</v-icon>
                        Venta vs Compra vs Profit (USD)
                      </h4>
                      <p class="text-caption text-grey">Cobro a clientes vs costos proveedores por ejecutivo (USD)</p>
                    </div>
                    <div class="d-flex align-center gap-1">
                      <v-tooltip text="Exportar gráfica como imagen PNG" location="top">
                        <template #activator="{ props }">
                          <v-btn
                            v-bind="props"
                            size="small"
                            variant="text"
                            color="primary"
                            icon="mdi-download"
                            density="comfortable"
                            @click="exportChartImage('chart-financial-box', 'venta-compra-profit-ejecutivos')"
                          />
                        </template>
                      </v-tooltip>
                      <v-tooltip text="Ampliar gráfica en modal grande" location="top">
                        <template #activator="{ props }">
                          <v-btn
                            v-bind="props"
                            size="small"
                            variant="tonal"
                            color="primary"
                            prepend-icon="mdi-arrow-expand-all"
                            class="text-capitalize font-weight-medium"
                            @click="openChartModal('financial')"
                          >
                            Ampliar
                          </v-btn>
                        </template>
                      </v-tooltip>
                    </div>
                  </div>
                  <div id="chart-financial-box">
                    <client-only>
                      <apexchart
                        type="bar"
                        height="230"
                        :options="financialChartOptions"
                        :series="financialChartSeries"
                      />
                      <template #fallback>
                        <v-skeleton-loader type="image" height="230" />
                      </template>
                    </client-only>
                  </div>
                </v-card>
              </v-col>
            </v-row>
          </div>

          <!-- Tab Content: Table -->
          <div v-else-if="activeTab === 'table'" class="pa-4">
            <!-- Table Toolbar -->
            <div class="d-flex justify-space-between align-center mb-4 flex-wrap gap-3">
              <div class="d-flex align-center gap-2">
                <v-text-field
                  v-model="tableSearch"
                  prepend-inner-icon="mdi-magnify"
                  label="Buscar en tabla..."
                  density="compact"
                  variant="outlined"
                  hide-details
                  style="min-width: 250px"
                  clearable
                />
                <v-btn-toggle
                  v-model="activityFilter"
                  mandatory
                  density="compact"
                  variant="outlined"
                  color="primary"
                >
                  <v-btn value="all" size="small">Todos ({{ executivesRows.length }})</v-btn>
                  <v-btn value="active" size="small">Solo Activos ({{ summary?.active_executives || 0 }})</v-btn>
                  <v-btn value="zero" size="small">Sin TEUs ({{ summary?.zero_executives || 0 }})</v-btn>
                </v-btn-toggle>
              </div>

              <v-menu location="bottom end">
                <template #activator="{ props }">
                  <v-btn
                    variant="outlined"
                    color="success"
                    size="small"
                    prepend-icon="mdi-file-excel"
                    append-icon="mdi-chevron-down"
                    :loading="exporting"
                    v-bind="props"
                  >
                    Descargar Excel
                  </v-btn>
                </template>
                <v-list density="compact" class="py-1">
                  <v-list-item @click="downloadExcel(true)">
                    <template #prepend>
                      <v-icon color="success" size="18">mdi-table-multiple</v-icon>
                    </template>
                    <v-list-item-title class="text-body-2 font-weight-medium">Libro Completo (Pestañas Separadas)</v-list-item-title>
                  </v-list-item>
                  <v-list-item @click="downloadExcel(false)">
                    <template #prepend>
                      <v-icon color="primary" size="18">mdi-table</v-icon>
                    </template>
                    <v-list-item-title class="text-body-2 font-weight-medium">Solo Vista Actual</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </div>

            <!-- Data Table -->
            <v-table class="elevation-0 report-data-table" density="comfortable" hover>
              <thead>
                <tr class="table-header-row">
                  <th class="text-left font-weight-bold" style="width: 50px">#</th>
                  <th class="text-left font-weight-bold" style="min-width: 280px">Ejecutivo</th>
                  <th class="text-right font-weight-bold" style="min-width: 110px">Total {{ summary?.volume_label || 'TEUs' }}</th>
                  <th
                    v-for="m in reportMonths"
                    :key="m"
                    class="text-right font-weight-bold"
                    style="min-width: 90px"
                  >
                    {{ m }}
                  </th>
                  <th class="text-right font-weight-bold" style="min-width: 140px">Total Venta (USD)</th>
                  <th class="text-right font-weight-bold" style="min-width: 140px">Total Compra (USD)</th>
                  <th class="text-right font-weight-bold" style="min-width: 130px">Profit (USD)</th>
                  <th class="text-center font-weight-bold" style="min-width: 90px">Margen %</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(item, index) in filteredTableRows"
                  :key="item.name"
                  :class="{
                    'group-row': item.is_group,
                    'zero-row': item.total_teus === 0 && item.total_sell === 0,
                  }"
                >
                  <td class="text-caption text-grey">{{ index + 1 }}</td>
                  <td>
                    <div class="d-flex align-center gap-2">
                      <v-icon
                        v-if="item.is_group"
                        color="primary"
                        size="18"
                      >mdi-domain</v-icon>
                      <v-icon
                        v-else-if="item.total_teus > 0"
                        color="success"
                        size="18"
                      >mdi-account-check</v-icon>
                      <v-icon
                        v-else
                        color="grey"
                        size="18"
                      >mdi-account-outline</v-icon>

                      <div>
                        <span class="font-weight-medium">{{ item.name }}</span>
                        <div v-if="item.group_detail" class="text-caption text-primary">
                          {{ item.group_detail }}
                        </div>
                      </div>

                      <v-chip
                        v-if="item.total_teus === 0 && item.total_sell === 0"
                        size="x-small"
                        color="grey"
                        variant="tonal"
                        class="ml-1"
                      >
                        0 {{ summary?.volume_label || 'TEUs' }}
                      </v-chip>
                    </div>
                  </td>
                  <td class="text-right font-weight-bold">
                    <span :class="item.total_teus > 0 ? 'text-primary' : 'text-grey'">
                      {{ formatNumber(item.total_teus) }}
                    </span>
                  </td>

                  <!-- Monthly TEUs -->
                  <td
                    v-for="k in monthKeys"
                    :key="k"
                    class="text-right"
                    :class="item.monthly_teus[k] > 0 ? 'font-weight-medium' : 'text-grey'"
                  >
                    {{ item.monthly_teus[k] > 0 ? formatNumber(item.monthly_teus[k]) : '-' }}
                  </td>

                  <td class="text-right font-weight-medium">
                    ${{ formatCurrencyMxn(item.total_sell) }}
                  </td>
                  <td class="text-right font-weight-medium text-grey-darken-1">
                    ${{ formatCurrencyMxn(item.total_buy) }}
                  </td>
                  <td
                    class="text-right font-weight-bold"
                    :class="item.profit > 0 ? 'text-success' : (item.profit < 0 ? 'text-error' : 'text-grey')"
                  >
                    ${{ formatCurrencyMxn(item.profit) }}
                  </td>
                  <td class="text-center">
                    <v-chip
                      size="x-small"
                      :color="getMarginColor(item.margin_percent, item.total_sell)"
                      variant="flat"
                    >
                      {{ item.total_sell > 0 ? `${item.margin_percent}%` : '-' }}
                    </v-chip>
                  </td>
                </tr>

                <!-- Fila de Total General -->
                <tr v-if="summary" class="total-general-row">
                  <td class="font-weight-bold"></td>
                  <td class="font-weight-bold text-primary">TOTAL GENERAL</td>
                  <td class="text-right font-weight-bold text-primary">
                    {{ formatNumber(summary.total_teus) }}
                  </td>
                  <td
                    v-for="k in monthKeys"
                    :key="'tot-' + k"
                    class="text-right font-weight-bold"
                  >
                    {{ summary.monthly_totals[k] > 0 ? formatNumber(summary.monthly_totals[k]) : '-' }}
                  </td>
                  <td class="text-right font-weight-bold text-success">
                    ${{ formatCurrencyMxn(summary.total_sell) }}
                  </td>
                  <td class="text-right font-weight-bold text-warning">
                    ${{ formatCurrencyMxn(summary.total_buy) }}
                  </td>
                  <td class="text-right font-weight-bold text-purple">
                    ${{ formatCurrencyMxn(summary.total_profit) }}
                  </td>
                  <td class="text-center font-weight-bold">
                    <v-chip size="small" color="purple" variant="flat">
                      {{ summary.margin_percent }}%
                    </v-chip>
                  </td>
                </tr>
              </tbody>
            </v-table>
          </div>

          <!-- Tab Content: Clients Charts (Niveles de Carga por Cliente) -->
          <div v-else-if="activeTab === 'clients_charts'" class="pa-4">
            <!-- Load Level Summary Cards (Alto / Medio / Bajo / Sin Carga) -->
            <v-row v-if="clientsSummary?.levels_breakdown" class="mb-4" dense>
              <v-col cols="12" sm="6" md="3">
                <v-card
                  variant="outlined"
                  class="pa-3 rounded-lg cursor-pointer"
                  :class="clientLevelFilter === 'high' ? 'border-teal bg-teal-lighten-5' : ''"
                  @click="filterClientLevelAndGoTable('high')"
                >
                  <div class="d-flex justify-space-between align-center mb-1">
                    <span class="text-caption font-weight-bold text-teal">NIVEL ALTO ({{ clientsSummary.levels_breakdown.high?.threshold_label }})</span>
                    <v-chip size="x-small" color="teal" variant="flat">
                      {{ clientsSummary.levels_breakdown.high?.share_percent ?? 0 }}% carga
                    </v-chip>
                  </div>
                  <div class="d-flex align-baseline justify-space-between">
                    <span class="text-h6 font-weight-bold text-teal">{{ clientsSummary.levels_breakdown.high?.count ?? 0 }} clientes</span>
                    <span class="text-subtitle-2 font-weight-bold">{{ formatNumber(clientsSummary.levels_breakdown.high?.teus ?? 0) }} {{ summary?.volume_label || 'TEUs' }}</span>
                  </div>
                  <div class="text-caption text-grey mt-1">
                    Venta: ${{ formatCurrencyMxn(clientsSummary.levels_breakdown.high?.sell ?? 0) }} | Profit: ${{ formatCurrencyMxn(clientsSummary.levels_breakdown.high?.profit ?? 0) }}
                  </div>
                </v-card>
              </v-col>

              <v-col cols="12" sm="6" md="3">
                <v-card
                  variant="outlined"
                  class="pa-3 rounded-lg cursor-pointer"
                  :class="clientLevelFilter === 'medium' ? 'border-primary bg-blue-lighten-5' : ''"
                  @click="filterClientLevelAndGoTable('medium')"
                >
                  <div class="d-flex justify-space-between align-center mb-1">
                    <span class="text-caption font-weight-bold text-success">NIVEL MEDIO ({{ clientsSummary.levels_breakdown.medium?.threshold_label }})</span>
                    <v-chip size="x-small" color="success" variant="flat">
                      {{ clientsSummary.levels_breakdown.medium?.share_percent ?? 0 }}% carga
                    </v-chip>
                  </div>
                  <div class="d-flex align-baseline justify-space-between">
                    <span class="text-h6 font-weight-bold text-success">{{ clientsSummary.levels_breakdown.medium?.count ?? 0 }} clientes</span>
                    <span class="text-subtitle-2 font-weight-bold">{{ formatNumber(clientsSummary.levels_breakdown.medium?.teus ?? 0) }} {{ summary?.volume_label || 'TEUs' }}</span>
                  </div>
                  <div class="text-caption text-grey mt-1">
                    Venta: ${{ formatCurrencyMxn(clientsSummary.levels_breakdown.medium?.sell ?? 0) }} | Profit: ${{ formatCurrencyMxn(clientsSummary.levels_breakdown.medium?.profit ?? 0) }}
                  </div>
                </v-card>
              </v-col>

              <v-col cols="12" sm="6" md="3">
                <v-card
                  variant="outlined"
                  class="pa-3 rounded-lg cursor-pointer"
                  :class="clientLevelFilter === 'low' ? 'border-primary bg-amber-lighten-5' : ''"
                  @click="filterClientLevelAndGoTable('low')"
                >
                  <div class="d-flex justify-space-between align-center mb-1">
                    <span class="text-caption font-weight-bold text-warning">NIVEL BAJO ({{ clientsSummary.levels_breakdown.low?.threshold_label }})</span>
                    <v-chip size="x-small" color="warning" variant="flat">
                      {{ clientsSummary.levels_breakdown.low?.share_percent ?? 0 }}% carga
                    </v-chip>
                  </div>
                  <div class="d-flex align-baseline justify-space-between">
                    <span class="text-h6 font-weight-bold text-warning">{{ clientsSummary.levels_breakdown.low?.count ?? 0 }} clientes</span>
                    <span class="text-subtitle-2 font-weight-bold">{{ formatNumber(clientsSummary.levels_breakdown.low?.teus ?? 0) }} {{ summary?.volume_label || 'TEUs' }}</span>
                  </div>
                  <div class="text-caption text-grey mt-1">
                    Venta: ${{ formatCurrencyMxn(clientsSummary.levels_breakdown.low?.sell ?? 0) }} | Profit: ${{ formatCurrencyMxn(clientsSummary.levels_breakdown.low?.profit ?? 0) }}
                  </div>
                </v-card>
              </v-col>

              <v-col cols="12" sm="6" md="3">
                <v-card
                  variant="outlined"
                  class="pa-3 rounded-lg cursor-pointer"
                  :class="clientLevelFilter === 'zero' ? 'border-primary bg-grey-lighten-4' : ''"
                  @click="filterClientLevelAndGoTable('zero')"
                >
                  <div class="d-flex justify-space-between align-center mb-1">
                    <span class="text-caption font-weight-bold text-grey-darken-1">SIN CARGA (0 OPERACIONES)</span>
                    <v-chip size="x-small" color="grey" variant="tonal">Inactivos</v-chip>
                  </div>
                  <div class="d-flex align-baseline justify-space-between">
                    <span class="text-h6 font-weight-bold text-grey-darken-2">{{ clientsSummary.levels_breakdown.zero?.count ?? 0 }} clientes</span>
                    <span class="text-subtitle-2 text-grey">0 {{ summary?.volume_label || 'TEUs' }}</span>
                  </div>
                  <div class="text-caption text-grey mt-1">
                    De {{ clientsSummary.total_clients || 0 }} clientes registrados en catálogo
                  </div>
                </v-card>
              </v-col>
            </v-row>

            <v-row>
              <!-- Client Chart 1: Ranking de Nivel de Carga por Cliente (Mayor a Menor) -->
              <v-col cols="12" lg="7">
                <v-card variant="outlined" class="chart-box pa-4">
                  <div class="d-flex justify-space-between align-center mb-2 flex-wrap gap-2">
                    <div>
                      <h4 class="text-subtitle-1 font-weight-bold">
                        <v-icon size="18" color="teal" class="mr-1">mdi-domain</v-icon>
                        Niveles de Carga por Cliente ({{ summary?.volume_label || 'TEUs' }} de Mayor a Menor)
                      </h4>
                      <p class="text-caption text-grey">
                        Clasificación visual de carga por cliente (Nivel Alto, Medio, Bajo y Sin Carga)
                      </p>
                    </div>
                    <div class="d-flex align-center gap-2 flex-wrap">
                      <v-btn-toggle
                        v-model="clientChartLimit"
                        mandatory
                        density="compact"
                        variant="outlined"
                        color="teal"
                      >
                        <v-btn :value="25" size="x-small">Top 25</v-btn>
                        <v-btn :value="50" size="x-small">Top 50</v-btn>
                        <v-btn :value="9999" size="x-small">Activos ({{ clientsSummary?.active_clients || 0 }})</v-btn>
                      </v-btn-toggle>
                      <v-tooltip text="Exportar gráfica como imagen PNG" location="top">
                        <template #activator="{ props }">
                          <v-btn
                            v-bind="props"
                            size="small"
                            variant="text"
                            color="teal"
                            icon="mdi-download"
                            density="comfortable"
                            @click="exportChartImage('chart-client-ranking-box', `niveles-carga-clientes-${summary?.volume_label || 'teus'}`)"
                          />
                        </template>
                      </v-tooltip>
                      <v-tooltip text="Ampliar gráfica en modal grande" location="top">
                        <template #activator="{ props }">
                          <v-btn
                            v-bind="props"
                            size="small"
                            variant="tonal"
                            color="teal"
                            prepend-icon="mdi-arrow-expand-all"
                            class="text-capitalize font-weight-medium"
                            @click="openChartModal('client_ranking')"
                          >
                            Ampliar
                          </v-btn>
                        </template>
                      </v-tooltip>
                    </div>
                  </div>
                  <div id="chart-client-ranking-box">
                    <client-only>
                      <apexchart
                        type="bar"
                        :height="chartClientRankingHeight"
                        :options="clientRankingChartOptions"
                        :series="clientRankingChartSeries"
                      />
                      <template #fallback>
                        <v-skeleton-loader type="image" height="420" />
                      </template>
                    </client-only>
                  </div>
                </v-card>
              </v-col>

              <!-- Client Chart 2 & 3 -->
              <v-col cols="12" lg="5">
                <!-- Client Chart 2: Distribución por Nivel de Carga -->
                <v-card variant="outlined" class="chart-box pa-4 mb-4">
                  <div class="d-flex justify-space-between align-center mb-2 flex-wrap gap-2">
                    <div>
                      <h4 class="text-subtitle-1 font-weight-bold">
                        <v-icon size="18" color="info" class="mr-1">mdi-chart-donut</v-icon>
                        Distribución por Nivel de Carga
                      </h4>
                      <p class="text-caption text-grey">
                        Volumen de {{ summary?.volume_label || 'TEUs' }} y # de clientes según su nivel (Alto, Medio, Bajo)
                      </p>
                    </div>
                    <div class="d-flex align-center gap-1">
                      <v-tooltip text="Exportar gráfica como imagen PNG" location="top">
                        <template #activator="{ props }">
                          <v-btn
                            v-bind="props"
                            size="small"
                            variant="text"
                            color="primary"
                            icon="mdi-download"
                            density="comfortable"
                            @click="exportChartImage('chart-client-levels-box', 'distribucion-niveles-carga-clientes')"
                          />
                        </template>
                      </v-tooltip>
                      <v-tooltip text="Ampliar gráfica en modal grande" location="top">
                        <template #activator="{ props }">
                          <v-btn
                            v-bind="props"
                            size="small"
                            variant="tonal"
                            color="primary"
                            prepend-icon="mdi-arrow-expand-all"
                            class="text-capitalize font-weight-medium"
                            @click="openChartModal('client_levels')"
                          >
                            Ampliar
                          </v-btn>
                        </template>
                      </v-tooltip>
                    </div>
                  </div>
                  <div id="chart-client-levels-box">
                    <client-only>
                      <apexchart
                        type="bar"
                        height="230"
                        :options="clientLevelsChartOptions"
                        :series="clientLevelsChartSeries"
                      />
                      <template #fallback>
                        <v-skeleton-loader type="image" height="230" />
                      </template>
                    </client-only>
                  </div>
                </v-card>

                <!-- Client Chart 3: Venta vs Compra vs Profit Top Clientes -->
                <v-card variant="outlined" class="chart-box pa-4">
                  <div class="d-flex justify-space-between align-center mb-2 flex-wrap gap-2">
                    <div>
                      <h4 class="text-subtitle-1 font-weight-bold">
                        <v-icon size="18" color="success" class="mr-1">mdi-cash-multiple</v-icon>
                        Venta vs Compra vs Profit por Cliente (USD)
                      </h4>
                      <p class="text-caption text-grey">Comparativa financiera de los clientes con mayor nivel de carga</p>
                    </div>
                    <div class="d-flex align-center gap-1">
                      <v-tooltip text="Exportar gráfica como imagen PNG" location="top">
                        <template #activator="{ props }">
                          <v-btn
                            v-bind="props"
                            size="small"
                            variant="text"
                            color="primary"
                            icon="mdi-download"
                            density="comfortable"
                            @click="exportChartImage('chart-client-financial-box', 'venta-compra-profit-clientes')"
                          />
                        </template>
                      </v-tooltip>
                      <v-tooltip text="Ampliar gráfica en modal grande" location="top">
                        <template #activator="{ props }">
                          <v-btn
                            v-bind="props"
                            size="small"
                            variant="tonal"
                            color="primary"
                            prepend-icon="mdi-arrow-expand-all"
                            class="text-capitalize font-weight-medium"
                            @click="openChartModal('client_financial')"
                          >
                            Ampliar
                          </v-btn>
                        </template>
                      </v-tooltip>
                    </div>
                  </div>
                  <div id="chart-client-financial-box">
                    <client-only>
                      <apexchart
                        type="bar"
                        height="230"
                        :options="clientFinancialChartOptions"
                        :series="clientFinancialChartSeries"
                      />
                      <template #fallback>
                        <v-skeleton-loader type="image" height="230" />
                      </template>
                    </client-only>
                  </div>
                </v-card>
              </v-col>
            </v-row>
          </div>

          <!-- Tab Content: Clients Table (Reporte de Niveles de Carga por Cliente) -->
          <div v-else-if="activeTab === 'clients_table'" class="pa-4">
            <div class="d-flex justify-space-between align-center mb-4 flex-wrap gap-3">
              <div class="d-flex align-center gap-2 flex-wrap">
                <v-text-field
                  v-model="clientTableSearch"
                  prepend-inner-icon="mdi-magnify"
                  label="Buscar cliente o ejecutivo..."
                  density="compact"
                  variant="outlined"
                  hide-details
                  style="min-width: 260px"
                  clearable
                />
                <v-btn-toggle
                  v-model="clientLevelFilter"
                  mandatory
                  density="compact"
                  variant="outlined"
                  color="teal"
                >
                  <v-btn value="all" size="small">Todos ({{ clientsRows.length }})</v-btn>
                  <v-btn value="active" size="small">Con Carga ({{ clientsSummary?.active_clients || 0 }})</v-btn>
                  <v-btn value="high" size="small">Nivel Alto ({{ clientsSummary?.levels_breakdown?.high?.count || 0 }})</v-btn>
                  <v-btn value="medium" size="small">Nivel Medio ({{ clientsSummary?.levels_breakdown?.medium?.count || 0 }})</v-btn>
                  <v-btn value="low" size="small">Nivel Bajo ({{ clientsSummary?.levels_breakdown?.low?.count || 0 }})</v-btn>
                  <v-btn value="zero" size="small">Sin Carga ({{ clientsSummary?.zero_clients || 0 }})</v-btn>
                </v-btn-toggle>
              </div>

              <v-menu location="bottom end">
                <template #activator="{ props }">
                  <v-btn
                    variant="outlined"
                    color="teal"
                    size="small"
                    prepend-icon="mdi-file-excel"
                    append-icon="mdi-chevron-down"
                    :loading="exporting"
                    v-bind="props"
                  >
                    Descargar Excel Clientes
                  </v-btn>
                </template>
                <v-list density="compact" class="py-1">
                  <v-list-item @click="downloadExcel(true, 'clients')">
                    <template #prepend>
                      <v-icon color="teal" size="18">mdi-table-multiple</v-icon>
                    </template>
                    <v-list-item-title class="text-body-2 font-weight-medium">Libro Completo Clientes (7 Pestañas)</v-list-item-title>
                  </v-list-item>
                  <v-list-item @click="downloadExcel(false, 'clients')">
                    <template #prepend>
                      <v-icon color="primary" size="18">mdi-table</v-icon>
                    </template>
                    <v-list-item-title class="text-body-2 font-weight-medium">Solo Vista Actual Clientes</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </div>

            <!-- Clients Data Table -->
            <v-table class="elevation-0 report-data-table" density="comfortable" hover>
              <thead>
                <tr class="table-header-row">
                  <th class="text-left font-weight-bold" style="width: 50px">#</th>
                  <th class="text-left font-weight-bold" style="min-width: 280px">Cliente</th>
                  <th class="text-center font-weight-bold" style="min-width: 120px">Nivel de Carga</th>
                  <th class="text-left font-weight-bold" style="min-width: 200px">Ejecutivo Asignado</th>
                  <th class="text-right font-weight-bold" style="min-width: 100px">Operaciones</th>
                  <th class="text-right font-weight-bold" style="min-width: 115px">Total {{ summary?.volume_label || 'TEUs' }}</th>
                  <th class="text-right font-weight-bold" style="min-width: 90px">% Carga</th>
                  <th
                    v-for="m in reportMonths"
                    :key="'cli-m-' + m"
                    class="text-right font-weight-bold"
                    style="min-width: 90px"
                  >
                    {{ m }}
                  </th>
                  <th class="text-right font-weight-bold" style="min-width: 140px">Total Venta (USD)</th>
                  <th class="text-right font-weight-bold" style="min-width: 140px">Total Compra (USD)</th>
                  <th class="text-right font-weight-bold" style="min-width: 130px">Profit (USD)</th>
                  <th class="text-center font-weight-bold" style="min-width: 90px">Margen %</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(client, index) in filteredClientTableRows"
                  :key="client.name"
                  :class="{
                    'group-row': client.is_group,
                    'zero-row': client.load_level === 'zero',
                  }"
                >
                  <td class="text-caption text-grey">{{ index + 1 }}</td>
                  <td>
                    <div class="d-flex align-center gap-2">
                      <v-icon
                        :color="getClientLevelColor(client.load_level)"
                        size="18"
                      >
                        {{ client.load_level === 'zero' ? 'mdi-domain-off' : 'mdi-domain' }}
                      </v-icon>
                      <div>
                        <span class="font-weight-medium">{{ client.name }}</span>
                        <div v-if="client.group_detail" class="text-caption text-primary">
                          {{ client.group_detail }}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td class="text-center">
                    <v-chip
                      size="x-small"
                      :color="getClientLevelColor(client.load_level)"
                      :variant="client.load_level === 'zero' ? 'tonal' : 'flat'"
                      class="font-weight-bold"
                    >
                      {{ client.load_level_label }}
                    </v-chip>
                  </td>
                  <td class="text-caption font-weight-medium text-grey-darken-2">
                    {{ client.executive_name }}
                  </td>
                  <td class="text-right">
                    <span :class="client.reference_count > 0 ? 'font-weight-medium' : 'text-grey'">
                      {{ formatNumber(client.reference_count) }}
                    </span>
                  </td>
                  <td class="text-right font-weight-bold">
                    <span :class="client.total_teus > 0 ? 'text-teal' : 'text-grey'">
                      {{ formatNumber(client.total_teus) }}
                    </span>
                  </td>
                  <td class="text-right text-caption font-weight-medium">
                    {{ client.share_percent > 0 ? `${client.share_percent}%` : '-' }}
                  </td>

                  <!-- Monthly TEUs -->
                  <td
                    v-for="k in monthKeys"
                    :key="'cli-' + k"
                    class="text-right"
                    :class="client.monthly_teus[k] > 0 ? 'font-weight-medium' : 'text-grey'"
                  >
                    {{ client.monthly_teus[k] > 0 ? formatNumber(client.monthly_teus[k]) : '-' }}
                  </td>

                  <td class="text-right font-weight-medium">
                    ${{ formatCurrencyMxn(client.total_sell) }}
                  </td>
                  <td class="text-right font-weight-medium text-grey-darken-1">
                    ${{ formatCurrencyMxn(client.total_buy) }}
                  </td>
                  <td
                    class="text-right font-weight-bold"
                    :class="client.profit > 0 ? 'text-success' : (client.profit < 0 ? 'text-error' : 'text-grey')"
                  >
                    ${{ formatCurrencyMxn(client.profit) }}
                  </td>
                  <td class="text-center">
                    <v-chip
                      size="x-small"
                      :color="getMarginColor(client.margin_percent, client.total_sell)"
                      variant="flat"
                    >
                      {{ client.total_sell > 0 ? `${client.margin_percent}%` : '-' }}
                    </v-chip>
                  </td>
                </tr>

                <!-- Fila de Total General Clientes -->
                <tr v-if="clientsSummary && summary" class="total-general-row">
                  <td class="font-weight-bold"></td>
                  <td class="font-weight-bold text-teal">TOTAL GENERAL CLIENTES</td>
                  <td class="text-center font-weight-bold text-caption">
                    {{ clientsSummary.active_clients }} activos / {{ clientsSummary.zero_clients }} sin carga
                  </td>
                  <td class="text-caption text-grey">-</td>
                  <td class="text-right font-weight-bold">
                    {{ formatNumber(clientsSummary.total_references) }}
                  </td>
                  <td class="text-right font-weight-bold text-teal">
                    {{ formatNumber(clientsSummary.total_teus) }}
                  </td>
                  <td class="text-right font-weight-bold">100%</td>
                  <td
                    v-for="k in monthKeys"
                    :key="'cli-tot-' + k"
                    class="text-right font-weight-bold"
                  >
                    {{ summary.monthly_totals[k] > 0 ? formatNumber(summary.monthly_totals[k]) : '-' }}
                  </td>
                  <td class="text-right font-weight-bold text-success">
                    ${{ formatCurrencyMxn(clientsSummary.total_sell) }}
                  </td>
                  <td class="text-right font-weight-bold text-warning">
                    ${{ formatCurrencyMxn(clientsSummary.total_buy) }}
                  </td>
                  <td class="text-right font-weight-bold text-purple">
                    ${{ formatCurrencyMxn(clientsSummary.total_profit) }}
                  </td>
                  <td class="text-center font-weight-bold">
                    <v-chip size="small" color="purple" variant="flat">
                      {{ clientsSummary.margin_percent }}%
                    </v-chip>
                  </td>
                </tr>
              </tbody>
            </v-table>
          </div>
        </v-card>
      </v-card-text>
    </v-card>

    <!-- Modal para Gráfica Ampliada en Alta Definición -->
    <v-dialog
      v-model="chartModal.open"
      max-width="1280px"
      scrollable
      transition="dialog-bottom-transition"
    >
      <v-card class="rounded-xl overflow-hidden" elevation="10">
        <!-- Dialog Header -->
        <div class="d-flex justify-space-between align-center px-6 py-4 border-b bg-surface flex-wrap gap-2">
          <div class="d-flex align-center gap-3">
            <v-avatar :color="chartModal.color" size="44" variant="tonal" class="rounded-lg">
              <v-icon :icon="chartModal.icon" size="26" />
            </v-avatar>
            <div>
              <div class="text-h6 font-weight-bold d-flex align-center gap-2 flex-wrap">
                {{ chartModal.title }}
                <v-chip size="x-small" :color="activeModeColor" variant="tonal">
                  {{ activeModeLabel }}
                </v-chip>
              </div>
              <div class="text-caption text-grey">{{ chartModal.subtitle }}</div>
            </div>
          </div>
          <div class="d-flex align-center gap-2 flex-wrap">
            <!-- Mode toggle if trend chart -->
            <v-btn-toggle
              v-if="chartModal.type === 'trend'"
              v-model="trendMode"
              mandatory
              density="compact"
              variant="outlined"
              color="primary"
              class="mr-2"
            >
              <v-btn value="financial" size="small">Finanzas ($ USD)</v-btn>
              <v-btn value="volume" size="small">{{ summary?.volume_label || 'TEUs' }}</v-btn>
            </v-btn-toggle>

            <v-btn-toggle
              v-if="chartModal.type === 'client_ranking'"
              v-model="clientChartLimit"
              mandatory
              density="compact"
              variant="outlined"
              color="teal"
              class="mr-2"
            >
              <v-btn :value="25" size="small">Top 25</v-btn>
              <v-btn :value="50" size="small">Top 50</v-btn>
              <v-btn :value="9999" size="small">Todos con Carga ({{ clientsSummary?.active_clients || 0 }})</v-btn>
            </v-btn-toggle>

            <v-btn
              color="primary"
              variant="flat"
              size="small"
              prepend-icon="mdi-download"
              class="text-capitalize font-weight-medium"
              :loading="exportingImage"
              @click="exportModalChart"
            >
              Exportar Imagen (PNG)
            </v-btn>
            <v-btn
              icon="mdi-close"
              variant="text"
              size="small"
              @click="chartModal.open = false"
            />
          </div>
        </div>

        <!-- Dialog Content -->
        <v-card-text class="pa-6 bg-grey-lighten-5">
          <div id="modal-chart-viewport" class="bg-surface pa-4 rounded-lg border">
            <!-- Modal Chart 1: Ranking -->
            <client-only v-if="chartModal.type === 'ranking'">
              <apexchart
                type="bar"
                :height="modalRankingHeight"
                :options="modalRankingChartOptions"
                :series="rankingChartSeries"
              />
            </client-only>

            <!-- Modal Chart 2: Trend -->
            <client-only v-else-if="chartModal.type === 'trend'">
              <apexchart
                v-if="trendMode === 'financial'"
                type="area"
                height="560"
                :options="modalFinancialTrendChartOptions"
                :series="financialTrendChartSeries"
              />
              <apexchart
                v-else
                type="area"
                height="560"
                :options="modalTrendChartOptions"
                :series="trendChartSeries"
              />
            </client-only>

            <!-- Modal Chart 3: Financial -->
            <client-only v-else-if="chartModal.type === 'financial'">
              <apexchart
                type="bar"
                height="560"
                :options="modalFinancialChartOptions"
                :series="financialChartSeries"
              />
            </client-only>

            <!-- Modal Chart 4: Client Ranking -->
            <client-only v-else-if="chartModal.type === 'client_ranking'">
              <apexchart
                type="bar"
                :height="modalClientRankingHeight"
                :options="modalClientRankingChartOptions"
                :series="clientRankingChartSeries"
              />
            </client-only>

            <!-- Modal Chart 5: Client Levels -->
            <client-only v-else-if="chartModal.type === 'client_levels'">
              <apexchart
                type="bar"
                height="560"
                :options="modalClientLevelsChartOptions"
                :series="clientLevelsChartSeries"
              />
            </client-only>

            <!-- Modal Chart 6: Client Financial -->
            <client-only v-else-if="chartModal.type === 'client_financial'">
              <apexchart
                type="bar"
                height="560"
                :options="modalClientFinancialChartOptions"
                :series="clientFinancialChartSeries"
              />
            </client-only>
          </div>
        </v-card-text>

        <!-- Dialog Footer -->
        <v-divider />
        <v-card-actions class="px-6 py-3 bg-surface d-flex justify-space-between align-center flex-wrap gap-2">
          <div class="d-flex align-center gap-2 flex-wrap text-caption text-grey">
            <span>Rango: <strong>{{ formatDate(filters.fromDate) }} a {{ formatDate(filters.toDate) }}</strong></span>
            <span>•</span>
            <span v-if="summary">Total Venta: <strong>${{ formatCurrencyMxn(summary.total_sell) }} USD</strong></span>
            <span>•</span>
            <span v-if="summary">Total Profit: <strong class="text-success">${{ formatCurrencyMxn(summary.total_profit) }} USD ({{ summary.margin_percent }}%)</strong></span>
          </div>
          <v-btn
            variant="outlined"
            size="small"
            class="text-capitalize"
            @click="chartModal.open = false"
          >
            Cerrar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import type { ApexOptions } from 'apexcharts'

const { $api } = useNuxtApp()
const snackbar = useSnackbar()

// Format helpers
function formatNumber(value: number) {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(value ?? 0)
}

function formatCurrencyMxn(value: number) {
  return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value ?? 0)
}

function formatDate(date: any) {
  if (!date) return ''
  if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return date
  }
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getMarginColor(margin: number, sell: number) {
  if (!sell || sell <= 0) return 'grey'
  if (margin >= 50) return 'success'
  if (margin >= 20) return 'primary'
  if (margin >= 5) return 'warning'
  return 'error'
}

function getClientLevelColor(level: string) {
  if (level === 'high') return 'teal'
  if (level === 'medium') return 'success'
  if (level === 'low') return 'warning'
  return 'grey'
}

// Service type options
const serviceTypeOptions = [
  { label: '🌐 Consolidado General (Marítimo + Aéreo)', value: null },
  { label: '🚢 Marítimo Consolidado (Impo + Expo)', value: 'sea' },
  { label: '🚢 Marítimo - Solo Importación (IMPO)', value: 'sea_impo' },
  { label: '🚢 Marítimo - Solo Exportación (EXPO)', value: 'sea_expo' },
  { label: '✈️ Aéreo Consolidado (Impo + Expo)', value: 'air' },
  { label: '✈️ Aéreo - Solo Importación (IMPO)', value: 'air_impo' },
  { label: '✈️ Aéreo - Solo Exportación (EXPO)', value: 'air_expo' },
]

const activeModeLabel = computed(() => {
  switch (filters.value.service_type) {
    case 'sea':
      return 'Marítimo Consolidado (Impo + Expo)'
    case 'sea_impo':
    case 'I':
      return 'Solo Importación Marítima (IMPO)'
    case 'sea_expo':
    case 'E':
      return 'Solo Exportación Marítima (EXPO)'
    case 'air':
      return 'Aéreo Consolidado (Impo + Expo)'
    case 'air_impo':
    case 'IA':
      return 'Solo Importación Aérea (IMPO)'
    case 'air_expo':
    case 'EA':
      return 'Solo Exportación Aérea (EXPO)'
    default:
      return 'Consolidado General (Marítimo + Aéreo)'
  }
})

const activeModeColor = computed(() => {
  if (!filters.value.service_type) return 'primary'
  const val = String(filters.value.service_type)
  if (val.startsWith('air') || val === 'IA' || val === 'EA') return 'teal'
  if (val === 'sea_impo' || val === 'I') return 'info'
  if (val === 'sea_expo' || val === 'E') return 'secondary'
  return 'primary'
})

const activeModeIcon = computed(() => {
  if (!filters.value.service_type) return 'mdi-layers-triple-outline'
  const val = String(filters.value.service_type)
  if (val.startsWith('air') || val === 'IA' || val === 'EA') return 'mdi-airplane-takeoff'
  return 'mdi-ferry'
})

const setServiceType = (type: string | null) => {
  filters.value.service_type = type
  fetchReportData()
}

// Default to 2026 (consolidated TM1 + TM2 data)
const defaultFromDate = '2026-01-01'
const defaultToDate = '2026-12-31'

const filters = ref<any>({
  fromDate: defaultFromDate,
  toDate: defaultToDate,
  executive_id: null,
  service_type: null,
})

const trendMode = ref<'financial' | 'volume'>('financial')

const activeTab = ref('charts')
const tableSearch = ref('')
const activityFilter = ref('all') // 'all' | 'active' | 'zero'

// Clients state
const clientTableSearch = ref('')
const clientLevelFilter = ref('active') // 'all' | 'active' | 'high' | 'medium' | 'low' | 'zero'
const clientChartLimit = ref(25)

const loadingData = ref(false)
const exporting = ref(false)

const executivesList = ref<any[]>([])
const reportMonths = ref<string[]>([])
const monthKeys = ref<string[]>([])
const executivesRows = ref<any[]>([])
const summary = ref<any>(null)
const clientsRows = ref<any[]>([])
const clientsSummary = ref<any>(null)

const filterClientLevelAndGoTable = (level: string) => {
  clientLevelFilter.value = level
  activeTab.value = 'clients_table'
}

// Height for ranking chart based on number of executives
const chartRankingHeight = computed(() => {
  const count = executivesRows.value.length || 10
  return Math.max(380, count * 22)
})

const chartClientsSlice = computed(() => {
  const active = clientsRows.value.filter((c) => c.load_level !== 'zero')
  return active.slice(0, clientChartLimit.value)
})

const chartClientRankingHeight = computed(() => {
  const count = chartClientsSlice.value.length || 10
  return Math.max(400, count * 24)
})

// Filtered table rows
const filteredTableRows = computed(() => {
  let list = executivesRows.value

  if (activityFilter.value === 'active') {
    list = list.filter((r) => r.total_teus > 0 || r.total_sell > 0)
  } else if (activityFilter.value === 'zero') {
    list = list.filter((r) => r.total_teus === 0 && r.total_sell === 0)
  }

  if (tableSearch.value) {
    const q = tableSearch.value.toLowerCase().trim()
    list = list.filter((r) => r.name.toLowerCase().includes(q))
  }

  return list
})

const filteredClientTableRows = computed(() => {
  let list = clientsRows.value

  if (clientLevelFilter.value === 'active') {
    list = list.filter((c) => c.load_level !== 'zero')
  } else if (['high', 'medium', 'low', 'zero'].includes(clientLevelFilter.value)) {
    list = list.filter((c) => c.load_level === clientLevelFilter.value)
  }

  if (clientTableSearch.value) {
    const q = clientTableSearch.value.toLowerCase().trim()
    list = list.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.executive_name && c.executive_name.toLowerCase().includes(q)),
    )
  }

  return list
})

// Fetch Analytics Report Data for Charts and Table
const fetchReportData = async () => {
  if (!filters.value.fromDate || !filters.value.toDate) {
    snackbar.add({ type: 'error', text: 'Por favor selecciona un rango de fechas.' })
    return
  }

  try {
    loadingData.value = true

    const queryFilters = {
      from: formatDate(filters.value.fromDate),
      to: formatDate(filters.value.toDate),
      executive_id: filters.value.executive_id,
      service_type: filters.value.service_type,
    }

    const res: any = await $api.reports.getExecutiveArrapData({
      query: queryFilters,
    })

    if (res) {
      reportMonths.value = res.months || []
      monthKeys.value = res.month_keys || []
      summary.value = res.summary || null
      executivesRows.value = res.executives || []
      clientsRows.value = res.clients || []
      clientsSummary.value = res.clients_summary || null
    }
  } catch (error: any) {
    console.error('Error loading ARRAP report data:', error)
    snackbar.add({
      type: 'error',
      text: error?.response?._data?.message || 'Error al obtener datos del reporte ARRAP.',
    })
  } finally {
    loadingData.value = false
  }
}

// Download Excel File
const downloadExcel = async (splitSheets: boolean = true, reportMode: 'executives' | 'clients' = 'executives') => {
  if (!filters.value.fromDate || !filters.value.toDate) {
    snackbar.add({ type: 'error', text: 'Por favor selecciona un rango de fechas.' })
    return
  }

  try {
    exporting.value = true

    const queryFilters = {
      from: formatDate(filters.value.fromDate),
      to: formatDate(filters.value.toDate),
      executive_id: filters.value.executive_id,
      service_type: filters.value.service_type,
      split_sheets: splitSheets ? 1 : 0,
      report_mode: reportMode,
    }

    const response: any = await $api.reports.getExecutiveArrapReport({
      query: queryFilters,
    })

    const blob = new Blob([response], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    const filePrefix = reportMode === 'clients' ? 'reporte_niveles_carga_clientes' : 'reporte_ejecutivo_arrap'
    link.setAttribute('download', `${filePrefix}_${formatDate(new Date())}.xlsx`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)

    snackbar.add({ type: 'success', text: 'Reporte Excel generado correctamente.' })
  } catch (e: any) {
    console.error(e)
    snackbar.add({ type: 'error', text: 'Error al exportar reporte a Excel.' })
  } finally {
    exporting.value = false
  }
}

// Reset filters
const clearFilters = () => {
  filters.value.fromDate = defaultFromDate
  filters.value.toDate = defaultToDate
  filters.value.executive_id = null
  filters.value.service_type = null
  fetchReportData()
}

// 2025 Test data button
const setTestDataRange = () => {
  filters.value.fromDate = defaultFromDate
  filters.value.toDate = defaultToDate
  fetchReportData()
}

// ================= ApexCharts Configurations =================
// 1. Ranking Chart (Horizontal Bar)
const rankingChartSeries = computed(() => {
  const data = executivesRows.value.map((e) => e.total_teus)
  const label = summary.value?.volume_label ? `Total ${summary.value.volume_label}` : 'Total TEUs'
  return [{ name: label, data }]
})

const rankingChartOptions = computed<ApexOptions>(() => {
  const categories = executivesRows.value.map((e) => e.name)

  return {
    chart: {
      type: 'bar',
      toolbar: { show: true },
      animations: { enabled: true },
    },
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 4,
        barHeight: '70%',
        distributed: true,
        dataLabels: { position: 'top' },
      },
    },
    colors: executivesRows.value.map((e) => {
      if (e.is_group) return '#2563eb' // Distinct primary blue for Liverpool & Suburbia
      if (e.total_teus > 500) return '#0d9488'
      if (e.total_teus > 100) return '#10b981'
      if (e.total_teus > 0) return '#6366f1'
      return '#cbd5e1' // Gray for 0 TEUs
    }),
    dataLabels: {
      enabled: true,
      textAnchor: 'start',
      style: { colors: ['#334155'], fontSize: '11px', fontWeight: 600 },
      formatter: (val: any) => (val > 0 ? formatNumber(val) : '0'),
      offsetX: 10,
    },
    xaxis: {
      categories,
      labels: {
        formatter: (val: any) => formatNumber(val),
      },
    },
    yaxis: {
      labels: {
        maxWidth: 240,
        style: { fontSize: '11px' },
      },
    },
    grid: { borderColor: '#f1f5f9' },
    legend: { show: false },
    tooltip: {
      y: {
        formatter: (val: any) => `${formatNumber(val)} TEUs`,
      },
    },
  }
})

// 2a. Financial Trend Chart (Area / Multi-series: Venta, Compra, Profit)
const financialTrendChartSeries = computed(() => {
  const fin = summary.value?.monthly_financials || {}
  const sellData = monthKeys.value.map((k) => fin.sell?.[k] ?? 0)
  const buyData = monthKeys.value.map((k) => fin.buy?.[k] ?? 0)
  const profitData = monthKeys.value.map((k) => fin.profit?.[k] ?? 0)

  return [
    { name: 'Venta (USD)', data: sellData },
    { name: 'Compra (USD)', data: buyData },
    { name: 'Profit (USD)', data: profitData },
  ]
})

const financialTrendChartOptions = computed<ApexOptions>(() => ({
  chart: {
    type: 'area',
    toolbar: { show: false },
  },
  colors: ['#16a34a', '#ea580c', '#9333ea'],
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.45,
      opacityTo: 0.05,
      stops: [0, 90, 100],
    },
  },
  stroke: { curve: 'smooth', width: [3, 2, 2] },
  dataLabels: { enabled: false },
  xaxis: {
    categories: reportMonths.value,
    labels: { style: { fontSize: '11px' } },
  },
  yaxis: {
    labels: {
      formatter: (val: any) => `$${formatNumber(val)}`,
    },
  },
  legend: { position: 'top' },
  tooltip: {
    y: {
      formatter: (val: any) => `$${formatCurrencyMxn(val)} USD`,
    },
  },
}))

// 2b. Trend Chart (Area - Volume TEUs)
const trendChartSeries = computed(() => {
  const monthly = summary.value?.monthly_totals || {}
  const data = monthKeys.value.map((k) => monthly[k] ?? 0)
  const label = summary.value?.volume_label ? `${summary.value.volume_label} Totales` : 'TEUs Totales'
  return [{ name: label, data }]
})

const trendChartOptions = computed<ApexOptions>(() => ({
  chart: {
    type: 'area',
    toolbar: { show: false },
    sparkline: { enabled: false },
  },
  colors: ['#0284c7'],
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.5,
      opacityTo: 0.05,
      stops: [0, 95, 100],
    },
  },
  stroke: { curve: 'smooth', width: 3 },
  dataLabels: { enabled: false },
  xaxis: {
    categories: reportMonths.value,
    labels: { style: { fontSize: '11px' } },
  },
  yaxis: {
    labels: {
      formatter: (val: any) => formatNumber(val),
    },
  },
  tooltip: {
    y: {
      formatter: (val: any) => `${formatNumber(val)} TEUs`,
    },
  },
}))

// 3. Financial Breakdown Top Executives (Venta vs Compra vs Profit)
const financialChartSeries = computed(() => {
  const activeOnly = executivesRows.value
    .filter((e) => e.total_sell > 0 || e.total_buy > 0)
    .slice(0, 8)
  return [
    { name: 'Venta (USD)', data: activeOnly.map((e) => e.total_sell) },
    { name: 'Compra (USD)', data: activeOnly.map((e) => e.total_buy) },
    { name: 'Profit (USD)', data: activeOnly.map((e) => e.profit) },
  ]
})

const financialChartOptions = computed<ApexOptions>(() => {
  const activeOnly = executivesRows.value
    .filter((e) => e.total_sell > 0 || e.total_buy > 0)
    .slice(0, 8)
  return {
    chart: {
      type: 'bar',
      toolbar: { show: false },
    },
    colors: ['#16a34a', '#ea580c', '#9333ea'],
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '60%',
        borderRadius: 4,
      },
    },
    dataLabels: { enabled: false },
    stroke: { show: true, width: 2, colors: ['transparent'] },
    xaxis: {
      categories: activeOnly.map((e) => (e.name.length > 15 ? e.name.slice(0, 15) + '...' : e.name)),
      labels: {
        rotate: -35,
        style: { fontSize: '10px' },
      },
    },
    yaxis: {
      labels: {
        formatter: (val: any) => `$${formatNumber(val)}`,
      },
    },
    legend: { position: 'top' },
    tooltip: {
      y: {
        formatter: (val: any) => `$${formatCurrencyMxn(val)} USD`,
      },
    },
  }
})

// ================= Client Load Levels ApexCharts Configurations =================
// 4. Client Ranking Chart (Horizontal Bar by Load Level)
const clientRankingChartSeries = computed(() => {
  const data = chartClientsSlice.value.map((c) => c.total_teus)
  const label = summary.value?.volume_label ? `Total ${summary.value.volume_label}` : 'Total TEUs'
  return [{ name: label, data }]
})

const clientRankingChartOptions = computed<ApexOptions>(() => {
  const categories = chartClientsSlice.value.map((c) => c.name)
  const vLabel = summary.value?.volume_label || 'TEUs'

  return {
    chart: {
      type: 'bar',
      toolbar: { show: true },
      animations: { enabled: true },
    },
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 4,
        barHeight: '72%',
        distributed: true,
        dataLabels: { position: 'top' },
      },
    },
    colors: chartClientsSlice.value.map((c) => {
      if (c.is_group) return '#2563eb'
      if (c.load_level === 'high') return '#0d9488'
      if (c.load_level === 'medium') return '#10b981'
      if (c.load_level === 'low') return '#f59e0b'
      return '#cbd5e1'
    }),
    dataLabels: {
      enabled: true,
      textAnchor: 'start',
      style: { colors: ['#334155'], fontSize: '11px', fontWeight: 600 },
      formatter: (val: any, opts: any) => {
        const item = chartClientsSlice.value[opts.dataPointIndex]
        const lvl = item?.load_level_label ? ` (${item.load_level_label})` : ''
        return val > 0 ? `${formatNumber(val)} ${vLabel}${lvl}` : '0'
      },
      offsetX: 10,
    },
    xaxis: {
      categories,
      labels: {
        formatter: (val: any) => formatNumber(val),
      },
    },
    yaxis: {
      labels: {
        maxWidth: 250,
        style: { fontSize: '11px' },
      },
    },
    grid: { borderColor: '#f1f5f9' },
    legend: { show: false },
    tooltip: {
      y: {
        formatter: (val: any, opts: any) => {
          const item = chartClientsSlice.value[opts?.dataPointIndex]
          if (!item) return `${formatNumber(val)} ${vLabel}`
          return `${formatNumber(val)} ${vLabel} (${item.share_percent}% del total | ${item.load_level_label} | Ejec: ${item.executive_name})`
        },
      },
    },
  }
})

// 5. Client Levels Breakdown Chart (Volumen y Cantidad de Clientes por Nivel)
const clientLevelsChartSeries = computed(() => {
  const b = clientsSummary.value?.levels_breakdown || {}
  const vLabel = summary.value?.volume_label || 'TEUs'
  return [
    {
      name: `Volumen (${vLabel})`,
      data: [
        b.high?.teus ?? 0,
        b.medium?.teus ?? 0,
        b.low?.teus ?? 0,
        b.zero?.teus ?? 0,
      ],
    },
    {
      name: 'Cantidad de Clientes',
      data: [
        b.high?.count ?? 0,
        b.medium?.count ?? 0,
        b.low?.count ?? 0,
        b.zero?.count ?? 0,
      ],
    },
  ]
})

const clientLevelsChartOptions = computed<ApexOptions>(() => ({
  chart: {
    type: 'bar',
    toolbar: { show: false },
  },
  colors: ['#0d9488', '#6366f1'],
  plotOptions: {
    bar: {
      horizontal: false,
      columnWidth: '55%',
      borderRadius: 4,
    },
  },
  dataLabels: { enabled: false },
  stroke: { show: true, width: 2, colors: ['transparent'] },
  xaxis: {
    categories: ['Nivel Alto', 'Nivel Medio', 'Nivel Bajo', 'Sin Carga'],
    labels: { style: { fontSize: '11px', fontWeight: 600 } },
  },
  yaxis: [
    {
      title: { text: summary.value?.volume_label || 'TEUs' },
      labels: { formatter: (val: any) => formatNumber(val) },
    },
    {
      opposite: true,
      title: { text: '# Clientes' },
      labels: { formatter: (val: any) => formatNumber(val) },
    },
  ],
  legend: { position: 'top' },
}))

// 6. Client Financial Chart (Top 10 Clients Venta vs Compra vs Profit USD)
const clientFinancialChartSeries = computed(() => {
  const topClients = clientsRows.value
    .filter((c) => c.total_sell > 0 || c.total_buy > 0)
    .slice(0, 10)
  return [
    { name: 'Venta (USD)', data: topClients.map((c) => c.total_sell) },
    { name: 'Compra (USD)', data: topClients.map((c) => c.total_buy) },
    { name: 'Profit (USD)', data: topClients.map((c) => c.profit) },
  ]
})

const clientFinancialChartOptions = computed<ApexOptions>(() => {
  const topClients = clientsRows.value
    .filter((c) => c.total_sell > 0 || c.total_buy > 0)
    .slice(0, 10)
  return {
    chart: {
      type: 'bar',
      toolbar: { show: false },
    },
    colors: ['#16a34a', '#ea580c', '#9333ea'],
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '60%',
        borderRadius: 4,
      },
    },
    dataLabels: { enabled: false },
    stroke: { show: true, width: 2, colors: ['transparent'] },
    xaxis: {
      categories: topClients.map((c) => (c.name.length > 16 ? c.name.slice(0, 16) + '...' : c.name)),
      labels: {
        rotate: -35,
        style: { fontSize: '10px' },
      },
    },
    yaxis: {
      labels: {
        formatter: (val: any) => `$${formatNumber(val)}`,
      },
    },
    legend: { position: 'top' },
    tooltip: {
      y: {
        formatter: (val: any) => `$${formatCurrencyMxn(val)} USD`,
      },
    },
  }
})

// ================= Expanded Modal State & Export Helpers =================
const chartModal = ref<{
  open: boolean
  type: 'ranking' | 'trend' | 'financial' | 'client_ranking' | 'client_levels' | 'client_financial' | null
  title: string
  subtitle: string
  icon: string
  color: string
}>({
  open: false,
  type: null,
  title: '',
  subtitle: '',
  icon: '',
  color: 'primary',
})

const openChartModal = (type: 'ranking' | 'trend' | 'financial' | 'client_ranking' | 'client_levels' | 'client_financial') => {
  if (type === 'ranking') {
    chartModal.value = {
      open: true,
      type: 'ranking',
      title: `Ranking de ${summary.value?.volume_label || 'TEUs'} por Ejecutivo`,
      subtitle: `Visualización ampliada de desempeño con ${executivesRows.value.length} ejecutivos`,
      icon: 'mdi-podium',
      color: 'primary',
    }
  } else if (type === 'trend') {
    chartModal.value = {
      open: true,
      type: 'trend',
      title: trendMode.value === 'financial' ? 'Tendencia Financiera Mensual' : `Tendencia de Volumen (${summary.value?.volume_label || 'TEUs'})`,
      subtitle: 'Comportamiento mensual consolidado a lo largo del periodo',
      icon: trendMode.value === 'financial' ? 'mdi-cash-trend' : 'mdi-chart-areaspline',
      color: trendMode.value === 'financial' ? 'success' : 'info',
    }
  } else if (type === 'financial') {
    chartModal.value = {
      open: true,
      type: 'financial',
      title: 'Venta vs Compra vs Profit (USD) por Ejecutivo',
      subtitle: 'Comparativa financiera detallada de los principales ejecutivos',
      icon: 'mdi-cash-multiple',
      color: 'purple',
    }
  } else if (type === 'client_ranking') {
    chartModal.value = {
      open: true,
      type: 'client_ranking',
      title: `Niveles de Carga por Cliente (${summary.value?.volume_label || 'TEUs'})`,
      subtitle: `Ranking ordenado de Mayor a Menor nivel de carga (${clientsSummary.value?.active_clients || 0} clientes con carga)`,
      icon: 'mdi-domain',
      color: 'teal',
    }
  } else if (type === 'client_levels') {
    chartModal.value = {
      open: true,
      type: 'client_levels',
      title: 'Distribución por Nivel de Carga de Clientes (Alto, Medio, Bajo, Sin Carga)',
      subtitle: 'Comparativa de volumen aportado y número de clientes en cada nivel',
      icon: 'mdi-chart-donut',
      color: 'info',
    }
  } else if (type === 'client_financial') {
    chartModal.value = {
      open: true,
      type: 'client_financial',
      title: 'Venta vs Compra vs Profit (USD) por Cliente',
      subtitle: 'Comparativa financiera de los clientes con mayor nivel de carga',
      icon: 'mdi-cash-multiple',
      color: 'success',
    }
  }
}

// Modal Chart Specific Options & Heights
const modalRankingHeight = computed(() => {
  const count = executivesRows.value.length || 10
  return Math.max(550, count * 28)
})

const modalClientRankingHeight = computed(() => {
  const count = chartClientsSlice.value.length || 10
  return Math.max(550, count * 28)
})

const modalRankingChartOptions = computed<ApexOptions>(() => ({
  ...rankingChartOptions.value,
  chart: {
    ...rankingChartOptions.value.chart,
    toolbar: { show: true, tools: { download: true, zoom: true, pan: true, reset: true } },
  },
  yaxis: {
    labels: {
      maxWidth: 320,
      style: { fontSize: '12px', fontWeight: 500 },
    },
  },
}))

const modalClientRankingChartOptions = computed<ApexOptions>(() => ({
  ...clientRankingChartOptions.value,
  chart: {
    ...clientRankingChartOptions.value.chart,
    toolbar: { show: true, tools: { download: true, zoom: true, pan: true, reset: true } },
  },
  yaxis: {
    labels: {
      maxWidth: 340,
      style: { fontSize: '12px', fontWeight: 500 },
    },
  },
}))

const modalClientLevelsChartOptions = computed<ApexOptions>(() => ({
  ...clientLevelsChartOptions.value,
  chart: {
    ...clientLevelsChartOptions.value.chart,
    toolbar: { show: true, tools: { download: true, zoom: true, pan: true, reset: true } },
  },
  dataLabels: {
    enabled: true,
    formatter: (val: any) => formatNumber(val),
    style: { fontSize: '11px' },
  },
}))

const modalClientFinancialChartOptions = computed<ApexOptions>(() => ({
  ...clientFinancialChartOptions.value,
  chart: {
    ...clientFinancialChartOptions.value.chart,
    toolbar: { show: true, tools: { download: true, zoom: true, pan: true, reset: true } },
  },
  xaxis: {
    ...clientFinancialChartOptions.value.xaxis,
    labels: {
      rotate: -20,
      style: { fontSize: '11px', fontWeight: 500 },
    },
  },
}))

const modalFinancialTrendChartOptions = computed<ApexOptions>(() => ({
  ...financialTrendChartOptions.value,
  chart: {
    ...financialTrendChartOptions.value.chart,
    toolbar: { show: true, tools: { download: true, zoom: true, pan: true, reset: true } },
  },
  dataLabels: {
    enabled: true,
    formatter: (val: any) => (val > 1000 ? `$${Math.round(val / 1000)}k` : `$${Math.round(val)}`),
    style: { fontSize: '10px' },
  },
}))

const modalTrendChartOptions = computed<ApexOptions>(() => ({
  ...trendChartOptions.value,
  chart: {
    ...trendChartOptions.value.chart,
    toolbar: { show: true, tools: { download: true, zoom: true, pan: true, reset: true } },
  },
  dataLabels: {
    enabled: true,
    formatter: (val: any) => formatNumber(val),
    style: { fontSize: '10px' },
  },
}))

const modalFinancialChartOptions = computed<ApexOptions>(() => ({
  ...financialChartOptions.value,
  chart: {
    ...financialChartOptions.value.chart,
    toolbar: { show: true, tools: { download: true, zoom: true, pan: true, reset: true } },
  },
  plotOptions: {
    bar: {
      horizontal: false,
      columnWidth: '50%',
      borderRadius: 4,
      dataLabels: { position: 'top' },
    },
  },
  xaxis: {
    ...financialChartOptions.value.xaxis,
    labels: {
      rotate: -20,
      style: { fontSize: '11px', fontWeight: 500 },
    },
  },
}))

// High-resolution image export
const exportingImage = ref(false)

const exportChartImage = async (containerId: string, filename: string) => {
  exportingImage.value = true
  try {
    const container = document.getElementById(containerId)
    if (!container) {
      snackbar.add({ type: 'error', text: 'No se encontró la gráfica para exportar.' })
      return
    }

    const svgElement = container.querySelector('svg.apexcharts-svg') as SVGSVGElement | null
    if (!svgElement) {
      snackbar.add({ type: 'warning', text: 'La gráfica aún no ha terminado de renderizarse.' })
      return
    }

    const clone = svgElement.cloneNode(true) as SVGSVGElement
    clone.style.backgroundColor = '#ffffff'
    clone.setAttribute('background-color', '#ffffff')

    const svgWidth = parseFloat(svgElement.getAttribute('width') || String(svgElement.clientWidth || 900))
    const svgHeight = parseFloat(svgElement.getAttribute('height') || String(svgElement.clientHeight || 500))

    const serializer = new XMLSerializer()
    let svgString = serializer.serializeToString(clone)

    if (!svgString.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
      svgString = svgString.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"')
    }

    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
    const blobUrl = URL.createObjectURL(svgBlob)

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const scale = 2 // 2x Retina resolution
      const canvas = document.createElement('canvas')
      canvas.width = svgWidth * scale
      canvas.height = svgHeight * scale

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        URL.revokeObjectURL(blobUrl)
        return
      }

      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.scale(scale, scale)
      ctx.drawImage(img, 0, 0, svgWidth, svgHeight)

      URL.revokeObjectURL(blobUrl)

      const pngUrl = canvas.toDataURL('image/png')
      const a = document.createElement('a')
      a.href = pngUrl
      a.download = `${filename}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)

      snackbar.add({ type: 'success', text: `Gráfica descargada correctamente como imagen (${filename}.png)` })
    }
    img.onerror = () => {
      URL.revokeObjectURL(blobUrl)
      snackbar.add({ type: 'error', text: 'Error al procesar la imagen de la gráfica.' })
    }
    img.src = blobUrl
  } catch (err: any) {
    console.error('Error exportChartImage:', err)
    snackbar.add({ type: 'error', text: 'Error al exportar la imagen.' })
  } finally {
    exportingImage.value = false
  }
}

const exportModalChart = () => {
  const vLabel = (summary.value?.volume_label || 'teus').toLowerCase()
  const name = matchModalChartName(chartModal.value.type, vLabel)
  exportChartImage('modal-chart-viewport', name)
}

function matchModalChartName(type: string | null, vLabel: string): string {
  switch (type) {
    case 'ranking':
      return `ranking-ejecutivos-${vLabel}-hd`
    case 'trend':
      return `tendencia-${trendMode.value}-hd`
    case 'financial':
      return 'venta-compra-profit-ejecutivos-hd'
    case 'client_ranking':
      return `niveles-carga-clientes-${vLabel}-hd`
    case 'client_levels':
      return 'distribucion-niveles-carga-clientes-hd'
    case 'client_financial':
      return 'venta-compra-profit-clientes-hd'
    default:
      return 'grafica-reporte-hd'
  }
}

// Initialize on mount
onMounted(async () => {
  try {
    const execRes: any = await $api.reports.getExecutiveArrapExecutives()
    executivesList.value = execRes?.data || execRes || []
  } catch (e) {
    console.error('Error fetching executives catalog:', e)
  }

  fetchReportData()
})
</script>

<style scoped>
.report-container {
  width: 100%;
}

.report-card {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 12px;
  overflow: hidden;
  background: rgb(var(--v-theme-surface));
}

.report-header {
  background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
  padding: 24px;
  color: white;
}

.icon-wrapper {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.report-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
}

.report-subtitle {
  font-size: 0.875rem;
  opacity: 0.9;
  margin: 0;
}

/* KPI Cards */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.kpi-card {
  border: 1px solid rgba(var(--v-border-color), 0.1);
  border-radius: 12px;
  padding: 16px;
  background: rgb(var(--v-theme-surface));
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
}

.kpi-body {
  display: flex;
  align-items: center;
  gap: 14px;
}

.kpi-icon-wrapper {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.kpi-blue { background: #eff6ff; }
.kpi-green { background: #f0fdf4; }
.kpi-orange { background: #fff7ed; }
.kpi-purple { background: #faf5ff; }
.kpi-teal { background: #f0fdfa; }

.kpi-info {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.kpi-label {
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.kpi-value {
  font-size: 1.25rem;
  font-weight: 700;
  line-height: 1.2;
}

.kpi-subtext {
  font-size: 0.75rem;
  color: #94a3b8;
  margin-top: 2px;
}

.panel-card {
  border: 1px solid rgba(var(--v-border-color), 0.12);
  border-radius: 12px;
}

.chart-box {
  border-radius: 10px;
  background: rgb(var(--v-theme-surface));
}

/* Table styling */
.report-data-table {
  font-size: 0.875rem;
}

.table-header-row {
  background: #f8fafc;
}

.group-row {
  background: #eff6ff !important;
}

.zero-row {
  opacity: 0.75;
}

.total-general-row {
  background: #f1f5f9 !important;
  border-top: 2px solid #cbd5e1;
  font-size: 0.9rem;
}
</style>