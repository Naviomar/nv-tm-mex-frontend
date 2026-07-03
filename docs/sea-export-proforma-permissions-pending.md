# Sea Export Proforma — Pending Permission Fix

## Same permission gap as Sea Import, not yet fixed here

**Context**: In Sea Import (`SeaImportConsigneeChargesSmart.vue`), reference-level charge editing (add/update/delete on `referencia.charges` and `referencia.sell_rate_breakdown`) used to have no permission check at all — only a boolean based on whether the voyage was locked (`canEditCharges`). This was fixed (2026-07-03) to require `proforma-tm-edit` / `proforma-wm-edit` (phase 1, voyage not locked) or the existing `sea-import-*-with-permission` permissions (phase 2, voyage locked), matching the charge's own `inv_type`.

**Current state**: `components/seaexport/SeaExportProformas.vue` has the same `canEditCharges` pattern (line ~146-150, computed purely from `referencia.voyage_discharge.locked_at`), passed down as a `:canEdit` prop. It was not audited or fixed as part of this session — the scope was specifically Sea Import.

**What needs to be done**:
- [ ] Audit `SeaExportProformas.vue` for the same gap: does add/update/delete of reference-level export charges have any permission check today, or only the lock-state boolean?
- [ ] If missing, apply the same fix: `proforma-tm-edit` / `proforma-wm-edit` for phase 1 (not locked), and confirm whether dedicated `sea-export-*-with-permission` permissions already exist for phase 2 (locked) — `sea-export-save-charge-with-permission` and `sea-export-delete-charge-with-permission` are already seeded (see `database/seeders/mexico/PermisosSeeder.php`), but need to verify whether they're actually checked anywhere yet, and whether they need to be split into update/delete like the Sea Import ones.
- [ ] Check the corresponding backend routes/controllers for Sea Export reference charges (likely in `ReferenciaExportRepository`/`ReferenciaExportService` or a dedicated export charges controller) for the same "no middleware on the base route" bug that Sea Import had.
- [ ] `InvoiceConsigneeChargesSmart.vue` (the proforma-level charge editor, shared across Sea Import, Sea Export, and Air) was already fixed as part of the Sea Import work — Sea Export and Air benefit from that fix automatically for the proforma-level (already-created TM/WM invoice) part. Only the reference-level (pre-proforma) part of Sea Export is the open gap.

**Files likely involved**:
- `components/seaexport/SeaExportProformas.vue`
- Backend: whatever service backs Sea Export reference charge add/update/delete (needs discovery — not traced in this session)
- `routes/mex/api.php` — Sea Export charge routes
