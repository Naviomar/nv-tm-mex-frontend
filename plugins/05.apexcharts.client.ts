import VueApexCharts from 'vue3-apexcharts'

// Client-only: ApexCharts touches window/document, so it must never run during SSR.
// Registers the global <apexchart> component.
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(VueApexCharts)
})
