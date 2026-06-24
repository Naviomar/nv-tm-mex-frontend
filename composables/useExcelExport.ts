/**
 * Client-side Excel export for report data tables. Builds an .xlsx file
 * directly from the already-loaded table data (headers + items [+ totals]),
 * no backend round-trip needed.
 */
export function useExcelExport() {
  const exportTableToExcel = async (
    headers: { title: string; key: string }[],
    items: Record<string, any>[],
    totals: Record<string, any> | undefined,
    fileName: string,
    sheetName = 'Sheet1'
  ) => {
    const XLSX = await import('xlsx')

    const rows = items.map(item => {
      const row: Record<string, any> = {}
      headers.forEach(h => { row[h.title] = item[h.key] ?? '' })
      return row
    })

    if (totals) {
      const totalsRow: Record<string, any> = {}
      headers.forEach((h, idx) => {
        totalsRow[h.title] = idx === 0 && totals[h.key] === undefined ? 'Total' : (totals[h.key] ?? '')
      })
      rows.push(totalsRow)
    }

    const worksheet = XLSX.utils.json_to_sheet(rows, { header: headers.map(h => h.title) })
    const workbook = XLSX.utils.book_new()
    // Excel sheet names: max 31 chars, no \ / ? * [ ] : characters.
    const safeSheetName = sheetName.replace(/[\\/?*[\]:]/g, '').slice(0, 31) || 'Sheet1'
    XLSX.utils.book_append_sheet(workbook, worksheet, safeSheetName)
    XLSX.writeFile(workbook, `${fileName}.xlsx`)
  }

  return { exportTableToExcel }
}
