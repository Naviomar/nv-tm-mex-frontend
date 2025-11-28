const deletedStatus = [
  {
    id: 1,
    name: 'Active',
    value: 'active',
  },
  {
    id: 2,
    name: 'Inactive',
    value: 'deleted',
  },
]

const bankAccounts = [
  {
    type: 'wm',
    beneficiary: 'WORLD MARITIME LTD',
    account_number: '6550240651',
    swift: 'BOFAUS3N',
    aba: '026009593',
    bank: 'BANK OF AMERICA NT & SA',
    bank_address: 'NEW YORK BRANCH, 10 W. 33rd, N.Y. 10001',
    country: 'USA',
    currency: 'USD',
  },
  {
    type: 'tm',
    beneficiary: 'TRANSPORTE MULTIMODAL, SA DE CV',
    account_number: '7001273796',
    branch: '617',
    clabe: '021180070012737960',
    bank: 'HSBC',
    bank_address: '', // Puedes agregar la dirección si la tienes
    country: 'MEXICO',
    currency: 'MXN',
  }
]

const systemBanks = [
  {
    id: 1,
    bank: 'BofA',
    tipo: 'Administrativa',
    accountNumber: '4364564536534',
  },
  {
    id: 2,
    bank: 'HSBC',
    tipo: 'Operativa',
    accountNumber: '785854543345',
  },
  {
    id: 3,
    bank: 'BofA',
    tipo: 'Administrativa',
    accountNumber: '3125234534543',
  },
  {
    id: 4,
    bank: 'HSBC',
    tipo: 'Operativa',
    accountNumber: '987645443434',
  },
  {
    id: 5,
    bank: 'BofA',
    tipo: 'Administrativa',
    accountNumber: '4364564536534',
  },
]

const systemCompanies = [
  {
    id: 1,
    name: 'Transporte Multimodal S.A. de C.V.',
    address: 'Address 1',
    phone: '123456789',
    systemBanks: systemBanks,
  },
  {
    id: 2,
    name: 'Naviomar S.A. de C.V.',
    address: 'Address 2',
    phone: '123456789',
    systemBanks: systemBanks,
  },
]

const currencies = [
  {
    id: 2,
    name: 'USD',
  },
  {
    id: 1,
    name: 'MXN',
  },
  {
    id: 3,
    name: 'EUR',
  },
  {
    id: 4,
    name: 'GBP',
  },
  {
    id: 5,
    name: 'JPY',
  },
  {
    id: 6,
    name: 'GTQ',
  },
  {
    id: 7,
    name: 'HNL',
  },
  {
    id: 8,
    name: 'CLP',
  },
]

const systemCountries = [
  {
    id: 1,
    name: 'Mexico',
    code: 'MX',
  },
  {
    id: 2,
    name: 'Chile',
    code: 'CL',
  },
]

const chargeEntities = [
  {
    id: 1,
    value: 'ff agent',
    name: 'F.F. Agent',
  },
  {
    id: 2,
    value: 'custom agent',
    name: 'Customs Agent',
  },
  {
    id: 3,
    value: 'other',
    name: 'Other',
  },
]

const serviceTypes = [
  {
    id: 1,
    value: 'sea',
    name: 'Sea',
  },
  {
    id: 2,
    value: 'air',
    name: 'Air',
  },
  {
    id: 3,
    value: 'intermodal',
    name: 'Intermodal',
  },
  {
    id: 4,
    value: 'free_format',
    name: 'Free format',
  },
]

const mailNotifications = [
  {
    "id": 1,
    "name": "App\\Mail\\Mexico\\AirExportRevalidation",
    "short_name": "AirExportRevalidation",
    "description": "Air Export Revalidation",
    "is_for_consignee": true
  },
  {
    "id": 2,
    "name": "App\\Mail\\Mexico\\AirImportNotify",
    "short_name": "AirImportNotify",
    "description": "Air Import Notification",
    "is_for_consignee": true
  },
  {
    "id": 3,
    "name": "App\\Mail\\Mexico\\AirImportRevalidation",
    "short_name": "AirImportRevalidation",
    "description": "Air Import Revalidation",
    "is_for_consignee": true
  },
  {
    "id": 4,
    "name": "App\\Mail\\Mexico\\AuthProcessNewRequest",
    "short_name": "AuthProcessNewRequest",
    "description": "Notification for new authorization process request",
    "is_for_consignee": false
  },
  {
    "id": 5,
    "name": "App\\Mail\\Mexico\\AuthProcessRespondRequest",
    "short_name": "AuthProcessRespondRequest",
    "description": "Notification responding to authorization process request",
    "is_for_consignee": false
  },
  {
    "id": 6,
    "name": "App\\Mail\\Mexico\\AuthRequestNotifyNew",
    "short_name": "AuthRequestNotifyNew",
    "description": "Notification for new authorization request",
    "is_for_consignee": false
  },
  {
    "id": 7,
    "name": "App\\Mail\\Mexico\\AuthRequestResponded",
    "short_name": "AuthRequestResponded",
    "description": "Authorization Request Responded",
    "is_for_consignee": false
  },
  {
    "id": 8,
    "name": "App\\Mail\\Mexico\\ConsigneeInvoiceTm",
    "short_name": "ConsigneeInvoiceTm",
    "description": "Consignee Invoice TM",
    "is_for_consignee": true
  },
  {
    "id": 9,
    "name": "App\\Mail\\Mexico\\ConsigneeInvoiceTmCfdi",
    "short_name": "ConsigneeInvoiceTmCfdi",
    "description": "Consignee Invoice TM CFDI linked",
    "is_for_consignee": true
  },
  {
    "id": 10,
    "name": "App\\Mail\\Mexico\\ConsigneeInvoiceWm",
    "short_name": "ConsigneeInvoiceWm",
    "description": "Consignee Invoice WM",
    "is_for_consignee": true
  },
  {
    "id": 11,
    "name": "App\\Mail\\Mexico\\DemurrageCutNotify",
    "short_name": "DemurrageCutNotify",
    "description": "Demurrages Cut Notify",
    "is_for_consignee": true
  },
  {
    "id": 12,
    "name": "App\\Mail\\Mexico\\DemurragesParcialOverdue",
    "short_name": "DemurragesParcialOverdue",
    "description": "Demurrages Parcial Overdue Notification",
    "is_for_consignee": true
  },
  {
    "id": 13,
    "name": "App\\Mail\\Mexico\\DemurragesThreeDaysLeft",
    "short_name": "DemurragesThreeDaysLeft",
    "description": "Demurrages Three Days Left",
    "is_for_consignee": true
  },
  {
    "id": 14,
    "name": "App\\Mail\\Mexico\\DemurragesThreeDaysLeftInternal",
    "short_name": "DemurragesThreeDaysLeftInternal",
    "description": "Internal Report about Demurrages Three Days Left Notification",
    "is_for_consignee": false
  },
  {
    "id": 15,
    "name": "App\\Mail\\Mexico\\InvoiceCustomerCancelled",
    "short_name": "InvoiceCustomerCancelled",
    "description": "Invoice Customer Cancelled",
    "is_for_consignee": true
  },
  {
    "id": 16,
    "name": "App\\Mail\\Mexico\\InvoiceTmCancelled",
    "short_name": "InvoiceTmCancelled",
    "description": "Invoice TM Cancelled",
    "is_for_consignee": true
  },
  {
    "id": 17,
    "name": "App\\Mail\\Mexico\\InvoiceWmCancelled",
    "short_name": "InvoiceWmCancelled",
    "description": "Invoice WM Cancelled",
    "is_for_consignee": true
  },
  {
    "id": 18,
    "name": "App\\Mail\\Mexico\\InvoicesWMPendingPayment",
    "short_name": "InvoicesWMPendingPayment",
    "description": "WM Invoices Pending Payment Notify",
    "is_for_consignee": false
  },
  {
    "id": 19,
    "name": "App\\Mail\\Mexico\\LinePaymentScheduleNoty",
    "short_name": "LinePaymentScheduleNoty",
    "description": "Line Payment Schedule notification",
    "is_for_consignee": false
  },
  {
    "id": 20,
    "name": "App\\Mail\\Mexico\\NotifyFfRequestPayment",
    "short_name": "NotifyFfRequestPayment",
    "description": "Request F.F. Agent payment",
    "is_for_consignee": false
  },
  {
    "id": 21,
    "name": "App\\Mail\\Mexico\\ProformasTmPendingToInvoiceNotify",
    "short_name": "ProformasTmPendingToInvoiceNotify",
    "description": "Proformas TM Pending To Invoice Notify",
    "is_for_consignee": false
  },
  {
    "id": 22,
    "name": "App\\Mail\\Mexico\\ReminderAuthRequestGrant",
    "short_name": "ReminderAuthRequestGrant",
    "description": "Reminder Auth Request Grant",
    "is_for_consignee": false
  },
  {
    "id": 23,
    "name": "App\\Mail\\Mexico\\RequestAdvancePaymentNoty",
    "short_name": "RequestAdvancePaymentNoty",
    "description": "Request Advance Payment notification",
    "is_for_consignee": false
  },
  {
    "id": 24,
    "name": "App\\Mail\\Mexico\\RequestDemurrageNoty",
    "short_name": "RequestDemurrageNoty",
    "description": "Request Demurrages to pay line notification",
    "is_for_consignee": false
  },
  {
    "id": 25,
    "name": "App\\Mail\\Mexico\\RequestDetentionNoty",
    "short_name": "RequestDetentionNoty",
    "description": "Request Detentions to pay line notification",
    "is_for_consignee": false
  },
  {
    "id": 26,
    "name": "App\\Mail\\Mexico\\RequestRefundNoty",
    "short_name": "RequestRefundNoty",
    "description": "Request Refund notification",
    "is_for_consignee": true
  },
  {
    "id": 27,
    "name": "App\\Mail\\Mexico\\SeaExportAlertDraftBl",
    "short_name": "SeaExportAlertDraftBl",
    "description": "Sea Export - Alert Draft BL",
    "is_for_consignee": true
  },
  {
    "id": 28,
    "name": "App\\Mail\\Mexico\\SeaExportAlertFinal",
    "short_name": "SeaExportAlertFinal",
    "description": "Sea Export - Final Alert",
    "is_for_consignee": true
  },
  {
    "id": 29,
    "name": "App\\Mail\\Mexico\\SeaExportBookingConfirmation",
    "short_name": "SeaExportBookingConfirmation",
    "description": "Sea Export - Booking Confirmation",
    "is_for_consignee": true
  },
  {
    "id": 30,
    "name": "App\\Mail\\Mexico\\SeaExportPreAlert",
    "short_name": "SeaExportPreAlert",
    "description": "Sea Export - Pre Alert",
    "is_for_consignee": true
  },
  {
    "id": 31,
    "name": "App\\Mail\\Mexico\\SeaImportIntermodalNoty",
    "short_name": "SeaImportIntermodalNoty",
    "description": "Sea Import - Intermodal Movement Notification",
    "is_for_consignee": true
  },
  {
    "id": 32,
    "name": "App\\Mail\\Mexico\\SeaImportIntermodalRailNoty",
    "short_name": "SeaImportIntermodalRailNoty",
    "description": "Sea Import - Intermodal Rail Arrival Notification",
    "is_for_consignee": true
  },
  {
    "id": 33,
    "name": "App\\Mail\\Mexico\\SeaImportIntermodalRailTruckPending",
    "short_name": "SeaImportIntermodalRailTruckPending",
    "description": "Sea Import Intermodal Rail arrival - Local Truck Pending",
    "is_for_consignee": true
  },
  {
    "id": 34,
    "name": "App\\Mail\\Mexico\\SeaImportIntermodalTruckPending",
    "short_name": "SeaImportIntermodalTruckPending",
    "description": "Sea Import Intermodal Truck Pending",
    "is_for_consignee": true
  },
  {
    "id": 35,
    "name": "App\\Mail\\Mexico\\SeaImportNoVesselWeeklyNotify",
    "short_name": "SeaImportNoVesselWeeklyNotify",
    "description": "Sea Import No Vessel Weekly Notify",
    "is_for_consignee": false
  },
  {
    "id": 36,
    "name": "App\\Mail\\Mexico\\SeaImportNotifyArrival",
    "short_name": "SeaImportNotifyArrival",
    "description": "Sea Import - Notify Vessel Arrival notification",
    "is_for_consignee": true
  },
  {
    "id": 37,
    "name": "App\\Mail\\Mexico\\SeaImportNotifyRevalidation",
    "short_name": "SeaImportNotifyRevalidation",
    "description": "Sea Import - Notify Revalidation",
    "is_for_consignee": true
  },
  {
    "id": 38,
    "name": "App\\Mail\\Mexico\\SeaImportPendingArrivalNotifyTm",
    "short_name": "SeaImportPendingArrivalNotifyTm",
    "description": "Sea Import Pending Arrival Notify only TM",
    "is_for_consignee": true
  },
  {
    "id": 39,
    "name": "App\\Mail\\Mexico\\SeaImportPendingRevalidation",
    "short_name": "SeaImportPendingRevalidation",
    "description": "Sea Import Pending Revalidation Notify",
    "is_for_consignee": true
  },
  {
    "id": 40,
    "name": "App\\Mail\\Mexico\\SeaImportPendingRevalidationInd",
    "short_name": "SeaImportPendingRevalidationInd",
    "description": "Sea Import Pending Revalidation Notify by reference",
    "is_for_consignee": true
  },
  {
    "id": 41,
    "name": "App\\Mail\\Mexico\\SeaImportVesselNoATANotify",
    "short_name": "SeaImportVesselNoATANotify",
    "description": "Sea Import Vessel No ATA Notify",
    "is_for_consignee": false
  },
  {
    "id": 42,
    "name": "App\\Mail\\Mexico\\SeaImportVesselWithETAnoATA",
    "short_name": "SeaImportVesselWithETAnoATA",
    "description": "Sea Import Vessel With ETA No ATA Notify",
    "is_for_consignee": false
  },
  {
    "id": 43,
    "name": "App\\Mail\\Mexico\\SeaVoyageDestUpdatedEtaConfirmed",
    "short_name": "SeaVoyageDestUpdatedEtaConfirmed",
    "description": "Sea Voyage Destination Updated ETA Confirmation",
    "is_for_consignee": true
  },
  {
    "id": 44,
    "name": "App\\Mail\\Mexico\\SeaVoyageDestUpdatedEtaConsignee",
    "short_name": "SeaVoyageDestUpdatedEtaConsignee",
    "description": "Sea Voyage Destination Updated ETA Consignee",
    "is_for_consignee": true
  },
  {
    "id": 45,
    "name": "App\\Mail\\Mexico\\SupplierInvoicesPendingProvision",
    "short_name": "SupplierInvoicesPendingProvision",
    "description": "Supplier Invoices Pending Provision",
    "is_for_consignee": false
  },
  {
    "id": 46,
    "name": "App\\Mail\\Mexico\\SupplierRequestPaymentNotify",
    "short_name": "SupplierRequestPaymentNotify",
    "description": "Supplier Request Payment notification",
    "is_for_consignee": false
  },
  {
    "id": 47,
    "name": "App\\Mail\\Mexico\\VoyageDestinationNotifyPort",
    "short_name": "VoyageDestinationNotifyPort",
    "description": "Notify port users about voyage destination",
    "is_for_consignee": true
  },
  {
    "id": 48,
    "name": "App\\Mail\\Mexico\\SeaImportChecklistNotify",
    "short_name": "SeaImportChecklistNotify",
    "description": "Sea Import - Notify Checklist revalidation",
    "is_for_consignee": true
  },
  {
    "id": 49,
    "name": "App\\Mail\\Mexico\\NewSupportAssistance",
    "short_name": "NewSupportAssistance",
    "description": "Notification for new support assistance request",
    "is_for_consignee": false
  },
  {
    "id": 50,
    "name": "App\\Mail\\Mexico\\UpdatedSupportAssistance",
    "short_name": "UpdatedSupportAssistance",
    "description": "Notification for updated support assistance request",
    "is_for_consignee": false
  }
];



const transportationModes = [
  {
    id: 1,
    name: 'Rail',
  },
  {
    id: 2,
    name: 'Truck',
  },
  {
    id: 3,
    name: 'Rail & Truck',
  },
]

const cfdiCatalogs = {
  usosCfdi: [
    {
      id: 1,
      name: 'G01 - Adquisición de mercancias',
    },
    {
      id: 2,
      name: 'G02 - Devoluciones, descuentos o bonificaciones',
    },
    {
      id: 3,
      name: 'G03 - Gastos en general',
    },
    {
      id: 4,
      name: 'I01 - Construcciones',
    },
    {
      id: 5,
      name: 'S01 - Sin efectos fiscales',
    },
  ],
  metodosPago: [
    {
      id: 1,
      name: 'PUE (Pago en una sola exhibición)',
    },
    {
      id: 2,
      name: 'PPD (Pago en parcialidades o diferido)',
    },
  ],
  formasPago: [
    {
      id: 1,
      name: '01 - Efectivo',
    },
    {
      id: 2,
      name: '02 - Cheque nominativo',
    },
    {
      id: 3,
      name: '03 - Transferencia electrónica de fondos',
    },
    {
      id: 4,
      name: '04 - Tarjeta de crédito',
    },
    {
      id: 5,
      name: '17 - Compensación',
    },
    {
      id: 6,
      name: '99 - Por definir',
    },
  ],
  regimenFiscales: [
    {
      id: 1,
      name: '601 - General de Ley Personas Morales'
    },
    {
      id: 2,
      name: '603 - Personas Morales con Fines no Lucrativos'
    },
    {
      id: 3,
      name: '605 - Sueldos y Salarios e Ingresos Asimilados a Salarios'
    },
    {
      id: 4,
      name: '606 - Arrendamiento'
    },
    {
      id: 5,
      name: '607 - Régimen de Enajenación o Adquisición de Bienes'
    },
    {
      id: 6,
      name: '608 - Demás ingresos'
    },
    {
      id: 7,
      name: '610 - Residentes en el Extranjero sin Establecimiento Permanente en México'
    },
    {
      id: 8,
      name: '611 - Ingresos por Dividendos (socios y accionistas)'
    },
    {
      id: 9,
      name: '612 - Personas Físicas con Actividades Empresariales y Profesionales'
    },
    {
      id: 10,
      name: '614 - Ingresos por intereses'
    },
    {
      id: 11,
      name: '615 - Régimen de los ingresos por obtención de premios'
    },
    {
      id: 12,
      name: '616 - Sin obligaciones fiscales'
    },
    {
      id: 13,
      name: '620 - Sociedades Cooperativas de Producción que optan por diferir sus ingresos'
    },
    {
      id: 14,
      name: '621 - Incorporación Fiscal'
    },
    {
      id: 15,
      name: '622 - Actividades Agrícolas, Ganaderas, Silvícolas y Pesqueras'
    },
    {
      id: 16,
      name: '623 - Opcional para Grupos de Sociedades'
    },
    {
      id: 17,
      name: '624 - Coordinados'
    },
    {
      id: 18,
      name: '625 - Régimen de las Actividades Empresariales con ingresos a través de Plataformas Tecnológicas'
    },
    {
      id: 19,
      name: '626 - Régimen Simplificado de Confianza'
    }
  ]
}

const sourceSystems = [
  {
    id: 1,
    name: 'TM-MEX',
  },
  {
    id: 2,
    name: 'Tracker-Liverpool',
  },
]

const customerInvTypes = [
  { name: 'TM', value: 'tm' },
  { name: 'WM', value: 'wm' },
]

const typeInvoices = [
  // Customers
  { deposit: true, withdrawal: false, slug: 'sea', tm: true, wm: false, name: 'Invoice Sea TM', class_name: 'InvoiceSeaTm' },
  { deposit: true, withdrawal: false, slug: 'sea', tm: false, wm: true, name: 'Invoice Sea WM', class_name: 'InvoiceSeaWm' },
  { deposit: true, withdrawal: false, slug: 'air', tm: true, wm: false, name: 'Invoice Air TM', class_name: 'InvoiceAirTm' },
  { deposit: true, withdrawal: false, slug: 'air', tm: false, wm: true, name: 'Invoice Air WM', class_name: 'InvoiceAirWm' },
  { deposit: true, withdrawal: false, slug: 'free-format', tm: true, wm: true, name: 'Free format Invoice', class_name: 'PartyInvoice' },

  // F.F. Agents SOA
  { deposit: true, withdrawal: true, slug: 'ff', tm: true, wm: true, name: 'Agent F.F. invoice', class_name: 'FfPayment' },

  // Freight Lines
  { deposit: false, withdrawal: true, slug: 'line', tm: true, wm: true, name: 'BL Payment Schedule', class_name: 'LinePaymentSchedule' },
  { deposit: false, withdrawal: true, slug: 'line-demurrages', tm: true, wm: true, name: 'Request Line Demurrages', class_name: 'ReqDemurrage' },
  { deposit: false, withdrawal: true, slug: 'line-detentions', tm: true, wm: true, name: 'Request Line Detentions', class_name: 'ReqDetention' },

  // Suppliers
  { deposit: false, withdrawal: true, slug: 'supplier', tm: true, wm: true, name: 'Supplier request payment', class_name: 'SupplierReqPayment' },
  { deposit: false, withdrawal: true, slug: 'supplier-advance-payment', inv_type: 'advance_payment', name: 'Supplier Advance payment', class_name: 'ReqAdvancePayment' },

  // Refunds
  { deposit: false, withdrawal: true, slug: 'refund', inv_type: 'refund', name: 'Refund', class_name: 'ReqRefund' },

]

const partyables = [
  { name: 'Customer', value: 'App\\Models\\Mexico\\Consignee' },
  { name: 'Supplier', value: 'App\\Models\\Mexico\\Supplier' },
  { name: 'Freight Forwarder', value: 'App\\Models\\Mexico\\FreightForwarder' },
  { name: 'Customs Agent', value: 'App\\Models\\Mexico\\CustomAgent' },
]

const ticketCatalogs = {
  priorities: [
    { name: 'Low', value: 'low' },
    { name: 'Medium', value: 'medium' },
    { name: 'High', value: 'high' },
    { name: 'Urgent', value: 'urgent' },
    { name: 'Critical', value: 'critical' },
  ],
  severities: [
    { name: 'S1: System is completely down', value: 's1' },
    { name: 'S2: Critical feature malfunctioning', value: 's2' },
    { name: 'S3: Minor feature affected, not critical.', value: 's3' },
    { name: 'S4: General questions, requests, etc.', value: 's4' },
    { name: 'S5: Feature request', value: 's5' },
    { name: 'S6: Documentation', value: 's6' },
  ],
  categories: [
    { name: 'Bug Report: An unexpected problem in the system.', value: 'bug' },
    { name: 'Feature Request: A request for a new feature.', value: 'feature' },
    { name: 'Documentation: A request for documentation.', value: 'documentation' },
    { name: 'Access Issue: Problems related to login or access', value: 'access' },
    { name: 'General Question: A general question.', value: 'question' },
  ],
  modules: [
    { name: 'Authorizations', value: 'authorizations' },
    { name: 'Banking Transactions - Transfers', value: 'banking-transactions-transfers' },
    { name: 'Payments - F.F. Agents D/C Notes', value: 'payments-ff-agents' },
    { name: 'Payments - Freight Lines - Schedule Payments', value: 'payments-freight-lines-schedule' },
    { name: 'Payments - Suppliers', value: 'payments-suppliers' },
    { name: 'Payments - Advance Payments', value: 'payments-advance-payments' },
    { name: 'Payments - Refunds', value: 'payments-refunds' },
    { name: 'Invoices - Customers', value: 'invoices-customers' },
    { name: 'Invoices - Customers TM', value: 'invoices-customers-tm' },
    { name: 'Invoices - Customers WM', value: 'invoices-customers-wm' },
    { name: 'Invoices - Customers Credit Notes', value: 'invoices-customers-credit-notes' },
    { name: 'Invoices - Free format', value: 'invoices-free-format' },

    { name: 'Invoices - Freight Lines', value: 'invoices-freight-lines' },
    { name: 'Invoices - Freight Lines credit notes', value: 'invoices-freight-lines-credit-notes' },
    { name: 'Invoices - Freight Lines Request demurrages payment', value: 'invoices-freight-lines-demurrages-payment' },
    { name: 'Invoices - Freight Lines Request detentions payment', value: 'invoices-freight-lines-detentions-payment' },

    { name: 'Invoices - F.F. Agents', value: 'invoices-ff-agents' },
    { name: 'Invoices - Suppliers', value: 'invoices-suppliers' },
    { name: 'Invoices - Suppliers Advance Payment', value: 'invoices-suppliers-advance-payment' },
    { name: 'Invoices - Suppliers Manual CFDI', value: 'invoices-suppliers-manual-cfdi' },
    { name: 'Invoices - Suppliers Request Payment', value: 'invoices-suppliers-request-payment' },
    { name: 'Invoices - AdminPack', value: 'invoices-adminpack' },

    { name: 'Maritime - Import', value: 'maritime-import' },
    { name: 'Maritime - Import - Intermodal', value: 'maritime-import-intermodal' },
    { name: 'Maritime - Import - MBL', value: 'maritime-import-mbl' },
    { name: 'Maritime - Import - HBL', value: 'maritime-import-hbl' },
    { name: 'Maritime - Import - Arrival Notification', value: 'maritime-import-arrival-notification' },
    { name: 'Maritime - Import - Rates', value: 'maritime-import-rates' },
    { name: 'Maritime - Import - Profit', value: 'maritime-import-profit' },
    { name: 'Maritime - Import - Containers', value: 'maritime-import-containers' },
    { name: 'Maritime - Import - Revalidation', value: 'maritime-import-revalidation' },
    { name: 'Maritime - Import - Checklist', value: 'maritime-import-checklist' },
    { name: 'Maritime - Import - Demurrages', value: 'maritime-import-demurrages' },
    { name: 'Maritime - Import - Demurrage Calculations', value: 'maritime-import-demurrage-calculations' },
    { name: 'Maritime - Import - Demurrage discounts', value: 'maritime-import-demurrage-discounts' },

    { name: 'Maritime - Export', value: 'maritime-export' },
    { name: 'Maritime - Export - MBL', value: 'maritime-export-mbl' },
    { name: 'Maritime - Export - HBL', value: 'maritime-export-hbl' },
    { name: 'Maritime - Export - Booking Confirmation', value: 'maritime-export-booking-confirmation' },
    { name: 'Maritime - Export - Release', value: 'maritime-export-release' },
    { name: 'Maritime - Export - Print BL', value: 'maritime-export-print-bl' },
    { name: 'Maritime - Export - Ship Sail Check', value: 'maritime-export-ship-sail-check' },
    { name: 'Maritime - Export - Alerts', value: 'maritime-export-alerts' },
    { name: 'Maritime - Export - Rates', value: 'maritime-export-rates' },
    { name: 'Maritime - Export - Profit', value: 'maritime-export-profit' },
    { name: 'Maritime - Export - Containers', value: 'maritime-export-containers' },
    { name: 'Maritime - Export - Detentions', value: 'maritime-export-detentions' },

    { name: 'Air - Import', value: 'air-import' },
    { name: 'Air - Import - Notification', value: 'air-import-notification' },
    { name: 'Air - Import - CBM', value: 'air-import-cbm' },
    { name: 'Air - Import - Rates', value: 'air-import-rates' },
    { name: 'Air - Import - Release', value: 'air-import-release' },

    { name: 'Air - Export', value: 'air-export' },
    { name: 'Air - Export - Print Master', value: 'air-export-print-master' },
    { name: 'Air - Export - Print House', value: 'air-export-print-house' },
    { name: 'Air - Export - CBM', value: 'air-export-cbm' },
    { name: 'Air - Export - Rates', value: 'air-export-rates' },

    { name: 'Sea - Tracking', value: 'sea-tracking' },
    { name: 'Air - Tracking', value: 'sea-tracking' },
    { name: 'Tracking Module', value: 'tracking' },

    { name: 'Configuration - Airlines', value: 'configuration-airlines' },
    { name: 'Configuration - Airports', value: 'configuration-airports' },
    { name: 'Configuration - Banks', value: 'configuration-banks' },
    { name: 'Configuration - Charges', value: 'configuration-charges' },
    { name: 'Configuration - Customers', value: 'configuration-customers' },
    { name: 'Configuration - Consignees MBL', value: 'configuration-consignees-mbl' },
    { name: 'Configuration - Containers', value: 'configuration-containers' },
    { name: 'Configuration - Countries', value: 'configuration-countries' },
    { name: 'Configuration - Currencies', value: 'configuration-currencies' },
    { name: 'Configuration - Customs Agents', value: 'configuration-customs-agents' },
    { name: 'Configuration - Embalajes', value: 'configuration-embalajes' },
    { name: 'Configuration - Exchange Rate', value: 'configuration-exchange-rate' },
    { name: 'Configuration - Executives', value: 'configuration-executives' },
    { name: 'Configuration - Freight Forwarders', value: 'configuration-freight-forwarders' },
    { name: 'Configuration - Handlers', value: 'configuration-handlers' },
    { name: 'Configuration - Lines', value: 'configuration-lines' },
    { name: 'Configuration - Locations', value: 'configuration-locations' },
    { name: 'Configuration - Notifications Types', value: 'configuration-notifications-types' },
    { name: 'Configuration - Ports', value: 'configuration-ports' },
    { name: 'Configuration - Services Contracts', value: 'configuration-services-contracts' },
    { name: 'Configuration - Sea Regions', value: 'configuration-sea-regions' },
    { name: 'Configuration - Shippers (POL) / Consignees (POD)', value: 'configuration-shippers' },
    { name: 'Configuration - Suppliers', value: 'configuration-suppliers' },
    { name: 'Configuration - Transportation Modes', value: 'configuration-transportation-modes' },
    { name: 'Configuration - Vessels', value: 'configuration-vessels' },
    { name: 'Configuration - Voyages', value: 'configuration-voyages' },
    { name: 'Configuration - Voyages - Update ETA', value: 'configuration-voyages-update-eta' },
    { name: 'Configuration - Voyages - Init demurrages', value: 'configuration-voyages-init-demurrages' },
    { name: 'Configuration - Warehouses', value: 'configuration-warehouses' },
    { name: 'System - Users', value: 'system-users' },
    { name: 'System - Roles and Permissions', value: 'system-roles-permissions' },
    { name: 'System - Bank Accounts', value: 'system-bank-accounts' },
    { name: 'System - Support Tickets', value: 'system-support-tickets' },

    { name: 'Tracker - Sea', value: 'tracker-sea' },
    { name: 'Tracker - Air', value: 'tracker-air' },
    { name: 'Tracker - Invoices', value: 'tracker-invoices' },
    { name: 'Other - Not listed', value: 'other' },
  ],
}

export {
  bankAccounts,
  systemCompanies,
  deletedStatus,
  systemBanks,
  serviceTypes,
  chargeEntities,
  currencies,
  cfdiCatalogs,
  transportationModes,
  sourceSystems,
  typeInvoices,
  customerInvTypes,
  partyables,
  ticketCatalogs,
  systemCountries,
  mailNotifications,
}
