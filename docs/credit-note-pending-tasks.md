# Credit Note — Pending Tasks

## 1. Payment cancellation requires authorization + delete CN charge

**Current state**: The TrashButton to cancel individual payments is hidden in the UI (`ConsigneeCreditNoteEditForm.vue`). The backend endpoint still exists at `POST /{id}/delete-payment-cn` with permission `delete-customer-credit-note-payment`.

**What needs to be done**:

- [ ] Add an authorization flow (similar to `validateCancelCreditNoteAuthorization`) for canceling individual CN payments
- [ ] When a payment is canceled, also soft-delete the corresponding `CreditNoteCharge` (they are linked — payment and charge go together)
- [ ] Re-show the TrashButton in the UI but gated behind the authorization request flow
- [ ] After authorization is granted, allow the user to confirm the payment cancellation
- [ ] Ensure `Invoice::updatePaymentStatus()` is called after cancellation (already done in `deleteCustomerCNPayment`)

**Files to modify**:
- `app/Services/V1/Mexico/CreditNoteUnifiedService.php` — add `validateCancelPaymentAuthorization()`
- `app/Repositories/V1/Mexico/Impl/CreditNoteUnifiedRepository.php` — `deleteCustomerCNPayment()` should also delete the `CreditNoteCharge`
- `components/consignees/ConsigneeCreditNoteEditForm.vue` — re-add TrashButton with auth flow
- `routes/mex/api.php` — add route for requesting payment cancellation authorization if needed

## 2. NC cancellation blocked by existing payments

**Issue**: Canceling a credit note (formato libre / customer type) shows an error about payments being applied. This happens with invoice `2ATM-26061601` and NC `#4305`.

**Root cause**: To be investigated — the `deleteCustomerCreditNote` service method does not have a payments guard, but the error may come from a different validation or from the authorization flow.

**What needs to be done**:
- [ ] Reproduce the error and check the exact error message
- [ ] Identify if the block is in the service, repository, or frontend
- [ ] Remove any guard that prevents cancellation when payments exist (payments should be reversed, not block cancellation)
