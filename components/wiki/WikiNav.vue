<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from '#imports'

const props = defineProps<{ items: ContentNavigationItem[] }>()
const route = useRoute()

/** Search query */
const q = ref('')

/** Expanded nodes (persisted) */
const expanded = ref<string[]>([])
const LS_KEY = 'wiki:expanded'

onMounted(() => {
  try {
    const saved = localStorage.getItem(LS_KEY)
    if (saved) expanded.value = JSON.parse(saved)
  } catch { }
  // Auto-expand parents of current page
  const parents = findParentsForPath(props.items, route.path)
  for (const p of parents) if (!expanded.value.includes(p)) expanded.value.push(p)
})

watch(
  expanded,
  (v) => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(v))
    } catch { }
  },
  { deep: true }
)

function isExpanded(path?: string) {
  return !!path && expanded.value.includes(path)
}
function toggle(path?: string) {
  if (!path) return
  const i = expanded.value.indexOf(path)
  i >= 0 ? expanded.value.splice(i, 1) : expanded.value.push(path)
}

const filteredItems = computed(() => {
  const needle = q.value.trim().toLowerCase()
  if (!needle) return props.items
  return filterTree(props.items, (n) => (n.title || n.path || '').toLowerCase().includes(needle))
})

function isActive(path?: string) {
  if (!path) return false
  return route.path === path || route.path.startsWith(path + '/')
}

/** Utils */
function filterTree(
  nodes: ContentNavigationItem[],
  pred: (n: ContentNavigationItem) => boolean
): ContentNavigationItem[] {
  const res: ContentNavigationItem[] = []
  for (const n of nodes) {
    const kids = n.children ? filterTree(n.children, pred) : []
    if (pred(n) || kids.length) res.push({ ...n, children: kids })
  }
  return res
}

function findParentsForPath(
  nodes: ContentNavigationItem[],
  targetPath: string,
  stack: string[] = []
): string[] {
  for (const n of nodes) {
    const withThis = n.path ? [...stack, n.path] : [...stack]
    if (n.path === targetPath) return stack
    if (n.children?.length) {
      const r = findParentsForPath(n.children, targetPath, withThis)
      if (r.length) return n.path ? [...stack, n.path] : stack
    }
  }
  return []
}

/** Keyboard: left/right to collapse/expand groups */
function onKeydownGroup(e: KeyboardEvent, item: ContentNavigationItem) {
  if (!item.path) return
  if (e.key === 'ArrowLeft' && isExpanded(item.path)) {
    e.preventDefault()
    toggle(item.path)
  } else if (e.key === 'ArrowRight' && item.children?.length && !isExpanded(item.path)) {
    e.preventDefault()
    toggle(item.path)
  }
}
</script>

<template>
  <nav aria-label="Wiki navigation" class="w-full">
    <!-- Search -->
    <div class="mb-2">
      <label class="sr-only" for="wiki-nav-search">Search wiki</label>
      <input id="wiki-nav-search" v-model="q" type="search" placeholder="Search…"
        class="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm outline-none focus:ring focus:ring-primary/20" />
    </div>

    <!-- Tree -->
    <ul role="tree" class="space-y-0.5">
      <TreeNode v-for="item in filteredItems" :key="item.path || item.title" :item="item" :is-expanded="isExpanded"
        :toggle="toggle" :is-active="isActive" @keydown-group="onKeydownGroup" />
    </ul>
  </nav>
</template>

<script lang="ts">
import { defineComponent, h, resolveComponent } from 'vue'
import type { ContentNavigationItem } from '@nuxt/content'

export default defineComponent({ name: 'WikiNav' })

const Chevron = (props: { open: boolean }) =>
  h(
    'svg',
    {
      xmlns: 'http://www.w3.org/2000/svg',
      viewBox: '0 0 20 20',
      fill: 'currentColor',
      class: ['h-4 w-4 transition-transform', props.open ? 'rotate-90 text-gray-700 dark:text-gray-200' : 'text-gray-500'],
      'aria-hidden': 'true'
    },
    [h('path', { d: 'M7 5l6 5-6 5V5z' })]
  )

const TreeNode = defineComponent({
  name: 'TreeNode',
  props: {
    item: { type: Object as () => ContentNavigationItem, required: true },
    isExpanded: { type: Function as unknown as () => (p?: string) => boolean, required: true },
    toggle: { type: Function as unknown as () => (p?: string) => void, required: true },
    isActive: { type: Function as unknown as () => (p?: string) => boolean, required: true }
  },
  emits: ['keydown-group'],
  setup(props, { emit }) {
    const NuxtLink = resolveComponent('NuxtLink')

    return () =>
      h(
        'li',
        {
          role: 'treeitem',
          'aria-expanded': !!props.item.children?.length && props.isExpanded(props.item.path),
          class: 'group'
        },
        [
          // Row
          h(
            'div',
            {
              class:
                'flex items-center gap-2 rounded-lg px-2 py-1.5 transition ' +
                (props.isActive(props.item.path)
                  ? 'bg-primary/10 text-primary-700 dark:text-primary-300'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800')
            },
            [
              props.item.children?.length
                ? // Group toggle (title acts as toggle, not link)
                h(
                  'button',
                  {
                    class:
                      'flex items-center gap-2 rounded-md px-1.5 py-1 text-left outline-none focus:ring focus:ring-primary/20',
                    'aria-label': (props.item.title || props.item.path) + ' section',
                    onClick: () => props.toggle(props.item.path),
                    onKeydown: (e: KeyboardEvent) => emit('keydown-group', e, props.item)
                  },
                  [
                    Chevron({ open: props.isExpanded(props.item.path) }),
                    h(
                      'span',
                      {
                        class:
                          'font-medium text-sm ' +
                          (props.isActive(props.item.path) ? 'text-inherit' : 'text-gray-700 dark:text-gray-200')
                      },
                      props.item.title || props.item.path
                    )
                  ]
                )
                : // Leaf link — FIXED to use NuxtLink (no full reload)
                h(
                  NuxtLink as any,
                  {
                    to: props.item.path,
                    class:
                      'block rounded-md px-1.5 py-1 text-sm ' +
                      (props.isActive(props.item.path)
                        ? 'text-primary-700 dark:text-primary-300 font-medium'
                        : 'text-gray-700 dark:text-gray-200'),
                    'aria-current': props.isActive(props.item.path) ? 'page' : undefined
                  },
                  { default: () => props.item.title || props.item.path }
                )
            ]
          ),

          // Children
          props.item.children?.length && props.isExpanded(props.item.path)
            ? h(
              'ul',
              { role: 'group', class: 'ml-3 border-l border-gray-200 dark:border-gray-800 pl-2 mt-1 space-y-0.5' },
              props.item.children.map((c) =>
                h(TreeNode, {
                  item: c,
                  isExpanded: props.isExpanded,
                  toggle: props.toggle,
                  isActive: props.isActive,
                  onKeydownGroup: (e: KeyboardEvent, it: ContentNavigationItem) => emit('keydown-group', e, it)
                })
              )
            )
            : null
        ]
      )
  }
}) as any
</script>

<style scoped>
:deep(.dark .border-gray-800) {
  border-color: rgba(255, 255, 255, 0.08);
}
</style>
