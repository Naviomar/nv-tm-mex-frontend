<template>
  <div class="flex flex-col mb-4">
    <div class="flex items-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
      <!-- Clock Icon -->
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-4 w-4 mr-1.5 text-blue-600 dark:text-blue-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="2"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>Filter by ETA Status</span>
    </div>

    <div
      class="relative inline-flex rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-1 w-full"
    >
      <!-- Sliding Background Indicator -->
      <div
        class="absolute top-1 bottom-1 bg-blue-600 rounded-md shadow-md transition-all duration-300 ease-out pointer-events-none w-[calc(33.333%-6px)]"
        :class="{
          'left-1': model === 'sin_eta',
          'left-[calc(33.333%+2px)]': model === 'ambos',
          'left-[calc(66.666%+2px)]': model === 'con_eta',
        }"
      ></div>

      <!-- Option: sin_eta -->
      <button
        type="button"
        @click="model = 'sin_eta'"
        :class="[
          'relative z-10 flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs md:text-sm font-semibold rounded-md transition-all duration-300 ease-out transform active:scale-95 focus:outline-none cursor-pointer',
          model === 'sin_eta'
            ? 'text-white'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200',
        ]"
      >
        <!-- Calendar X Icon -->
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-4 w-4 transition-transform duration-300"
          :class="model === 'sin_eta' ? 'scale-110' : ''"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
          <path stroke-linecap="round" stroke-linejoin="round" d="M10 12l4 4m0-4l-4 4" />
        </svg>
        <span>Only without ETA</span>
      </button>

      <!-- Option: ambos -->
      <button
        type="button"
        @click="model = 'ambos'"
        :class="[
          'relative z-10 flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs md:text-sm font-semibold rounded-md transition-all duration-300 ease-out transform active:scale-95 focus:outline-none cursor-pointer',
          model === 'ambos'
            ? 'text-white'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200',
        ]"
      >
        <!-- Multiple Calendars Icon -->
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-4 w-4 transition-transform duration-300"
          :class="model === 'ambos' ? 'scale-110' : ''"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <span>Both (With & Without ETA)</span>
      </button>

      <!-- Option: con_eta -->
      <button
        type="button"
        @click="model = 'con_eta'"
        :class="[
          'relative z-10 flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs md:text-sm font-semibold rounded-md transition-all duration-300 ease-out transform active:scale-95 focus:outline-none cursor-pointer',
          model === 'con_eta'
            ? 'text-white'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200',
        ]"
      >
        <!-- Calendar Check Icon -->
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-4 w-4 transition-transform duration-300"
          :class="model === 'con_eta' ? 'scale-110' : ''"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 16l3 3 7-7" />
        </svg>
        <span>Only with ETA</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const model = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})
</script>
