<script setup lang="ts">
const { data: navigation } = await useAsyncData('wiki:nav', () =>
  queryCollectionNavigation('wiki').order('title', 'ASC')
)
const { data: page } = await useAsyncData('wiki:home', () =>
  queryCollection('wiki').path('/wiki').first()
)

const navOpen = ref(false)
</script>

<template>
  <div class="grid grid-cols-12 gap-6">
    <!-- Mobile header -->
    <div class="col-span-12 md:hidden flex items-center justify-between">
      <h1 class="text-xl font-semibold">Wiki</h1>
      <button class="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
        @click="navOpen = !navOpen">
        {{ navOpen ? 'Close' : 'Menu' }}
      </button>
    </div>

    <!-- Sidebar -->
    <aside class="col-span-12 md:col-span-3 lg:col-span-3" :class="[
      'md:sticky md:top-4',
      'md:h-[calc(100vh-2rem)]',
      'md:overflow-auto',
      'shadow-sm',
      navOpen ? '' : 'hidden md:block',
    ]">
      <WikiNav :items="navigation || []" />
    </aside>

    <!-- Main -->
    <main class="col-span-12 md:col-span-9 lg:col-span-9 prose dark:prose-invert max-w-none">
      <article v-if="page" class="prose md:prose-base lg:prose-lg dark:prose-invert max-w-none">
        <h1 class="mt-0">{{ page.title ?? 'Wiki' }}</h1>
        <ContentRenderer :value="page" />
      </article>
      <div v-else>
        <p>No se encontró <code>content/wiki/index.md</code>. Crea uno para el home del wiki.</p>
      </div>
    </main>
  </div>
</template>
