<template>
  <v-autocomplete
    v-model="selected"
    v-model:search="search"
    :items="items"
    :loading="loading"
    item-title="title"
    item-value="key"
    label="Go to reference"
    placeholder="e.g. IM26-2551"
    prepend-inner-icon="mdi-magnify"
    density="compact"
    variant="outlined"
    hide-details
    hide-no-data
    no-filter
    return-object
    class="reference-quick-search"
    @update:model-value="goTo"
  >
    <template #item="{ props: itemProps, item }">
      <v-list-item v-bind="itemProps" :title="undefined">
        <div class="flex items-center gap-2">
          <span class="font-semibold">{{ item.raw.reference }}</span>
          <span v-if="item.raw.consignee" class="text-sm opacity-70 truncate">{{ item.raw.consignee }}</span>
          <v-spacer />
          <v-chip v-if="item.raw.cancelled" size="x-small" color="error" variant="tonal">Cancelled</v-chip>
          <v-chip v-if="item.raw.legacy" size="x-small" class="tm1-chip" variant="flat">TM1</v-chip>
        </div>
      </v-list-item>
    </template>
  </v-autocomplete>
</template>

<script setup lang="ts">
type QuickSearchModule = 'sea-import' | 'sea-export' | 'air-import' | 'air-export'

interface QuickSearchItem {
  key: string
  id: number
  title: string
  reference: string
  consignee: string | null
  legacy: boolean
  cancelled: boolean
}

const props = defineProps<{ module: QuickSearchModule }>()

const { $api } = useNuxtApp()
const route = useRoute()
const router = useRouter()

const search = ref('')
const selected = ref<any>(null)
const items = ref<QuickSearchItem[]>([])
const loading = ref(false)

// Services that have a read-only TM1 view: their TM1 references are searchable too
const LEGACY_VIEW_PATHS: Partial<Record<QuickSearchModule, string>> = { 'sea-import': '/maritime/import/legacy/', 'sea-export': '/maritime/export/legacy/', 'air-import': '/air/import/legacy/', 'air-export': '/air/export/legacy/' }
// Where a TM2 reference of the service is shown, to leave a TM1 page for a TM2 one
const VIEW_PATHS: Partial<Record<QuickSearchModule, string>> = { 'sea-import': '/maritime/import/view-details-', 'sea-export': '/maritime/export/view-details-', 'air-import': '/air/import/view-details-', 'air-export': '/air/export/view-details-' }

const fetchReferences = async (term: string) => {
  const options = { query: { referencias: term, limit: 10 } }
  switch (props.module) {
    case 'sea-import':
      return $api.referencias.getSeaImportReferencias(options)
    case 'sea-export':
      return $api.referenciasExport.getSeaExportReferencias(options)
    case 'air-import':
      return $api.airImport.getReferences(options)
    default:
      return $api.airExport.getReferences(options)
  }
}

const fetchLegacyReferences = async (term: string) =>
  LEGACY_VIEW_PATHS[props.module] ? $api.legacy.searchReferences(props.module, term, 10) : { data: [] }

const runSearch = _Debounce(async (term: string) => {
  loading.value = true
  try {
    // Each source fails on its own: TM1 being unavailable must not hide the TM2 results
    const [tm2, tm1] = await Promise.allSettled([fetchReferences(term), fetchLegacyReferences(term)])

    const current: QuickSearchItem[] = ((tm2.status === 'fulfilled' ? (tm2.value as any)?.data : null) ?? []).map((ref: any) => ({
      key: `tm2-${ref.id}`,
      id: ref.id,
      title: ref.consignee?.name ? `${ref.reference_number} · ${ref.consignee.name}` : ref.reference_number,
      reference: ref.reference_number,
      consignee: ref.consignee?.name ?? null,
      legacy: false,
      cancelled: !!ref.deleted_at,
    }))
    const legacy: QuickSearchItem[] = ((tm1.status === 'fulfilled' ? (tm1.value as any)?.data : null) ?? []).map((ref: any) => ({
      key: `tm1-${ref.id}`,
      id: ref.id,
      title: ref.consignee ? `${ref.reference_number} · ${ref.consignee}` : ref.reference_number,
      reference: ref.reference_number,
      consignee: ref.consignee,
      legacy: true,
      cancelled: ref.cancelled,
    }))

    items.value = [...current, ...legacy]
  } catch {
    items.value = []
  } finally {
    loading.value = false
  }
}, 400)

watch(search, (term) => {
  if (selected.value || !term || term.trim().length < 3) {
    items.value = []
    return
  }
  runSearch(term.trim())
})

const isLegacyPage = computed(() => /\/legacy\/\d+$/.test(route.path))

// Edit/detail pages end with the reference id (/maritime/import/12, .../view-details-12)
const targetPath = (item: QuickSearchItem) => {
  if (item.legacy) return `${LEGACY_VIEW_PATHS[props.module]}${item.id}`
  // From a TM1 page the trailing id belongs to another system: go to the TM2 view
  if (isLegacyPage.value) return `${VIEW_PATHS[props.module]}${item.id}`
  return route.path.replace(/\d+$/, String(item.id))
}

const goTo = (item: QuickSearchItem | null) => {
  if (!item) return
  const path = targetPath(item)
  selected.value = null
  search.value = ''
  items.value = []
  if (path && path !== route.path) router.push(path)
}
</script>

<style scoped>
.reference-quick-search {
  min-width: 220px;
  max-width: 280px;
}
</style>
