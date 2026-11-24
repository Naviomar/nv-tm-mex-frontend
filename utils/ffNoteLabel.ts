/**
 * Origin of an F.F. note: who issued it (inbound 1 = Agent, 0 = TM) and its kind (D/C).
 * TM Debit and Agent Credit are in TM's favor (sale side); Agent Debit and TM Credit are payable.
 */
export const ffNoteOriginLabel = (note: { inbound?: number | boolean | null; type?: string | null } | null | undefined) => {
  const issuer = Number(note?.inbound) === 1 ? 'Agent' : 'TM'
  const kind = note?.type === 'C' ? 'Credit' : 'Debit'
  return `From ${issuer} ${kind}`
}
