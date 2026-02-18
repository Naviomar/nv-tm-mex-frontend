<template>
  <div class="w-full">
    <nav
      class="flex items-center justify-center gap-0 rounded-lg bg-sky-200 dark:bg-sky-900/60 border border-zinc-200 dark:border-zinc-700 h-14 mb-4"
    >
      <button
        v-for="t in tabs"
        :key="t.value"
        type="button"
        :aria-selected="tab === t.value"
        :class="[
          'flex items-center justify-center gap-2 px-6 h-full font-medium rounded-md border-b-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2',
          tab === t.value
            ? 'bg-white dark:bg-zinc-900 text-sky-700 dark:text-sky-300 border-sky-500 dark:border-sky-400 -mb-px'
            : 'text-zinc-600 dark:text-zinc-400 border-transparent hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-sky-100/80 dark:hover:bg-sky-900/40'
        ]"
        @click="tab = t.value"
      >
        <span :class="t.icon" class="mdi text-lg shrink-0" aria-hidden="true" />
        {{ t.label }}
      </button>
    </nav>

    <ClientOnly>
      <SeaDashboard v-if="tab === 'sea-tab'" />
      <AirDashboard v-else-if="tab === 'air-tab'" />
      <BillingDashboard v-else-if="tab === 'billing-tab'" />
      <template #fallback>
        <div class="min-h-[200px] rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center text-zinc-500 text-sm">Cargando…</div>
      </template>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
const tab = ref<string>('sea-tab')

const tabs = [
  { value: 'sea-tab', label: 'Maritime', icon: 'mdi-ferry' },
  { value: 'air-tab', label: 'Air', icon: 'mdi-airplane' },
  { value: 'billing-tab', label: 'Billing', icon: 'mdi-invoice-list-outline' },
  ...(false ? [{ value: 'suppliers-tab', label: 'Suppliers', icon: 'mdi-account-details-outline' }] : []),
  ...(false ? [{ value: 'freight-line-tab', label: 'Freight lines', icon: 'mdi-account-details-outline' }] : []),
  ...(false ? [{ value: 'ff-agents-tab', label: 'F.F. Agents', icon: 'mdi-account-details-outline' }] : []),
]
</script>

