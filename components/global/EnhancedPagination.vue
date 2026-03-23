<template>
  <div class="enhanced-pagination">
    <!-- Top pagination controls -->
    <div class="flex flex-wrap items-center justify-between gap-4 mb-4">
      <!-- Left side: Records per page selector -->
      <div class="flex items-center gap-3">
        <!-- Records per page selector -->
        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-600 whitespace-nowrap">Show:</span>
          <v-select
            v-model="perPage"
            :items="perPageOptions"
            item-title="label"
            item-value="value"
            density="compact"
            variant="outlined"
            hide-details
            class="per-page-selector"
            style="width: 100px"
            @update:model-value="onPerPageChange"
          />
        </div>
      </div>

      <!-- Records info -->
      <div class="text-center text-xs text-gray-600 mb-2">
        Showing {{ from }} to {{ to }} from {{ total }} total records
      </div>

      <!-- Right side: Direct page navigation -->
      <div class="flex items-center gap-3">
        <!-- Direct page input -->
        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-600 whitespace-nowrap">Page:</span>
          <v-text-field
            v-model="directPageInput"
            type="number"
            density="compact"
            variant="outlined"
            hide-details
            :min="1"
            :max="totalPages"
            class="direct-page-input"
            style="width: 70px"
            @keyup.enter="onDirectPageSubmit"
            @blur="onDirectPageSubmit"
          />
          <span class="text-sm text-gray-600">of {{ totalPages }}</span>
        </div>

        <!-- Quick navigation buttons -->
        <div class="flex items-center gap-1">
          <v-btn
            icon="mdi-chevron-double-left"
            size="small"
            variant="text"
            :disabled="currentPage === 1"
            @click="goToPage(1)"
            title="First page"
          />
          <v-btn
            icon="mdi-chevron-left"
            size="small"
            variant="text"
            :disabled="currentPage === 1"
            @click="goToPage(currentPage - 1)"
            title="Previous page"
          />
          <v-btn
            icon="mdi-chevron-right"
            size="small"
            variant="text"
            :disabled="currentPage === totalPages"
            @click="goToPage(currentPage + 1)"
            title="Next page"
          />
          <v-btn
            icon="mdi-chevron-double-right"
            size="small"
            variant="text"
            :disabled="currentPage === totalPages"
            @click="goToPage(totalPages)"
            title="Last page"
          />
        </div>
      </div>
    </div>

    <!-- Compact pagination component -->
    <!-- <div class="flex items-center justify-center mb-4">
      <v-pagination
        v-model="currentPage"
        :length="totalPages"
        :total-visible="visiblePages"
        rounded="circle"
        density="compact"
        @update:model-value="onPageChange"
        />
    </div> -->
  </div>
</template>

<script setup lang="ts">
interface Props {
  /** Current page number */
  currentPage: number
  /** Total number of pages */
  totalPages: number
  /** Records per page */
  perPage: number
  /** Starting record number */
  from: number
  /** Ending record number */
  to: number
  /** Total records */
  total: number
  /** Storage key for persistence */
  storageKey?: string
}

const props = withDefaults(defineProps<Props>(), {
  storageKey: 'enhanced-pagination',
})

const emit = defineEmits<{
  'update:currentPage': [page: number]
  'update:perPage': [perPage: number]
  'page-change': [page: number]
  'per-page-change': [perPage: number]
}>()

// Local state
const currentPage = computed({
  get: () => props.currentPage,
  set: (value) => emit('update:currentPage', value),
})

const perPage = computed({
  get: () => props.perPage,
  set: (value) => emit('update:perPage', value),
})

const directPageInput = ref(String(props.currentPage))

// Options
const perPageOptions = [
  { label: '10', value: 10 },
  { label: '25', value: 25 },
  { label: '50', value: 50 },
  { label: '100', value: 100 },
]

// Calculate visible pages for compact pagination
const visiblePages = computed(() => {
  const total = props.totalPages
  if (total <= 7) return total
  if (total <= 12) return 9
  return 7 // Show current page ± 3
})

// Watch for page changes to update direct input
watch(() => props.currentPage, (newPage) => {
  directPageInput.value = String(newPage)
})

// Methods
const onPageChange = (page: number) => {
  emit('page-change', page)
}

const onPerPageChange = (newPerPage: number) => {
  // Save to localStorage for persistence
  if (props.storageKey) {
    localStorage.setItem(`${props.storageKey}-per-page`, String(newPerPage))
  }
  emit('per-page-change', newPerPage)
}

const onDirectPageSubmit = () => {
  const page = Number(directPageInput.value)
  if (!isNaN(page) && page >= 1 && page <= props.totalPages) {
    goToPage(page)
  } else {
    // Reset to current page if invalid
    directPageInput.value = String(props.currentPage)
  }
}

const goToPage = (page: number) => {
  if (page >= 1 && page <= props.totalPages && page !== props.currentPage) {
    currentPage.value = page
    emit('page-change', page)
  }
}

// Load persisted preferences on mount
onMounted(() => {
  // Load per-page preference from localStorage
  if (props.storageKey) {
    const savedPerPage = localStorage.getItem(`${props.storageKey}-per-page`)
    if (savedPerPage && perPageOptions.some(opt => opt.value === Number(savedPerPage))) {
      perPage.value = Number(savedPerPage)
    }
  }
})
</script>

<style scoped>
.per-page-selector :deep(.v-field__input) {
  padding: 0 8px;
}

.direct-page-input :deep(.v-field__input) {
  padding: 0 8px;
  text-align: center;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .enhanced-pagination {
    gap: 8px;
  }
  
  .enhanced-pagination > div {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }
  
  .enhanced-pagination > div > div {
    justify-content: center;
  }
}
</style>
