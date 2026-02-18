<template>
  <v-list density="compact" slim nav color="primary">
    <v-list-item prepend-icon="mdi-home-outline" title="Home" to="/"></v-list-item>
    <v-list-item
      prepend-icon="mdi-shield-lock-outline"
      title="Authorizations"
      to="/auth-requests"
    ></v-list-item>
    <v-list-group value="Banking Transactions">
      <template v-slot:activator="{ props }">
        <v-list-item v-bind="props" prepend-icon="mdi-piggy-bank-outline" title="Banking Transactions"></v-list-item>
      </template>

      <v-list-item title="Transfers" to="/transfers/global"></v-list-item>
    </v-list-group>
    <v-list-group value="Payments">
      <template v-slot:activator="{ props }">
        <v-list-item v-bind="props" prepend-icon="mdi-bank-transfer" title="Payments"></v-list-item>
      </template>

      <v-list-item v-if="false" title="Payments" to="/payments"></v-list-item>
      <v-list-item v-if="false" title="Credit notes" to="/credit-notes"></v-list-item>

      <v-list-item title="F.F. Agents D/C notes" to="/payments/agents"></v-list-item>

      <v-list-group value="Freight lines">
        <template v-slot:activator="{ props }">
          <v-list-item v-bind="props" title="Freight lines"></v-list-item>
        </template>

        <v-list-item title="Schedule payments" to="/payments/lines/schedules"></v-list-item>
        <v-list-item v-if="false" title="Payments" to="/payments/lines"></v-list-item>
      </v-list-group>
      <v-list-item title="Suppliers" to="/invoices/suppliers/cfdis/request-payment"></v-list-item>
      <v-list-item title="Refunds" to="/refunds"></v-list-item>
    </v-list-group>

    <v-list-group value="Invoices">
      <template v-slot:activator="{ props }">
        <v-list-item v-bind="props" prepend-icon="mdi-receipt-text-outline" title="Invoices"></v-list-item>
      </template>

      <v-list-item title="Customers" prepend-icon="mdi-account-outline" to="/invoices/search"></v-list-item>
      <v-list-item title="Freight lines" prepend-icon="mdi-briefcase-outline" to="/invoices/lines"></v-list-item>
      <v-list-item title="F.F. Agents" prepend-icon="mdi-briefcase-outline" to="/invoices/ffagents"></v-list-item>
      <v-list-item title="Suppliers" prepend-icon="mdi-briefcase-outline" to="/invoices/suppliers"></v-list-item>
      <v-list-item title="AdminPack" prepend-icon="mdi-briefcase-outline" to="/adminpack"></v-list-item>
    </v-list-group>

    <v-list-group value="Maritime">
      <template v-slot:activator="{ props }">
        <v-list-item v-bind="props" prepend-icon="mdi-ferry" title="Maritime"></v-list-item>
      </template>

      <v-list-item title="Import" to="/maritime/import"></v-list-item>
      <v-list-item title="Export" to="/maritime/export"></v-list-item>
    </v-list-group>

    <v-list-group value="Air">
      <template v-slot:activator="{ props }">
        <v-list-item v-bind="props" prepend-icon="mdi-airplane" title="Air"></v-list-item>
      </template>

      <v-list-item title="Import" to="/air/import"></v-list-item>
      <v-list-item title="Export" to="/air/export"></v-list-item>
    </v-list-group>

    <v-list-group v-if="false" value="Relocation">
      <template v-slot:activator="{ props }">
        <v-list-item v-bind="props" prepend-icon="mdi-truck-cargo-container" title="Relocation"></v-list-item>
      </template>
    </v-list-group>

    <v-list-item prepend-icon="mdi-radar" title="Tracking" to="/tracking"></v-list-item>
    <v-list-item prepend-icon="mdi-finance" title="Reports" to="/reports"></v-list-item>

    <v-list-group value="Configuration">
      <template v-slot:activator="{ props }">
        <v-list-item v-bind="props" prepend-icon="mdi-puzzle-edit-outline" title="Configuration"></v-list-item>
      </template>

      <v-list-item title="Airlines" to="/configuration/airlines"></v-list-item>
      <v-list-item title="Airports" to="/configuration/airports"></v-list-item>
      <v-list-item title="Banks" to="/configuration/banks"></v-list-item>
      <!-- <v-list-item title="Bank acount types" to="/configuration/banks-accounts-types"></v-list-item> -->
      <v-list-item title="Charges" to="/configuration/charges"></v-list-item>

      <v-list-item title="Consignees MBL" to="/configuration/consignees-mbl"></v-list-item>
      <v-list-item title="Containers" to="/configuration/containers"></v-list-item>
      <v-list-item title="Container delay rates" to="/configuration/container-delay-rates"></v-list-item>
      <v-list-item title="Countries" to="/configuration/countries"></v-list-item>
      <v-list-item title="Customers" to="/configuration/customers"></v-list-item>
      <v-list-item title="Currencies" to="/configuration/currencies"></v-list-item>
      <v-list-item title="Customs agents" to="/configuration/custom-agents"></v-list-item>
      <v-list-item title="Embalajes" to="/configuration/embalajes"></v-list-item>
      <v-list-item title="Exchange rate" to="/configuration/exchange-rate"></v-list-item>
      <v-list-item title="Executives" to="/configuration/executives"></v-list-item>
      <v-list-item title="Freight Forwarders" to="/configuration/freight-forwarders"></v-list-item>
      <v-list-item title="Handlers" to="/configuration/handlers"></v-list-item>
      <v-list-item title="Lines" to="/configuration/lines"></v-list-item>
      <v-list-item title="Locations" to="/configuration/destinations"></v-list-item>
      <!-- <v-list-item title="National destinations" to="/configuration/national-destinations"></v-list-item> -->
      <v-list-item title="Ports" to="/configuration/ports"></v-list-item>
      <v-list-item title="Services contracts" to="/configuration/services-contracts"></v-list-item>
      <v-list-item title="Sea regions" to="/configuration/sea-regions"></v-list-item>
      <v-list-item title="Shippers (POL) / Consignees (POD)" to="/configuration/shippers"></v-list-item>
      <v-list-item title="Suppliers" to="/configuration/suppliers"></v-list-item>
      <v-list-item title="Tracking events" to="/configuration/tracking-events"></v-list-item>
      <v-list-item title="Transportation modes" to="/configuration/transportation-modes"></v-list-item>
      <v-list-item title="Vessels" to="/configuration/vessels"></v-list-item>
      <v-list-item title="Voyages" to="/configuration/voyages"></v-list-item>
      <v-list-item title="Warehouses" to="/configuration/warehouses"></v-list-item>
    </v-list-group>

    <v-divider class="my-4 border border-[#aaa]!"></v-divider>

    <v-list-group value="System">
      <template v-slot:activator="{ props }">
        <v-list-item v-bind="props" prepend-icon="mdi-security" title="System"></v-list-item>
      </template>

      <v-list-item title="Users" prepend-icon="mdi-account-group" to="/system/users"></v-list-item>
      <v-list-item
        title="Roles and permissions"
        prepend-icon="mdi-shield-account-outline"
        to="/system/role-permissions"
      ></v-list-item>
      <v-list-item title="Bank accounts" prepend-icon="mdi-bank-outline" to="/system/bank-accounts"></v-list-item>
      <v-list-item
        title="Mail notifications"
        prepend-icon="mdi-email-outline"
        to="/system/mail-notifications"
      ></v-list-item>
      <v-list-item
        title="Mail notification groups"
        prepend-icon="mdi-email-multiple-outline"
        to="/system/mail-notification-groups"
      ></v-list-item>
      <v-list-item title="Alert types" prepend-icon="mdi-bell-cog" to="/system/alert-types"></v-list-item>
      <v-list-item title="Support tickets" prepend-icon="mdi-ticket-outline" to="/system/support-tickets"></v-list-item>
      <v-list-item title="Audit" prepend-icon="mdi-history" to="/system/audit-log"></v-list-item>
      <v-list-item title="Wiki" prepend-icon="mdi-book-outline" to="/wiki"></v-list-item>
    </v-list-group>

    <v-divider class="my-4 border border-[#aaa]!"></v-divider>

    <v-list-item prepend-icon="mdi-logout" title="Logout" @click="onClickLogout"></v-list-item>
  </v-list>
</template>
<script setup lang="ts">
const { logout } = useSanctumAuth()

async function onClickLogout() {
  await logout()
  return navigateTo('/system/auth/login', { replace: true })
}
</script>
