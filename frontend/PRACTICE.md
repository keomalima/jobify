# V1 practice plan

The aim is to explain and build one complete flow: sign in → load companies → save an application → see the updated list. The mockups are a visual direction, not a V1 feature checklist.

## What to write yourself

Prioritize these skills: typed API contracts; client and server validation; queries versus mutations; loading/error/empty states; cache invalidation; authentication versus authorization; relational data and partial failures; tests that cover real behavior. Use documentation first, then ask AI for a hint or review of your attempt.

Let AI handle spacing, colors, responsive grids, icons, repetitive markup, and initial test setup. Use libraries for dialogs, form state, and request caching. Understand how they work, but do not rebuild them.

## Exercises

Search for `TODO(practice-` to find each task next to the relevant code. The old company fetch and registration/login/offer submissions have been removed. The UI and validation work, but submission deliberately displays “Submission is not connected yet.” No fake success, token, or saved record is produced. The company list is an empty placeholder until exercise 2 is complete. Keep hooks inside the component initially; no generic API/form factory is needed.

**Suggested order:** 1 → 5 → 6 (login) → 2 → 3 → 4 → remaining session work in 6 → 7. Complete authentication first to reach protected pages normally; route guards remain enabled.

- [ ] **1. Validation and contracts** — `schemas/userSchemas.ts`, `schemas/offerSchema.ts`. Write schema tests for password mismatch, invalid email, required company ID versus new-company name/location, invalid website, empty type, and salary (blank, zero, negative, decimal). Check the backend schemas before changing requirements. Understand the difference between an input string and the numeric API payload. Frontend validation is UX; backend validation enforces the contract.
- [ ] **2. Read companies** — `components/forms/OfferForm.tsx`. Replace the empty companies placeholder with `useQuery`, key `['companies']`, and a typed `GET /companies` function returning `response.data`. Render loading, error with retry, and empty states independently. Verify a failed request isn't presented as an empty company list. Axios already supplies `/api`.
- [ ] **3. Save an application** — `OfferForm.tsx`. Use `useMutation` and await `mutateAsync` from the form submit handler. Map form values to explicit API payloads. Use the selected company ID, or create a company before saving the offer. Keep input on failure, show errors, and disable repeat submission while pending. Do not automatically retry creation requests.
- [ ] **4. List and refresh** — `pages/DashboardPage.tsx`, `pages/RegisterOfferPage.tsx`, `OfferForm.tsx`. Fetch `GET /offers` with key `['offers']`, render a simple list with loading/error/empty states, and invalidate companies/offers after successful creation. Close the modal only on success. Test a failed offer save after successful company creation: retry must reuse the existing company. Implement retaining that ID on failure, and consider what happens after closing/reopening. Explain when a backend transaction or idempotency key would be needed instead of two requests.
- [ ] **5. Registration mutation** — `components/forms/RegisterForm.tsx`. Implement submission with `useMutation`, explicitly omit `confirmPassword` from the request, preserve the email-field error on 409, and store the token/navigate only after success. Test 409, 500, network failure, and repeated clicks. A TypeScript response type alone does not validate incoming JSON.
- [ ] **6. Session lifecycle** — `components/forms/LoginForm.tsx`, `lib/api.ts`, `routes.tsx`. Apply the mutation pattern to login. Invalid credentials currently return **400** from this backend. A protected request's 401 should clear the session, clear user-specific query data, and redirect. Network errors and 500s should not log users out. Verify that a second account never sees the first account's cached records. Frontend route guards are navigation only; test ownership checks in the backend with two users.
- [ ] **7. Dialog behavior and integration tests** — `RegisterOfferPage.tsx`, `OfferForm.tsx`. Lift only pending/dirty status when needed to prevent dismissal while saving and confirm discarding edits. Test Escape/Cancel, failed submission staying open, successful submission closing, and saving both an existing and new company. Use React Testing Library with request mocks, or a small browser flow; avoid testing CSS class strings.

## V1 scope

Keep: registration/login, companies, application create/list/edit/status, and a simple dashboard based on real data. Company creation needs **name and location** with the current API; website is optional. Offer creation supports title, company, type, status, salary, and skills.

Defer: rich-text editors, notes per stage, calendars, reminders, document uploads, compensation breakdowns, drag-and-drop pipelines, optimistic updates, and the extra navigation shown in the mockups. Add one later only to practice a specific engineering problem. Do not add fields the API cannot save.

## Layout map

- `AppLayout`: responsive sidebar for protected pages.
- `AuthLayout`: shared logo/card for login and registration.
- `RegisterOfferPage`: page header, modal visibility, and success message.
- `OfferForm`: ordinary form fields and submission logic.
- `InputFormField`: label, validation message, and optional hint.
- `index.css`: shared `.form-input`, `.button-primary`, `.button-secondary` styles.

No universal form renderer, per-field configuration system, or extra global state library.

## Useful references

- [TanStack Query: queries](https://tanstack.com/query/latest/docs/framework/react/guides/queries)
- [TanStack Query: mutations](https://tanstack.com/query/latest/docs/framework/react/guides/mutations)
- [Invalidation after mutations](https://tanstack.com/query/latest/docs/framework/react/guides/invalidations-from-mutations)
- [React Hook Form: handleSubmit](https://react-hook-form.com/docs/useform/handlesubmit)

The most valuable interview exercise: demonstrate a failure, explain why it happens, fix it, and show a test that would catch it again.
