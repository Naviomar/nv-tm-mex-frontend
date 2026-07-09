const permissions = {
  SeaImportSales: 'sea-import-sales',
  SeaImportOperation: 'sea-import-operation',
  SeaImportAccounting: 'sea-import-accounting',
  AirProfitTotals: 'air-profit-totals',
  SeaImportProfit: 'sea-import-profit',
  SeaExportProfit: 'sea-export-profit',
  SupportRequestAssit: 'support-requests-assist',
  DemurragesUpdateSellRates: 'demurrages-sell-update-rates',
  DemurragesRateOverrideView: 'demurrages-rate-override-view',
  DemurragesRateOverrideCreate: 'demurrages-rate-override-create',
  DemurragesRateOverrideEdit: 'demurrages-rate-override-edit',
  DemurragesRateOverrideDelete: 'demurrages-rate-override-delete',

  // Container Delay Rates
  ContainerDelayRatesCreate: 'container-delay-rates-create',
  ContainerDelayRatesEdit: 'container-delay-rates-edit',
  ContainerDelayRatesDelete: 'container-delay-rates-delete',
  SupplierCfdiValidateSat: 'supplier-cfdi-validate-sat',
  MarkSupplierCfdiAsFreeFormat: 'mark-supplier-cfdi-as-free-format',
  RevertSupplierCfdiFromFreeFormat: 'revert-supplier-cfdi-from-free-format',

  // Customer Invoices
  CustomerInvoicesIndex: 'customer-invoices-index',
  CustomerInvoicesView: 'customer-invoices-view',
  CustomerInvoicesCreate: 'customer-invoices-create',
  CustomerInvoicesEdit: 'customer-invoices-edit',

  // Proforma/reference charge editing - phase 1 (voyage not locked yet).
  // Specific to the charge's own invoice type, NOT CustomerInvoicesEdit.
  ProformaTmEdit: 'proforma-tm-edit',
  ProformaWmEdit: 'proforma-wm-edit',

  // Sea import reference charges - elevated permission required once the
  // voyage is locked (phase 2).
  SeaImportAddChargeToReferenciaWithPermission: 'invoice-sea-add-charge-to-referencia-with-permission',
  SeaImportUpdateChargeWithPermission: 'sea-import-update-charge-with-permission',
  SeaImportDeleteChargeWithPermission: 'sea-import-delete-charge-with-permission',
  SeaImportUpdateSellChargeWithPermission: 'sea-import-update-sell-charge-with-permission',
  SeaImportDeleteSellChargeWithPermission: 'sea-import-delete-sell-charge-with-permission',

  // Sea import proforma charges - elevated permission required once the
  // voyage is locked (phase 2).
  InvoiceSeaAddChargeToProformaWithPermission: 'invoice-sea-add-charge-to-proforma-with-permission',
  InvoiceSeaUpdateChargeProformaWithPermission: 'invoice-sea-update-charge-proforma-with-permission',
  InvoiceSeaDeleteChargeProformaWithPermission: 'invoice-sea-delete-charge-proforma-with-permission',

  // TM Invoices
  TmInvoicesIndex: 'tm-invoices-index',
  TmInvoicesView: 'tm-invoices-view',
  TmInvoicesCreate: 'tm-invoices-create',
  TmInvoicesEdit: 'tm-invoices-edit',

  // WM Invoices
  WmInvoicesIndex: 'wm-invoices-index',
  WmInvoicesView: 'wm-invoices-view',
  WmInvoicesCreate: 'wm-invoices-create',
  WmInvoicesEdit: 'wm-invoices-edit',

  // TM Air Invoices
  TmAirInvoicesIndex: 'tm-air-invoices-index',
  TmAirInvoicesView: 'tm-air-invoices-view',
  TmAirInvoicesEdit: 'tm-air-invoices-edit',

  // WM Air Invoices
  WmAirInvoicesIndex: 'wm-air-invoices-index',
  WmAirInvoicesView: 'wm-air-invoices-view',
  WmAirInvoicesEdit: 'wm-air-invoices-edit',

  // Convert Proforma to Invoice
  TmInvoicesConvertToInvoice: 'tm-invoices-convert-to-invoice',
  WmInvoicesConvertToInvoice: 'wm-invoices-convert-to-invoice',
  WmInvoicesConvertToInvoiceLimited: 'wm-invoices-convert-to-invoice-limited',

  // Line Payments
  LinePaymentsIndex: 'line-payments-index',
  LinePaymentsView: 'line-payments-view',
  LinePaymentsCreate: 'line-payments-create',
  LinePaymentsEdit: 'line-payments-edit',
  LinePaymentsDelete: 'line-payments-delete',

  // Party Invoices (freight lines + ff agents)
  PartyInvoicesIndex: 'party-invoices-index',
  PartyInvoicesView: 'party-invoices-view',
  PartyInvoicesCreate: 'party-invoices-create',
  PartyInvoicesEdit: 'party-invoices-edit',
  PartyInvoicesDelete: 'party-invoices-delete',

  // Supplier Request Payments
  SupplierReqPaymentsIndex: 'supplier-req-payments-index',
  SupplierReqPaymentsView: 'supplier-req-payments-view',
  SupplierReqPaymentsCreate: 'supplier-req-payments-create',
  SupplierReqPaymentsEdit: 'supplier-req-payments-edit',
  SupplierReqPaymentsDelete: 'supplier-req-payments-delete',

  // Refunds
  RefundsIndex: 'refunds-index',
  RefundsView: 'refunds-view',
  RefundsCreate: 'refunds-create',
  RefundsEdit: 'refunds-edit',
  RefundsDelete: 'refunds-delete',

  // Advance Payments
  AdvancePaymentsIndex: 'advance-payments-index',
  AdvancePaymentsView: 'advance-payments-view',
  AdvancePaymentsCreate: 'advance-payments-create',
  AdvancePaymentsEdit: 'advance-payments-edit',
  AdvancePaymentsDelete: 'advance-payments-delete',
}

const menuPermissions = {
  Home: 'menu-home',
  Authorizations: 'menu-authorizations',
  AuthorizationsRequests: 'menu-authorizations-requests',
  AuthorizationsProcessRequests: 'menu-authorizations-process-requests',
  AuthorizationsRequestAssistance: 'menu-authorizations-request-assistance',
  BankingTransactions: 'menu-banking-transactions',
  BankingTransactionsTransfers: 'menu-banking-transactions-transfers',
  Payments: 'menu-payments',
  PaymentsFfAgents: 'menu-payments-ff-agents',
  PaymentsFfAgentsSoa: 'menu-payments-ff-agents-soa',
  PaymentsFfAgentsPending: 'menu-payments-ff-agents-pending-payments',
  PaymentsFfAgentsPaid: 'menu-payments-ff-agents-paid-payments',
  PaymentsFfAgentsReports: 'menu-payments-ff-agents-reports',
  PaymentsFreightLines: 'menu-payments-freight-lines',
  PaymentsFreightLinesSchedules: 'menu-payments-freight-lines-schedules',
  PaymentsFreightLinesReportBls: 'menu-payments-freight-lines-report-bls',
  PaymentsFreightLinesSeaServices: 'menu-payments-freight-lines-sea-services',
  PaymentsSuppliers: 'menu-payments-suppliers',
  PaymentsRefunds: 'menu-payments-refunds',
  Invoices: 'menu-invoices',
  InvoicesCustomers: 'menu-invoices-customers',
  InvoicesCustomersSeaImport: 'menu-invoices-customers-sea-import',
  InvoicesCustomersSeaExport: 'menu-invoices-customers-sea-export',
  InvoicesCustomersAirImport: 'menu-invoices-customers-air-import',
  InvoicesCustomersAirExport: 'menu-invoices-customers-air-export',
  InvoicesCustomersTm: 'menu-invoices-customers-tm',
  InvoicesCustomersWm: 'menu-invoices-customers-wm',
  InvoicesCustomersCreditNotes: 'menu-invoices-customers-credit-notes',
  InvoicesCustomersFreeFormat: 'menu-invoices-customers-free-format',
  InvoicesFreightLines: 'menu-invoices-freight-lines',
  InvoicesFreightLinesNotes: 'menu-invoices-freight-lines-notes',
  InvoicesFreightLinesDemurrageDetentions: 'menu-invoices-freight-lines-demurrage-detentions',
  InvoicesFreightLinesCreditNotes: 'menu-invoices-freight-lines-credit-notes',
  InvoicesFfAgents: 'menu-invoices-ff-agents',
  InvoicesSuppliers: 'menu-invoices-suppliers',
  InvoicesSuppliersCfdis: 'menu-invoices-suppliers-cfdis',
  InvoicesSuppliersRequestPayments: 'menu-invoices-suppliers-request-payments',
  InvoicesSuppliersNewPayment: 'menu-invoices-suppliers-new-payment',
  InvoicesSuppliersAdvancePayments: 'menu-invoices-suppliers-advance-payments',
  InvoicesAdminPack: 'menu-invoices-adminpack',
  InvoicesAdminPackExport: 'menu-invoices-adminpack-export',
  InvoicesAdminPackUpload: 'menu-invoices-adminpack-upload',
  InvoicesAdminPackHistory: 'menu-invoices-adminpack-history',
  Maritime: 'menu-maritime',
  MaritimeImport: 'menu-maritime-import',
  MaritimeImportDemurrages: 'menu-maritime-import-demurrages',
  MaritimeImportDemurragesSearch: 'menu-maritime-import-demurrages-search',
  MaritimeImportDemurragesPayments: 'menu-maritime-import-demurrages-payments',
  MaritimeImportDemurragesSupplierCfdi: 'menu-maritime-import-demurrages-supplier-cfdi',
  MaritimeImportDemurragesReports: 'menu-maritime-import-demurrages-reports',
  MaritimeExport: 'menu-maritime-export',
  Air: 'menu-air',
  AirImport: 'menu-air-import',
  AirExport: 'menu-air-export',
  Tracking: 'menu-tracking',
  Reports: 'menu-reports',
  Configuration: 'menu-configuration',
  ConfigurationAirlines: 'menu-configuration-airlines',
  ConfigurationAirports: 'menu-configuration-airports',
  ConfigurationBanks: 'menu-configuration-banks',
  ConfigurationBeneficiaries: 'menu-configuration-beneficiaries',
  ConfigurationCharges: 'menu-configuration-charges',
  ConfigurationConsigneesMbl: 'menu-configuration-consignees-mbl',
  ConfigurationContainers: 'menu-configuration-containers',
  ConfigurationContainerDelayRates: 'menu-configuration-container-delay-rates',
  ConfigurationCountries: 'menu-configuration-countries',
  ConfigurationCustomers: 'menu-configuration-customers',
  ConfigurationCurrencies: 'menu-configuration-currencies',
  ConfigurationCustomAgents: 'menu-configuration-custom-agents',
  ConfigurationEmbalajes: 'menu-configuration-embalajes',
  ConfigurationExchangeRate: 'menu-configuration-exchange-rate',
  ConfigurationExecutives: 'menu-configuration-executives',
  ConfigurationFreightForwarders: 'menu-configuration-freight-forwarders',
  ConfigurationHandlers: 'menu-configuration-handlers',
  ConfigurationLines: 'menu-configuration-lines',
  ConfigurationLocations: 'menu-configuration-locations',
  ConfigurationPorts: 'menu-configuration-ports',
  ConfigurationServicesContracts: 'menu-configuration-services-contracts',
  ConfigurationSeaRegions: 'menu-configuration-sea-regions',
  ConfigurationShippers: 'menu-configuration-shippers',
  ConfigurationSuppliers: 'menu-configuration-suppliers',
  ConfigurationTrackingEvents: 'menu-configuration-tracking-events',
  ConfigurationTransportationModes: 'menu-configuration-transportation-modes',
  ConfigurationVessels: 'menu-configuration-vessels',
  ConfigurationVoyages: 'menu-configuration-voyages',
  ConfigurationWarehouses: 'menu-configuration-warehouses',
  System: 'menu-system',
  SystemAdminDept: 'menu-system-admin-department',
  SystemUsers: 'menu-system-users',
  SystemRolesPermissions: 'menu-system-roles-permissions',
  SystemBankAccounts: 'menu-system-bank-accounts',
  SystemMailNotifications: 'menu-system-mail-notifications',
  SystemMailNotificationGroups: 'menu-system-mail-notification-groups',
  SystemEmailTemplates: 'menu-system-email-templates',
  SystemAlertTypes: 'menu-system-alert-types',
  SystemAuthRequestTypes: 'menu-system-auth-request-types',
  SystemSupportTickets: 'menu-system-support-tickets',
  SystemLogs: 'menu-system-logs',
  SystemAudit: 'menu-system-audit',
  SystemWiki: 'menu-system-wiki',
  Logout: 'menu-logout',
}

/**
 * Authorization Resources (AuthorizationRequest model)
 * Used by AuthorizeProcessSmart.vue component.
 * Each entry maps a resource key to a human-readable description and optional redirect path.
 */
const authorizeResources = {
  /** Cancel a Sea TM invoice */
  CancelInvoiceTm: {
    resource: 'cancel-invoice-tm',
    description: 'Cancel Invoice TM',
    redirect: '/auth-requests/cancel-invoice-tm',
  },
  /** Cancel a Sea WM invoice */
  CancelInvoiceWm: {
    resource: 'cancel-invoice-wm',
    description: 'Cancel Invoice WM',
    redirect: '/auth-requests/cancel-invoice-wm',
  },
  /** Cancel an Air TM invoice */
  CancelInvoiceTmAir: {
    resource: 'cancel-invoice-tm-air',
    description: 'Cancel Invoice Air TM',
    redirect: '/auth-requests/cancel-invoice-tm',
  },
  /** Cancel an Air WM invoice */
  CancelInvoiceWmAir: {
    resource: 'cancel-invoice-wm-air',
    description: 'Cancel Invoice Air WM',
    redirect: '/auth-requests/cancel-invoice-wm',
  },
  /** Cancel a free-format (party) invoice */
  CancelFreeFormat: {
    resource: 'cancel-free-fromat',
    description: 'Cancel Free Format Invoice',
    redirect: null,
  },
  /** Apply a discount on sea import demurrage charges */
  DemurrageDiscount: {
    resource: 'sea-import-demurrage-discount',
    description: 'Sea Import Demurrage Discount',
    redirect: null,
  },
  /** Revert a totaled sea import demurrage back to partial */
  DemurrageRevertToPartial: {
    resource: 'sea-import-demurrage-revert-to-partial',
    description: 'Revert Sea Import Demurrage to Partial',
    redirect: null,
  },
  /** Cancel a customer credit note */
  CancelCustomerCreditNote: {
    resource: 'cancel-customer-credit-note',
    description: 'Cancel Customer Credit Note',
    redirect: null,
  },
  /** Restore a cancelled customer credit note */
  RestoreCustomerCreditNote: {
    resource: 'restore-customer-credit-note',
    description: 'Restore Customer Credit Note',
    redirect: null,
  },
  /** Skip customs agent change charge during sea import revalidation */
  RevalidationSkipAgentChangeCharge: {
    resource: 'sea-import-revalidation-skip-agent-change-charge',
    description: 'Skip Agent Change Charge on Sea Import Revalidation',
    redirect: null,
  },
  /** Update locked arrival voyage on sea import reference */
  SeaImportUpdateLockedVoyage: {
    resource: 'sea-import-update-locked-voyage',
    description: 'Update Locked Sea Import Arrival Voyage',
    redirect: null,
  },
  /** Transfer BLs (references) from one voyage destination to another */
  VoyageTransferReferences: {
    resource: 'voyage-transfer-references',
    description: 'Transfer BLs between Voyage Destinations',
    redirect: null,
  },
  /** Cancel (revert) a bank movement */
  CancelBankMovement: {
    resource: 'cancel-bank-movement',
    description: 'Cancel Bank Movement',
    redirect: null,
  },
}

/**
 * Process Resources (ProcessRequest model)
 * Used by ProcessAuthorizationWrapper.vue component.
 * Each entry maps a process_name key to a human-readable description.
 * The request_key is used to uniquely identify the record within the process (e.g., invoice ID, reference ID).
 */
const processResources = {
  /** Authorize working on a supplier CFDI entered past the allowed date or with expired credit days */
  SupplierWorkPastDate: {
    processName: 'supplier-work-past-date',
    description: 'Supplier CFDI — Work Past Date / Credit Expired',
    keyLabel: 'CFDI',
  },
  /** Authorize unlinking a supplier invoice from a supplier payment request */
  SupplierRequestUnlinkInvoice: {
    processName: 'supplier-request-unlink-invoice',
    description: 'Unlink Supplier Invoice from Payment Request',
    keyLabel: null,
  },
  /** Authorize editing a line invoice after it has been locked */
  InvoicesLinesUpdate: {
    processName: 'invoices.lines.update',
    description: 'Edit Locked Line Invoice',
    keyLabel: 'Invoice',
  },
  /** Authorize cancelling a line invoice after it has been locked */
  InvoicesLinesDelete: {
    processName: 'invoices.lines.delete',
    description: 'Cancel Locked Line Invoice',
    keyLabel: 'Invoice',
  },
  /** Authorize reverting (deleting) a payment from a closed bank movement */
  BankMovementPaymentDelete: {
    processName: 'bank-movement-payment-delete',
    description: 'Undo Payment on Closed Bank Movement',
    keyLabel: null,
  },
  /** Authorize sending the electronic revalidation on a sea import reference */
  SeaImportElectronicRevalidation: {
    processName: 'sea-import-electronic-revalidation',
    description: 'Sea Import Electronic Revalidation',
    keyLabel: 'Reference',
  },
  /** Authorize updating detention days/amounts on a sea export container */
  SeaExportUpdateDetentions: {
    processName: 'sea-export-update-detentions',
    description: 'Update Sea Export Container Detentions',
    keyLabel: null,
  },
  /** Authorize deleting a supplier CFDI */
  SupplierCfdiDelete: {
    processName: 'supplier-cfdi-delete',
    description: 'Delete Supplier CFDI',
    keyLabel: 'CFDI',
  },
  /** Authorize restoring a supplier CFDI */
  SupplierCfdiRestore: {
    processName: 'supplier-cfdi-restore',
    description: 'Restore Supplier CFDI',
    keyLabel: 'CFDI',
  },
  /** Authorize applying container delay rate changes (create/update/delete batch) */
  ContainerDelayRatesApplyChanges: {
    processName: 'container-delay-rates.apply-changes',
    description: 'Apply Container Delay Rate Changes',
    keyLabel: 'Line',
  },
  /** Authorize deleting a charge from a sea import proforma */
  InvoiceSeaDeleteChargeProforma: {
    processName: 'invoice-sea.delete-charge-proforma',
    description: 'Delete Proforma Charge (Sea Import)',
    keyLabel: 'Charge',
  },
  /** Authorize adding a charge to a locked sea import reference */
  SeaImportAddChargeLocked: {
    processName: 'sea-import.add-charge-locked',
    description: 'Add Charge to Locked Sea Import Reference',
    keyLabel: 'Reference',
  },
  /** Authorize adding a charge to a credit note */
  CreditNoteAddCharge: {
    processName: 'credit-note.add-charge',
    description: 'Add Charge to Credit Note',
    keyLabel: 'Credit Note',
  },
  /** Authorize updating folio/comments on a credit note */
  CreditNoteUpdateMeta: {
    processName: 'credit-note.update-meta',
    description: 'Update Folio / Comments on Credit Note',
    keyLabel: 'Credit Note',
  },
  /** Authorize adding similar invoice names to a charge */
  ChargeSimilarNames: {
    processName: 'charge-similar-names',
    description: 'Add Similar Invoice Names to Charge',
    keyLabel: 'Charge',
  },
  /** Authorize editing a sea import container after it's restricted */
  ContainerEdit: {
    processName: 'container-edit',
    description: 'Edit Sea Import Container (restricted)',
    keyLabel: null,
  },
  /** Authorize deleting a sea import container after it's restricted */
  ContainerDelete: {
    processName: 'container-delete',
    description: 'Delete Sea Import Container (restricted)',
    keyLabel: null,
  },
}

const systemLayouts = {
  bankMovements: { path: 'mex/system-layouts/tm_mex_bank_movements_layout.xlsx', filename: 'tm_mex_bank_movements_layout.xlsx' },
  linePaySchedules: { path: 'mex/system-layouts/line_pay_schedules.xlsx', filename: 'line_pay_schedules.xlsx' },
  invoiceTmCfdiZip: { path: 'mex/system-layouts/invoice_tm_cfdi_zip.zip', filename: 'invoice_tm_cfdi_zip.zip' },
}

/** Look up an authorization resource entry by its resource key string */
const getAuthResourceByName = (resourceName: string) => {
  return Object.values(authorizeResources).find((resource) => resource.resource === resourceName)
}

/** Look up a process resource entry by its process_name key string */
const getProcessResource = (processName: string) => {
  return Object.values(processResources).find((p) => p.processName === processName)
}

/**
 * Returns a human-readable display name for a ProcessRequest record.
 * Priority: display_name (stored on record) > processResources map > raw fallback.
 *
 * @param processName - The raw process_name field value
 * @param requestKey  - The raw request_key field value (e.g. an ID or composite key)
 * @param displayName - The stored display_name value (may be null for older records)
 */
const getProcessDisplayName = (processName: string, requestKey?: string | null, displayName?: string | null): string => {
  if (displayName) return displayName
  const proc = getProcessResource(processName)
  const label = proc?.description ?? processName
  if (!requestKey) return label
  const keyPrefix = proc?.keyLabel ? `${proc.keyLabel}: ` : ''
  return `${label} — ${keyPrefix}${requestKey}`
}

export { permissions, menuPermissions, authorizeResources, processResources, systemLayouts, getAuthResourceByName, getProcessResource, getProcessDisplayName }
