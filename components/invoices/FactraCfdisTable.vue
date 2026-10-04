<template>
  <div>
    <v-card>
      <v-card-title>
        <div class="flex justify-between items-center flex-wrap">
          Supplier invoices (Factra incoming CFDIs)
          <v-btn color="primary" size="small" to="/invoices/suppliers/cfdis/create">
            <v-icon>mdi-plus</v-icon> Add new supplier CFDI</v-btn
          >
        </div>
      </v-card-title>
      <v-card-text>
        <div class="mb-4" @keyup.enter="onClickFilters">
          <v-btn
            size="small"
            variant="text"
            :prepend-icon="showFilters ? 'mdi-chevron-up' : 'mdi-chevron-down'"
            class="mb-2"
            @click="toggleFilters"
          >
            {{ showFilters ? 'Hide filters' : 'Show filters' }}
          </v-btn>
          <v-expand-transition>
          <div v-show="showFilters">
          <FilterLayoutGrid :filters="filterLayoutDefs" storage-key="filter-layout:supplier-cfdis" @hide="onLayoutFilterHidden">
            <template #invoiceDate>
              <v-text-field v-model="filters.invoiceDate" clearable type="date" density="compact" label="Invoice date" hide-details />
            </template>
            <template #startDate>
              <v-text-field v-model="filters.startDate" clearable type="date" density="compact" label="Start date" hide-details />
            </template>
            <template #endDate>
              <v-text-field v-model="filters.endDate" clearable type="date" density="compact" label="End date" hide-details />
            </template>
            <template #supplier>
              <ASupplierSearch v-model="filters.supplierId" label="Supplier" hide-details />
            </template>
            <template #hasSupplier>
              <v-autocomplete
                v-model="filters.hasSupplier"
                density="compact"
                :items="yesNoItems"
                item-title="name"
                item-value="value"
                hide-details
                clearable
                label="Linked to supplier"
              />
            </template>
            <template #rfcEmisor>
              <v-text-field v-model="filters.rfcEmisor" clearable density="compact" label="RFC Emisor" hide-details />
            </template>
            <template #nameEmisor>
              <v-text-field
                v-model="filters.nameEmisor"
                clearable
                density="compact"
                label="Issuer Name"
                hint="Search by name even if the supplier is not registered"
                persistent-hint
              />
            </template>
            <template #uuid>
              <v-text-field v-model="filters.uuid" clearable density="compact" label="CFDI UUID" hide-details />
            </template>
            <template #serviceType>
              <v-autocomplete
                v-model="filters.serviceType"
                density="compact"
                :items="[
                  { name: 'Sea services', value: 'sea' },
                  { name: 'Air services', value: 'air' },
                ]"
                item-title="name"
                item-value="value"
                hide-details
                clearable
                label="By service type"
              />
            </template>
            <template #serviceYear>
              <v-autocomplete
                v-model="filters.serviceYear"
                :prepend-inner-icon="filters.serviceType == 'air' ? 'mdi-airplane' : 'mdi-ferry'"
                :items="prefixYears"
                density="compact"
                label="Service year"
                hint="Use with service type"
                persistent-hint
                clearable
              />
            </template>
            <template #serviceNumbers>
              <v-text-field
                v-model="filters.serviceNumbers"
                density="compact"
                label="Service number(s)"
                hint="Separate multiple references with commas"
                persistent-hint
                clearable
              />
            </template>
            <template #reqPayFolio>
              <v-text-field v-model="filters.reqPayFolio" clearable density="compact" label="Request payment folio" hide-details />
            </template>
            <template #hasReqPay>
              <v-autocomplete
                v-model="filters.hasReqPay"
                density="compact"
                :items="yesNoItems"
                item-title="name"
                item-value="value"
                clearable
                hide-details
                label="Linked to a request payment"
              />
            </template>
            <template #amountProvisioned>
              <v-autocomplete
                v-model="filters.amountProvisioned"
                density="compact"
                :items="[
                  { name: 'Full amount', value: 1 },
                  { name: 'Partial amount', value: 2 },
                  { name: 'No amount', value: 3 },
                ]"
                item-title="name"
                item-value="value"
                clearable
                hide-details
                label="Amount provisioned"
              />
            </template>
            <template #tipoComprobante>
              <v-autocomplete
                v-model="filters.tipoComprobante"
                density="compact"
                :items="[
                  { name: 'Ingreso', value: 'I' },
                  { name: 'Egreso', value: 'E' },
                  { name: 'Traslado', value: 'T' },
                  { name: 'Nomina', value: 'N' },
                  { name: 'Pago', value: 'P' },
                ]"
                item-title="name"
                item-value="value"
                clearable
                hide-details
                label="Tipo de comprobante"
              />
            </template>
            <template #blockedAtEntry>
              <v-autocomplete
                v-model="filters.blockedAtEntry"
                density="compact"
                :items="[
                  { name: 'Blocked at entry', value: true },
                  { name: 'Not blocked at entry', value: false },
                ]"
                item-title="name"
                item-value="value"
                clearable
                hide-details
                label="Entry status"
              />
            </template>
            <template #currencyId>
              <v-autocomplete
                v-model="filters.currencyId"
                density="compact"
                :items="currencies"
                item-title="name"
                item-value="id"
                clearable
                hide-details
                label="By currency"
              />
            </template>
            <template #deletedStatus>
              <v-autocomplete
                v-model="filters.deleted_status"
                density="compact"
                label="Status"
                :items="deletedStatus"
                item-title="name"
                item-value="value"
                hide-details
              />
            </template>
            <template #folios>
              <!-- Multi-folio search (supports A-109553 or 109553 formats) -->
              <div class="flex gap-2 items-start">
                <v-textarea
                  v-model="filters.ifolio"
                  density="compact"
                  label="Invoice folios"
                  placeholder="Paste folios separated by spaces, commas, lines or semicolons. Supports A-109553 format."
                  rows="2"
                  auto-grow
                  hide-details
                  @keydown.enter.prevent.stop
                  @keyup.enter.prevent.stop="addFolios"
                />
                <v-btn size="small" color="primary" variant="tonal" icon="mdi-plus" class="mt-1" @click="addFolios" />
              </div>
              <div v-if="filters.folios.length > 0" class="mt-2">
                <div class="text-xs text-grey mb-1">Searching by folios:</div>
                <div class="flex flex-wrap gap-2">
                  <v-chip
                    v-for="(folio, index) in filters.folios"
                    :key="`folio-${index}`"
                    size="small"
                    closable
                    @click:close="removeFolio(Number(index))"
                  >
                    {{ folio }}
                  </v-chip>
                </div>
              </div>
            </template>
          </FilterLayoutGrid>

          <div class="flex gap-2 mt-2">
            <v-btn size="small" color="secondary" @click="clearFilters"> Clear </v-btn>
            <v-btn size="small" color="primary" @click="onClickFilters"> Search </v-btn>
          </div>
          </div>
          </v-expand-transition>
        </div>

        <div>
          <div class="flex gap-2 mb-4 border p-2">
            <v-btn color="green" size="small" variant="tonal" @click="requestCfdiPayments">
              Request payment module</v-btn
            >
          </div>
          <div class="flex gap-2 mb-4">
            <v-chip color="grey"><span class="inline-block w-5 h-5 bg-slate-200 mr-2"></span>Pending payment</v-chip>
            <v-chip color="orange"
              ><span class="inline-block w-5 h-5 bg-yellow-500 mr-2"></span>Payment requested</v-chip
            >
            <v-chip color="green"><span class="inline-block w-5 h-5 bg-green-500 mr-2"></span>Invoice paid</v-chip>
            <v-chip color="red"><span class="inline-block w-5 h-5 bg-red-500 mr-2"></span>Cancelled</v-chip>
          </div>
          <v-pagination
            v-model="supplierCfdis.current_page"
            :length="supplierCfdis.last_page"
            rounded="circle"
            density="compact"
            @update:model-value="onClickPagination"
          ></v-pagination>
          <div class="flex justify-end mb-1">
            <TableColumnsMenu :state="columnsLayout" />
          </div>
          <v-table density="compact" fixed-header height="75vh">
            <thead>
              <tr>
                <template v-for="col in visibleColumns" :key="col.key">
                  <th v-if="col.key === 'actions'" class="text-left">Actions</th>
                  <th v-else-if="col.key === 'xml'" class="text-left">XML</th>
                  <th v-else-if="col.key === 'zip'" class="text-left">Zip</th>
                  <th v-else-if="col.key === 'reqPayment'" class="text-left"># Req payment</th>
                  <th v-else-if="col.key === 'reissued'" class="text-left">Reissued</th>
                  <th v-else-if="col.key === 'serieFolio'" class="text-left">Serie-Folio</th>
                  <th v-else-if="col.key === 'emisor'" class="text-left">Emisor / Proveedor</th>
                  <th v-else-if="col.key === 'receptor'" class="text-left">Receptor</th>
                  <th v-else-if="col.key === 'tc'" class="text-left">
                  T.C.
                  <v-tooltip text="Tipo de comprobante" color="primary">
                    <template v-slot:activator="{ props }">
                      <v-icon v-bind="props">mdi-help-circle-outline</v-icon>
                    </template>
                  </v-tooltip>
                </th>
                  <th v-else-if="col.key === 'sat'" class="text-left">Estatus SAT</th>
                  <th v-else-if="col.key === 'total'" class="text-left">Total CFDI</th>
                  <th v-else-if="col.key === 'provisioned'" class="text-left">Provisioned</th>
                  <th v-else-if="col.key === 'concepts'" class="text-left">Concepts</th>
                  <th v-else-if="col.key === 'invoiceDate'" class="text-left">Invoice date</th>
                  <th v-else-if="col.key === 'createdAt'" class="text-left">Created at</th>
                  <th v-else-if="col.key === 'updatedAt'" class="text-left">Last modified</th>
                  <th v-else-if="col.key === 'cancelled'" class="text-left">Cancelled?</th>
                </template>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(cfdi, index) in supplierCfdis.data"
                :key="`supplier-cfdi-${cfdi.id}`"
                :class="columnClass(cfdi)"
              >
                <template v-for="col in visibleColumns" :key="col.key">
                  <td v-if="col.key === 'actions'">
                    <!-- State -1: Cancelled (soft-deleted) - only View and Restore, no other action or blocked/expired messaging -->
                    <div v-if="cfdi.deleted_at != null" class="flex justify-center gap-2 mb-2">
                      <ViewButton :item="cfdi" @click="viewSupplierCfdi(cfdi)" />
                      <ProcessAuthorizationWrapper
                        processName="supplier-cfdi-restore"
                        :requestKey="`${cfdi.id}`"
                        label="Restore CFDI"
                        :displayName="cfdi.serie_folio || `CFDI ${cfdi.id}`"
                      >
                        <template #auth>
                          <TrashButton :item="cfdi" @click="showConfirmDelete" />
                        </template>
                      </ProcessAuthorizationWrapper>
                    </div>
                    <!-- State 0: Already linked to a payment request - locked regardless of block/expiry status -->
                    <div v-else-if="isLinkedToReqPayment(cfdi)" class="flex justify-center gap-2 mb-2">
                      <ViewButton :item="cfdi" @click="viewSupplierCfdi(cfdi)" />
                      <v-chip size="small" color="deep-orange" variant="flat">
                        <v-icon size="small" start>mdi-lock</v-icon>Req payment linked
                      </v-chip>
                    </div>
                    <!-- State 1: Invoice blocked due to late entry into Factra -->
                    <div v-else-if="isBlockedAtEntry(cfdi)" class="text-sm text-red-600 dark:text-red-300">
                      <div class="flex justify-center mb-2">
                        <ViewButton :item="cfdi" @click="viewSupplierCfdi(cfdi)" />
                      </div>
                      <v-icon size="small">mdi-lock</v-icon>
                      <small>{{ cfdi.blocked_at_entry_reason || 'This invoice is blocked because it was entered into Factra past the deadline.' }}</small>
                      <ProcessAuthorizationWrapper
                          processName="supplier-work-past-date"
                          :requestKey="`${cfdi.id}`"
                          :displayName="cfdi.serie_folio || `Invoice ${cfdi.id}`"
                          label="Work Past Date / Credit Expired"
                          >
                          <template #auth>
                              <div class="flex justify-center gap-2 mb-2">
                                <template v-if="hasSupplierLinked(cfdi)">
                                  <EditButton :item="cfdi" @click="editSupplierCfdi(cfdi)" />
                                  <ProcessAuthorizationWrapper
                                    :processName="cfdi.deleted_at ? 'supplier-cfdi-restore' : 'supplier-cfdi-delete'"
                                    :requestKey="`${cfdi.id}`"
                                    :label="cfdi.deleted_at ? 'Restore CFDI' : 'Delete CFDI'"
                                    :displayName="cfdi.serie_folio || `CFDI ${cfdi.id}`"
                                  >
                                    <template #auth>
                                      <TrashButton v-if="!isTouched(cfdi)" :item="cfdi" @click="showConfirmDelete" />
                                    </template>
                                  </ProcessAuthorizationWrapper>
                                </template>
                              </div>
                              <div v-if="!hasSupplierLinked(cfdi)" class="flex gap-2">
                                <v-btn color="green" size="small" variant="tonal" @click="syncSupplierCfdi(cfdi.id)">
                                  <v-icon>mdi-sync</v-icon>
                                </v-btn>
                              </div>
                              <div class="mx-auto">
                                <LinkDeleteSupplierInvoice :supplierCfdi="cfdi" @refresh="getSupplierCfdis" />
                              </div>
                              <div v-if="cfdi.uuid && canValidateSat" class="flex justify-center mt-2">
                                <v-btn
                                  size="x-small"
                                  color="indigo"
                                  variant="tonal"
                                  :loading="cfdi._validatingSat === true"
                                  @click="validateCfdiSatRow(cfdi)"
                                >
                                  Validar SAT
                                </v-btn>
                              </div>
                          </template>
                      </ProcessAuthorizationWrapper>
                    </div>
                    <!-- State 2: Supplier credit days expired (invoice not blocked at entry) -->
                    <div v-else-if="isCreditExpired(cfdi)" class="text-sm text-orange-600 dark:text-orange-300">
                      <v-icon size="small">mdi-clock-alert</v-icon>
                      <small v-if="cfdi.supplier_credit_days === 0">
                        This invoice can only be processed on the same day (0 credit days).<br>
                        Invoice date: {{ new Date(cfdi.invoice_date).toLocaleDateString() }}
                      </small>
                      <small v-else>
                        The supplier's credit days have expired.<br>({{ cfdi.supplier_credit_days }} days from {{ new Date(cfdi.invoice_date).toLocaleDateString() }})
                      </small>
                      <div class="flex justify-center mb-2">
                        <ViewButton :item="cfdi" @click="viewSupplierCfdi(cfdi)" />
                      </div>
                      <ProcessAuthorizationWrapper
                          processName="supplier-work-past-date"
                          :requestKey="`${cfdi.id}`"
                          :displayName="cfdi.serie_folio || `Invoice ${cfdi.id}`"
                          label="Work Past Date / Credit Expired"
                          >
                          <template #auth>
                              <div class="flex justify-center gap-2 mb-2">
                                <template v-if="hasSupplierLinked(cfdi)">
                                  <EditButton :item="cfdi" @click="editSupplierCfdi(cfdi)" />
                                  <ProcessAuthorizationWrapper
                                    :processName="cfdi.deleted_at ? 'supplier-cfdi-restore' : 'supplier-cfdi-delete'"
                                    :requestKey="`${cfdi.id}`"
                                    :label="cfdi.deleted_at ? 'Restore CFDI' : 'Delete CFDI'"
                                    :displayName="cfdi.serie_folio || `CFDI ${cfdi.id}`"
                                  >
                                    <template #auth>
                                      <TrashButton v-if="!isTouched(cfdi)" :item="cfdi" @click="showConfirmDelete" />
                                    </template>
                                  </ProcessAuthorizationWrapper>
                                </template>
                              </div>
                              <div v-if="!hasSupplierLinked(cfdi)" class="flex gap-2">
                                <v-btn color="green" size="small" variant="tonal" @click="syncSupplierCfdi(cfdi.id)">
                                  <v-icon>mdi-sync</v-icon>
                                </v-btn>
                              </div>
                              <div class="mx-auto">
                                <LinkDeleteSupplierInvoice :supplierCfdi="cfdi" @refresh="getSupplierCfdis" />
                              </div>
                              <div v-if="cfdi.uuid && canValidateSat" class="flex justify-center mt-2">
                                <v-btn
                                  size="x-small"
                                  color="indigo"
                                  variant="tonal"
                                  :loading="cfdi._validatingSat === true"
                                  @click="validateCfdiSatRow(cfdi)"
                                >
                                  Validar SAT
                                </v-btn>
                              </div>
                          </template>
                      </ProcessAuthorizationWrapper>
                    </div>
                    <!-- State 3: Invoice within credit days - user can process normally -->
                    <div v-else>
                      <div class="flex justify-center gap-2 mb-2">
                        <ViewButton :item="cfdi" @click="viewSupplierCfdi(cfdi)" />
                        <template v-if="hasSupplierLinked(cfdi)">
                          <EditButton :item="cfdi" @click="editSupplierCfdi(cfdi)" />
                          <ProcessAuthorizationWrapper
                            :processName="cfdi.deleted_at ? 'supplier-cfdi-restore' : 'supplier-cfdi-delete'"
                            :requestKey="`${cfdi.id}`"
                            :label="cfdi.deleted_at ? 'Restore CFDI' : 'Delete CFDI'"
                            :displayName="cfdi.serie_folio || `CFDI ${cfdi.id}`"
                          >
                            <template #auth>
                              <TrashButton v-if="!isTouched(cfdi)" :item="cfdi" @click="showConfirmDelete" />
                            </template>
                          </ProcessAuthorizationWrapper>
                        </template>
                        <template v-else>
                          <v-btn color="green" size="small" variant="tonal" @click="syncSupplierCfdi(cfdi.id)">
                            <v-icon>mdi-sync</v-icon>
                          </v-btn>
                        </template>
                      </div>
                      <div class="mx-auto">
                        <LinkDeleteSupplierInvoice :supplierCfdi="cfdi" @refresh="getSupplierCfdis" />
                      </div>
                      <div v-if="cfdi.uuid && canValidateSat" class="flex justify-center mt-2">
                        <v-btn
                          size="x-small"
                          color="indigo"
                          variant="tonal"
                          :loading="cfdi._validatingSat === true"
                          @click="validateCfdiSatRow(cfdi)"
                        >
                          Validar SAT
                        </v-btn>
                      </div>
                    </div>
                  </td>
                  <td v-if="col.key === 'xml'">
                    <ButtonDownloadS3Object2 :s3Path="cfdi.xml_attachment" />
                    <div v-if="cfdi.is_manual">
                      <v-chip color="amber" size="small">Manual CFDI</v-chip>
                    </div>
                  </td>
                  <td v-if="col.key === 'zip'">
                    <ButtonDownloadS3Object2 :s3Path="cfdi.pdf_attachment" />
                  </td>
                  <td v-if="col.key === 'reqPayment'">
                    <template v-for="reqPay in getUniqueReqPayments(cfdi)" :key="`pay-${reqPay.id}`">
                      <v-chip
                        size="small"
                        color="deep-orange"
                        variant="flat"
                        :to="`/invoices/suppliers/cfdis/request-payment/view-${reqPay.id}`"
                      >
                        {{ reqPay.folio || `Req #${reqPay.id}` }}
                      </v-chip>
                    </template>
                    <template v-for="reqDem in cfdi.req_demurrages || []" :key="`dem-${reqDem.id}`">
                      <v-chip
                        size="small"
                        color="purple"
                        variant="flat"
                        :to="`/invoices/search/lines/demurrages/req-pay-view-${reqDem.id}`"
                      >
                        {{ reqDem.folio || `Demurrage #${reqDem.id}` }}
                      </v-chip>
                    </template>
                    <template v-for="reqDet in cfdi.req_detentions || []" :key="`det-${reqDet.id}`">
                      <v-chip
                        size="small"
                        color="indigo"
                        variant="flat"
                        :to="`/invoices/search/lines/detentions/req-pay-view-${reqDet.id}`"
                      >
                        {{ reqDet.folio || `Detention #${reqDet.id}` }}
                      </v-chip>
                    </template>
                  </td>
                  <td v-if="col.key === 'reissued'">
                    <div v-if="cfdi.parent_deleted" class="mb-1">
                      <v-chip color="orange" size="small" variant="outlined">
                        Reissued from {{ cfdi.parent_deleted?.serie_folio }}
                      </v-chip>
                    </div>
                    <div v-if="cfdi.children_deleted?.length">
                      <v-chip color="blue" size="small" variant="outlined">
                        Replaced by {{ cfdi.children_deleted[0]?.serie_folio }}
                      </v-chip>
                    </div>
                  </td>
                  <td v-if="col.key === 'serieFolio'" class="whitespace-nowrap">
                    {{ `${cfdi.serie_folio}` }}
                    <v-chip v-if="cfdi.legacy_payment_request" color="deep-orange" size="x-small" variant="flat" class="ml-1">
                      <v-icon size="x-small" start>mdi-alert-circle</v-icon>
                      TM1 pay request
                    </v-chip>
                  </td>
                  <td v-if="col.key === 'emisor'">
                    <v-icon v-if="cfdi.supplier_id != null" color="primary">mdi-link</v-icon>
                    <v-icon v-if="cfdi.supplier_id == null" color="red">mdi-link-off</v-icon>
                    <div>{{ cfdi.rfc_emisor }}</div>
                    <div>{{ cfdi.name_emisor }}</div>
                  </td>
                  <td v-if="col.key === 'receptor'">
                    <div>{{ cfdi.rfc_receptor }}</div>
                    <div>{{ cfdi.name_receptor }}</div>
                  </td>
                  <td v-if="col.key === 'tc'">
                    <v-chip
                      :color="cfdi.tipo_comprobante === 'I' ? 'green' : cfdi.tipo_comprobante === 'E' ? 'red' : 'blue'"
                      class="text-white"
                      size="small"
                      variant="outlined"
                    >
                      {{ cfdi.tipo_comprobante_name }}
                    </v-chip>
                  </td>
                  <td v-if="col.key === 'sat'">
                    <SatValidationStatus v-if="cfdi.uuid" :key="`sat-${cfdi.id}-${cfdi.sat_validated_at}`" :supplierCfdi="cfdi" :showValidateButton="false" />
                    <v-chip v-else color="grey" size="small" variant="tonal">N/A</v-chip>
                  </td>
                  <td v-if="col.key === 'total'" class="whitespace-nowrap">
                    {{ formatToCurrency(cfdi.amount_cfdi) }} {{ getCurrencyName(cfdi.currency_id) }}
                  </td>
                  <td v-if="col.key === 'provisioned'" class="whitespace-nowrap">
                    {{ formatToCurrency(cfdi.amount_provisioned) }} {{ getCurrencyName(cfdi.currency_id) }}
                  </td>
                  <td v-if="col.key === 'concepts'" class="whitespace-nowrap">
                    <template v-if="cfdi.is_free_format">
                      <div v-for="(charge, index) in cfdi.cfdi_charges" :key="`charge-${index}`" class="text-xs mb-1">
                        <v-chip size="x-small" color="deep-purple" variant="tonal">
                          {{ charge.charge?.name ? `${charge.charge.name} - ` : '' }}{{ charge.notes }}
                        </v-chip>
                      </div>
                      <div v-if="!cfdi.cfdi_charges?.length" class="text-xs text-grey">Sin cargos</div>
                    </template>
                    <template v-else>
                      <div v-for="(cfdiInvoice, index) in cfdi.invoices" :key="`cfdi-invoice-${index}`">
                        <div>{{ cfdiInvoice.chargeable?.name }}</div>
                      </div>
                    </template>
                  </td>
                  <td v-if="col.key === 'invoiceDate'">{{ formatDateOnlyString(cfdi.invoice_date) }}</td>
                  <td v-if="col.key === 'createdAt'">{{ formatDateString(cfdi.created_at) }}</td>
                  <td v-if="col.key === 'updatedAt'">
                    <UserInfoBadge :item="cfdi">
                      {{ formatDateString(cfdi.updated_at) }}
                    </UserInfoBadge>
                  </td>
                  <td v-if="col.key === 'cancelled'">{{ cfdi.deleted_at != null ? 'Yes' : 'No' }}</td>
                </template>
              </tr>
            </tbody>
          </v-table>
          <v-pagination
            v-model="supplierCfdis.current_page"
            :length="supplierCfdis.last_page"
            rounded="circle"
            density="compact"
            @update:model-value="onClickPagination"
          ></v-pagination>

        </div>
      </v-card-text>
    </v-card>
  </div>
</template>
<script setup lang="ts">
import { currencies } from '@/utils/data/systemData'
import { permissions } from '@/utils/data/system'
import { useCheckUser } from '@/composables/useCheckUser'
import { deletedStatus } from '@/utils/data/systemData'

const { $api, $notifications } = useNuxtApp()
const snackbar = useSnackbar()
const confirm = $notifications.useConfirm()
const router = useRouter()
const loadingStore = useLoadingStore()
const { hasPermission } = useCheckUser()

const yesNoItems = [
  { name: 'Yes', value: true },
  { name: 'No', value: false },
]

const initialFilters = {
  invoiceDate: '',
  startDate: '',
  endDate: '',
  supplierId: '',
  folios: [] as string[],
  ifolio: '',
  serviceType: null as string | null,
  serviceYear: null as string | null,
  serviceNumbers: null as string | null,
  tipoComprobante: '',
  rfcEmisor: '',
  nameEmisor: '',
  uuid: '',
  currencyId: null as number | null,
  hasSupplier: null as boolean | null,
  amountProvisioned: null as number | null,
  blockedAtEntry: '' as any,
  deleted_status: '',
  reqPayFolio: '',
  hasReqPay: null as boolean | null,
}

// Registry of every filter available in the search form (default order/spans).
const filterLayoutDefs = [
  { key: 'invoiceDate', label: 'Invoice date', span: 2 },
  { key: 'startDate', label: 'Start date', span: 2 },
  { key: 'endDate', label: 'End date', span: 2 },
  { key: 'supplier', label: 'Supplier', span: 4 },
  { key: 'hasSupplier', label: 'Linked to supplier', span: 2 },
  { key: 'rfcEmisor', label: 'RFC Emisor', span: 3 },
  { key: 'nameEmisor', label: 'Issuer name', span: 4 },
  { key: 'uuid', label: 'CFDI UUID', span: 3 },
  { key: 'reqPayFolio', label: 'Request payment folio', span: 2 },
  { key: 'hasReqPay', label: 'Linked to a request payment', span: 2 },
  { key: 'amountProvisioned', label: 'Amount provisioned', span: 2 },
  { key: 'tipoComprobante', label: 'Tipo de comprobante', span: 2 },
  { key: 'blockedAtEntry', label: 'Entry status', span: 2 },
  { key: 'currencyId', label: 'Currency', span: 2 },
  { key: 'deletedStatus', label: 'Status', span: 2 },
  { key: 'serviceType', label: 'Service type', span: 2, visible: false },
  { key: 'serviceYear', label: 'Service year', span: 2, visible: false },
  { key: 'serviceNumbers', label: 'Service number(s)', span: 4, visible: false },
  { key: 'folios', label: 'Invoice folios (multi)', span: 12 },
]

// Model keys backing each layout filter: cleared when the user hides it
const filterModelKeys: Record<string, string[]> = {
  invoiceDate: ['invoiceDate'],
  startDate: ['startDate'],
  endDate: ['endDate'],
  supplier: ['supplierId'],
  hasSupplier: ['hasSupplier'],
  rfcEmisor: ['rfcEmisor'],
  nameEmisor: ['nameEmisor'],
  uuid: ['uuid'],
  reqPayFolio: ['reqPayFolio'],
  hasReqPay: ['hasReqPay'],
  amountProvisioned: ['amountProvisioned'],
  tipoComprobante: ['tipoComprobante'],
  blockedAtEntry: ['blockedAtEntry'],
  currencyId: ['currencyId'],
  deletedStatus: ['deleted_status'],
  serviceType: ['serviceType', 'serviceYear', 'serviceNumbers'],
  serviceYear: ['serviceYear'],
  serviceNumbers: ['serviceNumbers'],
  folios: ['folios', 'ifolio'],
}

const onLayoutFilterHidden = (key: string) => {
  ;(filterModelKeys[key] || []).forEach((modelKey) => {
    const initialValue = (initialFilters as any)[modelKey]
    ;(filters.value as any)[modelKey] = Array.isArray(initialValue) ? [...initialValue] : initialValue
  })
  syncToUrl()
}

// Registry of the table columns. Actions and Serie-Folio are locked.
const tableColumnDefs = [
  { key: 'actions', label: 'Actions', locked: true },
  { key: 'xml', label: 'XML' },
  { key: 'zip', label: 'Zip' },
  { key: 'reqPayment', label: '# Req payment' },
  { key: 'reissued', label: 'Reissued' },
  { key: 'serieFolio', label: 'Serie-Folio', locked: true },
  { key: 'emisor', label: 'Emisor / Proveedor' },
  { key: 'receptor', label: 'Receptor' },
  { key: 'tc', label: 'T.C. (Tipo de comprobante)' },
  { key: 'sat', label: 'Estatus SAT' },
  { key: 'total', label: 'Total CFDI' },
  { key: 'provisioned', label: 'Provisioned' },
  { key: 'concepts', label: 'Concepts' },
  { key: 'invoiceDate', label: 'Invoice date' },
  { key: 'createdAt', label: 'Created at' },
  { key: 'updatedAt', label: 'Last modified' },
  { key: 'cancelled', label: 'Cancelled?' },
]
const columnsLayout = useTableColumns('table-columns:supplier-cfdis', tableColumnDefs)
const { visibleColumns } = columnsLayout

const {
  filters,
  currentPage,
  syncToUrl,
  resetFilters: resetFiltersComposable,
} = useTableFilters(initialFilters, {
  storageKey: 'supplier-cfdis-filters',
  arrayFields: ['folios'],
})

const FILTER_VISIBILITY_KEY = 'supplier-cfdis-filters-visible'
const showFilters = ref(sessionStorage.getItem(FILTER_VISIBILITY_KEY) !== 'false')
const toggleFilters = () => {
  showFilters.value = !showFilters.value
  sessionStorage.setItem(FILTER_VISIBILITY_KEY, String(showFilters.value))
}

const initialYear = 2022
const currentYear = new Date().getFullYear()
const maxYear = currentYear + 1

const isEnteredLate = (cfdi: any): boolean => {
  if (!cfdi.invoice_date || !cfdi.created_at) return false
  const invoiceDate = new Date(cfdi.invoice_date + 'T00:00:00')
  const lastDayOfMonth = new Date(invoiceDate.getFullYear(), invoiceDate.getMonth() + 1, 0)
  const entryDeadline = new Date(lastDayOfMonth)
  entryDeadline.setDate(entryDeadline.getDate() + 3)
  entryDeadline.setHours(23, 59, 59, 999)
  const createdAt = new Date(cfdi.created_at)
  return createdAt > entryDeadline
}

const isBlockedAtEntry = (cfdi: any): boolean => {
  if (cfdi.blocked_at_entry === true) return true
  return isEnteredLate(cfdi)
}

const isCreditExpired = (cfdi: any): boolean => {
  const creditDays = cfdi.supplier_credit_days ?? 0
  
  // If no supplier linked, we can't validate credit days
  if (!cfdi.supplier_id) {
    return false
  }

  const invoiceDate = new Date(cfdi.invoice_date + 'T00:00:00')
  const deadline = new Date(invoiceDate)
  
  // If credit days is 0, deadline is end of the same day
  // Otherwise, add credit days to the invoice date
  if (creditDays === 0) {
    deadline.setHours(23, 59, 59, 999)
  } else {
    deadline.setDate(deadline.getDate() + creditDays)
    deadline.setHours(23, 59, 59, 999)
  }

  const now = new Date()
  return now > deadline
}


const canProcessCfdi = (cfdi: any): boolean => {
  if (isBlockedAtEntry(cfdi)) return false
  if (isCreditExpired(cfdi)) return false
  return true
}

const prefixYears = computed(() => {
  const years = []
  for (let i = initialYear; i <= maxYear; i++) {
    // last two digits of the year
    const year = i.toString().slice(-2)
    years.push(Number(year))
  }
  return years
})

const catalogs = ref<any>({
  charges: [],
})
const supplierCfdis = ref({
  data: [] as any,
  current_page: 1,
  page: 1,
  perPage: 10,
  last_page: 1,
})

const canValidateSat = computed(() => hasPermission(permissions.SupplierCfdiValidateSat))

const columnClass = (note: any) => {
  if (note.deleted_at != null) {
    return 'bg-red-100! dark:bg-red-900!'
  }
  if (note.is_manual) {
    return 'bg-gray-100! dark:bg-gray-800!'
  }
  if (rfcReceptorNotTM(note)) {
    return 'bg-yellow-100! dark:bg-yellow-900!'
  }
  return ''
}

const validateCfdiSatRow = async (cfdi: any) => {
  try {
    cfdi._validatingSat = true
    const response = await $api.suppliers.validateCfdiSat(cfdi.id.toString())

    cfdi.sat_status = response.sat_status
    cfdi.sat_status_label = response.sat_status_label
    cfdi.sat_validated_at = response.sat_validated_at
    cfdi.sat_validator = response.sat_validator
    cfdi.is_sat_valid = response.is_sat_valid

    if (response.sat_status === 'Vigente') {
      snackbar.add({ type: 'success', text: `CFDI ${cfdi.serie_folio} está vigente en SAT` })
    } else if (response.sat_status === 'Cancelado') {
      snackbar.add({ type: 'error', text: `CFDI ${cfdi.serie_folio} está CANCELADO en SAT` })
    } else {
      snackbar.add({ type: 'warning', text: response.message || `Resultado SAT para CFDI ${cfdi.serie_folio}` })
    }
  } catch (e: any) {
    console.error(e)
    snackbar.add({ type: 'error', text: e?.response?.data?.message || 'Error al validar CFDI con SAT' })
  } finally {
    cfdi._validatingSat = false
  }
}

const requestCfdiPayments = () => {
  console.log('Requesting payment module')
  router.push('/invoices/suppliers/cfdis/request-payment')
}

const viewSupplierCfdi = (cfdi: any) => {
  // snackbar.add({ type: 'warning', text: 'Not implemented yet' })
  router.push(`/invoices/suppliers/cfdis/view-${cfdi.id}`)
}

const editSupplierCfdi = (cfdi: any) => {
  router.push(`/invoices/suppliers/cfdis/edit-${cfdi.id}`)
}

const showConfirmDelete = async (supplierCfdi: any) => {
  const result = await confirm({
    title: 'Are you sure?',
    confirmationText: 'Update',
    content: `Please confirm you want to ${supplierCfdi.deleted_at ? 'restore' : 'delete'} this CFDI.`,
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
      const response = supplierCfdi.deleted_at
        ? await $api.suppliers.restoreCfdi(supplierCfdi.id)
        : await $api.suppliers.deleteCfdi(supplierCfdi.id)
      snackbar.add({
        type: 'success',
        text: `Supplier CFDI ${supplierCfdi.deleted_at ? 'restored' : 'deleted'}`
      })
      await getSupplierCfdis()
    } catch (e) {
      console.error(e)
    } finally {
      setTimeout(() => {
        loadingStore.stop()
      }, 250)
    }
  }
}

const addFolios = () => {
  if (!filters.value.ifolio || filters.value.ifolio.trim() === '') return
  // Split by spaces, commas, semicolons, pipes or line breaks
  const raw = filters.value.ifolio.split(/[\s,;|\n]+/).map((s: string) => s.trim()).filter(Boolean)
  for (const token of raw) {
    if (!filters.value.folios.includes(token)) {
      filters.value.folios.push(token)
    }
  }
  filters.value.ifolio = ''
}

const removeFolio = (index: number) => {
  filters.value.folios.splice(index, 1)
}

const isTouched = (cfdi: any) => {
  return cfdi.amount_provisioned < cfdi.amount_cfdi
}

const isLinkedToReqPayment = (cfdi: any): boolean => {
  return (
    (cfdi.invoices || []).some((inv: any) => inv.req_pay_invoice?.supplier_req_pay != null) ||
    (cfdi.req_demurrages || []).length > 0 ||
    (cfdi.req_detentions || []).length > 0
  )
}

const getUniqueReqPayments = (cfdi: any): { id: number; folio: string | null }[] => {
  const reqPayments = (cfdi.invoices || [])
    .map((inv: any) => inv.req_pay_invoice?.supplier_req_pay)
    .filter(Boolean)
  const unique = new Map<number, { id: number; folio: string | null }>()
  for (const rp of reqPayments) {
    unique.set(rp.id, { id: rp.id, folio: rp.folio })
  }
  return [...unique.values()]
}

const rfcReceptorNotTM = (cfdi: any) => {
  return cfdi.rfc_receptor != 'TMU861110IP2'
}

const hasSupplierLinked = (cfdi: any) => {
  return cfdi.supplier_id != null
}

const syncSupplierCfdi = async (id: number) => {
  try {
    loadingStore.start()
    const body = {
      id: id,
    }
    const response = await $api.suppliers.syncSupplierCfdiSupplier(body)
    if (response.supplier_id != null) {
      snackbar.add({ type: 'success', text: 'Supplier CFDI synced' })
    } else {
      snackbar.add({ type: 'error', text: `Supplier with RFC ${response.rfc_emisor} not found` })
    }

    await getSupplierCfdis()
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const onClickFilters = async () => {
  // Process any pending folios from the textarea before searching
  addFolios()
  // set current page to 1
  supplierCfdis.value.current_page = 1
  currentPage.value = 1
  await syncToUrl()
  await getSupplierCfdis()
}

const onClickPagination = async (page: number) => {
  supplierCfdis.value.current_page = page
  currentPage.value = page
  await syncToUrl()
  await getSupplierCfdis()
}

const getSupplierCfdis = async () => {
  try {
    loadingStore.start()
    const response = await $api.suppliers.getFactraCfdis({
      query: {
        ...flattenArraysToCommaSeparatedString(filters.value),
        page: supplierCfdis.value.current_page,
      },
    })

    supplierCfdis.value = response as any
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}


const clearFilters = async () => {
  await resetFiltersComposable()
  supplierCfdis.value.current_page = 1
  await getSupplierCfdis()
}

const getCatalogs = async () => {
  try {
    const response = await $api.suppliers.getFactraCfdisSearchFilters()
    catalogs.value = response
  } catch (e) {
    console.error(e)
  }
}
onMounted(async () => {
  supplierCfdis.value.current_page = currentPage.value
  await getSupplierCfdis()
  await getCatalogs()
})
</script>
