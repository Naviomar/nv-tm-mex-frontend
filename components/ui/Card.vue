<template>
  <div
    class="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 overflow-hidden"
    :class="$attrs.class"
  >
    <slot />
  </div>
</template>
<script setup lang="ts">
defineOptions({ name: 'Card', inheritAttrs: false })
</script>
