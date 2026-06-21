import type { ApexOptions } from 'apexcharts'

/**
 * Shared formatters + ApexCharts option factory for the reports module.
 * Auto-imported by Nuxt.
 */
export function useReportFormatters() {
  const formatNumber = (value: number) =>
    new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(value ?? 0)

  const formatInt = (value: number) =>
    new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value ?? 0)

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value ?? 0)

  // Per-year color palette (chart-friendly hex). Index 0 = first year, etc.
  const yearPalette = ['#3b82f6', '#a855f7', '#22c55e', '#f97316', '#ec4899', '#14b8a6', '#6366f1', '#eab308']

  // Distinct palette for categorical breakdowns (clients, lines, ports).
  const categoryPalette = [
    '#3b82f6', '#a855f7', '#22c55e', '#f97316', '#ec4899',
    '#0ea5e9', '#eab308', '#6366f1', '#14b8a6', '#ef4444',
    '#8b5cf6', '#10b981',
  ]

  /**
   * Base ApexCharts options shared across cards. Each chart spreads this and
   * overrides what it needs (series live separately on the component).
   */
  const apexBaseOptions = (overrides: ApexOptions = {}): ApexOptions => {
    const base: ApexOptions = {
      chart: {
        fontFamily: 'inherit',
        toolbar: {
          show: true,
          tools: { download: true, selection: false, zoom: false, zoomin: false, zoomout: false, pan: false, reset: false },
        },
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 650,
          animateGradually: { enabled: true, delay: 120 },
          dynamicAnimation: { enabled: true, speed: 350 },
        },
        dropShadow: {
          enabled: true,
          top: 4,
          left: 0,
          blur: 6,
          opacity: 0.08,
        },
      },
      dataLabels: { enabled: false },
      legend: { position: 'bottom', fontSize: '12px' },
      grid: { borderColor: 'rgba(0,0,0,0.06)' },
      tooltip: { theme: 'dark' },
      noData: { text: 'No data' },
    }
    return { ...base, ...overrides }
  }

  return { formatNumber, formatInt, formatCurrency, yearPalette, categoryPalette, apexBaseOptions }
}
