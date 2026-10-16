<template>
  <v-autocomplete
    v-model="selected"
    v-model:search="search"
    :items="items"
    :loading="loading"
    item-title="title"
    item-value="id"
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
  />
</template>

<script setup lang="ts">
type QuickSearchModule = 'sea-import' | 'sea-export' | 'air-import' | 'air-export'

const props = defineProps<{ module: QuickSearchModule }>()

const { $api } = useNuxtApp()
const route = useRoute()
const router = useRouter()

const search = ref('')
const selected = ref<any>(null)
const items = ref<{ id: number; title: string }[]>([])
const loading = ref(false)

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

const runSearch = _Debounce(async (term: string) => {
  loading.value = true
  try {
    const response = (await fetchReferences(term)) as any
    items.value = (response?.data ?? []).map((ref: any) => ({
      id: ref.id,
      title: ref.consignee?.name ? `${ref.reference_number} · ${ref.consignee.name}` : ref.reference_number,
    }))
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

// Edit/detail pages end with the reference id (/maritime/import/12, .../view-details-12)
const goTo = (item: { id: number } | null) => {
  if (!item) return
  const path = route.path.replace(/\d+$/, String(item.id))
  selected.value = null
  search.value = ''
  items.value = []
  if (path !== route.path) router.push(path)
}
</script>

<style scoped>
.reference-quick-search {
  min-width: 220px;
  max-width: 280px;
}
</style>
