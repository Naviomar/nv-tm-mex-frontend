<template>
  <div>
    <h1 class="text-xl font-bold mb-4">{{ auditableName }}</h1>
    <div class="grid grid-cols-2 gap-4 text-sm">
      <!-- OLD VALUES -->
      <div>
        <h3 class="font-semibold text-gray-700 dark:text-gray-300 mb-2">Old Values</h3>
        <div v-for="(value, key) in oldValues" :key="key" class="mb-1">
          <div class="bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 px-2 py-1 rounded">
            <strong class="text-red-700 dark:text-red-400">{{ key }}</strong
            >:
            <span class="text-red-600 dark:text-red-300">{{ format(value) }}</span>
          </div>
        </div>
      </div>

      <!-- NEW VALUES -->
      <div>
        <h3 class="font-semibold text-gray-700 dark:text-gray-300 mb-2">New Values</h3>
        <div v-for="(value, key) in newValues" :key="key" class="mb-1">
          <div
            :class="[
              changedKeys.includes(key)
                ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700 text-green-600 dark:text-green-300'
                : 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300',
              'border px-2 py-1 rounded',
            ]"
          >
            <strong>{{ key }}</strong
            >: <span>{{ format(value) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  auditable: String,
  oldValues: Object,
  newValues: Object,
})

// computed just get model name without namespace
const auditableName = computed(() => {
  return props.auditable?.split('\\').pop() || props.auditable
})

function format(val: any) {
  return typeof val === 'object' ? JSON.stringify(val) : val
}

const changedKeys = Object.keys(props.newValues || {}).filter(
  (key) => props.oldValues?.[key] !== props.newValues?.[key]
)
</script>
