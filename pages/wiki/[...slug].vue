<script setup lang="ts">
const route = useRoute()

// e.g. /wiki/billing/setup  -> /wiki/billing/setup
const slug = Array.isArray(route.params.slug) ? route.params.slug.join('/') : ''
const manualPath = '/wiki' + (slug ? `/${slug}` : '')

const { data: navigation } = await useAsyncData('wiki:nav', () =>
  queryCollectionNavigation('wiki').order('title', 'ASC'),
)

// Fetch the matching page from the wiki collection
const { data: page } = await useAsyncData(
  () => `wiki:page:${manualPath}`,
  () => queryCollection('wiki').path(manualPath).first(),
)

// Optional: refresh if route changes (client)
if (import.meta.client) {
  watch(
    () => route.fullPath,
    () => refreshNuxtData([`wiki:page:${manualPath}`]),
  )
}
</script>

<template>
  <div class="grid grid-cols-12 gap-6">
    <aside class="col-span-12 md:col-span-3 lg:col-span-3">
      <WikiNav :items="navigation || []" />
    </aside>

    <main class="col-span-12 md:col-span-9 lg:col-span-9 prose dark:prose-invert max-w-none">
      <article v-if="page" class="prose md:prose-base lg:prose-lg dark:prose-invert max-w-none">
        <h1 class="mt-0">{{ page.title ?? page.path }}</h1>
        <ContentRenderer :value="page" />

        <!-- Sibling nav footer -->
        <WikiSiblings :items="navigation || []" />
      </article>
      <div v-else>
        <p>
          Documento no encontrado: <code>{{ manualPath }}</code>
        </p>
      </div>
    </main>
  </div>
</template>
