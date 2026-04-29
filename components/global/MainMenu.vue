<template>
  <div class="d-flex h-100 flex-column">
    <v-list v-model:opened="opened" density="compact" slim nav color="primary" class="flex-1 px-2 py-3 custom-scrollbar">
      <v-list-item
        v-if="canAccess(menuPermissions.Home)"
        prepend-icon="mdi-home-outline"
        title="Home"
        to="/"
        rounded="xl"
        exact
        class="mb-1"
      ></v-list-item>

      <v-list-group
        v-if="canAccess(menuPermissions.Authorizations) && hasAnyPermission(authorizationsPermissions)"
        value="authorizations"
      >
        <template v-slot:activator="{ props }">
          <v-list-item
            v-bind="props"
            prepend-icon="mdi-shield-lock-outline"
            :append-icon="getChevronIcon('authorizations')"
            title="Authorizations"
            rounded="xl"
            class="mb-1"
            :active="route.path.startsWith('/auth-requests') || route.path.startsWith('/auth-process-requests') || route.path.startsWith('/request-assistance')"
          ></v-list-item>
        </template>

        <v-list-item
          v-if="canAccess(menuPermissions.AuthorizationsRequests)"
          prepend-icon="mdi-shield-check-outline"
          title="Authorization requests"
          to="/auth-requests"
          rounded="xl"
          class="mb-1"
        ></v-list-item>
        <v-list-item
          v-if="canAccess(menuPermissions.AuthorizationsProcessRequests)"
          prepend-icon="mdi-shield-key-outline"
          title="Process requests"
          to="/auth-process-requests"
          rounded="xl"
          class="mb-1"
        ></v-list-item>
        <v-list-item
          v-if="canAccess(menuPermissions.AuthorizationsRequestAssistance)"
          prepend-icon="mdi-handshake-outline"
          title="Request assistance"
          to="/request-assistance"
          rounded="xl"
          class="mb-1"
        ></v-list-item>
      </v-list-group>

      <v-list-group
        v-if="canAccess(menuPermissions.BankingTransactions) && canAccess(menuPermissions.BankingTransactionsTransfers)"
        value="banking-transactions"
      >
        <template v-slot:activator="{ props }">
          <v-list-item
            v-bind="props"
            prepend-icon="mdi-piggy-bank-outline"
            :append-icon="getChevronIcon('banking-transactions')"
            title="Banking transactions"
            rounded="xl"
            class="mb-1"
            :active="route.path.startsWith('/transfers')"
          ></v-list-item>
        </template>

        <v-list-item
          v-if="canAccess(menuPermissions.BankingTransactionsTransfers)"
          prepend-icon="mdi-swap-horizontal"
          title="Transfers"
          to="/transfers/global"
          rounded="xl"
          class="mb-1"
        ></v-list-item>
      </v-list-group>

      <v-list-group
        v-if="canAccess(menuPermissions.Payments) && hasAnyPermission(paymentsPermissions)"
        value="payments"
      >
        <template v-slot:activator="{ props }">
          <v-list-item
            v-bind="props"
            prepend-icon="mdi-bank-transfer"
            :append-icon="getChevronIcon('payments')"
            title="Payments"
            rounded="xl"
            class="mb-1"
            :active="route.path.startsWith('/payments') || route.path.startsWith('/refunds') || route.path.startsWith('/invoices/suppliers/cfdis/request-payment')"
          ></v-list-item>
        </template>

        <v-list-item v-if="false" title="Payments" to="/payments"></v-list-item>
        <v-list-item v-if="false" title="Credit notes" to="/credit-notes"></v-list-item>

        <v-list-group
          v-if="canAccess(menuPermissions.PaymentsFfAgents) && hasAnyPermission(paymentsFfAgentsPermissions)"
          value="payments-ffagents"
          subgroup
        >
          <template v-slot:activator="{ props }">
            <v-list-item
              v-bind="props"
              prepend-icon="mdi-file-document-outline"
              :append-icon="getChevronIcon('payments-ffagents')"
              title="F.F. Agents D/C notes"
              rounded="xl"
              class="mb-1"
              :active="route.path.startsWith('/payments/agents')"
            ></v-list-item>
          </template>

          <v-list-item
            v-if="canAccess(menuPermissions.PaymentsFfAgentsSoa)"
            prepend-icon="mdi-text-box-search-outline"
            title="SOA"
            to="/payments/agents/soa"
            rounded="xl"
            class="mb-1"
          ></v-list-item>
          <v-list-item
            v-if="canAccess(menuPermissions.PaymentsFfAgentsPending)"
            prepend-icon="mdi-clock-outline"
            title="Pending payments"
            :to="{ path: '/payments/agents/payments', query: { status: 'pending' } }"
            rounded="xl"
            class="mb-1"
            :active="route.path === '/payments/agents/payments' && route.query.status === 'pending'"
          ></v-list-item>
          <v-list-item
            v-if="canAccess(menuPermissions.PaymentsFfAgentsPaid)"
            prepend-icon="mdi-check-circle-outline"
            title="Paid"
            :to="{ path: '/payments/agents/payments', query: { status: 'paid' } }"
            rounded="xl"
            class="mb-1"
            :active="route.path === '/payments/agents/payments' && route.query.status === 'paid'"
          ></v-list-item>
          <v-list-item
            v-if="canAccess(menuPermissions.PaymentsFfAgentsReports)"
            prepend-icon="mdi-chart-box-outline"
            title="Reports"
            to="/payments/agents/reports"
            rounded="xl"
            class="mb-1"
          ></v-list-item>
        </v-list-group>

        <v-list-group
          v-if="canAccess(menuPermissions.PaymentsFreightLines) && canAccess(menuPermissions.PaymentsFreightLinesSchedules)"
          value="payments-freight-lines"
          subgroup
        >
          <template v-slot:activator="{ props }">
            <v-list-item
              v-bind="props"
              prepend-icon="mdi-ferry"
              :append-icon="getChevronIcon('payments-freight-lines')"
              title="Freight lines"
              rounded="xl"
              class="mb-1"
              :active="route.path.startsWith('/payments/lines')"
            ></v-list-item>
          </template>

          <v-list-item
            v-if="canAccess(menuPermissions.PaymentsFreightLinesSchedules)"
            prepend-icon="mdi-calendar-clock-outline"
            title="Schedule payments"
            to="/payments/lines/schedules"
            rounded="xl"
            class="mb-1"
          ></v-list-item>
          <v-list-item v-if="false" title="Payments" to="/payments/lines"></v-list-item>
        </v-list-group>

        <v-list-item
          v-if="canAccess(menuPermissions.PaymentsSuppliers)"
          prepend-icon="mdi-truck-delivery-outline"
          title="Suppliers"
          to="/invoices/suppliers/cfdis/request-payment"
          rounded="xl"
          class="mb-1"
        ></v-list-item>
        <v-list-item
          v-if="canAccess(menuPermissions.PaymentsRefunds)"
          prepend-icon="mdi-cash-refund"
          title="Refunds"
          to="/refunds"
          rounded="xl"
          class="mb-1"
        ></v-list-item>
      </v-list-group>

      <v-list-group v-if="canAccess(menuPermissions.Invoices) && hasAnyPermission(invoicesPermissions)" value="invoices">
        <template v-slot:activator="{ props }">
          <v-list-item
            v-bind="props"
            prepend-icon="mdi-receipt-text-outline"
            :append-icon="getChevronIcon('invoices')"
            title="Invoices"
            rounded="xl"
            class="mb-1"
            :active="route.path.startsWith('/invoices') || route.path.startsWith('/adminpack')"
          ></v-list-item>
        </template>

        <v-list-group
          v-if="canAccess(menuPermissions.InvoicesCustomers) && hasAnyPermission(invoicesCustomersPermissions)"
          value="invoices-customers"
          subgroup
        >
          <template v-slot:activator="{ props }">
            <v-list-item
              v-bind="props"
              prepend-icon="mdi-account-outline"
              :append-icon="getChevronIcon('invoices-customers')"
              title="Customers"
              rounded="xl"
              class="mb-1"
              :active="route.path.startsWith('/invoices/search')"
            ></v-list-item>
          </template>
          <v-list-item
            v-if="canAccess(menuPermissions.InvoicesCustomersTm)"
            prepend-icon="mdi-file-document-multiple-outline"
            title="TM invoices"
            to="/invoices/search/tm"
            rounded="xl"
            class="mb-1"
          ></v-list-item>
          <v-list-item
            v-if="canAccess(menuPermissions.InvoicesCustomersWm)"
            prepend-icon="mdi-file-document-multiple-outline"
            title="WM invoices"
            to="/invoices/search/wm"
            rounded="xl"
            class="mb-1"
          ></v-list-item>
          <v-list-item
            v-if="canAccess(menuPermissions.InvoicesCustomersCreditNotes)"
            prepend-icon="mdi-note-text-outline"
            title="Credit notes"
            to="/invoices/search/credit-notes"
            rounded="xl"
            class="mb-1"
          ></v-list-item>
          <v-list-item
            v-if="canAccess(menuPermissions.InvoicesCustomersFreeFormat)"
            prepend-icon="mdi-text-box-edit-outline"
            title="Free format"
            to="/invoices/search/free-format"
            rounded="xl"
            class="mb-1"
          ></v-list-item>
          <v-list-item
            v-if="canAccess(menuPermissions.InvoicesCustomersSeaImport)"
            prepend-icon="mdi-ferry"
            title="Sea import references"
            to="/invoices/search/sea-import"
            rounded="xl"
            class="mb-1"
          ></v-list-item>
          <v-list-item
            v-if="canAccess(menuPermissions.InvoicesCustomersSeaExport)"
            prepend-icon="mdi-ferry"
            title="Sea export references"
            to="/invoices/search/sea-export"
            rounded="xl"
            class="mb-1"
          ></v-list-item>
          <v-list-item
            v-if="canAccess(menuPermissions.InvoicesCustomersAirImport)"
            prepend-icon="mdi-airplane"
            title="Air import references"
            to="/invoices/search/air-import"
            rounded="xl"
            class="mb-1"
          ></v-list-item>
          <v-list-item
            v-if="canAccess(menuPermissions.InvoicesCustomersAirExport)"
            prepend-icon="mdi-airplane"
            title="Air export references"
            to="/invoices/search/air-export"
            rounded="xl"
            class="mb-1"
          ></v-list-item>
        </v-list-group>

        <v-list-group
          v-if="canAccess(menuPermissions.InvoicesFreightLines) && hasAnyPermission(invoicesFreightLinesPermissions)"
          value="invoices-freight-lines"
          subgroup
        >
          <template v-slot:activator="{ props }">
            <v-list-item
              v-bind="props"
              prepend-icon="mdi-briefcase-outline"
              :append-icon="getChevronIcon('invoices-freight-lines')"
              title="Freight lines"
              rounded="xl"
              class="mb-1"
              :active="route.path.startsWith('/invoices/lines')"
            ></v-list-item>
          </template>

          <v-list-item
            v-if="canAccess(menuPermissions.InvoicesFreightLinesNotes)"
            prepend-icon="mdi-receipt-text"
            title="Freight line invoices"
            to="/invoices/lines/notes"
            rounded="xl"
            class="mb-1"
          ></v-list-item>
          <v-list-item
            v-if="canAccess(menuPermissions.InvoicesFreightLinesDemurrageDetentions)"
            prepend-icon="mdi-timer-sand"
            title="Demurrages & detentions"
            to="/invoices/lines/demurrage-detentions"
            rounded="xl"
            class="mb-1"
          ></v-list-item>
          <v-list-item
            v-if="canAccess(menuPermissions.InvoicesFreightLinesCreditNotes)"
            prepend-icon="mdi-note-edit-outline"
            title="Credit notes"
            to="/invoices/lines/credit-notes"
            rounded="xl"
            class="mb-1"
          ></v-list-item>
        </v-list-group>

        <v-list-item
          v-if="canAccess(menuPermissions.InvoicesFfAgents)"
          prepend-icon="mdi-briefcase-account-outline"
          title="F.F. Agents"
          to="/invoices/ffagents/notes"
          rounded="xl"
          class="mb-1"
        ></v-list-item>
        <v-list-group
          v-if="canAccess(menuPermissions.InvoicesSuppliers) && hasAnyPermission(invoicesSuppliersPermissions)"
          value="invoices-suppliers"
          subgroup
        >
          <template v-slot:activator="{ props }">
            <v-list-item
              v-bind="props"
              prepend-icon="mdi-truck-delivery-outline"
              :append-icon="getChevronIcon('invoices-suppliers')"
              title="Suppliers"
              rounded="xl"
              class="mb-1"
              :active="route.path.startsWith('/invoices/suppliers') || route.path.startsWith('/advance-payments')"
            ></v-list-item>
          </template>

          <v-list-item
            v-if="canAccess(menuPermissions.InvoicesSuppliersCfdis)"
            prepend-icon="mdi-file-document-outline"
            title="CFDIs (Factra)"
            to="/invoices/suppliers/cfdis"
            rounded="xl"
            class="mb-1"
          ></v-list-item>
          <v-list-item
            v-if="canAccess(menuPermissions.InvoicesSuppliersNewPayment)"
            prepend-icon="mdi-plus-circle-outline"
            title="Request a new payment"
            to="/invoices/suppliers/cfdis/request-payment/new"
            rounded="xl"
            class="mb-1"
          ></v-list-item>
          <v-list-item
            v-if="canAccess(menuPermissions.InvoicesSuppliersRequestPayments)"
            prepend-icon="mdi-eye-outline"
            title="View request payments"
            to="/invoices/suppliers/cfdis/request-payment"
            rounded="xl"
            class="mb-1"
          ></v-list-item>
          <v-list-item
            v-if="canAccess(menuPermissions.InvoicesSuppliersAdvancePayments)"
            prepend-icon="mdi-cash-multiple"
            title="Advance payments"
            to="/advance-payments"
            rounded="xl"
            class="mb-1"
          ></v-list-item>
        </v-list-group>
        <v-list-group
          v-if="canAccess(menuPermissions.InvoicesAdminPack) && hasAnyPermission(invoicesAdminPackPermissions)"
          value="invoices-adminpack"
          subgroup
        >
          <template v-slot:activator="{ props }">
            <v-list-item
              v-bind="props"
              prepend-icon="mdi-package-variant-closed"
              :append-icon="getChevronIcon('invoices-adminpack')"
              title="AdminPack"
              rounded="xl"
              class="mb-1"
              :active="route.path.startsWith('/adminpack')"
            ></v-list-item>
          </template>

          <v-list-item
            v-if="canAccess(menuPermissions.InvoicesAdminPackExport)"
            prepend-icon="mdi-export"
            title="Export TM Invoices"
            to="/adminpack/export-invoices"
            rounded="xl"
            class="mb-1"
          ></v-list-item>
          <v-list-item
            v-if="canAccess(menuPermissions.InvoicesAdminPackUpload)"
            prepend-icon="mdi-upload"
            title="Upload Zip File with CFDIs"
            to="/adminpack/upload-invoices-tm"
            rounded="xl"
            class="mb-1"
          ></v-list-item>
          <v-list-item
            v-if="canAccess(menuPermissions.InvoicesAdminPackHistory)"
            prepend-icon="mdi-history"
            title="Zip files uploaded history"
            to="/adminpack/zip-file-jobs"
            rounded="xl"
            class="mb-1"
          ></v-list-item>
        </v-list-group>
      </v-list-group>

      <v-list-group
        v-if="canAccess(menuPermissions.Maritime) && hasAnyPermission(maritimePermissions)"
        value="maritime"
      >
        <template v-slot:activator="{ props }">
          <v-list-item
            v-bind="props"
            prepend-icon="mdi-ferry"
            :append-icon="getChevronIcon('maritime')"
            title="Maritime"
            rounded="xl"
            class="mb-1"
            :active="route.path.startsWith('/maritime')"
          ></v-list-item>
        </template>

        <v-list-item
          v-if="canAccess(menuPermissions.MaritimeImport)"
          prepend-icon="mdi-tray-arrow-down"
          title="Import"
          to="/maritime/import"
          rounded="xl"
          class="mb-1"
        ></v-list-item>
        <v-list-item
          v-if="canAccess(menuPermissions.MaritimeExport)"
          prepend-icon="mdi-tray-arrow-up"
          title="Export"
          to="/maritime/export"
          rounded="xl"
          class="mb-1"
        ></v-list-item>
      </v-list-group>

      <v-list-group v-if="canAccess(menuPermissions.Air) && hasAnyPermission(airPermissions)" value="air">
        <template v-slot:activator="{ props }">
          <v-list-item
            v-bind="props"
            prepend-icon="mdi-airplane"
            :append-icon="getChevronIcon('air')"
            title="Air"
            rounded="xl"
            class="mb-1"
            :active="route.path.startsWith('/air')"
          ></v-list-item>
        </template>

        <v-list-item
          v-if="canAccess(menuPermissions.AirImport)"
          prepend-icon="mdi-tray-arrow-down"
          title="Import"
          to="/air/import"
          rounded="xl"
          class="mb-1"
        ></v-list-item>
        <v-list-item
          v-if="canAccess(menuPermissions.AirExport)"
          prepend-icon="mdi-tray-arrow-up"
          title="Export"
          to="/air/export"
          rounded="xl"
          class="mb-1"
        ></v-list-item>
      </v-list-group>

      <v-list-group
        v-if="canAccess(menuPermissions.MaritimeImportDemurrages) && hasAnyPermission(maritimeImportDemurragesPermissions)"
        value="demurrages"
      >
        <template v-slot:activator="{ props }">
          <v-list-item
            v-bind="props"
            prepend-icon="mdi-timer-alert-outline"
            :append-icon="getChevronIcon('demurrages')"
            title="Demurrages & Detentions"
            rounded="xl"
            class="mb-1"
            :active="route.path.startsWith('/maritime/import/demurrages') || route.path.startsWith('/invoices/lines/demurrage-detentions') || route.path.startsWith('/invoices/suppliers/cfdis/create')"
          ></v-list-item>
        </template>

        <v-list-item
          v-if="canAccess(menuPermissions.MaritimeImportDemurragesSearch)"
          prepend-icon="mdi-magnify"
          title="Search Import References"
          to="/maritime/import/demurrages/search"
          rounded="xl"
          class="mb-1"
        ></v-list-item>

        <v-list-item
          v-if="canAccess(menuPermissions.MaritimeImportDemurragesPayments)"
          prepend-icon="mdi-cash-clock"
          title="Demurrage & Detentions Request Payments"
          to="/invoices/lines/demurrage-detentions"
          rounded="xl"
          class="mb-1"
        ></v-list-item>

        <v-list-item
          v-if="canAccess(menuPermissions.MaritimeImportDemurragesSupplierCfdi)"
          prepend-icon="mdi-plus"
          title="Add New Supplier CFDI"
          to="/invoices/suppliers/cfdis/create"
          rounded="xl"
          class="mb-1"
        ></v-list-item>

        <v-list-item
          v-if="canAccess(menuPermissions.MaritimeImportDemurragesReports)"
          prepend-icon="mdi-chart-bell-curve"
          title="Demurrage Reports"
          to="/maritime/import/demurrages/reports"
          rounded="xl"
          class="mb-1"
        ></v-list-item>
      </v-list-group>

      <v-list-group v-if="false" value="Relocation">
        <template v-slot:activator="{ props }">
          <v-list-item v-bind="props" prepend-icon="mdi-truck-cargo-container" title="Relocation"></v-list-item>
        </template>
      </v-list-group>

      <v-list-group
        v-if="canAccess(menuPermissions.Quotes) || canAccess(menuPermissions.Pricing)"
        value="pricing"
      >
        <template v-slot:activator="{ props }">
          <v-list-item
            v-bind="props"
            prepend-icon="mdi-cash-multiple"
            title="Pricing & Commercial"
            rounded="xl"
            class="mb-1"
            :active="route.path.startsWith('/quotes') || route.path.startsWith('/pricing')"
          ></v-list-item>
        </template>
        
        <v-list-item
          v-if="canAccess(menuPermissions.Quotes)"
          prepend-icon="mdi-file-document-edit-outline"
          title="Quotations"
          to="/quotes"
          rounded="xl"
          class="mb-1"
        ></v-list-item>
        
        <v-list-item
          v-if="canAccess(menuPermissions.Pricing)"
          prepend-icon="mdi-routes"
          title="Tariffs / Routes"
          to="/pricing"
          rounded="xl"
          class="mb-1"
        ></v-list-item>
      </v-list-group>

      <v-list-item
        v-if="canAccess(menuPermissions.Tracking)"
        prepend-icon="mdi-radar"
        title="Tracking"
        to="/tracking"
        rounded="xl"
        class="mb-1"
      ></v-list-item>
      <v-list-item
        v-if="canAccess(menuPermissions.Reports)"
        prepend-icon="mdi-finance"
        title="Reports"
        to="/reports"
        rounded="xl"
        class="mb-1"
      ></v-list-item>

      <v-divider class="my-3 border border-[#aaa]!"></v-divider>

      <v-list-group
        v-if="canAccess(menuPermissions.Configuration) && hasAnyPermission(configurationPermissions)"
        value="configuration"
      >
        <template v-slot:activator="{ props }">
          <v-list-item
            v-bind="props"
            prepend-icon="mdi-puzzle-edit-outline"
            :append-icon="getChevronIcon('configuration')"
            title="Configuration"
            rounded="xl"
            class="mb-1"
            :active="route.path.startsWith('/configuration')"
          ></v-list-item>
        </template>

        <v-list-item v-if="canAccess(menuPermissions.ConfigurationAirlines)" title="Airlines" to="/configuration/airlines" rounded="xl" class="mb-1"></v-list-item>
        <v-list-item v-if="canAccess(menuPermissions.ConfigurationAirports)" title="Airports" to="/configuration/airports" rounded="xl" class="mb-1"></v-list-item>
        <v-list-item v-if="canAccess(menuPermissions.ConfigurationBanks)" title="Banks" to="/configuration/banks" rounded="xl" class="mb-1"></v-list-item>
        <!-- <v-list-item title="Bank acount types" to="/configuration/banks-accounts-types"></v-list-item> -->
        <v-list-item v-if="canAccess(menuPermissions.ConfigurationBeneficiaries)" title="Beneficiaries" to="/configuration/beneficiaries" rounded="xl" class="mb-1"></v-list-item>
        <v-list-item v-if="canAccess(menuPermissions.ConfigurationCharges)" title="Charges" to="/configuration/charges" rounded="xl" class="mb-1"></v-list-item>
        <v-list-item v-if="canAccess(menuPermissions.ConfigurationConsigneesMbl)" title="Consignees MBL" to="/configuration/consignees-mbl" rounded="xl" class="mb-1"></v-list-item>
        <v-list-item v-if="canAccess(menuPermissions.ConfigurationContainers)" title="Containers" to="/configuration/containers" rounded="xl" class="mb-1"></v-list-item>
        <v-list-item v-if="canAccess(menuPermissions.ConfigurationContainerDelayRates)" title="Container DnD Rates" to="/configuration/container-delay-rates" rounded="xl" class="mb-1"></v-list-item>
        <v-list-item v-if="canAccess(menuPermissions.ConfigurationCountries)" title="Countries" to="/configuration/countries" rounded="xl" class="mb-1"></v-list-item>
        <v-list-item v-if="canAccess(menuPermissions.ConfigurationCustomers)" title="Customers" to="/configuration/customers" rounded="xl" class="mb-1"></v-list-item>
        <v-list-item v-if="canAccess(menuPermissions.ConfigurationCurrencies)" title="Currencies" to="/configuration/currencies" rounded="xl" class="mb-1"></v-list-item>
        <v-list-item v-if="canAccess(menuPermissions.ConfigurationCustomAgents)" title="Customs agents" to="/configuration/custom-agents" rounded="xl" class="mb-1"></v-list-item>
        <v-list-item v-if="canAccess(menuPermissions.ConfigurationEmbalajes)" title="Embalajes" to="/configuration/embalajes" rounded="xl" class="mb-1"></v-list-item>
        <v-list-item v-if="canAccess(menuPermissions.ConfigurationExchangeRate)" title="Exchange rate" to="/configuration/exchange-rate" rounded="xl" class="mb-1"></v-list-item>
        <v-list-item v-if="canAccess(menuPermissions.ConfigurationExecutives)" title="Executives" to="/configuration/executives" rounded="xl" class="mb-1"></v-list-item>
        <v-list-item v-if="canAccess(menuPermissions.ConfigurationFreightForwarders)" title="Freight Forwarders" to="/configuration/freight-forwarders" rounded="xl" class="mb-1"></v-list-item>
        <v-list-item v-if="canAccess(menuPermissions.ConfigurationHandlers)" title="Handlers" to="/configuration/handlers" rounded="xl" class="mb-1"></v-list-item>
        <v-list-item v-if="canAccess(menuPermissions.ConfigurationLines)" title="Lines" to="/configuration/lines" rounded="xl" class="mb-1"></v-list-item>
        <v-list-item v-if="canAccess(menuPermissions.ConfigurationLocations)" title="Locations" to="/configuration/destinations" rounded="xl" class="mb-1"></v-list-item>
        <!-- <v-list-item title="National destinations" to="/configuration/national-destinations"></v-list-item> -->
        <v-list-item v-if="canAccess(menuPermissions.ConfigurationPorts)" title="Ports" to="/configuration/ports" rounded="xl" class="mb-1"></v-list-item>
        <v-list-item v-if="canAccess(menuPermissions.ConfigurationServicesContracts)" title="Services contracts" to="/configuration/services-contracts" rounded="xl" class="mb-1"></v-list-item>
        <v-list-item v-if="canAccess(menuPermissions.ConfigurationSeaRegions)" title="Sea regions" to="/configuration/sea-regions" rounded="xl" class="mb-1"></v-list-item>
        <v-list-item v-if="canAccess(menuPermissions.ConfigurationShippers)" title="Shippers (POL) / Consignees (POD)" to="/configuration/shippers" rounded="xl" class="mb-1"></v-list-item>
        <v-list-item v-if="canAccess(menuPermissions.ConfigurationSuppliers)" title="Suppliers" to="/configuration/suppliers" rounded="xl" class="mb-1"></v-list-item>
        <v-list-item v-if="canAccess(menuPermissions.ConfigurationTrackingEvents)" title="Tracking events" to="/configuration/tracking-events" rounded="xl" class="mb-1"></v-list-item>
        <v-list-item v-if="canAccess(menuPermissions.ConfigurationTransportationModes)" title="Transportation modes" to="/configuration/transportation-modes" rounded="xl" class="mb-1"></v-list-item>
        <v-list-item v-if="canAccess(menuPermissions.ConfigurationVessels)" title="Vessels" to="/configuration/vessels" rounded="xl" class="mb-1"></v-list-item>
        <v-list-item v-if="canAccess(menuPermissions.ConfigurationVoyages)" title="Voyages" to="/configuration/voyages" rounded="xl" class="mb-1"></v-list-item>
        <v-list-item v-if="canAccess(menuPermissions.ConfigurationWarehouses)" title="Warehouses" to="/configuration/warehouses" rounded="xl" class="mb-1"></v-list-item>
      </v-list-group>

      <v-list-group v-if="canAccess(menuPermissions.System) && hasAnyPermission(systemPermissions)" value="system">
        <template v-slot:activator="{ props }">
          <v-list-item
            v-bind="props"
            prepend-icon="mdi-security"
            :append-icon="getChevronIcon('system')"
            title="System"
            rounded="xl"
            class="mb-1"
            :active="route.path.startsWith('/system') || route.path.startsWith('/wiki')"
          ></v-list-item>
        </template>

        <v-list-item v-if="canAccess(menuPermissions.SystemUsers)" title="Users" prepend-icon="mdi-account-group" to="/system/users" rounded="xl" class="mb-1"></v-list-item>
        <v-list-item v-if="canAccess(menuPermissions.SystemRolesPermissions)" title="Roles and permissions" prepend-icon="mdi-shield-account-outline" to="/system/role-permissions" rounded="xl" class="mb-1"></v-list-item>
        <v-list-item v-if="canAccess(menuPermissions.SystemBankAccounts)" title="Bank accounts" prepend-icon="mdi-bank-outline" to="/system/bank-accounts" rounded="xl" class="mb-1"></v-list-item>
        <v-list-item v-if="canAccess(menuPermissions.SystemMailNotifications)" title="Mail notifications" prepend-icon="mdi-email-outline" to="/system/mail-notifications" rounded="xl" class="mb-1"></v-list-item>
        <v-list-item v-if="canAccess(menuPermissions.SystemMailNotificationGroups)" title="Mail notification groups" prepend-icon="mdi-email-multiple-outline" to="/system/mail-notification-groups" rounded="xl" class="mb-1"></v-list-item>
        <v-list-item v-if="canAccess(menuPermissions.SystemAlertTypes)" title="Alert types" prepend-icon="mdi-bell-cog" to="/system/alert-types" rounded="xl" class="mb-1"></v-list-item>
        <v-list-item v-if="canAccess(menuPermissions.SystemAuthRequestTypes)" title="Auth Request Types" prepend-icon="mdi-key-variant" to="/system/auth-request-types" rounded="xl" class="mb-1"></v-list-item>
        <v-list-item v-if="canAccess(menuPermissions.SystemSupportTickets)" title="Support tickets" prepend-icon="mdi-ticket-outline" to="/system/support-tickets" rounded="xl" class="mb-1"></v-list-item>
        <v-list-item v-if="canAccess(menuPermissions.SystemLogs)" title="System Logs" prepend-icon="mdi-console" to="/system/system-logs" rounded="xl" class="mb-1"></v-list-item>
        <v-list-item v-if="canAccess(menuPermissions.SystemAudit)" title="Audit" prepend-icon="mdi-history" to="/system/audit-log" rounded="xl" class="mb-1"></v-list-item>
        <v-list-item v-if="canAccess(menuPermissions.SystemWiki)" title="Wiki" prepend-icon="mdi-book-outline" to="/wiki" rounded="xl" class="mb-1"></v-list-item>
        <v-list-item v-if="canAccess(menuPermissions.SystemLogs)" title="Usage Statistics" prepend-icon="mdi-chart-line" to="/system/usage-statistics" rounded="xl" class="mb-1"></v-list-item>
      </v-list-group>
    </v-list>

    <div class="px-2 pb-3">
      <v-divider class="my-3 border border-[#aaa]!"></v-divider>
      <v-list density="compact" slim nav color="primary" class="px-0">
        <v-list-item
          v-if="canAccess(menuPermissions.Logout)"
          prepend-icon="mdi-logout"
          title="Logout"
          rounded="xl"
          @click="onClickLogout"
        ></v-list-item>
      </v-list>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import { menuPermissions } from '~/utils/data/system'

const { logout } = useSanctumAuth()
const { hasPermission, user } = useCheckUser()
const route = useRoute()
const opened = ref<string[]>([])

const hasMenuPermissionsSeeded = computed(() => {
  const directPermissions = user.value?.permissions?.some((permission: any) => permission.name.startsWith('menu-'))
  const rolePermissions = user.value?.roles?.some((role: any) =>
    role.permissions?.some((permission: any) => permission.name.startsWith('menu-'))
  )

  return !!directPermissions || !!rolePermissions
})

const authorizationsPermissions = [
  menuPermissions.AuthorizationsRequests,
  menuPermissions.AuthorizationsProcessRequests,
  menuPermissions.AuthorizationsRequestAssistance,
]

const paymentsFfAgentsPermissions = [
  menuPermissions.PaymentsFfAgentsSoa,
  menuPermissions.PaymentsFfAgentsPending,
  menuPermissions.PaymentsFfAgentsPaid,
  menuPermissions.PaymentsFfAgentsReports,
]

const paymentsPermissions = [
  menuPermissions.PaymentsFfAgents,
  ...paymentsFfAgentsPermissions,
  menuPermissions.PaymentsFreightLines,
  menuPermissions.PaymentsFreightLinesSchedules,
  menuPermissions.PaymentsSuppliers,
  menuPermissions.PaymentsRefunds,
]

const invoicesCustomersPermissions = [
  menuPermissions.InvoicesCustomersSeaImport,
  menuPermissions.InvoicesCustomersSeaExport,
  menuPermissions.InvoicesCustomersAirImport,
  menuPermissions.InvoicesCustomersAirExport,
  menuPermissions.InvoicesCustomersTm,
  menuPermissions.InvoicesCustomersWm,
  menuPermissions.InvoicesCustomersCreditNotes,
  menuPermissions.InvoicesCustomersFreeFormat,
]

const invoicesFreightLinesPermissions = [
  menuPermissions.InvoicesFreightLinesNotes,
  menuPermissions.InvoicesFreightLinesDemurrageDetentions,
  menuPermissions.InvoicesFreightLinesCreditNotes,
]

const invoicesSuppliersPermissions = [
  menuPermissions.InvoicesSuppliersCfdis,
  menuPermissions.InvoicesSuppliersNewPayment,
  menuPermissions.InvoicesSuppliersRequestPayments,
  menuPermissions.InvoicesSuppliersAdvancePayments,
]

const invoicesAdminPackPermissions = [
  menuPermissions.InvoicesAdminPackExport,
  menuPermissions.InvoicesAdminPackUpload,
  menuPermissions.InvoicesAdminPackHistory,
]

const invoicesPermissions = [
  menuPermissions.InvoicesCustomers,
  ...invoicesCustomersPermissions,
  menuPermissions.InvoicesFreightLines,
  ...invoicesFreightLinesPermissions,
  menuPermissions.InvoicesFfAgents,
  menuPermissions.InvoicesSuppliers,
  ...invoicesSuppliersPermissions,
  menuPermissions.InvoicesAdminPack,
  ...invoicesAdminPackPermissions,
]

const maritimePermissions = [menuPermissions.MaritimeImport, menuPermissions.MaritimeExport]

const maritimeImportDemurragesPermissions = [
  menuPermissions.MaritimeImportDemurragesSearch,
  menuPermissions.MaritimeImportDemurragesPayments,
  menuPermissions.MaritimeImportDemurragesSupplierCfdi,
  menuPermissions.MaritimeImportDemurragesReports,
]
const airPermissions = [menuPermissions.AirImport, menuPermissions.AirExport]

const configurationPermissions = [
  menuPermissions.ConfigurationAirlines,
  menuPermissions.ConfigurationAirports,
  menuPermissions.ConfigurationBanks,
  menuPermissions.ConfigurationBeneficiaries,
  menuPermissions.ConfigurationCharges,
  menuPermissions.ConfigurationConsigneesMbl,
  menuPermissions.ConfigurationContainers,
  menuPermissions.ConfigurationContainerDelayRates,
  menuPermissions.ConfigurationCountries,
  menuPermissions.ConfigurationCustomers,
  menuPermissions.ConfigurationCurrencies,
  menuPermissions.ConfigurationCustomAgents,
  menuPermissions.ConfigurationEmbalajes,
  menuPermissions.ConfigurationExchangeRate,
  menuPermissions.ConfigurationExecutives,
  menuPermissions.ConfigurationFreightForwarders,
  menuPermissions.ConfigurationHandlers,
  menuPermissions.ConfigurationLines,
  menuPermissions.ConfigurationLocations,
  menuPermissions.ConfigurationPorts,
  menuPermissions.ConfigurationServicesContracts,
  menuPermissions.ConfigurationSeaRegions,
  menuPermissions.ConfigurationShippers,
  menuPermissions.ConfigurationSuppliers,
  menuPermissions.ConfigurationTrackingEvents,
  menuPermissions.ConfigurationTransportationModes,
  menuPermissions.ConfigurationVessels,
  menuPermissions.ConfigurationVoyages,
  menuPermissions.ConfigurationWarehouses,
]

const systemPermissions = [
  menuPermissions.SystemUsers,
  menuPermissions.SystemRolesPermissions,
  menuPermissions.SystemBankAccounts,
  menuPermissions.SystemMailNotifications,
  menuPermissions.SystemMailNotificationGroups,
  menuPermissions.SystemAlertTypes,
  menuPermissions.SystemAuthRequestTypes,
  menuPermissions.SystemSupportTickets,
  menuPermissions.SystemLogs,
  menuPermissions.SystemAudit,
  menuPermissions.SystemWiki,
]

const canAccess = (permission: string) => {
  if (!hasMenuPermissionsSeeded.value) {
    return true
  }

  return hasPermission(permission)
}

const hasAnyPermission = (permissions: string[]) => {
  if (!hasMenuPermissionsSeeded.value) {
    return true
  }

  return permissions.some((permission) => hasPermission(permission))
}

const getChevronIcon = (groupValue: string) => {
  return opened.value.includes(groupValue) ? 'mdi-chevron-up' : 'mdi-chevron-down'
}

const getDefaultOpenedGroups = (path: string) => {
  const groups: string[] = []

  if (path.startsWith('/auth-requests') || path.startsWith('/auth-process-requests') || path.startsWith('/request-assistance')) {
    groups.push('authorizations')
  }

  if (path.startsWith('/transfers')) {
    groups.push('banking-transactions')
  }

  if (path.startsWith('/payments') || path.startsWith('/refunds') || path.startsWith('/invoices/suppliers/cfdis/request-payment')) {
    groups.push('payments')
  }

  if (path.startsWith('/payments/agents')) {
    groups.push('payments', 'payments-ffagents')
  }

  if (path.startsWith('/payments/lines')) {
    groups.push('payments', 'payments-freight-lines')
  }

  if (path.startsWith('/invoices') || path.startsWith('/adminpack')) {
    groups.push('invoices')
  }

  if (path.startsWith('/invoices/search')) {
    groups.push('invoices', 'invoices-customers')
  }

  if (path.startsWith('/invoices/lines')) {
    groups.push('invoices', 'invoices-freight-lines')
  }

  if (path.startsWith('/invoices/suppliers') || path.startsWith('/advance-payments')) {
    groups.push('invoices', 'invoices-suppliers')
  }

  if (path.startsWith('/adminpack')) {
    groups.push('invoices', 'invoices-adminpack')
  }

  if (path.startsWith('/maritime')) {
    groups.push('maritime')
  }

  if (path.startsWith('/quotes') || path.startsWith('/pricing')) {
    groups.push('pricing')
  }

  if (path.startsWith('/air')) {
    groups.push('air')
  }

  if (path.startsWith('/maritime/import/demurrages') || path.startsWith('/invoices/lines/demurrage-detentions') || path.startsWith('/invoices/suppliers/cfdis/create')) {
    groups.push('demurrages')
  }

  if (path.startsWith('/configuration')) {
    groups.push('configuration')
  }

  if (path.startsWith('/system') || path.startsWith('/wiki')) {
    groups.push('system')
  }

  return [...new Set(groups)]
}

watch(
  () => route.fullPath,
  () => {
    opened.value = getDefaultOpenedGroups(route.path)
  },
  { immediate: true }
)

async function onClickLogout() {
  await logout()
  return navigateTo('/system/auth/login', { replace: true })
}
</script>

<style scoped>
:deep(.custom-scrollbar) {
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
}

:deep(.custom-scrollbar)::-webkit-scrollbar {
  width: .5px !important;
}

:deep(.custom-scrollbar)::-webkit-scrollbar-track {
  background: transparent !important;
}

:deep(.custom-scrollbar)::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2) !important;
  border-radius: 2px !important;
}

:deep(.custom-scrollbar)::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3) !important;
}

:deep(.custom-scrollbar) {
  overflow-y: auto !important;
  overflow-x: hidden !important;
}

/* Firefox fallback */
:deep(.custom-scrollbar) * {
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
}
</style>
