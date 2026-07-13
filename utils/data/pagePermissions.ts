import { menuPermissions } from '~/utils/data/system'

/**
 * Registro ruta -> permiso "de menú" que controla si esa página aparece en
 * la navegación, derivado directamente de los `to="..."` y sus
 * `v-if="canAccess(...)"` en MainMenu.vue (única fuente hoy de esa
 * relación, ya que ninguna página tiene `definePageMeta` con permisos).
 * Alimenta el drawer "Page permissions" del footer — junto con los
 * permisos observados en llamadas reales al API (ver
 * utils/data/permissionsRoutesMatch.ts), que cubren las acciones dentro de
 * la página (crear/editar/eliminar) que este registro no captura.
 *
 * No pretende cubrir el 100% de las páginas del sistema — solo las que ya
 * están representadas en el menú principal. Páginas sin entrada aquí
 * simplemente no muestran nada en el drawer.
 *
 * `path` hace match por prefijo (startsWith); se evalúa del más específico
 * al menos específico, así que el orden de declaración no importa.
 */
export interface PagePermissionEntry {
  path: string
  permissions: string[]
}

export const pagePermissions: PagePermissionEntry[] = [
  { path: '/', permissions: [menuPermissions.Home] },

  { path: '/auth-requests', permissions: [menuPermissions.AuthorizationsRequests] },
  { path: '/auth-process-requests', permissions: [menuPermissions.AuthorizationsProcessRequests] },
  { path: '/request-assistance', permissions: [menuPermissions.AuthorizationsRequestAssistance] },

  { path: '/transfers', permissions: [menuPermissions.BankingTransactionsTransfers] },

  { path: '/payments/agents/soa', permissions: [menuPermissions.PaymentsFfAgentsSoa] },
  { path: '/payments/agents/payments', permissions: [menuPermissions.PaymentsFfAgentsPending, menuPermissions.PaymentsFfAgentsPaid] },
  { path: '/payments/agents/reports', permissions: [menuPermissions.PaymentsFfAgentsReports] },
  { path: '/payments/lines/schedules/report-bls', permissions: [menuPermissions.PaymentsFreightLinesReportBls] },
  { path: '/payments/lines/schedules/sea-services', permissions: [menuPermissions.PaymentsFreightLinesSeaServices] },
  { path: '/payments/lines/schedules', permissions: [menuPermissions.PaymentsFreightLinesSchedules] },

  { path: '/invoices/suppliers/cfdis/request-payment/new', permissions: [menuPermissions.InvoicesSuppliersNewPayment] },
  { path: '/invoices/suppliers/cfdis/request-payment', permissions: [menuPermissions.PaymentsSuppliers, menuPermissions.InvoicesSuppliersRequestPayments] },
  { path: '/invoices/suppliers/cfdis/create', permissions: [menuPermissions.MaritimeImportDemurragesSupplierCfdi] },
  { path: '/invoices/suppliers/cfdis', permissions: [menuPermissions.InvoicesSuppliersCfdis] },
  { path: '/advance-payments', permissions: [menuPermissions.InvoicesSuppliersAdvancePayments] },
  { path: '/refunds', permissions: [menuPermissions.PaymentsRefunds] },

  { path: '/invoices/search/tm', permissions: [menuPermissions.InvoicesCustomersTm] },
  { path: '/invoices/search/wm', permissions: [menuPermissions.InvoicesCustomersWm] },
  { path: '/invoices/search/credit-notes', permissions: [menuPermissions.InvoicesCustomersCreditNotes] },
  { path: '/invoices/search/free-format', permissions: [menuPermissions.InvoicesCustomersFreeFormat] },
  { path: '/invoices/search/sea-import', permissions: [menuPermissions.InvoicesCustomersSeaImport] },
  { path: '/invoices/search/sea-export', permissions: [menuPermissions.InvoicesCustomersSeaExport] },
  { path: '/invoices/search/air-import', permissions: [menuPermissions.InvoicesCustomersAirImport] },
  { path: '/invoices/search/air-export', permissions: [menuPermissions.InvoicesCustomersAirExport] },

  { path: '/invoices/lines/notes', permissions: [menuPermissions.InvoicesFreightLinesNotes] },
  { path: '/invoices/lines/demurrage-detentions', permissions: [menuPermissions.InvoicesFreightLinesDemurrageDetentions, menuPermissions.MaritimeImportDemurragesPayments] },
  { path: '/invoices/lines/credit-notes', permissions: [menuPermissions.InvoicesFreightLinesCreditNotes] },

  { path: '/invoices/ffagents/notes', permissions: [menuPermissions.InvoicesFfAgents] },

  { path: '/adminpack/export-invoices', permissions: [menuPermissions.InvoicesAdminPackExport] },
  { path: '/adminpack/upload-invoices-tm', permissions: [menuPermissions.InvoicesAdminPackUpload] },
  { path: '/adminpack/zip-file-jobs', permissions: [menuPermissions.InvoicesAdminPackHistory] },

  { path: '/maritime/import/demurrages/search', permissions: [menuPermissions.MaritimeImportDemurragesSearch] },
  { path: '/maritime/import/demurrages/reports', permissions: [menuPermissions.MaritimeImportDemurragesReports] },
  { path: '/maritime/import', permissions: [menuPermissions.MaritimeImport] },
  { path: '/maritime/export', permissions: [menuPermissions.MaritimeExport] },

  { path: '/air/import', permissions: [menuPermissions.AirImport] },
  { path: '/air/export', permissions: [menuPermissions.AirExport] },

  { path: '/tracking', permissions: [menuPermissions.Tracking] },
  { path: '/reports', permissions: [menuPermissions.Reports] },

  { path: '/configuration/airlines', permissions: [menuPermissions.ConfigurationAirlines] },
  { path: '/configuration/airports', permissions: [menuPermissions.ConfigurationAirports] },
  { path: '/configuration/banks', permissions: [menuPermissions.ConfigurationBanks] },
  { path: '/configuration/beneficiaries', permissions: [menuPermissions.ConfigurationBeneficiaries] },
  { path: '/configuration/charges', permissions: [menuPermissions.ConfigurationCharges] },
  { path: '/configuration/consignees-mbl', permissions: [menuPermissions.ConfigurationConsigneesMbl] },
  { path: '/configuration/container-delay-rates', permissions: [menuPermissions.ConfigurationContainerDelayRates] },
  { path: '/configuration/containers', permissions: [menuPermissions.ConfigurationContainers] },
  { path: '/configuration/countries', permissions: [menuPermissions.ConfigurationCountries] },
  { path: '/configuration/customers', permissions: [menuPermissions.ConfigurationCustomers] },
  { path: '/configuration/currencies', permissions: [menuPermissions.ConfigurationCurrencies] },
  { path: '/configuration/custom-agents', permissions: [menuPermissions.ConfigurationCustomAgents] },
  { path: '/configuration/embalajes', permissions: [menuPermissions.ConfigurationEmbalajes] },
  { path: '/configuration/exchange-rate', permissions: [menuPermissions.ConfigurationExchangeRate] },
  { path: '/configuration/executives', permissions: [menuPermissions.ConfigurationExecutives] },
  { path: '/configuration/freight-forwarders', permissions: [menuPermissions.ConfigurationFreightForwarders] },
  { path: '/configuration/handlers', permissions: [menuPermissions.ConfigurationHandlers] },
  { path: '/configuration/lines', permissions: [menuPermissions.ConfigurationLines] },
  { path: '/configuration/destinations', permissions: [menuPermissions.ConfigurationLocations] },
  { path: '/configuration/ports', permissions: [menuPermissions.ConfigurationPorts] },
  { path: '/configuration/services-contracts', permissions: [menuPermissions.ConfigurationServicesContracts] },
  { path: '/configuration/sea-regions', permissions: [menuPermissions.ConfigurationSeaRegions] },
  { path: '/configuration/shippers', permissions: [menuPermissions.ConfigurationShippers] },
  { path: '/configuration/suppliers', permissions: [menuPermissions.ConfigurationSuppliers] },
  { path: '/configuration/tracking-events', permissions: [menuPermissions.ConfigurationTrackingEvents] },
  { path: '/configuration/transportation-modes', permissions: [menuPermissions.ConfigurationTransportationModes] },
  { path: '/configuration/vessels', permissions: [menuPermissions.ConfigurationVessels] },
  { path: '/configuration/voyages', permissions: [menuPermissions.ConfigurationVoyages] },
  { path: '/configuration/warehouses', permissions: [menuPermissions.ConfigurationWarehouses] },

  { path: '/system/admin-department', permissions: [menuPermissions.SystemAdminDept] },
  { path: '/system/users', permissions: [menuPermissions.SystemUsers] },
  { path: '/system/role-permissions', permissions: [menuPermissions.SystemRolesPermissions] },
  { path: '/system/bank-accounts', permissions: [menuPermissions.SystemBankAccounts] },
  { path: '/system/mail-notification-groups', permissions: [menuPermissions.SystemMailNotificationGroups] },
  { path: '/system/mail-notifications', permissions: [menuPermissions.SystemMailNotifications] },
  { path: '/system/email-templates', permissions: [menuPermissions.SystemEmailTemplates] },
  { path: '/system/alert-types', permissions: [menuPermissions.SystemAlertTypes] },
  { path: '/system/auth-request-types', permissions: [menuPermissions.SystemAuthRequestTypes] },
  { path: '/system/support-tickets', permissions: [menuPermissions.SystemSupportTickets] },
  { path: '/system/usage-statistics', permissions: [menuPermissions.SystemLogs] },
  { path: '/system/system-logs', permissions: [menuPermissions.SystemLogs] },
  { path: '/system/audit-log', permissions: [menuPermissions.SystemAudit] },
  { path: '/wiki', permissions: [menuPermissions.SystemWiki] },
]

/** Permisos registrados para la ruta actual (match del prefijo más específico). */
export function getPagePermissions(path: string): string[] {
  const match = [...pagePermissions]
    .sort((a, b) => b.path.length - a.path.length)
    .find((entry) => path === entry.path || path.startsWith(entry.path + '/'))

  return match ? [...new Set(match.permissions)] : []
}
