import { $fetch, type $Fetch, type FetchOptions, type IFetchError } from 'ofetch'

import AuthModule from '~/repository/modules/auth'
import UsersModule from '~/repository/modules/users'
import ShippersModule from '~/repository/modules/catalogs/shippers'
import SeaTrafficsModule from '~/repository/modules/catalogs/seatraffics'
import SeaRegionsModule from '~/repository/modules/catalogs/searegions'
import CustomAgentsModule from '~/repository/modules/catalogs/customsagents'
import ConsigneesModule from '~/repository/modules/catalogs/consignees'
import VesselsModule from '~/repository/modules/catalogs/vessels'
import VoyagesModule from '~/repository/modules/catalogs/voyages'
import ExchangeRateModule from '~/repository/modules/catalogs/exchangerates'
import ExecutivesModule from '~/repository/modules/catalogs/executives'
import FreightForwardersModule from '~/repository/modules/catalogs/freightforwarders'
import PortsModule from '~/repository/modules/catalogs/ports'
import CountriesModule from '~/repository/modules/catalogs/countries'
import ContainersModule from '~/repository/modules/catalogs/containers'
import LinesModule from '~/repository/modules/catalogs/lines'
import LineCreditNotesModule from '~/repository/modules/catalogs/lineCreditNotes'
import BanksModule from '~/repository/modules/catalogs/banks'
import CurrenciesModule from '~/repository/modules/catalogs/currencies'
import NotificationsModule from '~/repository/modules/catalogs/notificationstypes'
import BankAccountsTypesModule from '~/repository/modules/catalogs/bankaccountstypes'
import ExecutiveGroupsModule from '~/repository/modules/catalogs/executivesgroups'
import ReferenciasModule from '~/repository/modules/catalogs/referencias'
import ReferenciasExportModule from '~/repository/modules/catalogs/referenciasExport'
import FreightForwardersGroupModule from '~/repository/modules/catalogs/freightforwardersgroups'
import ConsigneesGroupsModule from '~/repository/modules/catalogs/consigneesgroups'
import ChargesModule from '~/repository/modules/catalogs/charges'
import TransportationModesModule from '~/repository/modules/catalogs/transporationmodes'
import ServicesContractModule from '~/repository/modules/catalogs/servicescontract'
import TestServicesModule from '~/repository/modules/catalogs/testservices'
import ConsigneeMblsModule from '~/repository/modules/catalogs/consigneeMbls'
import AwsModule from '~/repository/modules/catalogs/aws'
import TmInvoicesModule from '~/repository/modules/catalogs/tmInvoices'
import WmInvoicesModule from '~/repository/modules/catalogs/wmInvoices'
import TmAirInvoicesModule from '~/repository/modules/catalogs/tmAirInvoices'
import WmAirInvoicesModule from '~/repository/modules/catalogs/wmAirInvoices'
import InvoicesModule from '~/repository/modules/catalogs/invoices'
import EmbalajeModule from '~/repository/modules/catalogs/embalajes'
import DestinationModule from '~/repository/modules/catalogs/destinations'
import AuthRequestsModule from '~/repository/modules/catalogs/authrequests'
import AuthProcessRequestsModule from '~/repository/modules/catalogs/authProcessRequests'
import RequestAssistancesModule from '~/repository/modules/catalogs/requestAssistances'
import SystemAccountsModule from '~/repository/modules/catalogs/systemAccounts'
import BankMovementsModule from '~/repository/modules/catalogs/bankMovements'
import DemurragesModule from '~/repository/modules/catalogs/demurrages'
import LinePaymentsModule from '~/repository/modules/catalogs/linePayments'
import SuppliersModule from '~/repository/modules/catalogs/suppliers'
import SupplierTypesModule from '~/repository/modules/catalogs/supplierTypes'
import SupplierBanksModule from '~/repository/modules/catalogs/supplierBanks'
import ConsigneeCreditNotesModule from '~/repository/modules/catalogs/consigneeCreditNotes'
import FfNotesModule from '~/repository/modules/catalogs/ffNotes'
import SupportTiModule from '~/repository/modules/catalogs/supportTi'
import SystemServicesModule from '~/repository/modules/catalogs/systemServices'
import AirExportModule from '~/repository/modules/catalogs/airExportReferences'
import AirImportModule from '~/repository/modules/catalogs/airImportReferences'
import AirServiceModule from '~/repository/modules/catalogs/airServices'
import AirlineModule from '~/repository/modules/catalogs/airlines'
import HandlerModule from '~/repository/modules/catalogs/handlers'
import WarehouseModule from '~/repository/modules/catalogs/warehouses'
import AirportModule from '~/repository/modules/catalogs/airports'
import AirReferenceModule from '~/repository/modules/catalogs/airReferences'
import RefundModule from '~/repository/modules/catalogs/refunds'
import AdvancePaymentModule from '~/repository/modules/catalogs/advancepayments'
import FreightBanksModule from '~/repository/modules/catalogs/freightBanks'
import CustomerBanksModule from '~/repository/modules/catalogs/customerBanks'
import SupplierInvoicesModule from '~/repository/modules/catalogs/supplierInvoices'
import SupplierReqPaymentsModule from '~/repository/modules/catalogs/supplierReqPayments'
import FreeFormatInvoicesModule from '~/repository/modules/catalogs/freeFormatInvoices'
import MaritimeDemurragesModule from '~/repository/modules/catalogs/maritimeDemurrages'
import MaritimeDetentionsModule from '~/repository/modules/catalogs/maritimeDetentions'
import DepartmentsModule from '~/repository/modules/catalogs/departments'
import MailNotificationsModule from '~/repository/modules/catalogs/mailNotifications'
import MailNotificationGroupsModule from '~/repository/modules/catalogs/mailNotificationGroups'
import ServicePrintsModule from '~/repository/modules/catalogs/servicePrints'
import ServiceChargeLogsModule from '~/repository/modules/catalogs/serviceChargeLogs'
import SeaTrackingModule from '~/repository/modules/catalogs/seaTrackings'
import TrackingEventModule from '~/repository/modules/catalogs/trackingEvents'
import servicePaymentsModule from '~/repository/modules/catalogs/servicePayments'
import AuditModule from '~/repository/modules/catalogs/audit'
import DashboardModule from '~/repository/modules/catalogs/dashboard'
import ReportsModule from '~/repository/modules/catalogs/reports'
import ContainerDelayRatesModule from '~/repository/modules/catalogs/containerDelayRates'

interface IApiInstance {
  audit: AuditModule
  dashboard: DashboardModule
  reports: ReportsModule
  auth: AuthModule
  users: UsersModule
  shippers: ShippersModule
  seaTraffics: SeaTrafficsModule
  seaRegions: SeaRegionsModule
  customAgents: CustomAgentsModule
  consignees: ConsigneesModule
  customerBanks: CustomerBanksModule
  consigneeMbls: ConsigneeMblsModule
  vessels: VesselsModule
  voyages: VoyagesModule
  executives: ExecutivesModule
  freightForwarders: FreightForwardersModule
  freightBanks: FreightBanksModule
  ports: PortsModule
  countries: CountriesModule
  containers: ContainersModule
  lines: LinesModule
  banks: BanksModule
  referencias: ReferenciasModule
  referenciasExport: ReferenciasExportModule
  currencies: CurrenciesModule
  notificationsTypes: NotificationsModule
  bankAccountsTypes: BankAccountsTypesModule
  executivesGroups: ExecutiveGroupsModule
  freightForwardersGroups: FreightForwardersGroupModule
  consigneeGroups: ConsigneesGroupsModule
  charges: ChargesModule
  transportationModes: TransportationModesModule
  servicesContracts: ServicesContractModule
  testServices: TestServicesModule
  aws: AwsModule
  tmInvoices: TmInvoicesModule
  wmInvoices: WmInvoicesModule
  tmAirInvoices: TmAirInvoicesModule
  wmAirInvoices: WmAirInvoicesModule
  invoices: InvoicesModule
  embalajes: EmbalajeModule
  destinations: DestinationModule
  authRequests: AuthRequestsModule
  authProcessRequests: AuthProcessRequestsModule
  requestAssistances: RequestAssistancesModule
  systemAccounts: SystemAccountsModule
  bankMovements: BankMovementsModule
  servicePayments: servicePaymentsModule
  demurrages: DemurragesModule
  lineCreditNotes: LineCreditNotesModule
  linePayments: LinePaymentsModule
  suppliers: SuppliersModule
  supplierTypes: SupplierTypesModule
  supplierBanks: SupplierBanksModule
  consigneeCreditNotes: ConsigneeCreditNotesModule
  ffNotes: FfNotesModule
  supportTi: SupportTiModule
  systemServices: SystemServicesModule
  airReferences: AirReferenceModule
  airImport: AirImportModule
  airExport: AirExportModule
  airServices: AirServiceModule
  airlines: AirlineModule
  airports: AirportModule
  handlers: HandlerModule
  warehouses: WarehouseModule
  exchangeRates: ExchangeRateModule
  refunds: RefundModule
  advancePayments: AdvancePaymentModule
  supplierInvoices: SupplierInvoicesModule
  supplierReqPayments: SupplierReqPaymentsModule
  freeFormatInvoices: FreeFormatInvoicesModule
  maritimeDemurrages: MaritimeDemurragesModule
  maritimeDetentions: MaritimeDetentionsModule
  departments: DepartmentsModule
  mailNotifications: MailNotificationsModule
  mailNotificationGroups: MailNotificationGroupsModule
  servicePrints: ServicePrintsModule
  serviceChargeLogs: ServiceChargeLogsModule
  seaTrackings: SeaTrackingModule
  trackingEvents: TrackingEventModule
  containerDelayRates: ContainerDelayRatesModule
}

export function useApiFactory() {

  const client = useSanctumClient();

  const modules: IApiInstance = {
    audit: new AuditModule(client),
    dashboard: new DashboardModule(client),
    reports: new ReportsModule(client), // Assuming reports is part of the dashboard module
    auth: new AuthModule(client),
    users: new UsersModule(client),
    shippers: new ShippersModule(client),
    seaTraffics: new SeaTrafficsModule(client),
    seaRegions: new SeaRegionsModule(client),
    customAgents: new CustomAgentsModule(client),
    consignees: new ConsigneesModule(client),
    customerBanks: new CustomerBanksModule(client),
    vessels: new VesselsModule(client),
    voyages: new VoyagesModule(client),
    executives: new ExecutivesModule(client),
    freightForwarders: new FreightForwardersModule(client),
    ports: new PortsModule(client),
    countries: new CountriesModule(client),
    containers: new ContainersModule(client),
    lines: new LinesModule(client),
    banks: new BanksModule(client),
    referencias: new ReferenciasModule(client),
    referenciasExport: new ReferenciasExportModule(client),
    currencies: new CurrenciesModule(client),
    notificationsTypes: new NotificationsModule(client),
    bankAccountsTypes: new BankAccountsTypesModule(client),
    executivesGroups: new ExecutiveGroupsModule(client),
    freightForwardersGroups: new FreightForwardersGroupModule(client),
    consigneeGroups: new ConsigneesGroupsModule(client),
    charges: new ChargesModule(client),
    transportationModes: new TransportationModesModule(client),
    servicesContracts: new ServicesContractModule(client),
    testServices: new TestServicesModule(client),
    consigneeMbls: new ConsigneeMblsModule(client),
    aws: new AwsModule(client),
    tmInvoices: new TmInvoicesModule(client),
    wmInvoices: new WmInvoicesModule(client),
    tmAirInvoices: new TmAirInvoicesModule(client),
    wmAirInvoices: new WmAirInvoicesModule(client),
    invoices: new InvoicesModule(client),
    embalajes: new EmbalajeModule(client),
    destinations: new DestinationModule(client),
    authRequests: new AuthRequestsModule(client),
    authProcessRequests: new AuthProcessRequestsModule(client),
    requestAssistances: new RequestAssistancesModule(client),
    systemAccounts: new SystemAccountsModule(client),
    bankMovements: new BankMovementsModule(client),
    servicePayments: new servicePaymentsModule(client),
    demurrages: new DemurragesModule(client),
    linePayments: new LinePaymentsModule(client),
    lineCreditNotes: new LineCreditNotesModule(client),
    suppliers: new SuppliersModule(client),
    supplierTypes: new SupplierTypesModule(client),
    supplierBanks: new SupplierBanksModule(client),
    consigneeCreditNotes: new ConsigneeCreditNotesModule(client),
    ffNotes: new FfNotesModule(client),
    supportTi: new SupportTiModule(client),
    systemServices: new SystemServicesModule(client),
    airImport: new AirImportModule(client),
    airExport: new AirExportModule(client),
    airServices: new AirServiceModule(client),
    airReferences: new AirReferenceModule(client),
    airlines: new AirlineModule(client),
    airports: new AirportModule(client),
    handlers: new HandlerModule(client),
    warehouses: new WarehouseModule(client),
    exchangeRates: new ExchangeRateModule(client),
    refunds: new RefundModule(client),
    advancePayments: new AdvancePaymentModule(client),
    freightBanks: new FreightBanksModule(client),
    supplierInvoices: new SupplierInvoicesModule(client),
    supplierReqPayments: new SupplierReqPaymentsModule(client),
    freeFormatInvoices: new FreeFormatInvoicesModule(client),
    maritimeDemurrages: new MaritimeDemurragesModule(client),
    maritimeDetentions: new MaritimeDetentionsModule(client),
    departments: new DepartmentsModule(client),
    mailNotifications: new MailNotificationsModule(client),
    mailNotificationGroups: new MailNotificationGroupsModule(client),
    servicePrints: new ServicePrintsModule(client),
    serviceChargeLogs: new ServiceChargeLogsModule(client),
    seaTrackings: new SeaTrackingModule(client),
    trackingEvents: new TrackingEventModule(client),
    containerDelayRates: new ContainerDelayRatesModule(client),
  }

  return modules
}
