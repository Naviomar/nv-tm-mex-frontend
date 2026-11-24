<template>
  <div>
    <v-card>
      <v-card-title class="d-flex align-center flex-wrap gap-2">
        <span>Agents F.F. SOA - Bulk load</span>
        <span class="text-caption text-medium-emphasis">
          Read the agent's statement, match it against the notes in the system and request the payment
        </span>
        <v-spacer />
        <v-btn size="small" variant="outlined" to="/payments/agents/soa">
          <v-icon start>mdi-arrow-left</v-icon>Back to SOA
        </v-btn>
      </v-card-title>

      <v-card-text>
        <div class="d-flex flex-wrap gap-2 mb-4">
          <v-chip
            v-for="s in stepLabels"
            :key="s.value"
            :color="step === s.value ? 'primary' : undefined"
            :variant="step === s.value ? 'flat' : 'outlined'"
            :disabled="s.value > maxStep"
            @click="step = s.value"
          >
            {{ s.value }}. {{ s.title }}
          </v-chip>
        </div>

        <!-- Step 1: agent + file + detected layout -->
        <div v-show="step === 1">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3 items-start">
            <v-autocomplete
              v-model="forwarderId"
              clearable
              :items="freightForwarders"
              item-title="name"
              item-value="id"
              density="compact"
              label="Freight forwarder"
              hide-details
              :disabled="!!groupId"
              @update:model-value="onAgentChange"
            />
            <AGlobalSearch
              v-model="groupId"
              :onSearch="searchFfGroups"
              validate-key="freightGroupId"
              label="Or freight forwarder group"
              @update:model-value="onAgentChange"
            />
            <FileDropzone @drop-files="onFile">
              <v-file-input
                v-model="fileModel"
                density="compact"
                label="Agent statement (.xls, .xlsx, .xlsb, .csv)"
                accept=".xls,.xlsx,.xlsb,.csv"
                hide-details
                prepend-icon=""
                prepend-inner-icon="mdi-paperclip"
                @update:model-value="onFile"
              />
            </FileDropzone>
          </div>

          <div v-if="rawRows.length" class="mt-4">
            <div class="flex flex-wrap items-center gap-2 mb-2">
              <v-icon :color="hasRequiredColumns && parsedRows.length ? 'success' : 'warning'">
                {{ hasRequiredColumns && parsedRows.length ? 'mdi-check-circle-outline' : 'mdi-alert-outline' }}
              </v-icon>
              <span class="text-sm">
                <template v-if="hasRequiredColumns && parsedRows.length">
                  <b>{{ parsedRows.length }}</b> rows read from <b>{{ fileName }}</b>
                  <span v-if="ignoredCount > 0" class="text-medium-emphasis">
                    · {{ ignoredCount }} ignored (empty, totals or without amount)
                  </span>
                </template>
                <template v-else>
                  The columns could not be identified in <b>{{ fileName }}</b>. Tell us where they are.
                </template>
              </span>
              <v-chip v-if="appliedProfileName" size="x-small" color="primary" variant="tonal">
                <v-icon start size="x-small">mdi-account-check-outline</v-icon>Your layout "{{ appliedProfileName }}"
              </v-chip>
              <v-chip v-else-if="hasRequiredColumns" size="x-small" variant="tonal">
                <v-icon start size="x-small">mdi-auto-fix</v-icon>Detected automatically
              </v-chip>
              <v-spacer />
              <v-btn size="small" variant="text" @click="showAdjust = !showAdjust">
                <v-icon start>{{ showAdjust ? 'mdi-chevron-up' : 'mdi-tune-variant' }}</v-icon>
                {{ showAdjust ? 'Hide column settings' : 'Adjust columns' }}
              </v-btn>
            </div>

            <div v-if="mappingSummary.length" class="flex flex-wrap gap-1 mb-2">
              <v-chip v-for="m in mappingSummary" :key="m.label" size="x-small" variant="outlined">
                {{ m.label }}: {{ m.text }}
              </v-chip>
            </div>

            <div v-show="showAdjust" class="border tm-border p-3 mb-3">
              <div class="flex flex-wrap items-center gap-2 mb-3">
                <v-select
                  v-model="profileId"
                  :items="profileItems"
                  item-title="title"
                  item-value="id"
                  clearable
                  density="compact"
                  label="My saved layouts"
                  hide-details
                  style="max-width: 320px"
                  @update:model-value="onProfileSelected"
                />
                <v-btn v-if="profileId" size="small" variant="text" color="error" @click="deleteProfile">
                  <v-icon start>mdi-delete-outline</v-icon>Delete layout
                </v-btn>
                <v-btn size="small" variant="text" @click="autoDetect">
                  <v-icon start>mdi-auto-fix</v-icon>Detect again
                </v-btn>
              </div>

              <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                <v-select
                  v-if="sheetNames.length > 1"
                  v-model="sheetName"
                  :items="sheetNames"
                  density="compact"
                  label="Sheet"
                  hide-details
                  @update:model-value="loadSheet"
                />
                <v-text-field
                  v-model.number="config.header_row"
                  type="number"
                  min="1"
                  density="compact"
                  label="Header row"
                  hide-details
                />
              </div>

              <div class="grid grid-cols-2 md:grid-cols-5 gap-3 mt-3">
                <v-select
                  v-model="config.columns.folio"
                  :items="columnOptions"
                  clearable
                  density="compact"
                  label="Note / folio"
                  hide-details
                />
                <v-select
                  v-model="config.columns.mbl"
                  :items="columnOptions"
                  clearable
                  density="compact"
                  label="Master BL / AWB"
                  hide-details
                />
                <v-select
                  v-model="config.columns.counter"
                  :items="columnOptions"
                  clearable
                  density="compact"
                  label="TM reference (optional)"
                  hide-details
                />
                <v-select
                  v-model="config.columns.amount"
                  :items="columnOptions"
                  clearable
                  density="compact"
                  label="Amount (single column)"
                  hide-details
                />
                <v-select
                  v-model="config.columns.debit"
                  :items="columnOptions"
                  clearable
                  density="compact"
                  label="Debit"
                  hide-details
                  :disabled="config.columns.amount !== null"
                />
                <v-select
                  v-model="config.columns.credit"
                  :items="columnOptions"
                  clearable
                  density="compact"
                  label="Credit"
                  hide-details
                  :disabled="config.columns.amount !== null"
                />
              </div>
              <div class="text-caption text-medium-emphasis mt-2">
                Use either a single signed amount column or the debit and credit columns. A positive amount (or a
                debit) is a balance in the agent's favor and TM pays it.
              </div>
            </div>

            <div v-if="parsedRows.length" class="catalog-table-wrapper" style="max-height: 240px">
              <v-table density="compact" class="soa-table table-nowrap">
                <thead>
                  <tr>
                    <th>Sheet row</th>
                    <th>Folio</th>
                    <th>Master</th>
                    <th>TM reference</th>
                    <th class="text-right">Amount (agent)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="r in parsedRows.slice(0, 5)" :key="`p-${r.row}`">
                    <td>{{ r.row }}</td>
                    <td>{{ r.folio }}</td>
                    <td>{{ r.mbl }}</td>
                    <td>{{ r.counter }}</td>
                    <td class="text-right">{{ formatToCurrency(r.amount) }}</td>
                  </tr>
                </tbody>
              </v-table>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-4 mt-4">
            <v-btn color="primary" :disabled="!canMatch" @click="runMatch">
              <v-icon start>mdi-magnify-scan</v-icon>Match against the system
            </v-btn>
            <v-checkbox v-model="rememberLayout" density="compact" hide-details label="Remember this layout for this agent" />
            <v-checkbox
              v-model="includeMissing"
              density="compact"
              hide-details
              label="Also list the agent's notes that are not in the file"
            />
            <span v-if="!canMatch && rawRows.length" class="text-caption text-medium-emphasis">
              {{ matchBlockedReason }}
            </span>
          </div>
        </div>

        <!-- Step 2: preview -->
        <div v-show="step === 2">
          <div v-if="result">
            <v-tabs v-model="tab" density="compact" color="primary" class="mb-3">
              <v-tab v-for="t in tabDefs" :key="t.value" :value="t.value">
                {{ t.title }}
                <v-chip size="x-small" class="ml-2" :color="t.color" variant="tonal">{{ tabCounts[t.value] }}</v-chip>
              </v-tab>
            </v-tabs>
            <div class="text-caption text-medium-emphasis mb-2">{{ tabHint }}</div>

            <div class="flex flex-wrap items-center gap-2 mb-3">
              <v-chip
                :variant="statusFilter === null ? 'flat' : 'outlined'"
                color="primary"
                size="small"
                @click="statusFilter = null"
              >
                All · {{ statusTotal }}
              </v-chip>
              <v-chip
                v-for="(count, status) in statusCounts"
                :key="`st-${status}`"
                :color="statusMeta(String(status)).color"
                :variant="statusFilter === status ? 'flat' : 'outlined'"
                size="small"
                @click="statusFilter = statusFilter === status ? null : String(status)"
              >
                {{ statusMeta(String(status)).label }} · {{ count }}
              </v-chip>
            </div>

            <div v-if="Object.keys(currencyCounts).length > 1 || currencyFilter" class="flex flex-wrap items-center gap-2 mb-3">
              <span class="text-xs font-bold">Currency:</span>
              <v-chip
                v-for="(count, cur) in currencyCounts"
                :key="`cur-${cur}`"
                color="primary"
                :variant="currencyFilter === cur ? 'flat' : 'outlined'"
                size="x-small"
                @click="currencyFilter = currencyFilter === cur ? null : String(cur)"
              >
                {{ cur }} · {{ count }}
              </v-chip>
            </div>

            <div class="mb-3">
              <v-btn size="x-small" variant="text" @click="showWarningFilters = !showWarningFilters">
                <v-icon start size="small">{{ showWarningFilters || flagFilter ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
                {{ showWarningFilters || flagFilter ? 'Hide' : 'Show' }} warning filters
              </v-btn>
              <div v-if="showWarningFilters || flagFilter" class="flex flex-wrap items-center gap-2 mt-1">
                <span class="text-xs font-bold">Warnings:</span>
                <v-chip
                  v-for="(count, flag) in flagCounts"
                  :key="`fl-${flag}`"
                  :color="flagMeta(String(flag)).color"
                  :variant="flagFilter === flag ? 'flat' : 'outlined'"
                  size="x-small"
                  @click="flagFilter = flagFilter === flag ? null : String(flag)"
                >
                  {{ flagMeta(String(flag)).label }} · {{ count }}
                </v-chip>
              </div>
            </div>

            <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
              <v-card variant="flat" class="tm-panel pa-2">
                <div class="text-caption text-medium-emphasis">Agent total (file)</div>
                <div class="text-lg">{{ formatToCurrency(result.summary.agent_total) }}</div>
              </v-card>
              <v-card variant="flat" class="tm-panel pa-2">
                <div class="text-caption text-medium-emphasis">Matched in the system</div>
                <div class="text-lg">{{ formatToCurrency(result.summary.system_total) }}</div>
              </v-card>
              <v-card variant="flat" class="tm-panel pa-2">
                <div class="text-caption text-medium-emphasis">Difference</div>
                <div class="text-lg" :class="totalDifference !== 0 ? 'text-error' : 'text-success'">
                  {{ formatToCurrency(totalDifference) }}
                </div>
              </v-card>
              <v-text-field v-model="search" clearable density="compact" label="Search folio / master / reference" hide-details />
            </div>

            <div class="flex flex-wrap items-center gap-2 mb-2">
              <v-btn size="x-small" color="primary" variant="tonal" @click="selectClean">Select matches without warnings</v-btn>
              <v-btn size="x-small" color="primary" variant="tonal" @click="selectedKeys = []">Clear selection</v-btn>
              <v-btn size="x-small" color="secondary" variant="tonal" @click="exportAttention">
                <v-icon start size="small">mdi-file-excel-outline</v-icon>Export rows that need attention
              </v-btn>
              <v-btn size="x-small" variant="text" @click="step = 1">Change file or columns</v-btn>
            </div>

            <div
              v-if="selectedKeys.length"
              class="flex flex-wrap items-center gap-3 mb-2 border p-2 tm-border bg-surface sticky top-0 z-10"
            >
              <span class="text-sm">
                <b>{{ selectedNotes.length }}</b> notes selected ·
                <span :class="selectedAgentBalance >= 0 ? 'text-error' : 'text-success'">
                  {{ selectedAgentBalance >= 0 ? 'Due to F.F. agent' : 'Due to TM' }}:
                  {{ formatToCurrency(Math.abs(selectedAgentBalance)) }}
                </span>
              </span>
              <v-btn color="green" size="small" variant="elevated" :disabled="!canRequestPayment" @click="confirmDialog = true">
                Lock and request payment
              </v-btn>
              <span v-if="currencyConflict" class="text-error text-xs">
                The selected notes use more than one currency ({{ selectedCurrencies.join(', ') }}). Filter by currency and select again.
              </span>
            </div>

            <div class="catalog-table-wrapper" style="max-height: 62vh">
              <v-table density="compact" class="soa-table table-nowrap" fixed-header>
                <thead>
                  <tr>
                    <th>
                      <v-checkbox
                        :model-value="allVisibleSelected"
                        :indeterminate="someVisibleSelected && !allVisibleSelected"
                        density="compact"
                        hide-details
                        @update:model-value="toggleVisible"
                      />
                    </th>
                    <th>Row</th>
                    <th>Status</th>
                    <th>Agent folio</th>
                    <th>Folio in the system</th>
                    <th>Agent master</th>
                    <th>Currency</th>
                    <th class="text-right">Agent amount</th>
                    <th class="text-right">System amount</th>
                    <th class="text-right">Difference</th>
                    <th>Warnings</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="r in pageRows" :key="`r-${r.key}`" :class="rowClass(r)" class="cursor-pointer" @click="openDetail(r)">
                    <td @click.stop>
                      <v-checkbox
                        v-if="isSelectable(r)"
                        v-model="selectedKeys"
                        :value="r.key"
                        density="compact"
                        hide-details
                      />
                    </td>
                    <td>{{ r.row }}</td>
                    <td>
                      <v-chip :color="statusMeta(r.status).color" size="x-small" variant="flat">
                        {{ statusMeta(r.status).label }}
                      </v-chip>
                    </td>
                    <td class="font-bold">{{ r.folio }}</td>
                    <td class="whitespace-normal!">
                      <div v-for="n in r.notes" :key="`n-${n.id}`" class="flex items-center gap-1 my-1">
                        <v-chip size="x-small" :color="sameFolio(r.folio, n.folio) ? 'success' : 'warning'" variant="flat">
                          {{ n.folio }}
                        </v-chip>
                        <span class="text-caption text-medium-emphasis">{{ n.reference_number }}</span>
                        <v-icon v-if="n.payment_request_id" size="x-small" color="deep-purple">mdi-file-document-outline</v-icon>
                        <v-icon v-else-if="n.checked_at" size="x-small" color="green">mdi-lock-outline</v-icon>
                      </div>
                      <div v-for="ref in r.references || []" :key="`ref-${ref.service}-${ref.id}`" class="text-caption my-1">
                        <v-chip size="x-small" color="warning" variant="outlined">{{ ref.reference_number }}</v-chip>
                        <span class="text-medium-emphasis">no note</span>
                      </div>
                      <span v-if="!r.notes.length && !(r.references || []).length" class="text-medium-emphasis">—</span>
                    </td>
                    <td class="max-w-[200px] whitespace-normal! break-words!">{{ r.mbl }}</td>
                    <td>{{ rowCurrencies(r).join(' / ') }}</td>
                    <td class="text-right">{{ formatToCurrency(r.agent_amount) }}</td>
                    <td class="text-right">{{ r.system_amount === null ? '' : formatToCurrency(r.system_amount) }}</td>
                    <td class="text-right" :class="r.difference ? 'text-error' : ''">
                      {{ r.difference === null || r.difference === 0 ? '' : formatToCurrency(r.difference) }}
                    </td>
                    <td class="whitespace-normal!">
                      <v-chip
                        v-for="f in r.flags"
                        :key="`f-${r.key}-${f}`"
                        :color="flagMeta(f).color"
                        size="x-small"
                        variant="tonal"
                        class="mr-1 mb-1"
                      >
                        {{ flagMeta(f).label }}
                        <v-tooltip activator="parent" location="top" max-width="320">{{ flagDetail(r, f) }}</v-tooltip>
                      </v-chip>
                    </td>
                    <td><v-icon size="small">mdi-chevron-right</v-icon></td>
                  </tr>
                </tbody>
              </v-table>
            </div>
            <v-pagination v-model="page" :length="pageCount" density="compact" :total-visible="7" class="mt-2" />

            <div v-if="result.missing_in_file" class="mt-6">
              <div class="font-bold mb-1">
                Notes of this agent that are not in the file ({{ result.missing_in_file.total }})
                <span v-if="result.missing_in_file.total > result.missing_in_file.notes.length" class="text-caption">
                  — showing the newest {{ result.missing_in_file.notes.length }}
                </span>
              </div>
              <div class="catalog-table-wrapper" style="max-height: 280px">
                <v-table density="compact" class="soa-table table-nowrap">
                  <thead>
                    <tr>
                      <th>Note</th>
                      <th>Reference</th>
                      <th>Master</th>
                      <th>Type</th>
                      <th class="text-right">Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="n in result.missing_in_file.notes" :key="`m-${n.id}`">
                      <td>#{{ n.folio }}</td>
                      <td>{{ n.reference_number }}</td>
                      <td>{{ n.master }}</td>
                      <td>{{ n.inbound ? 'From agent' : 'From TM' }} / {{ n.type === 'C' ? 'Credit' : 'Debit' }}</td>
                      <td class="text-right">{{ formatToCurrency(n.amount) }}</td>
                      <td>{{ n.checked_at ? 'Locked' : 'Open' }}</td>
                    </tr>
                  </tbody>
                </v-table>
              </div>
            </div>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <v-navigation-drawer v-model="detailShow" temporary location="right" width="560">
      <div v-if="detailRow" class="pa-4">
        <div class="flex items-center gap-2 mb-3">
          <v-chip :color="statusMeta(detailRow.status).color" size="small" variant="flat">
            {{ statusMeta(detailRow.status).label }}
          </v-chip>
          <span class="text-caption text-medium-emphasis">
            File row {{ detailRow.row }}<template v-if="detailRow.matched_by"> · matched by {{ matchedByLabel(detailRow.matched_by) }}</template>
          </span>
          <v-spacer />
          <v-btn icon="mdi-close" size="small" variant="text" @click="detailShow = false" />
        </div>

        <div class="tm-panel pa-3 mb-3">
          <div class="text-caption text-medium-emphasis">What the agent sent</div>
          <div class="grid grid-cols-2 gap-2 mt-1 text-sm">
            <div><span class="text-medium-emphasis">Folio:</span> <b>{{ detailRow.folio || '—' }}</b></div>
            <div><span class="text-medium-emphasis">Amount:</span> <b>{{ formatToCurrency(detailRow.agent_amount) }}</b></div>
            <div class="col-span-2"><span class="text-medium-emphasis">Master:</span> {{ detailRow.mbl || '—' }}</div>
            <div v-if="detailRow.counter" class="col-span-2">
              <span class="text-medium-emphasis">TM reference:</span> {{ detailRow.counter }}
            </div>
          </div>
        </div>

        <div v-if="detailRow.flags.length" class="mb-3">
          <div class="text-caption text-medium-emphasis mb-1">Warnings</div>
          <v-alert
            v-for="f in detailRow.flags"
            :key="`d-${f}`"
            :type="flagMeta(f).color === 'error' ? 'error' : 'warning'"
            variant="tonal"
            density="compact"
            class="mb-1"
          >
            <b>{{ flagMeta(f).label }}.</b> {{ flagDetail(detailRow, f) }}
          </v-alert>
        </div>

        <div class="text-caption text-medium-emphasis mb-1">
          Notes in the system · expected {{ detailRow.system_amount === null ? '—' : formatToCurrency(detailRow.system_amount) }}
          <template v-if="detailRow.difference"> · difference {{ formatToCurrency(detailRow.difference) }}</template>
        </div>
        <div v-for="n in detailRow.notes" :key="`dn-${n.id}`" class="tm-panel pa-3 mb-2">
          <div class="flex items-center gap-2">
            <b>#{{ n.folio }}</b>
            <v-chip v-if="n.payment_request_id" size="x-small" color="deep-purple">
              {{ n.payment_request_folio || `Payment request #${n.payment_request_id}` }}
            </v-chip>
            <v-chip v-else-if="n.checked_at" size="x-small" color="green" variant="tonal">Locked</v-chip>
            <v-chip v-if="n.cancelled" size="x-small" color="error">Cancelled</v-chip>
            <v-spacer />
            <v-btn size="x-small" variant="tonal" color="blue" @click="viewNote(n.id)">
              <v-icon start size="small">mdi-eye-outline</v-icon>Open note
            </v-btn>
          </div>
          <div class="text-sm mt-1">
            {{ n.reference_number }} · {{ n.service }} · {{ n.customer }}
          </div>
          <div class="text-sm text-medium-emphasis">
            {{ n.inbound ? 'From agent' : 'From TM' }} / {{ n.type === 'C' ? 'Credit' : 'Debit' }} ·
            {{ formatToCurrency(n.amount) }} · expected from the agent {{ formatToCurrency(n.expected_agent_amount) }}
          </div>
          <div v-if="n.master" class="text-xs text-medium-emphasis">Master: {{ n.master }}</div>
        </div>
        <div v-if="!detailRow.notes.length" class="text-sm text-medium-emphasis mb-2">No note was found for this row.</div>

        <div v-if="(detailRow.references || []).length" class="mt-3">
          <div class="text-caption text-medium-emphasis mb-1">References with this master and no note registered</div>
          <div v-for="ref in detailRow.references" :key="`dr-${ref.service}-${ref.id}`" class="tm-panel pa-3 mb-2 text-sm">
            <b>{{ ref.reference_number }}</b> · {{ ref.service }} · {{ ref.customer }}
            <div class="text-xs text-medium-emphasis">Master: {{ ref.master }}</div>
          </div>
        </div>

        <div v-if="isSelectable(detailRow)" class="mt-3">
          <v-btn
            block
            :color="selectedKeys.includes(detailRow.key) ? undefined : 'primary'"
            :variant="selectedKeys.includes(detailRow.key) ? 'outlined' : 'flat'"
            @click="toggleRow(detailRow.key)"
          >
            {{ selectedKeys.includes(detailRow.key) ? 'Remove from the payment' : 'Add to the payment' }}
          </v-btn>
        </div>
      </div>
    </v-navigation-drawer>

    <v-dialog v-model="confirmDialog" max-width="520">
      <v-card>
        <v-card-title>Lock notes and request payment</v-card-title>
        <v-card-text>
          <div class="grid grid-cols-2 gap-2 text-sm">
            <div class="text-medium-emphasis">Notes</div>
            <div class="text-right"><b>{{ selectedNotes.length }}</b></div>
            <div class="text-medium-emphasis">To lock now</div>
            <div class="text-right">
              <b>{{ selectedNotes.filter((n) => !n.checked_at).length }}</b>
              <span class="text-medium-emphasis"> ({{ selectedNotes.filter((n) => n.checked_at).length }} already locked)</span>
            </div>
            <div class="text-medium-emphasis">Rows of the file</div>
            <div class="text-right">{{ selectedKeys.length }}</div>
            <div class="text-medium-emphasis">Agent</div>
            <div class="text-right">{{ groupId ? 'Group' : forwarderName(forwarderId) }}</div>
            <div class="text-medium-emphasis">{{ selectedAgentBalance >= 0 ? 'Due to F.F. agent' : 'Due to TM' }}</div>
            <div class="text-right text-lg" :class="selectedAgentBalance >= 0 ? 'text-error' : 'text-success'">
              <b>{{ formatToCurrency(Math.abs(selectedAgentBalance)) }}</b>
            </div>
          </div>
          <v-alert v-if="selectedWithWarnings" type="warning" variant="tonal" density="compact" class="mt-3">
            {{ selectedWithWarnings }} selected row(s) still have warnings (for example an amount that differs from the
            agent's). Review them before continuing.
          </v-alert>
          <div class="text-caption text-medium-emphasis mt-3">
            The notes are locked and a payment request is created with them. You will be taken to the request.
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="confirmDialog = false">Cancel</v-btn>
          <v-btn color="green" variant="elevated" @click="confirmAndRequest">Lock and request payment</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="noteViewDialog.show" fullscreen>
      <v-card>
        <v-toolbar color="primary">
          <v-btn icon @click="noteViewDialog.show = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <v-toolbar-title>F.F. Note #{{ noteViewDialog.noteId }}</v-toolbar-title>
        </v-toolbar>
        <v-card-text>
          <FfAgentInvoiceNoteDetails v-if="noteViewDialog.show" :id="String(noteViewDialog.noteId)" />
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>
<script setup lang="ts">
const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const router = useRouter()
const loadingStore = useLoadingStore()

type Columns = {
  folio: number | null
  mbl: number | null
  counter: number | null
  amount: number | null
  debit: number | null
  credit: number | null
}

const stepLabels = [
  { value: 1, title: 'Agent and file' },
  { value: 2, title: 'Review and payment' },
]

const step = ref(1)
const maxStep = ref(1)

const freightForwarders = ref<any[]>([])
const forwarderId = ref<number | null>(null)
const groupId = ref<number | null>(null)

const fileModel = ref<any>(null)
const fileName = ref('')
const sheetNames = ref<string[]>([])
const sheetName = ref('')
const rawRows = ref<string[][]>([])
let workbook: any = null
let XLSX: any = null

const defaultConfig = () => ({
  header_row: 1,
  amount_mode: 'signed',
  columns: { folio: null, mbl: null, counter: null, amount: null, debit: null, credit: null } as Columns,
})
const config = ref<any>(defaultConfig())

const profiles = ref<any[]>([])
const profileId = ref<number | null>(null)
const rememberLayout = ref(false)
const showAdjust = ref(false)

const includeMissing = ref(false)
const result = ref<any>(null)
const statusFilter = ref<string | null>(null)
const flagFilter = ref<string | null>(null)
const currencyFilter = ref<string | null>(null)
const showWarningFilters = ref(false)
const search = ref('')
const page = ref(1)
const PAGE_SIZE = 100
const selectedKeys = ref<number[]>([])
const tab = ref<'ready' | 'review' | 'pending' | 'all'>('all')
const detailShow = ref(false)
const detailRow = ref<any>(null)
const confirmDialog = ref(false)
const noteViewDialog = ref<any>({ show: false, noteId: null })

const searchFfGroups = async (params: any) => {
  try {
    return await $api.freightForwarders.searchFfGroups({ query: params })
  } catch (error) {
    snackbar.add({ type: 'error', text: 'Error fetching freight forwarder groups' })
  }
}

const STATUS_META: Record<string, { label: string; color: string }> = {
  found: { label: 'Found', color: 'success' },
  found_no_letter: { label: 'Found (letter differs)', color: 'success' },
  by_reference: { label: 'By TM reference', color: 'info' },
  by_mbl: { label: 'By master', color: 'info' },
  mbl_only: { label: 'Reference without note', color: 'warning' },
  not_found: { label: 'Not found', color: 'error' },
}
const FLAG_META: Record<string, { label: string; color: string }> = {
  amount_diff: { label: 'Amount differs', color: 'warning' },
  sign_mismatch: { label: 'Type / sign differs', color: 'error' },
  sum_of_notes: { label: 'Sum of several notes', color: 'info' },
  duplicate_row: { label: 'Note already used in another row', color: 'warning' },
  in_payment: { label: 'In a payment request', color: 'deep-purple' },
  cancelled: { label: 'Cancelled', color: 'error' },
  locked: { label: 'Locked', color: 'orange' },
  missing_attachment: { label: 'No attachment', color: 'warning' },
}
const statusMeta = (s: string) => STATUS_META[s] ?? { label: s, color: 'secondary' }
const flagMeta = (f: string) => FLAG_META[f] ?? { label: f, color: 'secondary' }
const matchedByLabel = (m: string) =>
  ({ folio: 'folio', folio_no_letter: 'folio (letter differs)', reference: 'TM reference', mbl: 'master' })[m] ?? m

// ---- file reading ----------------------------------------------------------------------------

const onFile = async (input: any) => {
  const file: File | null = Array.isArray(input) ? (input[0] ?? null) : input
  if (!file) {
    return
  }
  try {
    loadingStore.loading = true
    XLSX = XLSX ?? (await import('xlsx'))
    workbook = XLSX.read(await file.arrayBuffer(), { type: 'array' })
    fileName.value = file.name
    sheetNames.value = workbook.SheetNames
    // Pick the first sheet that has data
    const firstWithData =
      workbook.SheetNames.find((n: string) => (workbook.Sheets[n]['!ref'] ?? '') !== '') ?? workbook.SheetNames[0]
    loadSheet(firstWithData)
    pickProfileForAgent()
    showAdjust.value = !hasRequiredColumns.value || parsedRows.value.length === 0
  } catch (e) {
    console.error(e)
    snackbar.add({ type: 'error', text: 'The file could not be read.' })
  } finally {
    loadingStore.stop()
  }
}

const loadSheet = (name: string) => {
  sheetName.value = name
  rawRows.value = XLSX.utils.sheet_to_json(workbook.Sheets[name], { header: 1, raw: false, defval: '' }) as string[][]
  autoDetect()
}

const canContinue = computed(() => rawRows.value.length > 0 && (!!forwarderId.value || !!groupId.value))

// ---- column mapping --------------------------------------------------------------------------

const columnLetter = (i: number) => {
  let s = ''
  let n = i
  do {
    s = String.fromCharCode(65 + (n % 26)) + s
    n = Math.floor(n / 26) - 1
  } while (n >= 0)
  return s
}

const headerCells = computed<string[]>(() => rawRows.value[(config.value.header_row ?? 1) - 1] ?? [])

const columnOptions = computed(() => {
  const width = Math.max(headerCells.value.length, ...rawRows.value.slice(0, 50).map((r) => r.length), 0)
  return Array.from({ length: width }, (_, i) => ({
    value: i,
    title: `${columnLetter(i)} · ${String(headerCells.value[i] ?? '').trim() || '(empty)'}`,
  }))
})

const HEADER_PATTERNS: Record<keyof Columns, RegExp> = {
  folio: /(ref(erence)?[\s_.-]*no|folio|cn\s*\/?\s*dn|note|invoice|doc(ument)?)/i,
  mbl: /(mbl|master|m\.?awb|awb|b\/?l)/i,
  counter: /(counter|our\s*ref|tm\s*ref|your\s*ref)/i,
  amount: /(amt|amount|balance|bal_|importe|total)/i,
  debit: /^\s*debit/i,
  credit: /^\s*credit/i,
}

const autoDetect = () => {
  let best = { row: 0, score: 0, columns: null as Columns | null }
  rawRows.value.slice(0, 40).forEach((cells, rowIndex) => {
    const columns: Columns = { folio: null, mbl: null, counter: null, amount: null, debit: null, credit: null }
    let score = 0
    ;(['debit', 'credit', 'counter', 'mbl', 'folio', 'amount'] as (keyof Columns)[]).forEach((field) => {
      const used = Object.values(columns)
      const idx = cells.findIndex((c, i) => !used.includes(i) && HEADER_PATTERNS[field].test(String(c)))
      if (idx >= 0) {
        columns[field] = idx
        score++
      }
    })
    if (score > best.score) {
      best = { row: rowIndex, score, columns }
    }
  })
  if (best.columns && best.score >= 2) {
    config.value.header_row = best.row + 1
    config.value.columns = best.columns
    config.value.amount_mode = best.columns.amount === null && best.columns.debit !== null ? 'debit_credit' : 'signed'
  }
}

// The layout follows from the chosen columns: one signed amount column, otherwise debit / credit
watch(
  () => [config.value.columns.amount, config.value.columns.debit, config.value.columns.credit],
  ([amount]) => {
    config.value.amount_mode = amount === null || amount === undefined ? 'debit_credit' : 'signed'
  }
)

const mappingSummary = computed(() => {
  const c = config.value.columns
  const label = (i: number | null) =>
    i === null || i === undefined ? '' : `${columnLetter(i)} · ${String(headerCells.value[i] ?? '').trim() || '(empty)'}`
  return [
    { label: 'Folio', text: label(c.folio) },
    { label: 'Master', text: label(c.mbl) },
    { label: 'TM reference', text: label(c.counter) },
    { label: 'Amount', text: label(c.amount) },
    { label: 'Debit', text: label(c.debit) },
    { label: 'Credit', text: label(c.credit) },
  ].filter((m) => m.text)
})

const hasRequiredColumns = computed(() => {
  const c = config.value.columns
  const hasKey = c.folio !== null || c.mbl !== null || c.counter !== null
  const hasAmount = config.value.amount_mode === 'signed' ? c.amount !== null : c.debit !== null || c.credit !== null
  return hasKey && hasAmount
})

type DecimalMark = '.' | ','

// Decides which character is the decimal mark of a single numeric text, or null when it can't tell
// ("1,234" could be one thousand two hundred thirty-four or 1.234).
const decimalMarkOf = (raw: string): DecimalMark | null => {
  const text = raw.replace(/[^0-9.,]/g, '')
  const lastDot = text.lastIndexOf('.')
  const lastComma = text.lastIndexOf(',')
  if (lastDot >= 0 && lastComma >= 0) {
    return lastDot > lastComma ? '.' : ','
  }
  const mark = lastDot >= 0 ? '.' : lastComma >= 0 ? ',' : null
  if (!mark) {
    return null
  }
  const parts = text.split(mark)
  if (parts.length > 2) {
    // repeated mark = thousands separator, so the decimal mark is the other one
    return mark === '.' ? ',' : '.'
  }
  const decimals = parts[1].length
  if (decimals === 3 && parts[0].length >= 1 && parts[0].length <= 3 && !/^0+$/.test(parts[0])) {
    return null
  }
  return mark
}

const detectDecimalMark = (samples: string[]): DecimalMark => {
  let dot = 0
  let comma = 0
  samples.forEach((s) => {
    const mark = decimalMarkOf(s)
    if (mark === '.') dot++
    else if (mark === ',') comma++
  })
  return comma > dot ? ',' : '.'
}

const amountSamples = computed<string[]>(() => {
  const c = config.value.columns
  const indexes = (config.value.amount_mode === 'signed' ? [c.amount] : [c.debit, c.credit]).filter(
    (i: number | null) => i !== null
  ) as number[]
  const out: string[] = []
  rawRows.value.slice(config.value.header_row ?? 1).forEach((cells) => {
    indexes.forEach((i) => {
      const v = String(cells[i] ?? '').trim()
      if (/\d/.test(v)) out.push(v)
    })
  })
  return out
})

const decimalMark = computed<DecimalMark>(() => detectDecimalMark(amountSamples.value))

const parseAmount = (value: any, mark: DecimalMark = decimalMark.value): number | null => {
  let text = String(value ?? '').trim()
  if (!text) {
    return null
  }
  let negative = false
  if (/^\(.*\)$/.test(text)) {
    negative = true
    text = text.slice(1, -1)
  }
  // trailing minus ("123.45-") is how some ERPs print negatives
  if (/\d-\s*$/.test(text)) {
    negative = true
  }
  if (/^\s*-/.test(text)) {
    negative = true
  }
  const thousands = mark === '.' ? ',' : '.'
  text = text.replace(/[^0-9.,]/g, '').split(thousands).join('')
  if (mark === ',') {
    text = text.replace(',', '.')
  }
  if (text === '' || text === '.') {
    return null
  }
  const n = parseFloat(text)
  if (Number.isNaN(n)) {
    return null
  }
  return negative ? -Math.abs(n) : n
}

const cell = (cells: string[], index: number | null) => (index === null ? '' : String(cells[index] ?? '').trim())

const parsedAll = computed(() => {
  const c = config.value.columns
  const rows: any[] = []
  let ignored = 0
  rawRows.value.slice(config.value.header_row ?? 1).forEach((cells, i) => {
    const folio = cell(cells, c.folio)
    const mbl = cell(cells, c.mbl)
    const counter = cell(cells, c.counter)
    if (!folio && !mbl && !counter) {
      if (cells.some((v) => String(v).trim() !== '')) ignored++
      return
    }
    if (/^\s*total/i.test(folio) || /^\s*total/i.test(mbl)) {
      ignored++
      return
    }
    let amount: number | null
    if (config.value.amount_mode === 'signed') {
      amount = parseAmount(cell(cells, c.amount))
    } else {
      const debit = parseAmount(cell(cells, c.debit))
      const credit = parseAmount(cell(cells, c.credit))
      amount = debit === null && credit === null ? null : (debit ?? 0) - (credit ?? 0)
    }
    if (amount === null) {
      ignored++
      return
    }
    rows.push({ row: (config.value.header_row ?? 1) + i + 1, folio, mbl, counter, amount })
  })
  return { rows, ignored }
})
const parsedRows = computed(() => parsedAll.value.rows)
const ignoredCount = computed(() => parsedAll.value.ignored)

// ---- profiles --------------------------------------------------------------------------------

const loadProfiles = async () => {
  try {
    profiles.value = (await $api.ffNotes.getSoaBulkProfiles()) as any[]
  } catch (e) {
    console.error(e)
  }
}

const forwarderName = (id: number | null) => freightForwarders.value.find((f) => f.id === id)?.name

const profileItems = computed(() =>
  profiles.value.map((p) => ({
    id: p.id,
    title: p.forwarder_id ? `${p.name} · ${forwarderName(p.forwarder_id) ?? 'agent'}` : p.name,
  }))
)

const applyProfile = (profile: any) => {
  const base = defaultConfig()
  config.value = {
    ...base,
    ...profile.config,
    columns: { ...base.columns, ...(profile.config?.columns ?? {}) },
  }
  const wantedSheet = profile.config?.sheet
  if (wantedSheet && workbook && workbook.SheetNames.includes(wantedSheet) && wantedSheet !== sheetName.value) {
    sheetName.value = wantedSheet
    rawRows.value = XLSX.utils.sheet_to_json(workbook.Sheets[wantedSheet], {
      header: 1,
      raw: false,
      defval: '',
    }) as string[][]
  }
}

const onProfileSelected = (id: number | null) => {
  const profile = profiles.value.find((p) => p.id === id)
  if (profile) {
    applyProfile(profile)
  }
}

/** Applies the user's most recently used profile for the chosen agent; if it doesn't fit this file, falls back to detection. */
const pickProfileForAgent = () => {
  if (!rawRows.value.length) {
    return
  }
  const mine = profiles.value.find(
    (p) =>
      (forwarderId.value && p.forwarder_id === forwarderId.value) || (groupId.value && p.freight_group_id === groupId.value)
  )
  if (!mine) {
    return
  }
  applyProfile(mine)
  if (hasRequiredColumns.value && parsedRows.value.length) {
    profileId.value = mine.id
  } else {
    profileId.value = null
    autoDetect()
  }
}

const onAgentChange = () => {
  profileId.value = null
  pickProfileForAgent()
}

const appliedProfileName = computed(() => profiles.value.find((p) => p.id === profileId.value)?.name ?? '')

/** Stores the layout used for this match under the agent's name (or the profile already in use). */
const rememberProfile = async () => {
  if (!forwarderId.value && !groupId.value) {
    return
  }
  try {
    const saved = (await $api.ffNotes.saveSoaBulkProfile({
      name: appliedProfileName.value || forwarderName(forwarderId.value) || `Group ${groupId.value}`,
      forwarder_id: forwarderId.value,
      freight_group_id: groupId.value,
      config: { ...config.value, sheet: sheetName.value },
    })) as any
    await loadProfiles()
    profileId.value = saved.id
  } catch (e) {
    console.error(e)
  }
}

const deleteProfile = async () => {
  if (!profileId.value || !window.confirm('Delete this profile?')) {
    return
  }
  try {
    await $api.ffNotes.deleteSoaBulkProfile(profileId.value)
    profileId.value = null
    await loadProfiles()
    snackbar.add({ type: 'success', text: 'Profile deleted' })
  } catch (e) {
    console.error(e)
  }
}

const canMatch = computed(() => {
  if (!rawRows.value.length) return false
  return !!(forwarderId.value || groupId.value) && hasRequiredColumns.value && parsedRows.value.length > 0
})
const matchBlockedReason = computed(() => {
  if (!forwarderId.value && !groupId.value) return 'Choose the freight forwarder (or group) first.'
  if (!hasRequiredColumns.value) return 'Pick the folio / master column and the amount column.'
  if (!parsedRows.value.length) return 'No rows could be read with these columns.'
  return ''
})

// ---- matching --------------------------------------------------------------------------------

const runMatch = async () => {
  if (parsedRows.value.length > 5000) {
    snackbar.add({ type: 'error', text: 'The file has more than 5,000 rows. Split it and load it in parts.' })
    return
  }
  try {
    loadingStore.loading = true
    const rows = parsedRows.value
    const response = (await $api.ffNotes.matchSoaBulk({
      forwarder_id: groupId.value ? null : forwarderId.value,
      freight_group_id: groupId.value,
      include_missing: includeMissing.value,
      rows: rows.map((r, i) => ({ row: r.row, folio: r.folio, mbl: r.mbl, counter: r.counter, amount: r.amount })),
    })) as any

    response.rows = response.rows.map((m: any, i: number) => ({
      ...m,
      key: i,
      folio: rows[i].folio,
      mbl: rows[i].mbl,
      counter: rows[i].counter,
    }))
    result.value = response
    statusFilter.value = null
    flagFilter.value = null
    currencyFilter.value = null
    search.value = ''
    page.value = 1
    selectedKeys.value = []
    selectClean()
    tab.value = tabCounts.value.ready > 0 ? 'ready' : 'all'
    if (rememberLayout.value) {
      await rememberProfile()
    } else if (profileId.value) {
      await $api.ffNotes.useSoaBulkProfile(profileId.value)
    }
    maxStep.value = 2
    step.value = 2
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => loadingStore.stop(), 250)
  }
}

const totalDifference = computed(() =>
  Math.round((result.value.summary.agent_total - result.value.summary.system_total) * 100) / 100
)

const rowCurrencies = (r: any): string[] => [...new Set<string>(r.notes.map((n: any) => n.currency).filter(Boolean))]

type FilterSkip = 'status' | 'flag' | null
/** Rows that pass the tab, search and chip filters; `skip` leaves one chip group out so its own counts stay meaningful. */
const rowsFor = (skip: FilterSkip, ignoreCurrency = false) => {
  if (!result.value) return []
  const q = (search.value ?? '').toLowerCase().trim()
  return result.value.rows.filter((r: any) => {
    if (tab.value !== 'all' && rowCategory(r) !== tab.value) return false
    if (skip !== 'status' && statusFilter.value && r.status !== statusFilter.value) return false
    if (skip !== 'flag' && flagFilter.value && !r.flags.includes(flagFilter.value)) return false
    if (!ignoreCurrency && currencyFilter.value && !rowCurrencies(r).includes(currencyFilter.value)) return false
    if (q) {
      const hay = [r.folio, r.mbl, r.counter, ...r.notes.flatMap((n: any) => [n.folio, n.reference_number])]
        .join(' ')
        .toLowerCase()
      if (!hay.includes(q)) return false
    }
    return true
  })
}
const statusCounts = computed<Record<string, number>>(() => {
  const c: Record<string, number> = {}
  for (const r of rowsFor('status')) c[r.status] = (c[r.status] ?? 0) + 1
  return c
})
const flagCounts = computed<Record<string, number>>(() => {
  const c: Record<string, number> = {}
  for (const r of rowsFor('flag')) for (const f of r.flags) c[f] = (c[f] ?? 0) + 1
  return c
})
const currencyCounts = computed<Record<string, number>>(() => {
  const c: Record<string, number> = {}
  for (const r of rowsFor(null, true)) for (const cur of rowCurrencies(r)) c[cur] = (c[cur] ?? 0) + 1
  return c
})
const statusTotal = computed(() => rowsFor('status').length)

const filteredRows = computed(() => rowsFor(null))
const pageCount = computed(() => Math.max(1, Math.ceil(filteredRows.value.length / PAGE_SIZE)))
const pageRows = computed(() => filteredRows.value.slice((page.value - 1) * PAGE_SIZE, page.value * PAGE_SIZE))
watch([statusFilter, flagFilter, currencyFilter, search, tab], () => (page.value = 1))

const normFolio = (v: string) => String(v ?? '').toUpperCase().replace(/[^A-Z0-9]/g, '')
const sameFolio = (a: string, b: string) => normFolio(a) === normFolio(b)

const BLOCKING = ['amount_diff', 'sign_mismatch', 'duplicate_row', 'cancelled', 'in_payment', 'missing_attachment']

/** ready = can go to the payment as is; review = has a note but something needs a look; pending = no note to pay */
const rowCategory = (r: any): 'ready' | 'review' | 'pending' => {
  if (!r.notes.length) return 'pending'
  return isSelectable(r) && !r.flags.some((f: string) => BLOCKING.includes(f)) ? 'ready' : 'review'
}

const tabDefs = [
  { value: 'ready', title: 'Ready to pay', color: 'success' },
  { value: 'review', title: 'Needs review', color: 'warning' },
  { value: 'pending', title: 'No note', color: 'error' },
  { value: 'all', title: 'All', color: undefined },
] as const
const tabHint = computed(
  () =>
    ({
      ready: 'Rows with a matching note and no warnings. They are selected by default.',
      review: 'A note exists but the amount, type, attachment or payment status needs a look.',
      pending: 'Rows with no note in the system, or a reference that has no note registered yet.',
      all: 'Every row of the file.',
    })[tab.value]
)
const tabCounts = computed<Record<string, number>>(() => {
  const counts: Record<string, number> = { ready: 0, review: 0, pending: 0, all: 0 }
  for (const r of result.value?.rows ?? []) {
    counts[rowCategory(r)]++
    counts.all++
  }
  return counts
})

const flagDetail = (r: any, f: string): string => {
  const money = (v: number | null) => (v === null || v === undefined ? '—' : formatToCurrency(v))
  const folios = (list: any[]) => list.map((n) => `#${n.folio}`).join(', ')
  switch (f) {
    case 'amount_diff':
      return `The agent charges ${money(r.agent_amount)} and the system expects ${money(r.system_amount)} (difference ${money(r.difference)}).`
    case 'sign_mismatch':
      return `The agent amount (${money(r.agent_amount)}) has the opposite sign of what the system expects (${money(r.system_amount)}). Check the note type and direction.`
    case 'sum_of_notes':
      return `${r.notes.length} notes add up to the agent's amount: ${folios(r.notes)}.`
    case 'duplicate_row':
      return 'Another row of this file already uses one of these notes.'
    case 'in_payment':
      return `Already in a payment request: ${r.notes.filter((n: any) => n.payment_request_id).map((n: any) => n.payment_request_folio || `#${n.payment_request_id}`).join(', ')}.`
    case 'cancelled':
      return `Cancelled note(s): ${folios(r.notes.filter((n: any) => n.cancelled))}. They cannot be paid.`
    case 'locked':
      return 'Already locked. It will not be locked again.'
    case 'missing_attachment':
      return `Notes from the agent need their attachment before they can be paid: ${folios(r.notes.filter((n: any) => n.inbound && !n.has_attachment))}.`
    default:
      return ''
  }
}

const openDetail = (r: any) => {
  detailRow.value = r
  detailShow.value = true
}
const toggleRow = (key: number) => {
  selectedKeys.value = selectedKeys.value.includes(key)
    ? selectedKeys.value.filter((k) => k !== key)
    : [...selectedKeys.value, key]
}

const rowClass = (r: any) => ({
  'tm-row-error': r.status === 'not_found',
  'tm-row-selected': selectedKeys.value.includes(r.key),
  'tm-row-muted': r.flags.includes('in_payment') || r.flags.includes('cancelled'),
})

// ---- selection and payment -------------------------------------------------------------------

const isSelectable = (r: any) => r.notes.length > 0 && r.notes.every((n: any) => n.eligible)

const BLOCKING_FLAGS = BLOCKING
const selectClean = () => {
  selectedKeys.value = result.value.rows
    .filter((r: any) => isSelectable(r) && !r.flags.some((f: string) => BLOCKING_FLAGS.includes(f)))
    .map((r: any) => r.key)
}

const selectableVisible = computed(() => filteredRows.value.filter(isSelectable).map((r: any) => r.key))
const allVisibleSelected = computed(
  () => selectableVisible.value.length > 0 && selectableVisible.value.every((k: number) => selectedKeys.value.includes(k))
)
const someVisibleSelected = computed(() => selectableVisible.value.some((k: number) => selectedKeys.value.includes(k)))
const toggleVisible = (on: boolean | null) => {
  const visible = new Set(selectableVisible.value)
  const rest = selectedKeys.value.filter((k) => !visible.has(k))
  selectedKeys.value = on ? [...rest, ...selectableVisible.value] : rest
}

const selectedNotes = computed(() => {
  const byId = new Map<number, any>()
  for (const r of result.value?.rows ?? []) {
    if (selectedKeys.value.includes(r.key)) {
      r.notes.forEach((n: any) => byId.set(n.id, n))
    }
  }
  return [...byId.values()]
})

const selectedAgentBalance = computed(() =>
  Math.round(selectedNotes.value.reduce((acc, n) => acc + n.expected_agent_amount, 0) * 100) / 100
)
const selectedCurrencies = computed(() => [...new Set<string>(selectedNotes.value.map((n) => n.currency).filter(Boolean))])
const currencyConflict = computed(() => new Set(selectedNotes.value.map((n) => n.currency_id)).size > 1)
const canRequestPayment = computed(() => selectedNotes.value.length > 0 && !currencyConflict.value)

const selectedWithWarnings = computed(
  () =>
    (result.value?.rows ?? []).filter(
      (r: any) => selectedKeys.value.includes(r.key) && r.flags.some((f: string) => BLOCKING.includes(f))
    ).length
)

const confirmAndRequest = async () => {
  confirmDialog.value = false
  await requestPayment()
}

const requestPayment = async () => {
  const notes = selectedNotes.value
  try {
    loadingStore.loading = true
    // Locking again would reset the date of notes that were already locked
    const toLock = notes.filter((n) => !n.checked_at).map((n) => n.id)
    if (toLock.length) {
      await $api.ffNotes.updateLockingStatus({ ff_notes: toLock, type: 'lock' })
    }
    const response = (await $api.ffNotes.generatePayment({
      notes: notes.map((n) => ({ id: n.id, notes: null })),
      ff_type: groupId.value ? 'ff_group' : 'ff_agent',
      ff_id: groupId.value || forwarderId.value,
    })) as any
    snackbar.add({ type: 'success', text: `Payment request #${response.id} generated` })
    router.push(`/payments/agents/payments/view-${response.id}`)
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => loadingStore.stop(), 200)
  }
}

const viewNote = (id: number) => {
  noteViewDialog.value = { show: true, noteId: id }
}

const exportAttention = async () => {
  const rows = result.value.rows.filter(
    (r: any) => r.status === 'not_found' || r.status === 'mbl_only' || r.flags.some((f: string) => BLOCKING_FLAGS.includes(f))
  )
  if (!rows.length) {
    snackbar.add({ type: 'info', text: 'Nothing needs attention' })
    return
  }
  XLSX = XLSX ?? (await import('xlsx'))
  const data = rows.map((r: any) => ({
    Row: r.row,
    Status: statusMeta(r.status).label,
    'Agent folio': r.folio,
    'Agent master': r.mbl,
    'Agent amount': r.agent_amount,
    'System notes': r.notes.map((n: any) => `#${n.folio} (${n.reference_number})`).join(', '),
    'System amount': r.system_amount,
    Difference: r.difference,
    Warnings: r.flags.map((f: string) => flagMeta(f).label).join(', '),
    'Reference without note': (r.references ?? []).map((x: any) => x.reference_number).join(', '),
  }))
  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Needs attention')
  XLSX.writeFile(wb, 'soa-bulk-load-needs-attention.xlsx')
}

// ---- init ------------------------------------------------------------------------------------

onMounted(async () => {
  try {
    freightForwarders.value = (await $api.freightForwarders.getAllFreightForwarders()) as any
  } catch (e) {
    console.error(e)
  }
  await loadProfiles()
})
</script>

<style scoped>
.catalog-table-wrapper {
  contain: layout paint;
}
.soa-table {
  width: auto !important;
}
.soa-table :deep(table) {
  width: auto !important;
}
.soa-table :deep(td),
.soa-table :deep(th) {
  font-size: 0.75rem !important;
  padding: 2px 6px !important;
  white-space: nowrap;
}
</style>
