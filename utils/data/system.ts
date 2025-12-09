const permissions = {
  SeaImportSales: 'sea-import-sales',
  SeaImportOperation: 'sea-import-operation',
  SeaImportAccounting: 'sea-import-accounting',
  AirProfitTotals: 'air-profit-totals',
  SeaImportProfit: 'import-maritime-profit',
  SeaExportProfit: 'export-maritime-profit',
  SupportRequestAssit: 'support_request.assist',
  DemurragesUpdateSellRates: 'demurrages-sell-update-rates',
}

const authorizeResources = {
  CancelInvoiceTm: {
    resource: 'cancel-invoice-tm',
    description: 'Cancel Invoice TM',
    redirect: '/auth-requests/cancel-invoice-tm',
  },
  CancelInvoiceWm: {
    resource: 'cancel-invoice-wm',
    description: 'Cancel Invoice WM',
    redirect: '/auth-requests/cancel-invoice-wm',
  },
  CancelInvoiceTmAir: {
    resource: 'cancel-invoice-tm-air',
    description: 'Cancel Invoice Air TM',
    redirect: '/auth-requests/cancel-invoice-tm',
  },
  CancelInvoiceWmAir: {
    resource: 'cancel-invoice-wm-air',
    description: 'Cancel Invoice Air WM',
    redirect: '/auth-requests/cancel-invoice-wm',
  },
  CancelFreeFormat: {
    resource: 'cancel-free-fromat',
    description: 'Cancel Free Format',
    redirect: null,
  },
  DemurrageDiscount: {
    resource: 'sea-import-demurrage-discount',
    description: 'Demurrage Discount',
    redirect: null,
  },
  DemurrageRevertToPartial: {
    resource: 'sea-import-demurrage-revert-to-partial',
    description: 'Revert Demurrage to Partial',
    redirect: null,
  },
  CancelCustomerCreditNote: {
    resource: 'cancel-customer-credit-note',
    description: 'Cancel Customer Credit Note',
    redirect: null,
  },
  RevalidationSkipAgentChangeCharge: {
    resource: 'sea-import-revalidation-skip-agent-change-charge',
    description: 'Skip customs agent change charge on sea import revalidation',
    redirect: null,
  },
}

const systemLayouts = {
  bankMovements: { path: 'mex/system-layouts/tm_mex_bank_movements_layout.xlsx', filename: 'tm_mex_bank_movements_layout.xlsx' },
  linePaySchedules: { path: 'mex/system-layouts/line_pay_schedules.xlsx', filename: 'line_pay_schedules.xlsx' },
  invoiceTmCfdiZip: { path: 'mex/system-layouts/invoice_tm_cfdi_zip.zip', filename: 'invoice_tm_cfdi_zip.zip' },
}


const getAuthResourceByName = (resourceName: string) => {
  return Object.values(authorizeResources).find((resource) => resource.resource === resourceName)
}

export { permissions, authorizeResources, systemLayouts, getAuthResourceByName }
