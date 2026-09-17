<template>
  <div>
    <template v-if="charges.length">
      <div class="divide-y divide-gray-100 rounded border border-gray-200 overflow-hidden">
        <div v-for="(c, ci) in charges" :key="ci" class="flex items-center gap-2 px-2 py-1.5 text-sm bg-gray-50">
          <div class="flex-1 min-w-0">
            <div class="font-medium text-gray-900 truncate">{{ c.charge_name }}</div>
            <div v-if="c.invoice_number" class="text-xs text-gray-400">Invoice #{{ c.invoice_number }}</div>
          </div>
          <div class="font-semibold text-gray-700 whitespace-nowrap">${{ Number(c.amount).toFixed(2) }}</div>
        </div>
      </div>
    </template>

    <template v-else-if="operations.length">
      <div class="divide-y divide-gray-100 rounded border border-gray-200 overflow-hidden">
        <div v-for="(op, oi) in operations" :key="oi" class="px-2 py-1.5 text-sm bg-gray-50">
          <span class="font-medium capitalize">{{ op.action }}</span>
          <span class="ml-1">{{ op.description || op.summary || '' }}</span>
        </div>
      </div>
    </template>

    <template v-else-if="fields.length">
      <table class="w-full text-sm border-collapse">
        <tbody>
          <tr v-for="f in fields" :key="f.key" class="border-b border-gray-100 align-top">
            <td class="py-1 pr-3 font-medium text-gray-600 whitespace-nowrap capitalize">{{ f.label }}</td>
            <td class="py-1 text-gray-900">
              <template v-if="f.isObject">
                <table class="w-full text-xs border border-gray-200 rounded overflow-hidden">
                  <tbody>
                    <tr v-for="sub in f.entries" :key="sub.key" class="border-b border-gray-100 last:border-0">
                      <td class="py-1 px-2 font-medium text-gray-500 whitespace-nowrap capitalize bg-gray-50">{{ sub.label }}</td>
                      <td class="py-1 px-2 break-all">{{ sub.value }}</td>
                    </tr>
                  </tbody>
                </table>
              </template>
              <template v-else>
                <span class="break-all">{{ f.value }}</span>
              </template>
            </td>
          </tr>
        </tbody>
      </table>
    </template>

    <div v-else class="text-sm text-gray-500">No additional data</div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  processData: Record<string, any> | null | undefined
}>()

const humanizeKey = (key: string) => String(key).replace(/_/g, ' ')

const tryParseJson = (val: any) => {
  if (typeof val !== 'string') return val
  const trimmed = val.trim()
  if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) return val
  try {
    return JSON.parse(trimmed)
  } catch {
    return val
  }
}

const charges = computed(() => props.processData?.charges ?? [])
const operations = computed(() => props.processData?.operations ?? [])

const fields = computed(() => {
  if (!props.processData || charges.value.length || operations.value.length) return []
  return Object.entries(props.processData)
    .filter(([key]) => !['charges', 'operations'].includes(key))
    .map(([key, rawVal]) => {
      const val = tryParseJson(rawVal)
      const isObject = val && typeof val === 'object'
      return {
        key,
        label: humanizeKey(key),
        value: isObject ? '' : String(val ?? ''),
        isObject,
        entries: isObject
          ? Object.entries(val).map(([k, v]) => ({
              key: k,
              label: humanizeKey(k),
              value: typeof v === 'object' && v !== null ? JSON.stringify(v) : String(v ?? ''),
            }))
          : [],
      }
    })
})
</script>
