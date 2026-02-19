<template>
  <div
    class="overflow-hidden border border-zinc-200 dark:border-zinc-800"
    :class="[roundedClass, $attrs.class]"
  >
    <div v-if="scroll" class="overflow-x-auto">
      <table class="w-full text-sm">
        <slot />
      </table>
    </div>
    <table v-else class="w-full text-sm">
      <slot />
    </table>
  </div>
</template>
<script setup lang="ts">
defineOptions({ name: 'Table' })

const props = withDefaults(
  defineProps<{
    rounded?: 'md' | 'lg'
    scroll?: boolean
  }>(),
  { rounded: 'md', scroll: false }
)

const roundedClass = computed(() =>
  props.rounded === 'lg' ? 'rounded-lg' : 'rounded-md'
)
</script>
