<template>
  <NuxtLink
    v-if="props.to"
    :to="props.to"
    :class="buttonClass"
    @click="onClick"
  >
    <slot />
  </NuxtLink>
  <button
    v-else
    type="button"
    :class="buttonClass"
    :disabled="disabled"
    @click="onClick"
  >
    <slot />
  </button>
</template>
<script setup lang="ts">
defineOptions({ name: 'Button', inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'ghost'
    size?: 'sm' | 'md'
    to?: string
    disabled?: boolean
  }>(),
  { variant: 'secondary', size: 'md', disabled: false }
)

const emit = defineEmits<{ (e: 'click', ev: MouseEvent): void }>()

const baseClass = 'inline-flex items-center justify-center font-medium rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 disabled:opacity-30 disabled:pointer-events-none no-underline'

const buttonClass = computed(() => {
  const sizeClass = props.size === 'sm' ? 'h-8 px-2.5 text-xs' : 'h-9 px-4 text-sm'
  const part = sizeClass + ' shrink-0'
  switch (props.variant) {
    case 'primary':
      return baseClass + ' ' + part + ' text-white bg-blue-900 hover:bg-blue-800 dark:bg-blue-900 dark:hover:bg-blue-800'
    case 'ghost':
      return baseClass + ' ' + part + ' text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800'
    default:
      return baseClass + ' ' + part + ' !text-zinc-700 bg-transparent hover:!bg-zinc-100 border !border-zinc-300 dark:!text-zinc-300 dark:hover:!bg-zinc-800 dark:!border-zinc-600'
  }
})

function onClick(ev: MouseEvent) {
  if (!props.to) emit('click', ev)
}
</script>
