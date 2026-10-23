# Account Deletion and Multi-Provider Auth Security Report

**Date:** 2026-10-23 (updated; supersedes the earlier same-day version, whose findings are kept below)
**Scope:** RemoteSEA Web + API: source review, a new database-backed integration suite, unit tests, and typecheck/lint/build.
**Policy applied:** PB20 says deletion is permanent and irreversible, removes all personal data, revokes sessions, and redirects to the home page. PB04 §4.3 says an OAuth sign-in with an unknown email creates a new account. The product owner confirmed that signing in again after deletion may create a **fresh** account: new user ID and no inherited data. No tombstone, email blacklist or hashed identity may be kept. So "the deleted account must not come back" means: the old ID, its data, its identities and anything issued to it must never work again. It does not mean the email address is blocked from signing up again.

## 1. Root cause (proven)

The reported symptom was that a user deleted their account and then signed in with another provider. The investigation established the following:

1. **The deleted account is not restored.** `DELETE /users/me` hard-deletes the `users` row. `accounts` (OAuth identities), `sessions` and all profile data cascade. On a real PostgreSQL database, all 16 combinations of (method before deletion) × (method after deletion) were run. Each one produced either `401 INVALID_CREDENTIALS` (old password) or a **new** user ID with none of the old data. When a provider signs in again after deletion, it is a new signup under PB04 §4.3, not a recovery. This is the most likely explanation of the reported symptom, and it is the behaviour the policy accepts.
2. **Defect found and fixed: password-reset tokens survived deletion.** `verification_tokens` has no foreign key to `users`. Reset tokens are keyed only by email, so the cascade did not reach them. The effects were:
   - The deleted user's email stayed in the database. This violates PB20.
   - A reset link requested before deletion still worked afterwards. If the same email later signed up again (for example through Google OAuth), the old link set a password on the **new** account. This was reproduced on the database: `POST /auth/reset-password` returned **200** and the new OAuth-only account got a password. The window is the token TTL (1 hour).
3. **Frontend defect fixed: wrong landing page after deletion.** After a successful delete, `logout()` ran while the user was still on `/settings`. `ProtectedRoute` then sent them to `/login?callbackUrl=/settings`. PB20 requires the home page, and the callback pointed into a private page of an account that no longer exists.
4. **Frontend defect fixed: double submit.** TanStack Query sets `isPending` asynchronously, so two quick submits both passed the `!pending` check and sent **two** `DELETE` requests. The test failed against the old component with "called 2 times". The second request is rejected by the backend, but it showed an error toast on top of a successful deletion.
5. **Fixed earlier the same day and kept:** logout did not clear private TanStack Query data from memory. It now clears it, and other tabs are told to log out too.

None of the other hypotheses in the brief had supporting evidence. Details are in §7.

## 2. Reproduction of the original scenario

On the isolated local database (see §9), using the real HTTP routes:

1. Register `E` with a password, or sign in through `GET /auth/google/callback` followed by `POST /auth/oauth/exchange`.
2. `DELETE /users/me` with `{ confirmation: "DELETE", password }` returns `200 { success: true }`.
3. Sign in through `GET /auth/github/callback` (or Google, LinkedIn or the same provider) with verified email `E`. This returns `302 /auth/callback?code=…`, and the exchange returns `200` with a session.
4. The session belongs to a **new** user ID. The old ID, its sessions, OAuth identities, notifications and talent profile all have 0 rows.

So "I can still sign in" is reproducible, but what the user signs into is a new, empty account. Under the confirmed policy this is expected behaviour. The real defect in this area was the surviving reset token in §1.2. Before the fix, it let a pre-deletion credential act on the account created at step 3.

## 3. Supported sign-in methods

| Method                | Status             | Notes                                                 |
| --------------------- | ------------------ | ----------------------------------------------------- |
| Email/password        | Supported          | Emails are lowercased and trimmed (zod `emailSchema`) |
| Google OAuth          | Supported          | Requires `email_verified`                             |
| GitHub OAuth          | Supported          | Requires a verified email (primary first)             |
| LinkedIn OAuth (OIDC) | Supported          | Requires `email_verified`                             |
| TOTP 2FA              | Second factor only | Challenge token is tied to the user ID                |

No other provider exists in the codebase. There is **no refresh-token flow**. Access tokens are JWTs carrying a `sid`, and every request checks that `sessions` row (`JwtStrategy.validate`, `AuthService.verifySession`).

## 4. Flows

**OAuth sign-in:** provider → passport strategy (verified email required) → `GET /auth/:provider/callback` → link intent in `state`? If yes, link the provider to that user. If no, run `findOrCreateOAuthUser`: look up by `(provider, providerAccountId)`; otherwise upsert the user by verified email and upsert the `accounts` row. → a 60-second exchange code is placed in the redirect → `POST /auth/oauth/exchange` checks that the user still exists, then creates a `sessions` row and returns a JWT with `sid`.

**Deletion:** `DELETE /users/me` (JWT + session check, TALENT/EMPLOYER role, rate limit) → zod check that the confirmation is `DELETE` → current password check if the account has one → reject if there are active job postings or team obligations (409) → **one transaction:** delete the user, which cascades to accounts, sessions and profiles, and **delete that email's reset tokens** (new) → best-effort S3 cleanup of resume and logo → `200`. The web client calls the endpoint and acts only on success: it navigates to `/` (new), then `logout()` clears the token, private query cache and session, and signals other tabs.

## 5. Test results

### 5.1 New DB-backed integration suite: `remotesea-api/test/account-deletion.integration.test.ts`

These tests use the real Nest app, guards, controllers, Prisma and PostgreSQL 14. Email sending and rate limiting are stubbed. **Only the provider handshake** of the three OAuth guards is stubbed: the stub gives the real callback route the profile the strategy would return after its verified-email check.

| ID            | Case                                                                                                                                                                                                                                                                                                                                                               | Result                           |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------- |
| AD-MATRIX ×16 | {password, google, github, linkedin} before × same set after: old ID gone (user, sessions, accounts, notifications, profile = 0); old token rejected on `/auth/me`, `/users/me/account`, `/users/me/export`, `/users/me/sessions`, `PATCH /users/me`, `DELETE /users/me`, `/auth/session`; old password → 401; any new sign-in → **new ID with no inherited data** | **PASS 16/16**                   |
| AD-MULTI      | Password + Google + GitHub + LinkedIn linked, second device signed in → delete → all 3 identity rows and both sessions gone; re-entry through each provider gives one shared fresh ID                                                                                                                                                                              | PASS                             |
| AD-OTHER      | Deleting user A leaves user B (different email and provider) unchanged: same ID, data and sessions                                                                                                                                                                                                                                                                 | PASS                             |
| AD-STALE-01   | Unredeemed OAuth exchange code issued before deletion → 401 `INVALID_OAUTH_EXCHANGE_CODE`, no session                                                                                                                                                                                                                                                              | PASS                             |
| AD-STALE-02   | Pending 2FA challenge token → 401 `INVALID_CHALLENGE_TOKEN`                                                                                                                                                                                                                                                                                                        | PASS                             |
| AD-STALE-03   | Settings "Connect" link intent minted before deletion → redirect `connectionError`, no `accounts` row created                                                                                                                                                                                                                                                      | PASS                             |
| AD-STALE-04   | Reset link requested before deletion: token row purged; cannot set a password on a later fresh account (400)                                                                                                                                                                                                                                                       | **FAIL before fix → PASS after** |
| AD-AUTHZ-01   | No token or invalid token → 401                                                                                                                                                                                                                                                                                                                                    | PASS                             |
| AD-AUTHZ-02   | Wrong password (400 `CURRENT_PASSWORD_INCORRECT`), missing or lowercase confirmation (400) → account, identities and session unchanged                                                                                                                                                                                                                             | PASS                             |
| AD-AUTHZ-03   | A token can delete only its own account                                                                                                                                                                                                                                                                                                                            | PASS                             |
| AD-ROLLBACK   | Deletion blocked by an active job → 409; user, session and reset token all unchanged                                                                                                                                                                                                                                                                               | PASS                             |
| AD-RACE-01    | Two concurrent deletes: exactly one 200, no 5xx, account gone                                                                                                                                                                                                                                                                                                      | PASS                             |
| AD-RACE-02 ×2 | Six password or Google sign-ins racing the delete: no session remains on the deleted ID (the FK on `sessions.userId` makes this impossible); any token that survived the race belongs to a new ID or gets 401                                                                                                                                                      | PASS 2/2                         |

**Total: 29/29 PASS after the fix (28/29 before; only AD-STALE-04 failed).**

### 5.2 Unit tests

| Suite                                                                                                                                                       | Result     |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| API `users.repository.spec.ts`: `deleteUser` purges reset tokens in the same transaction; no purge if the delete fails                                      | PASS (new) |
| Web `DeleteAccountButton.test.tsx`: confirm/cancel (earlier), **single request on double submit** (fails on old code), **form stays open on backend error** | PASS 4/4   |
| Web `users.queries.test.tsx`: logout plus **navigation to `/` (replace)** only after backend success; neither happens on failure                            | PASS 2/2   |
| Earlier the same day: `AuthContext.test.tsx`, `users.repository.test.ts`, API `jwt.strategy.spec.ts`, `auth.service.spec.ts`, `auth.repository.spec.ts`     | PASS       |

### 5.3 Regression

| Command                                        | Result                                                                      |
| ---------------------------------------------- | --------------------------------------------------------------------------- |
| API `npm test -- --runInBand`                  | PASS: 89 suites, **852** tests (was 850)                                    |
| API `npm run lint` / `format:check` / `build`  | PASS / PASS / PASS                                                          |
| API deletion integration suite                 | PASS 29/29                                                                  |
| Web `npm test`                                 | PASS: 59 files, **337** tests (was 335)                                     |
| Web `type-check` / `format:check` / `build`    | PASS / PASS / PASS                                                          |
| Web `lint`                                     | 0 errors, 23 warnings (unchanged; none in touched files)                    |
| API `test/sprint3.integration.test.ts`         | NOT RUN (needs its own `remotesea_s3_*` database; unrelated to this change) |
| Real Google/GitHub/LinkedIn consent + callback | **BLOCKED**: no test OAuth apps or test provider accounts available         |
| Browser E2E (Playwright) of the delete UI      | NOT RUN: covered by component and hook tests only                           |

## 6. Files changed

**Backend (`remotesea-api`)**

- `src/modules/users/users.repository.ts`: `deleteUser` now runs in a transaction that deletes the user and then `verificationToken.deleteMany({ identifier: email })`.
- `src/modules/users/users.repository.spec.ts`: 2 tests.
- `test/account-deletion.integration.test.ts` and `jest-account-deletion.config.cjs`: new suite. It refuses to run unless `ACCOUNT_DELETION_TEST_DATABASE_URL` points to a localhost `remotesea_authdel_*` database, and it checks `current_database()` before running.
- Earlier the same day (tests only): `auth.repository.spec.ts`, `auth.service.spec.ts`, `strategies/jwt.strategy.spec.ts`.

**Frontend (`remotesea-web`)**

- `src/features/users/users.queries.ts`: `useDeleteMyAccount` navigates to `ROUTES.home` (replace) in the same tick as `logout()`.
- `src/features/settings/components/DeleteAccountButton.tsx`: synchronous in-flight ref guard.
- Tests: `DeleteAccountButton.test.tsx`, `users.queries.test.tsx`.
- Earlier the same day: `src/contexts/AuthContext.tsx` (+ test), which clears private query cache on logout and 401, and signals logout across tabs.

**Database:** none.

## 7. Migration

No schema change or migration. The cascades on `accounts` and `sessions` were already correct. The token purge is application logic inside a transaction. A foreign key from `verification_tokens` to `users` was rejected because the table is keyed by email, not by user ID.

## 8. Sessions and refresh tokens

- After deletion, every `sessions` row for the user is gone, so every previously issued JWT is rejected with 401 on every protected route tested, and `GET /auth/session` returns `user: null`. This was verified on all 16 matrix rows plus a second device in AD-MULTI.
- There is no refresh-token endpoint or flow. The `accounts.refresh_token`/`access_token` columns are never written by the current code, and they cascade anyway.
- A sign-in racing a delete cannot leave a session on the deleted ID. `createSession` fails on the foreign key and the transaction ordering guarantees it (AD-RACE-02).

## 9. Signing in with a different provider after deletion

| Before \ After | Password                               | Google        | GitHub        | LinkedIn      |
| -------------- | -------------------------------------- | ------------- | ------------- | ------------- |
| Password       | 401 + fresh registration allowed       | Fresh account | Fresh account | Fresh account |
| Google         | 401 (no password) + fresh registration | Fresh account | Fresh account | Fresh account |
| GitHub         | same as above                          | Fresh account | Fresh account | Fresh account |
| LinkedIn       | same as above                          | Fresh account | Fresh account | Fresh account |

"Fresh account" means a new ID with 0 inherited rows, and the old token stays rejected. Every cell is PASS on the database with the provider handshake stubbed. A provider profile with a missing or unverified email is rejected by the strategy before any lookup (existing `oauth-strategy-validation.spec.ts`). A different email produces a separate, unrelated account (AD-OTHER).

## 10. Environment limits

- The local `.env` points to a **remote Supabase database**. Nothing destructive was run against it. All database-backed tests used a throwaway PostgreSQL 14 instance on `127.0.0.1:55432` in a temporary directory.
- `prisma migrate deploy` **does not replay on an empty database**: it fails with `index "jobs_search_vector_idx" does not exist`. The test database was therefore built with `prisma db push` from the current schema. This is a pre-existing problem in the migration history, and it means migration-based tests cannot run from scratch.
- No OAuth test apps or test provider accounts were available, so no real provider round trip was run.

## 11. Remaining risks

1. **Real-provider E2E is still open.** Run the matrix in §9 on staging with Google, GitHub and LinkedIn test apps.
2. **Uppercase emails from before normalization was added.** New rows are lowercase. If old rows contain uppercase emails, an OAuth login (lowercased) would create a second account next to the old one. Deleting one would then leave the other able to sign in, which looks exactly like the reported bug. Recommended read-only check on the real database: `SELECT count(*) FROM users WHERE email <> lower(trim(email));`. This was **not** run here.
3. **Other email-keyed rows are kept by design.** `team_invitations.email` (owned by the inviting company) and `admin_audit_log.adminEmail` (admins cannot self-delete through this route) remain. If PB20 is read strictly ("all personal data"), legal/product should confirm that keeping these is acceptable.
4. **S3 cleanup is best-effort** and runs after commit. Failures are only logged, so files can be orphaned.
5. **Cached public pages:** job and employer lists use an in-memory TTL cache, so a deleted employer's public data can stay visible until the TTL expires. Talent and session data are not cached.
6. **An OAuth link intent stays valid for 10 minutes** after deletion. It is harmless: linking fails on the foreign key and no row is created (AD-STALE-03). It just redirects with `reason=unknown` rather than a specific message.

## Conclusion

Under the confirmed policy, the reported scenario does not restore the deleted account. Every later sign-in, by any provider, is a new account with a new ID and no inherited data. Every token and session issued to the deleted account is rejected by the backend. This is shown on a real database across the full provider matrix, multi-provider accounts, stale codes and links, and races.

One real backend defect was found and fixed: password-reset tokens survived deletion and could set a password on a later account with the same email. Two frontend defects were also fixed: the wrong landing page after deletion and a double `DELETE` request. All three have regression tests that failed before the fix. The real OAuth-provider round trip is still unverified (BLOCKED).
