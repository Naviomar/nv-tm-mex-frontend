<template>
  <div class="space-y-4">
    <v-card rounded="xl" variant="flat">
      <v-card-text class="space-y-4">
        <div class="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <div class="text-2xl font-semibold">Container DnD Rates</div>
            <div class="text-sm opacity-70">
              Review active rate coverage by line and container, then edit each rate directly from the catalog.
            </div>
          </div>

          <div class="flex flex-wrap gap-2">
            <v-btn color="primary" prepend-icon="mdi-plus" @click="router.push('/configuration/container-delay-rates/add')">
              New configuration
            </v-btn>
            <v-btn color="secondary" variant="outlined" prepend-icon="mdi-compare" @click="compareDialog.show = true">
              Compare lines
            </v-btn>
            <v-btn color="slate" variant="outlined" prepend-icon="mdi-refresh" :loading="loading" @click="loadRates">
              Refresh
            </v-btn>
          </div>
        </div>

        <v-alert
          type="info"
          variant="tonal"
          density="compact"
          text="End date is optional. Leave it empty to keep a rate open-ended. Click any rate button or rate chip to edit it."
        />

        <div class="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          <v-card rounded="lg" variant="tonal" color="primary">
            <v-card-text>
              <div class="text-caption opacity-80">Lines visible</div>
              <div class="text-2xl font-semibold">{{ metrics.lines }}</div>
            </v-card-text>
          </v-card>

          <v-card rounded="lg" variant="tonal" color="success">
            <v-card-text>
              <div class="text-caption opacity-80">Active ranges</div>
              <div class="text-2xl font-semibold">{{ metrics.activePeriods }}</div>
            </v-card-text>
          </v-card>

          <v-card rounded="lg" variant="tonal" color="warning">
            <v-card-text>
              <div class="text-caption opacity-80">Incomplete rows</div>
              <div class="text-2xl font-semibold">{{ metrics.incompleteRows }}</div>
            </v-card-text>
          </v-card>

          <v-card rounded="lg" variant="tonal" color="error">
            <v-card-text>
              <div class="text-caption opacity-80">Conflicts detected</div>
              <div class="text-2xl font-semibold">{{ metrics.conflictRows }}</div>
            </v-card-text>
          </v-card>
        </div>

        <div class="grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-5">
          <v-text-field
            v-model="filters.search"
            label="Search"
            density="compact"
            variant="outlined"
            clearable
            prepend-inner-icon="mdi-magnify"
            @keyup.enter="loadRates"
          />

          <v-autocomplete
            v-model="filters.line_id"
            :items="lines"
            item-title="name"
            item-value="id"
            label="Line"
            density="compact"
            variant="outlined"
            clearable
          />

          <v-autocomplete
            v-model="filters.container_type_id"
            :items="containerTypes"
            item-title="name"
            item-value="id"
            label="Container type"
            density="compact"
            variant="outlined"
            clearable
          />

          <v-text-field
            v-model="filters.active_on"
            label="Reference date"
            density="compact"
            variant="outlined"
            type="date"
          />

          <v-select
            v-model="viewMode"
            :items="viewOptions"
            item-title="label"
            item-value="value"
            label="View"
            density="compact"
            variant="outlined"
          />
        </div>

        <div class="flex flex-wrap justify-end gap-2">
          <v-btn color="secondary" variant="outlined" prepend-icon="mdi-filter-off" @click="clearFilters">Clear</v-btn>
          <v-btn color="primary" prepend-icon="mdi-magnify" :loading="loading" @click="loadRates">Search</v-btn>
        </div>

        <div class="flex flex-wrap gap-3">
          <v-switch v-model="filters.active_only" label="Show active rates only" hide-details color="success" inset />
          <v-switch v-model="filters.conflicts_only" label="Show conflicts / incomplete only" hide-details color="warning" inset />
          <v-switch v-model="filters.show_deleted" label="Include inactive rows" hide-details color="error" inset />
        </div>
      </v-card-text>
    </v-card>

    <div v-if="loading" class="space-y-3">
      <v-skeleton-loader v-for="index in 3" :key="`cdr-skeleton-${index}`" type="article" />
    </div>

    <template v-else>
      <div v-if="viewMode === 'matrix'" class="space-y-4">
        <v-alert
          v-if="!lineGroups.length"
          type="info"
          variant="tonal"
          title="No rates found"
          text="Adjust your filters or create a new configuration for a line."
        />

        <v-card v-for="line in lineGroups" :key="`line-${line.line_id}`" rounded="xl" variant="flat" class="overflow-hidden">
          <div class="border-b px-6 py-4">
            <div class="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <div class="flex flex-wrap items-center gap-2">
                  <div class="text-xl font-semibold">{{ line.line_name }}</div>
                  <v-chip size="small" color="primary" label>{{ line.periods.length }} {{ filters.active_only ? 'active ranges' : 'ranges' }}</v-chip>
                  <v-chip v-if="line.incompleteCount" size="small" color="warning" label>
                    {{ line.incompleteCount }} incomplete
                  </v-chip>
                  <v-chip v-if="line.conflictsCount" size="small" color="error" label>
                    {{ line.conflictsCount }} conflicts
                  </v-chip>
                </div>
                <div class="mt-1 text-sm opacity-70">
                  {{ filters.active_only ? 'Showing all active rates together across active ranges.' : getSelectedPeriod(line)?.label ?? 'No validity range selected' }}
                </div>
              </div>

              <div class="flex flex-wrap gap-2">
                <v-btn size="small" variant="outlined" prepend-icon="mdi-content-copy" @click="duplicateConfiguration(line)">
                  Duplicate
                </v-btn>
                <v-btn
                  size="small"
                  variant="outlined"
                  prepend-icon="mdi-pencil-box-multiple-outline"
                  :disabled="!getSelectedPeriod(line)?.rows.length"
                  @click="openBulkDialog(line, 1)"
                >
                  Bulk Rate 1
                </v-btn>
                <v-btn
                  size="small"
                  variant="outlined"
                  prepend-icon="mdi-pencil-box-multiple-outline"
                  :disabled="!getSelectedPeriod(line)?.rows.length"
                  @click="openBulkDialog(line, 2)"
                >
                  Bulk Rate 2
                </v-btn>
              </div>
            </div>
          </div>

          <v-card-text class="space-y-4">
            <div v-if="filters.active_only && line.periods.length > 1" class="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-end">
              <div class="text-sm opacity-70">
                All active rates are displayed together below. Use this selector only to choose which validity range bulk and duplicate actions should use.
              </div>
              <v-select
                v-model="selectedPeriodKeys[line.line_id]"
                :items="getPeriodOptions(line)"
                item-title="label"
                item-value="value"
                label="Action range"
                density="compact"
                variant="outlined"
              />
            </div>

            <v-tabs
              v-else-if="!filters.active_only && line.periods.length > 1"
              v-model="selectedPeriodKeys[line.line_id]"
              color="primary"
              density="comfortable"
              class="border rounded-lg"
            >
              <v-tab v-for="period in line.periods" :key="period.key" :value="period.key">
                <span class="mr-2">{{ period.label }}</span>
                <v-chip :color="getPeriodChipColor(period.status)" size="x-small" label>{{ period.status }}</v-chip>
              </v-tab>
            </v-tabs>

            <div v-if="getDisplayRows(line).length" class="space-y-3">
              <div class="flex flex-wrap items-center gap-2">
                <v-chip :color="getPeriodChipColor(filters.active_only ? 'active' : getSelectedPeriod(line)!.status)" label>
                  {{ filters.active_only ? 'active view' : getSelectedPeriod(line)!.status }}
                </v-chip>
                <v-chip v-if="!filters.active_only && getSelectedPeriod(line)" size="small" variant="outlined" label>
                  Validity: {{ getSelectedPeriod(line)!.label }}
                </v-chip>
                <v-chip v-if="line.incompleteCount" size="small" color="warning" label>
                  {{ line.incompleteCount }} missing cells
                </v-chip>
                <v-chip v-if="line.conflictsCount" size="small" color="error" label>
                  {{ line.conflictsCount }} conflicts
                </v-chip>
              </div>

              <v-alert
                v-if="line.conflictsCount"
                type="error"
                variant="tonal"
                density="compact"
                title="Conflicting rates detected"
                :text="filters.active_only ? 'At least one container has overlapping active rates for this line.' : 'At least one container has overlapping rates within the selected validity range.'"
              />

              <v-alert
                v-else-if="line.incompleteCount"
                type="warning"
                variant="tonal"
                density="compact"
                title="Rate coverage is incomplete"
                :text="filters.active_only ? 'Some containers are missing an active Rate 1 or Rate 2 and should be reviewed.' : 'Some containers are missing Rate 1 or Rate 2 in the selected validity range.'"
              />

              <div class="hidden md:block overflow-x-auto rounded-xl border">
                <v-table density="comfortable" class="min-w-full">
                  <thead>
                    <tr>
                      <th class="text-left">Container</th>
                      <th class="text-left">Start date</th>
                      <th class="text-left">End date</th>
                      <th class="text-left">Rate 1</th>
                      <th class="text-left">Rate 2</th>
                      <th class="text-left">Status</th>
                      <th class="text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="displayRow in getDisplayRows(line)"
                      :key="displayRow.key"
                      :class="{
                        'bg-red-50 dark:bg-red-950': displayRow.row.status === 'conflict',
                        'bg-amber-50 dark:bg-amber-950': displayRow.row.status === 'incomplete',
                      }"
                    >
                      <td class="whitespace-nowrap font-medium">{{ displayRow.row.container_name }}</td>
                      <td class="whitespace-nowrap">{{ formatDateLabel(displayRow.startDate) }}</td>
                      <td class="whitespace-nowrap">{{ displayRow.endDate ? formatDateLabel(displayRow.endDate) : 'Open ended' }}</td>
                      <td>
                        <v-btn
                          variant="tonal"
                          :color="getCellColor(displayRow.row.rate1, displayRow.row.status)"
                          size="small"
                          @click="openCellDialog(line, displayRow.period, displayRow.row, 1)"
                        >
                          {{ displayRow.row.rate1 ? formatCurrencyAmount(displayRow.row.rate1.amount) : 'Add Rate 1' }}
                        </v-btn>
                      </td>
                      <td>
                        <v-btn
                          variant="tonal"
                          :color="getCellColor(displayRow.row.rate2, displayRow.row.status)"
                          size="small"
                          @click="openCellDialog(line, displayRow.period, displayRow.row, 2)"
                        >
                          {{ displayRow.row.rate2 ? formatCurrencyAmount(displayRow.row.rate2.amount) : 'Add Rate 2' }}
                        </v-btn>
                      </td>
                      <td>
                        <v-chip :color="getRowStatusColor(displayRow.row.status)" size="small" label>
                          {{ displayRow.row.status }}
                        </v-chip>
                      </td>
                      <td>
                        <div class="flex flex-wrap gap-2 items-center">
                          <v-chip size="x-small" variant="outlined" label>{{ displayRow.periodLabel }}</v-chip>
                          <v-btn size="x-small" variant="text" prepend-icon="mdi-history" @click="openHistory(line, displayRow.row)">
                            History
                          </v-btn>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </v-table>
              </div>

              <div class="grid gap-3 md:hidden">
                <v-card v-for="displayRow in getDisplayRows(line)" :key="`card-${displayRow.key}`" rounded="lg" variant="outlined">
                  <v-card-text class="space-y-3">
                    <div class="flex items-start justify-between gap-3">
                      <div>
                        <div class="font-semibold">{{ displayRow.row.container_name }}</div>
                        <div class="text-xs opacity-70">{{ displayRow.periodLabel }}</div>
                      </div>
                      <v-chip :color="getRowStatusColor(displayRow.row.status)" size="small" label>
                        {{ displayRow.row.status }}
                      </v-chip>
                    </div>

                    <div class="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <div class="text-xs opacity-60">Start date</div>
                        <div>{{ formatDateLabel(displayRow.startDate) }}</div>
                      </div>
                      <div>
                        <div class="text-xs opacity-60">End date</div>
                        <div>{{ displayRow.endDate ? formatDateLabel(displayRow.endDate) : 'Open ended' }}</div>
                      </div>
                    </div>

                    <div class="grid grid-cols-1 gap-2">
                      <v-btn
                        block
                        variant="tonal"
                        :color="getCellColor(displayRow.row.rate1, displayRow.row.status)"
                        @click="openCellDialog(line, displayRow.period, displayRow.row, 1)"
                      >
                        {{ displayRow.row.rate1 ? `Rate 1 · ${formatCurrencyAmount(displayRow.row.rate1.amount)}` : 'Add Rate 1' }}
                      </v-btn>
                      <v-btn
                        block
                        variant="tonal"
                        :color="getCellColor(displayRow.row.rate2, displayRow.row.status)"
                        @click="openCellDialog(line, displayRow.period, displayRow.row, 2)"
                      >
                        {{ displayRow.row.rate2 ? `Rate 2 · ${formatCurrencyAmount(displayRow.row.rate2.amount)}` : 'Add Rate 2' }}
                      </v-btn>
                    </div>

                    <div class="flex justify-end">
                      <v-btn size="small" variant="text" prepend-icon="mdi-history" @click="openHistory(line, displayRow.row)">
                        History
                      </v-btn>
                    </div>
                  </v-card-text>
                </v-card>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </div>

      <v-card v-else rounded="xl" variant="flat">
        <v-card-text class="space-y-4">
          <div class="hidden md:block overflow-x-auto rounded-xl border">
            <v-table density="comfortable" class="min-w-full">
            <thead>
              <tr>
                <th class="text-left">Line</th>
                <th class="text-left">Container</th>
                <th class="text-left">Rate</th>
                <th class="text-left">Amount</th>
                <th class="text-left">Start</th>
                <th class="text-left">End</th>
                <th class="text-left">Status</th>
                <th class="text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in flatRows" :key="`flat-${row.id}`">
                <td>{{ row.line?.name }}</td>
                <td>{{ row.container_type?.name }}</td>
                <td>
                  <v-chip size="small" :color="row.rate_type === 1 ? 'primary' : 'secondary'" label class="cursor-pointer" @click="openRateRow(row)">
                    Rate {{ row.rate_type }}
                  </v-chip>
                </td>
                <td>{{ formatCurrencyAmount(row.amount) }}</td>
                <td>{{ formatDateLabel(row.start_date) }}</td>
                <td>{{ row.end_date ? formatDateLabel(row.end_date) : 'Open ended' }}</td>
                <td>
                  <v-chip size="small" :color="row.deleted_at ? 'error' : rowConflictIds.has(row.id) ? 'warning' : 'success'" label>
                    {{ row.deleted_at ? 'inactive' : rowConflictIds.has(row.id) ? 'conflict' : 'active' }}
                  </v-chip>
                </td>
                <td>
                  <div class="flex gap-2">
                    <v-btn size="x-small" variant="text" prepend-icon="mdi-history" @click="openHistoryByRow(row)">
                      History
                    </v-btn>
                  </div>
                </td>
              </tr>
            </tbody>
            </v-table>
          </div>

          <div class="grid gap-3 md:hidden">
            <v-card v-for="row in flatRows" :key="`flat-card-${row.id}`" rounded="lg" variant="outlined">
              <v-card-text class="space-y-3">
                <div class="flex items-start justify-between gap-3">
                  <div>
                    <div class="font-semibold">{{ row.container_type?.name }}</div>
                    <div class="text-xs opacity-70">{{ row.line?.name }}</div>
                  </div>
                  <v-chip size="small" :color="row.deleted_at ? 'error' : rowConflictIds.has(row.id) ? 'warning' : 'success'" label>
                    {{ row.deleted_at ? 'inactive' : rowConflictIds.has(row.id) ? 'conflict' : 'active' }}
                  </v-chip>
                </div>

                <div class="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div class="text-xs opacity-60">Start date</div>
                    <div>{{ formatDateLabel(row.start_date) }}</div>
                  </div>
                  <div>
                    <div class="text-xs opacity-60">End date</div>
                    <div>{{ row.end_date ? formatDateLabel(row.end_date) : 'Open ended' }}</div>
                  </div>
                </div>

                <div class="flex items-center justify-between gap-3">
                  <v-chip size="small" :color="row.rate_type === 1 ? 'primary' : 'secondary'" label class="cursor-pointer" @click="openRateRow(row)">
                    Rate {{ row.rate_type }}
                  </v-chip>
                  <div class="font-medium">{{ formatCurrencyAmount(row.amount) }}</div>
                </div>

                <div class="flex justify-end">
                  <v-btn size="small" variant="text" prepend-icon="mdi-history" @click="openHistoryByRow(row)">
                    History
                  </v-btn>
                </div>
              </v-card-text>
            </v-card>
          </div>
        </v-card-text>
      </v-card>
    </template>

    <v-dialog v-model="compareDialog.show" max-width="1200" scrollable>
      <v-card rounded="xl">
        <v-toolbar color="primary" density="comfortable">
          <v-toolbar-title>Compare lines</v-toolbar-title>
          <v-spacer />
          <v-btn icon="mdi-close" variant="text" @click="compareDialog.show = false" />
        </v-toolbar>
        <v-card-text class="space-y-4 pt-4">
          <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
            <v-autocomplete
              v-model="compareDialog.leftLineId"
              :items="lines"
              item-title="name"
              item-value="id"
              label="Line A"
              density="compact"
              variant="outlined"
              clearable
            />
            <v-autocomplete
              v-model="compareDialog.rightLineId"
              :items="lines"
              item-title="name"
              item-value="id"
              label="Line B"
              density="compact"
              variant="outlined"
              clearable
            />
          </div>

          <v-alert
            v-if="!compareRows.length"
            type="info"
            variant="tonal"
            text="Select two lines with an active period on the selected reference date to compare them."
          />

          <div v-else class="overflow-x-auto">
            <v-table density="comfortable">
              <thead>
                <tr>
                  <th class="text-left">Container</th>
                  <th class="text-left">{{ compareLeft?.line_name }} Rate 1</th>
                  <th class="text-left">{{ compareLeft?.line_name }} Rate 2</th>
                  <th class="text-left">{{ compareRight?.line_name }} Rate 1</th>
                  <th class="text-left">{{ compareRight?.line_name }} Rate 2</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in compareRows" :key="`compare-${row.container_type_id}`">
                  <td class="font-medium">{{ row.container_name }}</td>
                  <td>{{ row.leftRate1 === null ? '—' : formatCurrencyAmount(row.leftRate1) }}</td>
                  <td>{{ row.leftRate2 === null ? '—' : formatCurrencyAmount(row.leftRate2) }}</td>
                  <td>{{ row.rightRate1 === null ? '—' : formatCurrencyAmount(row.rightRate1) }}</td>
                  <td>{{ row.rightRate2 === null ? '—' : formatCurrencyAmount(row.rightRate2) }}</td>
                </tr>
              </tbody>
            </v-table>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog v-model="cellDialog.show" max-width="520" persistent>
      <v-card rounded="xl">
        <v-toolbar color="primary" density="comfortable">
          <v-toolbar-title>
            {{ cellDialog.rowId ? 'Edit rate cell' : 'Create rate cell' }}
          </v-toolbar-title>
          <v-spacer />
          <v-btn icon="mdi-close" variant="text" @click="closeCellDialog" />
        </v-toolbar>
        <v-card-text class="space-y-4 pt-4">
          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <v-text-field :model-value="cellDialog.lineName" label="Line" variant="outlined" density="compact" readonly />
            <v-text-field :model-value="cellDialog.containerName" label="Container" variant="outlined" density="compact" readonly />
            <v-text-field :model-value="`Rate ${cellDialog.rateType}`" label="Rate type" variant="outlined" density="compact" readonly />
            <v-text-field
              v-model="cellDialog.amount"
              label="Amount"
              variant="outlined"
              density="compact"
              type="number"
              prefix="$"
              step="0.01"
            />
            <v-text-field v-model="cellDialog.startDate" label="Start date" variant="outlined" density="compact" type="date" />
            <v-text-field v-model="cellDialog.endDate" label="End date (optional)" variant="outlined" density="compact" type="date" />
          </div>
          <div class="text-sm opacity-70">Leave end date empty to keep this rate open-ended.</div>
        </v-card-text>
        <v-card-actions class="px-6 pb-6">
          <v-btn v-if="cellDialog.rowId" color="error" variant="text" prepend-icon="mdi-delete" @click="deleteCellRow">
            Delete
          </v-btn>
          <v-spacer />
          <v-btn variant="text" @click="closeCellDialog">Cancel</v-btn>
          <v-btn color="primary" :loading="cellDialog.saving" @click="saveCellDialog">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="bulkDialog.show" max-width="560" persistent>
      <v-card rounded="xl">
        <v-toolbar color="secondary" density="comfortable">
          <v-toolbar-title>Bulk update Rate {{ bulkDialog.rateType }}</v-toolbar-title>
          <v-spacer />
          <v-btn icon="mdi-close" variant="text" @click="bulkDialog.show = false" />
        </v-toolbar>
        <v-card-text class="space-y-4 pt-4">
          <div class="text-sm opacity-70">
            This will update all visible containers in {{ bulkDialog.lineName }} for {{ bulkDialog.periodLabel }}.
          </div>
          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <v-text-field
              v-model="bulkDialog.amount"
              label="Amount"
              density="compact"
              variant="outlined"
              type="number"
              prefix="$"
              step="0.01"
            />
            <v-text-field v-model="bulkDialog.startDate" label="Start date" density="compact" variant="outlined" type="date" />
            <v-text-field v-model="bulkDialog.endDate" label="End date (optional)" density="compact" variant="outlined" type="date" />
          </div>
          <div class="text-sm opacity-70">Leave end date empty to keep the updated rates open-ended.</div>
        </v-card-text>
        <v-card-actions class="px-6 pb-6">
          <v-spacer />
          <v-btn variant="text" @click="bulkDialog.show = false">Cancel</v-btn>
          <v-btn color="secondary" :loading="bulkDialog.saving" @click="applyBulkDialog">Apply</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="historyDialog.show" max-width="880" scrollable>
      <v-card rounded="xl">
        <v-toolbar color="info" density="comfortable">
          <v-toolbar-title>
            History · {{ historyDialog.lineName }} / {{ historyDialog.containerName }}
          </v-toolbar-title>
          <v-spacer />
          <v-btn icon="mdi-close" variant="text" @click="historyDialog.show = false" />
        </v-toolbar>
        <v-card-text class="pt-4">
          <v-table density="compact">
            <thead>
              <tr>
                <th class="text-left">Rate</th>
                <th class="text-left">Amount</th>
                <th class="text-left">Start</th>
                <th class="text-left">End</th>
                <th class="text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in historyDialog.rows" :key="`history-${row.id}`">
                <td>
                  <v-chip size="small" :color="row.rate_type === 1 ? 'primary' : 'secondary'" label>
                    Rate {{ row.rate_type }}
                  </v-chip>
                </td>
                <td>{{ formatCurrencyAmount(row.amount) }}</td>
                <td>{{ formatDateLabel(row.start_date) }}</td>
                <td>{{ row.end_date ? formatDateLabel(row.end_date) : 'Open ended' }}</td>
                <td>
                  <v-chip size="small" :color="row.deleted_at ? 'error' : rowConflictIds.has(row.id) ? 'warning' : 'success'" label>
                    {{ row.deleted_at ? 'inactive' : rowConflictIds.has(row.id) ? 'conflict' : 'active' }}
                  </v-chip>
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
 </template>
 
 <script setup lang="ts">
 import {
   buildLineGroups,
   cleanContainerDelayQuery,
   fetchAllContainerDelayRates,
   formatCurrencyAmount,
   formatDateLabel,
   getConflictRateIds,
   getHistoryRows,
   toDateOnly,
   todayKey,
   type LineGroup,
   type MatrixCell,
   type MatrixRow,
   type NamedCatalog,
   type PeriodGroup,
   type RateRow,
   type RateType,
 } from '~/composables/useContainerDelayRates'
 
 const { $api, $notifications } = useNuxtApp()
 const snackbar = useSnackbar()
 const router = useRouter()
 const loadingStore = useLoadingStore()
 const confirm = $notifications.useConfirm()
 
 const lines = ref<NamedCatalog[]>([])
 const containerTypes = ref<NamedCatalog[]>([])
 const allRows = ref<RateRow[]>([])
 const loading = ref(false)
 const viewMode = ref<'matrix' | 'list'>('matrix')
 
 const viewOptions = [
   { label: 'Matrix', value: 'matrix' },
   { label: 'List', value: 'list' },
 ]
 
 const filters = reactive({
   search: '',
   line_id: null as number | null,
   container_type_id: null as number | null,
   active_on: todayKey(),
   active_only: true,
   conflicts_only: false,
   show_deleted: false,
 })
 
 const selectedPeriodKeys = reactive<Record<number, string | null>>({})
 
 const compareDialog = reactive({
   show: false,
   leftLineId: null as number | null,
   rightLineId: null as number | null,
 })
 
 const cellDialog = reactive({
   show: false,
   saving: false,
   rowId: null as number | null,
   lineId: null as number | null,
   lineName: '',
   containerTypeId: null as number | null,
   containerName: '',
   rateType: 1 as RateType,
   amount: null as number | null,
   startDate: todayKey(),
   endDate: null as string | null,
 })
 
 const bulkDialog = reactive({
   show: false,
   saving: false,
   lineId: null as number | null,
   lineName: '',
   periodKey: null as string | null,
   periodLabel: '',
   rateType: 1 as RateType,
   amount: null as number | null,
   startDate: todayKey(),
   endDate: null as string | null,
   rows: [] as MatrixRow[],
 })
 
 const historyDialog = reactive({
   show: false,
   lineId: null as number | null,
   lineName: '',
   containerTypeId: null as number | null,
   containerName: '',
   rows: [] as RateRow[],
 })
 
 const rowConflictIds = computed(() => getConflictRateIds(allRows.value))
 
 const lineGroups = computed(() =>
   buildLineGroups(allRows.value, containerTypes.value, {
     includeEmptyContainers: true,
     lineId: filters.line_id,
     containerTypeId: filters.container_type_id,
     search: filters.search,
     activeOnly: filters.active_only,
     conflictsOnly: filters.conflicts_only,
     hideDeleted: !filters.show_deleted,
     onDate: filters.active_on || todayKey(),
   })
 )
 
 const metrics = computed(() => ({
   lines: lineGroups.value.length,
   activePeriods: lineGroups.value.reduce((acc, line) => acc + line.periods.filter((period) => period.is_active).length, 0),
   incompleteRows: lineGroups.value.reduce((acc, line) => acc + line.incompleteCount, 0),
   conflictRows: lineGroups.value.reduce((acc, line) => acc + line.conflictsCount, 0),
 }))
 
 const flatRows = computed(() => {
   const selectedDate = filters.active_on || todayKey()
   return allRows.value
     .filter((row) => {
       if (filters.line_id && row.line_id !== filters.line_id) return false
       if (filters.container_type_id && row.container_type_id !== filters.container_type_id) return false
       if (!filters.show_deleted && row.deleted_at) return false
       if (filters.active_only) {
         const start = toDateOnly(row.start_date)
         const end = toDateOnly(row.end_date)
         if (start && start > selectedDate) return false
         if (end && end < selectedDate) return false
       }
       if (!filters.search) return true
       const haystack = [row.line?.name, row.container_type?.name, row.amount, row.start_date, row.end_date]
         .filter(Boolean)
         .join(' ')
         .toLowerCase()
       return haystack.includes(filters.search.toLowerCase())
     })
     .filter((row) => !filters.conflicts_only || rowConflictIds.value.has(row.id))
     .sort((left, right) => {
       const lineCompare = `${left.line?.name ?? ''}`.localeCompare(`${right.line?.name ?? ''}`)
       if (lineCompare !== 0) return lineCompare
       const containerCompare = `${left.container_type?.name ?? ''}`.localeCompare(`${right.container_type?.name ?? ''}`)
       if (containerCompare !== 0) return containerCompare
       return `${left.start_date ?? ''}`.localeCompare(`${right.start_date ?? ''}`)
     })
 })
 
 const compareSourceGroups = computed(() =>
   buildLineGroups(allRows.value, containerTypes.value, {
     includeEmptyContainers: true,
     activeOnly: true,
     hideDeleted: !filters.show_deleted,
     onDate: filters.active_on || todayKey(),
   })
 )
 
 const compareLeft = computed(() => compareSourceGroups.value.find((line) => line.line_id === compareDialog.leftLineId) ?? null)
 const compareRight = computed(() => compareSourceGroups.value.find((line) => line.line_id === compareDialog.rightLineId) ?? null)
 
 const compareRows = computed(() => {
   const leftPeriod = compareLeft.value ? getSelectedPeriod(compareLeft.value) : null
   const rightPeriod = compareRight.value ? getSelectedPeriod(compareRight.value) : null
   if (!leftPeriod || !rightPeriod) return []
 
   const containers = new Map<number, string>()
   leftPeriod.rows.forEach((row) => containers.set(row.container_type_id, row.container_name))
   rightPeriod.rows.forEach((row) => containers.set(row.container_type_id, row.container_name))
 
   return [...containers.entries()]
     .map(([containerTypeId, containerName]) => {
       const leftRow = leftPeriod.rows.find((row) => row.container_type_id === containerTypeId)
       const rightRow = rightPeriod.rows.find((row) => row.container_type_id === containerTypeId)
 
       return {
         container_type_id: containerTypeId,
         container_name: containerName,
         leftRate1: leftRow?.rate1?.amount ?? null,
         leftRate2: leftRow?.rate2?.amount ?? null,
         rightRate1: rightRow?.rate1?.amount ?? null,
         rightRate2: rightRow?.rate2?.amount ?? null,
       }
     })
     .sort((left, right) => left.container_name.localeCompare(right.container_name))
 })
 
 watch(
   lineGroups,
   (groups) => {
     groups.forEach((line) => {
       const selected = selectedPeriodKeys[line.line_id]
       if (!selected || !line.periods.some((period) => period.key === selected)) {
         selectedPeriodKeys[line.line_id] = line.activePeriodKey ?? line.periods[0]?.key ?? null
       }
     })
   },
   { immediate: true }
 )
 
 async function loadCatalogs() {
   const [ls, cts] = await Promise.all([
     $api.lines.getLines({ query: { perPage: 1000 } }),
     $api.containers.getAllTypes({ query: { perPage: 1000 } }),
   ])
 
   lines.value = (ls?.data ?? ls ?? []) as NamedCatalog[]
   containerTypes.value = (cts?.data ?? cts ?? []) as NamedCatalog[]
 }
 
 async function loadRates() {
   try {
     loading.value = true
     loadingStore.start()
 
     const baseQuery = cleanContainerDelayQuery({
       line_id: filters.line_id,
       container_type_id: filters.container_type_id,
     })
 
     const [activeRows, deletedRows] = await Promise.all([
       fetchAllContainerDelayRates($api, baseQuery),
       fetchAllContainerDelayRates($api, { ...baseQuery, deleted_status: 'deleted' }),
     ])
 
     const merged = [...activeRows, ...deletedRows].reduce((acc, row) => {
       if (!acc.some((item) => item.id === row.id)) acc.push(row)
       return acc
     }, [] as RateRow[])
 
     allRows.value = merged
   } catch (error) {
     console.error(error)
     snackbar.add({ type: 'error', text: 'Failed to load Container DnD Rates' })
   } finally {
     loading.value = false
     setTimeout(() => loadingStore.stop(), 250)
   }
 }
 
 function getSelectedPeriod(line: LineGroup) {
   const selectedKey = selectedPeriodKeys[line.line_id] ?? line.activePeriodKey
   return line.periods.find((period) => period.key === selectedKey) ?? line.periods[0] ?? null
 }

 function getPeriodOptions(line: LineGroup) {
   return line.periods.map((period) => ({
     label: period.label,
     value: period.key,
   }))
 }

 function getDisplayRows(line: LineGroup) {
   if (!filters.active_only) {
     const selectedPeriod = getSelectedPeriod(line)
     if (!selectedPeriod) return []

     return selectedPeriod.rows.map((row) => ({
       key: `${line.line_id}-${selectedPeriod.key}-${row.container_type_id}`,
       row,
       period: selectedPeriod,
       periodLabel: selectedPeriod.label,
       startDate: row.rate1?.startDate ?? row.rate2?.startDate ?? selectedPeriod.start_date,
       endDate: row.rate1?.endDate ?? row.rate2?.endDate ?? selectedPeriod.end_date,
     }))
   }

   return line.periods
     .filter((period) => period.is_active)
     .flatMap((period) =>
       period.rows.map((row) => ({
         key: `${line.line_id}-${period.key}-${row.container_type_id}`,
         row,
         period,
         periodLabel: period.label,
         startDate: row.rate1?.startDate ?? row.rate2?.startDate ?? period.start_date,
         endDate: row.rate1?.endDate ?? row.rate2?.endDate ?? period.end_date,
       }))
     )
     .sort((left, right) => {
       const containerCompare = left.row.container_name.localeCompare(right.row.container_name)
       if (containerCompare !== 0) return containerCompare
       return `${left.startDate ?? ''}`.localeCompare(`${right.startDate ?? ''}`)
     })
 }
 
 function getPeriodChipColor(status: PeriodGroup['status']) {
   if (status === 'active') return 'success'
   if (status === 'upcoming') return 'info'
   return 'default'
 }
 
 function getRowStatusColor(status: MatrixRow['status']) {
   if (status === 'conflict') return 'error'
   if (status === 'incomplete') return 'warning'
   if (status === 'inactive') return 'secondary'
   return 'success'
 }
 
 function getCellColor(cell: MatrixCell | null, status: MatrixRow['status']) {
   if (!cell) return 'grey'
   if (cell.deletedAt) return 'secondary'
   if (cell.hasConflict || status === 'conflict') return 'error'
   return cell.rateType === 1 ? 'primary' : 'secondary'
 }
 
 async function clearFilters() {
   filters.search = ''
   filters.line_id = null
   filters.container_type_id = null
   filters.active_on = todayKey()
   filters.active_only = true
   filters.conflicts_only = false
   filters.show_deleted = false
 
   await loadRates()
 }
 
 function duplicateConfiguration(line: LineGroup) {
   const period = getSelectedPeriod(line)
   router.push({
     path: '/configuration/container-delay-rates/add',
     query: {
       duplicate_line_id: `${line.line_id}`,
       duplicate_start_date: period?.start_date ?? '',
       duplicate_end_date: period?.end_date ?? '',
     },
   })
 }

 function openRateRow(row: RateRow) {
   router.push({
     path: `/configuration/container-delay-rates/edit-${row.id}`,
     query: {
       start_date: toDateOnly(row.start_date) ?? '',
       end_date: toDateOnly(row.end_date) ?? '',
     },
   })
 }
 
 function openCellDialog(line: LineGroup, period: PeriodGroup, row: MatrixRow, rateType: RateType) {
   const cell = rateType === 1 ? row.rate1 : row.rate2
   cellDialog.show = true
   cellDialog.rowId = cell?.rowId ?? null
   cellDialog.lineId = line.line_id
   cellDialog.lineName = line.line_name
   cellDialog.containerTypeId = row.container_type_id
   cellDialog.containerName = row.container_name
   cellDialog.rateType = rateType
   cellDialog.amount = cell?.amount ?? null
   cellDialog.startDate = cell?.startDate ?? period.start_date ?? todayKey()
   cellDialog.endDate = cell?.endDate ?? period.end_date ?? null
 }
 
 function closeCellDialog() {
   cellDialog.show = false
   cellDialog.saving = false
   cellDialog.rowId = null
   cellDialog.lineId = null
   cellDialog.lineName = ''
   cellDialog.containerTypeId = null
   cellDialog.containerName = ''
   cellDialog.rateType = 1
   cellDialog.amount = null
   cellDialog.startDate = todayKey()
   cellDialog.endDate = null
 }
 
 async function saveCellDialog() {
   if (!cellDialog.lineId || !cellDialog.containerTypeId || cellDialog.amount === null || !cellDialog.startDate) {
     snackbar.add({ type: 'error', text: 'Complete amount and dates before saving.' })
     return
   }
 
   try {
     cellDialog.saving = true
     loadingStore.start()
 
     if (cellDialog.rowId) {
       await $api.containerDelayRates.updateRate(`${cellDialog.rowId}`, {
         line_id: cellDialog.lineId,
         container_type_id: cellDialog.containerTypeId,
         rate_type: cellDialog.rateType,
         amount: Number(cellDialog.amount),
         start_date: cellDialog.startDate,
         end_date: cellDialog.endDate || null,
       })
     } else {
       await $api.containerDelayRates.createRates({
         line_id: cellDialog.lineId,
         container_type_ids: [cellDialog.containerTypeId],
         all_containers: false,
         rate_type: cellDialog.rateType,
         amount: Number(cellDialog.amount),
         start_date: cellDialog.startDate,
         end_date: cellDialog.endDate || null,
       })
     }
 
     snackbar.add({ type: 'success', text: 'Rate cell saved' })
     closeCellDialog()
     await loadRates()
   } catch (error: any) {
     console.error(error)
     snackbar.add({ type: 'error', text: error?.data?.message || 'Failed to save rate cell' })
   } finally {
     cellDialog.saving = false
     setTimeout(() => loadingStore.stop(), 250)
   }
 }
 
 async function deleteCellRow() {
   if (!cellDialog.rowId) return
 
   const result = await confirm({
     title: 'Delete rate?',
     content: 'This will deactivate the selected rate row.',
     confirmationText: 'Delete',
     dialogProps: { persistent: true, maxWidth: 500 },
     confirmationButtonProps: { color: 'error' },
   })
 
   if (!result) return
 
   try {
     cellDialog.saving = true
     loadingStore.start()
     await $api.containerDelayRates.deleteRate(`${cellDialog.rowId}`)
     snackbar.add({ type: 'success', text: 'Rate row deleted' })
     closeCellDialog()
     await loadRates()
   } catch (error) {
     console.error(error)
     snackbar.add({ type: 'error', text: 'Failed to delete rate row' })
   } finally {
     cellDialog.saving = false
     setTimeout(() => loadingStore.stop(), 250)
   }
 }
 
 function openBulkDialog(line: LineGroup, rateType: RateType) {
   const period = getSelectedPeriod(line)
   if (!period) return
 
   bulkDialog.show = true
   bulkDialog.lineId = line.line_id
   bulkDialog.lineName = line.line_name
   bulkDialog.periodKey = period.key
   bulkDialog.periodLabel = period.label
   bulkDialog.rateType = rateType
   bulkDialog.startDate = period.start_date ?? todayKey()
   bulkDialog.endDate = period.end_date ?? null
   bulkDialog.amount = null
   bulkDialog.rows = period.rows
 }
 
 async function applyBulkDialog() {
   if (!bulkDialog.lineId || bulkDialog.amount === null || !bulkDialog.startDate) {
     snackbar.add({ type: 'error', text: 'Set amount and dates before applying bulk update.' })
     return
   }
 
   try {
     bulkDialog.saving = true
     loadingStore.start()
 
     for (const row of bulkDialog.rows) {
       const cell = bulkDialog.rateType === 1 ? row.rate1 : row.rate2
       if (cell?.rowId) {
         await $api.containerDelayRates.updateRate(`${cell.rowId}`, {
           line_id: bulkDialog.lineId,
           container_type_id: row.container_type_id,
           rate_type: bulkDialog.rateType,
           amount: Number(bulkDialog.amount),
           start_date: bulkDialog.startDate,
           end_date: bulkDialog.endDate || null,
         })
       } else {
         await $api.containerDelayRates.createRates({
           line_id: bulkDialog.lineId,
           container_type_ids: [row.container_type_id],
           all_containers: false,
           rate_type: bulkDialog.rateType,
           amount: Number(bulkDialog.amount),
           start_date: bulkDialog.startDate,
           end_date: bulkDialog.endDate || null,
         })
       }
     }
 
     snackbar.add({ type: 'success', text: `Rate ${bulkDialog.rateType} updated for ${bulkDialog.rows.length} containers` })
     bulkDialog.show = false
     await loadRates()
   } catch (error: any) {
     console.error(error)
     snackbar.add({ type: 'error', text: error?.data?.message || 'Bulk update failed' })
   } finally {
     bulkDialog.saving = false
     setTimeout(() => loadingStore.stop(), 250)
   }
 }
 
 function openHistory(line: LineGroup, row: MatrixRow) {
   historyDialog.show = true
   historyDialog.lineId = line.line_id
   historyDialog.lineName = line.line_name
   historyDialog.containerTypeId = row.container_type_id
   historyDialog.containerName = row.container_name
   historyDialog.rows = getHistoryRows(allRows.value, line.line_id, row.container_type_id)
 }
 
 function openHistoryByRow(row: RateRow) {
   const lineName = row.line?.name ?? `Line ${row.line_id}`
   const containerName = row.container_type?.name ?? `Container ${row.container_type_id}`
   historyDialog.show = true
   historyDialog.lineId = row.line_id
   historyDialog.lineName = lineName
   historyDialog.containerTypeId = row.container_type_id
   historyDialog.containerName = containerName
   historyDialog.rows = getHistoryRows(allRows.value, row.line_id, row.container_type_id)
 }
 
 onMounted(async () => {
   try {
     loadingStore.start()
     await loadCatalogs()
     await loadRates()
   } finally {
     setTimeout(() => loadingStore.stop(), 250)
   }
 })
 </script>
