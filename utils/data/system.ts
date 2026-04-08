const permissions = {
  SeaImportSales: 'sea-import-sales',
  SeaImportOperation: 'sea-import-operation',
  SeaImportAccounting: 'sea-import-accounting',
  AirProfitTotals: 'air-profit-totals',
  SeaImportProfit: 'import-maritime-profit',
  SeaExportProfit: 'export-maritime-profit',
  SupportRequestAssit: 'support_request.assist',
  DemurragesUpdateSellRates: 'demurrages-sell-update-rates',
  DemurragesRateOverrideView: 'demurrages-rate-override-view',
  DemurragesRateOverrideCreate: 'demurrages-rate-override-create',
  DemurragesRateOverrideEdit: 'demurrages-rate-override-edit',
  DemurragesRateOverrideDelete: 'demurrages-rate-override-delete',
  SupplierCfdiValidateSat: 'supplier-cfdi-validate-sat',
  MarkSupplierCfdiAsFreeFormat: 'mark-supplier-cfdi-as-free-format',
  RevertSupplierCfdiFromFreeFormat: 'revert-supplier-cfdi-from-free-format',
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
  SystemUsers: 'menu-system-users',
  SystemRolesPermissions: 'menu-system-roles-permissions',
  SystemBankAccounts: 'menu-system-bank-accounts',
  SystemMailNotifications: 'menu-system-mail-notifications',
  SystemMailNotificationGroups: 'menu-system-mail-notification-groups',
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
