<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'

/** Optional: pass the nav you already fetched. If omitted, we fetch it here. */
const props = defineProps<{ items?: ContentNavigationItem[] }>()

const route = useRoute()

// Use the provided nav, or fetch it.
const { data: nav } = await useAsyncData('wiki:siblings:nav', async () => {
  if (props.items?.length) return props.items
  // v3 API
  return await queryCollectionNavigation('wiki')
})

// Find the current node and its parent
type Found = { parent: ContentNavigationItem | null; node: ContentNavigationItem | null }
function findNode(
  items: ContentNavigationItem[] = [],
  path: string,
  parent: ContentNavigationItem | null = null,
): Found {
  for (const it of items) {
    if (it.path === path) return { parent, node: it }
    if (it.children?.length) {
      const res = findNode(it.children, path, it)
      if (res.node) return res
    }
  }
  return { parent: null, node: null }
}

const prevNext = computed(() => {
  const tree = nav.value || []
  const { parent, node } = findNode(tree, route.path)

  if (!node) return { prev: null as ContentNavigationItem | null, next: null as ContentNavigationItem | null }

  // Siblings are the children of the parent (or the root list if no parent)
  const group = (parent?.children ?? tree)
    // only linkable pages (folders without index.md have page === false)
    .filter((i) => i.path && i.page !== false && i.navigation !== false)

  const idx = group.findIndex((i) => i.path === node.path)
  const prev = idx > 0 ? group[idx - 1] : null
  const next = idx >= 0 && idx < group.length - 1 ? group[idx + 1] : null
  return { prev, next }
})
</script>

<template>
  <nav v-if="prevNext.prev || prevNext.next" class="mt-10 pt-6 border-t flex justify-between gap-4">
    <div class="min-w-0">
      <NuxtLink
        v-if="prevNext.prev"
        :to="prevNext.prev!.path!"
        class="block rounded-lg px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        <div class="text-xs opacity-70">Previous</div>
        <div class="truncate font-medium">{{ prevNext.prev!.title ?? prevNext.prev!.path }}</div>
      </NuxtLink>
    </div>
    <div class="min-w-0 text-right">
      <NuxtLink
        v-if="prevNext.next"
        :to="prevNext.next!.path!"
        class="block rounded-lg px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        <div class="text-xs opacity-70">Next</div>
        <div class="truncate font-medium">{{ prevNext.next!.title ?? prevNext.next!.path }}</div>
      </NuxtLink>
    </div>
  </nav>
</template>
