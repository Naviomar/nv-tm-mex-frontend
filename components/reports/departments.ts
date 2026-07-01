export interface DeptReport {
  key: string
  title: string
  icon: string
  /** Globally-registered (auto-imported) component name. Empty => coming soon. */
  component?: string
  /** Granular permission required to access this report. */
  permission?: string
}

export interface ReportDept {
  key: string
  title: string
  icon: string
  color: string
  reports: DeptReport[]
}

/**
 * Information architecture for the reports module, grouped by department.
 * Only Sea Import / Finance / Billing have implemented reports today; the rest
 * render a "coming soon" state and are ready to be filled in later.
 */
export const REPORT_DEPARTMENTS: ReportDept[] = [
  {
    key: 'maritime-import',
    title: 'Maritime Import',
    icon: 'mdi-ferry',
    color: 'indigo',
    reports: [
      { key: 'comparative', title: 'Comparative Analytics', icon: 'mdi-chart-line', component: 'SeaImportReports', permission: 'reports-cobranza-view' },
      { key: 'import-repo', title: 'Import Repo', icon: 'mdi-table-large', component: 'ImportRepoReport', permission: 'reports-import-repo-view' },
    ],
  },
  {
    key: 'maritime-export',
    title: 'Maritime Export',
    icon: 'mdi-ferry',
    color: 'cyan',
    reports: [],
  },
  {
    key: 'air-import',
    title: 'Air Import',
    icon: 'mdi-airplane-landing',
    color: 'blue',
    reports: [],
  },
  {
    key: 'air-export',
    title: 'Air Export',
    icon: 'mdi-airplane-takeoff',
    color: 'light-blue',
    reports: [],
  },
  {
    key: 'finance',
    title: 'Finance',
    icon: 'mdi-finance',
    color: 'green',
    reports: [
      { key: 'cobranza', title: 'Cobranza', icon: 'mdi-cash-multiple', component: 'CobranzaReport', permission: 'reports-cobranza-view' },
      { key: 'payments-history', title: 'Payments History', icon: 'mdi-history', component: 'PaymentsHistoryReport', permission: 'reports-payments-history-view' },
      { key: 'movement-payments', title: 'Movement Payments', icon: 'mdi-transfer', component: 'MovementPaymentsReport', permission: 'reports-movements-payments-view' },
    ],
  },
  {
    key: 'billing',
    title: 'Billing',
    icon: 'mdi-receipt-text',
    color: 'amber',
    reports: [
      { key: 'invoices', title: 'Customer Invoices', icon: 'mdi-receipt-text', component: 'CustomerInvoicesReport', permission: 'reports-customer-invoices-view' },
      { key: 'pending-invoice', title: 'Pending Invoice', icon: 'mdi-receipt-clock-outline', component: 'ChargesPendingInvoiceReport', permission: 'reports-charges-pending-invoice-view' },
      { key: 'executive', title: 'Executive Reports', icon: 'mdi-account-star', component: 'ExecutiveReport', permission: 'reports-executives-view' },
    ],
  },
  {
    key: 'accounting',
    title: 'Accounting',
    icon: 'mdi-calculator',
    color: 'teal',
    reports: [],
  },
]
