export function extractTicketNumber(notes: string): string | null {
  if (!notes) return null
  const match = notes.match(/T-?\s*(\d{10,13})/i)
  return match ? match[1] : null
}
