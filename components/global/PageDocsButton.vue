<template>
  <div v-if="docs.length">
    <v-btn
      size="small"
      color="primary"
      variant="tonal"
      icon="mdi-book-open-page-variant-outline"
      title="Documentation for this view"
      @click="show = true"
    />
    <v-dialog v-model="show" max-width="1150" scrollable>
      <v-card rounded="lg">
        <v-card-title class="d-flex align-center gap-2 bg-primary text-white py-3">
          <v-icon :icon="active.icon || 'mdi-book-open-page-variant-outline'" />
          <div>
            <div class="text-subtitle-1 font-weight-bold">{{ active.title }}</div>
            <div v-if="active.subtitle" class="text-caption" style="opacity: 0.85">{{ active.subtitle }}</div>
          </div>
          <v-spacer />
          <v-btn icon="mdi-close" variant="text" density="comfortable" @click="show = false" />
        </v-card-title>
        <v-tabs v-if="docs.length > 1" v-model="activeId" color="primary" density="compact" class="border-b">
          <v-tab v-for="doc in docs" :key="doc.id" :value="doc.id">{{ doc.title }}</v-tab>
        </v-tabs>
        <v-card-text class="pa-0" style="max-height: 78vh">
          <component :is="contentFor(active)" />
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>
<script setup lang="ts">
import { docsForPath } from '~/utils/docs/registry'

const route = useRoute()
const show = ref(false)
const activeId = ref<string | null>(null)

const docs = computed(() => docsForPath(route.path))
const active = computed(() => docs.value.find((d) => d.id === activeId.value) ?? docs.value[0])

watch(docs, () => (activeId.value = docs.value[0]?.id ?? null), { immediate: true })

// Other components can ask for a doc to be opened (usePageDocs().open(id, tab)).
const { request } = usePageDocs()
watch(request, (req) => {
  if (!req) return
  const doc = docs.value.find((d) => d.id === req.id)
  if (!doc) return
  activeId.value = doc.id
  show.value = true
})

const cache = new Map<string, any>()
const contentFor = (doc: any) => {
  if (!cache.has(doc.id)) cache.set(doc.id, defineAsyncComponent(doc.component))
  return cache.get(doc.id)
}
</script>
