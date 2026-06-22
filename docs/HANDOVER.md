# clar · tag — Handover

Stand: Juni 2026. Übergabe an Emergent.

---

## 1. Stack

| Layer | Technologie |
|---|---|
| Frontend | React 19, TanStack Start 1.x (SSR + File-Based Routing), TanStack Router, TanStack Query |
| Styling | Tailwind CSS v4 (über `src/styles.css`, `@import` + `@theme`), shadcn/ui (Radix) |
| Build | Vite 7, Cloudflare Vite Plugin (Worker SSR), Wrangler |
| Backend | Supabase (Postgres + Auth + RLS) — projektintern "Lovable Cloud" genannt |
| Server-Code | `createServerFn` aus `@tanstack/react-start` (RPC); Server-Routes nur unter `src/routes/api/` für rohe HTTP-Endpunkte (Webhooks etc.) |
| Auth | Supabase E-Mail-OTP (Magic Link) + Supabase Anonymous Auth (für PIN-Pairing-Devices) |
| Sprache | Deutsch (UI), TypeScript strict |

### Wichtige Pakete
`@supabase/supabase-js`, `@tanstack/react-router`, `@tanstack/react-start`, `@tanstack/react-query`, `qrcode.react`, `zod`, `lucide-react`, `class-variance-authority`.

### Lokal starten
```bash
bun install
bun run dev      # vite dev
bun run build    # production
```

`.env`-Beispiel (NICHT im ZIP enthalten):
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
SUPABASE_URL=...
SUPABASE_PUBLISHABLE_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...        # nur server
CLAR_SERVICE_ROLE_KEY=...            # alias, von DSGVO-Delete-ServerFn genutzt
```

---

## 2. Repo-Struktur (Kurz)

```
src/
  routes/                 # File-based Routing (TanStack)
    __root.tsx            # Root-Layout, Auth-Listener, Embedded-Shell-Bridge
    index.tsx             # / Heute-Screen
    login.tsx             # Magic-Link Login + Link auf /verbinden
    verbinden.tsx         # PIN-Pairing für Kinder/Mitglieder (ssr: false)
    einstellungen.tsx     # Settings, Familie, Gefahrenzone
    onboarding.tsx
    routinen*.tsx, run.$workflowId.tsx, statistiken.tsx, ruhe*.tsx, entscheiden*.tsx
  components/
    AppShell.tsx, BottomNav.tsx, CountdownCard.tsx, RingTimer.tsx, ...
    family/MemberDialog.tsx           # PIN- & QR-Generation
    settings/DeleteAccountDialog.tsx  # DSGVO-Delete-Dialog (Texteingabe "LÖSCHEN")
  hooks/
    use-auth.ts, use-family.ts, use-settings.ts, use-member-status.ts
  lib/
    family.functions.ts          # ServerFns: getFamilyContext, upsert/remove Member,
                                 #            createPinInvite, claimPin, renameFamily
    account.functions.ts         # ServerFn: deleteMyAccount (DSGVO)
    user-workflows.functions.ts  # ServerFns für Routinen
    schedules.functions.ts, completions.functions.ts
    embedded-shell.ts            # Shell-Contract (siehe §5)
    storage.ts                   # localStorage-Keys, Stage/Toggle-Defaults
  integrations/supabase/
    client.ts                    # Browser-Client (publishable key)
    client.server.ts             # supabaseAdmin (service role, server-only)
    auth-middleware.ts           # requireSupabaseAuth für ServerFns
    auth-attacher.ts             # hängt Bearer-Token an ServerFn-Calls (global registriert)
    types.ts                     # generierte DB-Types
supabase/
  migrations/*.sql               # 5 Migrationen — Schema in §3
```

Alle App-Daten leben im Postgres-Schema **`clar_tag`** (Supabase Data API ist auf dieses Schema gemappt; `types.ts` reflektiert das).

---

## 3. Datenbank-Schema

### `profiles`
1:1 zu `auth.users`, automatisch via Trigger `on_auth_user_created` (Function `handle_new_user`) angelegt. Felder: `user_id`, `display_name`.

### `workflows` (Routinen)
- `id`, `user_id` → auth.users (ON DELETE CASCADE)
- `name`, `category`, `icon`, `steps jsonb`, `is_archived`
- RLS: owner-only (alle CRUD nur für `auth.uid() = user_id`)

### `workflow_schedules` (geplante Läufe)
- `user_id`, `workflow_id` (nullable, SET NULL), `workflow_key`, `scheduled_at`, `status ∈ {planned, done, skipped}`
- RLS: owner-only

### `workflow_completions` (Verlauf)
- `user_id`, `workflow_id`, `workflow_key`, `completed_at`
- RLS: owner-only

### Familien-Subsystem

| Tabelle | Zweck |
|---|---|
| `families` | 1 Eintrag pro Admin. `admin_user_id`, `name`. |
| `family_members` | Mitglieder. `family_id`, `user_id` (nullable — leer = noch nicht verbunden; gefüllt = anonyme oder echte Auth-User-ID), `name`, `emoji`, `stage` (enum `begleitet`/`unterstuetzt`/`selbststaendig`), `toggles jsonb`. `UNIQUE(user_id)`. |
| `family_invites` | PIN- oder Email-Einladungen. `member_id`, `kind` (`pin`/`email`), `pin_hash`, `expires_at`, `used_at`. |
| `family_member_status` | Live-Status (welcher Schritt läuft gerade) für Admin-Übersicht. |

RLS-Helper (`SECURITY DEFINER`):
- `is_family_admin(_family_id)` — true wenn `auth.uid()` der Family-Admin ist
- `is_family_member(_family_id)` — true wenn `auth.uid()` als Member verlinkt ist

Policies decken: Admin = full CRUD auf Family + Members + Invites; Member = read siblings + read/write own status.

### RPCs
- `create_pin_invite(_member_id uuid) RETURNS (pin text, expires_at timestamptz)` — Admin-only. Erzeugt 6-stelligen Zufalls-PIN, speichert `pin_hash` in `family_invites`, 24 h gültig.
- `claim_pin(_pin text) RETURNS (member_id, family_id, name)` — vom Kind-Gerät aufgerufen. Sucht ungenutzten, nicht-abgelaufenen Invite, setzt `family_members.user_id = auth.uid()`, markiert `used_at`.

### Migration-Reihenfolge
```
20260520073730_*  profiles + workflows + schedules
20260520073742_*  REVOKE auf interne Trigger-Funktionen
20260520100551_*  workflow_completions
20260521213539_*  Familien-Subsystem (Tabellen + RLS + Policies)
20260521213758_*  RPCs create_pin_invite / claim_pin
```

---

## 4. Auth-Flow

### 4.1 Admin / Eltern — Magic Link
1. `/login` → `supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: origin + '/', shouldCreateUser: true } })`
2. User klickt Link in Mail → Redirect auf `/` → `onAuthStateChange('SIGNED_IN')` im `__root.tsx`.
3. ServerFns mit `.middleware([requireSupabaseAuth])` lesen Bearer-Token (via `auth-attacher`, global in `src/start.ts` als `functionMiddleware` registriert).
4. Geschützte Routen liegen nicht unter `_authenticated/` — Schutz erfolgt auf ServerFn-Ebene (`requireSupabaseAuth`) + Client-Redirect im `AppShell` wenn keine Session.

### 4.2 Kinder-Gerät — Anonymous + PIN
Siehe §5 (PIN-Pairing).

### 4.3 DSGVO-Löschung
`einstellungen.tsx` → "Gefahrenzone" → `DeleteAccountDialog` (User tippt "LÖSCHEN") → ServerFn `deleteMyAccount` (`account.functions.ts`):

1. Caller-Family laden (`admin_user_id = caller`)
2. Alle `family_members` einsammeln, davon `member_ids` + alle `user_id`s ≠ caller
3. Löschen FK-Reihenfolge: `family_member_status` → `family_invites` → `family_members` → `families`
4. Eigene Daten: `workflow_completions`, `workflow_schedules`, `workflows`, `profiles`
5. Für jeden ehemaligen `member.user_id`: `auth.admin.getUserById` → nur falls `is_anonymous`: `auth.admin.deleteUser` (echte Accounts werden bewusst nicht angefasst)
6. `auth.admin.deleteUser(caller)`

Service-Role-Key dafür: **`CLAR_SERVICE_ROLE_KEY`** (separater Secret, NICHT `SUPABASE_SERVICE_ROLE_KEY`).

---

## 5. Embedded-Shell-Contract

Quelle: `src/lib/embedded-shell.ts`. Initialisiert in `src/routes/__root.tsx` via `initEmbeddedShellBridge(supabase)`.

### Detection (eines von)
- URL-Query `?clar_embedded=1`
- `window.ReactNativeWebView` (React-Native-WebView)
- `window.clarShell` (Web-Shell injiziert das)

Im Browser-Standalone-Modus ist der Bridge ein No-Op.

### Envelope
```ts
{ type: string; payload?: unknown }   // type beginnt immer mit "clar:"
```

### Shell → App (inbound, via `window.message`)
| type | payload | Verhalten |
|---|---|---|
| `clar:session` | `{ access_token, refresh_token }` | `supabase.auth.setSession(...)` |
| `clar:signout` | — | `supabase.auth.signOut()` |

### App → Shell (outbound, via `ReactNativeWebView.postMessage` / `clarShell.postMessage` / `parent.postMessage`)
| type | payload | Wann |
|---|---|---|
| `clar:ready` | — | Bridge installiert, auch nach erfolgreichem PIN-Claim |
| `clar:needs-session` | — | Boot, keine Supabase-Session vorhanden |
| `clar:signed-in` | `{ userId }` | `onAuthStateChange('SIGNED_IN')` oder Boot mit Session |
| `clar:signed-out` | — | `onAuthStateChange('SIGNED_OUT')` |

Symmetrisch zum bestehenden `clar.log`-Contract.

---

## 6. PIN-Pairing-Flow

Ziel: Kinder/Mitglieder ohne eigenes E-Mail-Konto bekommen ein gepairtes Gerät, das via anonymem Auth-User auf die Familie zugreift.

### 6.1 Admin erzeugt PIN
1. `Einstellungen` → "Mitglied hinzufügen" → `MemberDialog` (`src/components/family/MemberDialog.tsx`)
2. Mitglied speichern → automatisch in `ConnectView` → ServerFn `createPinInvite({ memberId })`
3. RPC `clar_tag.create_pin_invite(member_id)` liefert 6-stelligen PIN + `expires_at` (24 h, 1× einlösbar).
4. Anzeige: großer PIN + QR-Code (`qrcode.react`) mit URL `/verbinden?pin=NNNNNN`.

### 6.2 Kind-Gerät löst PIN ein
1. `/verbinden` (Route ist **`ssr: false`** + öffentlich, da anonyme Session lokal erzeugt wird).
2. Falls keine Session: `supabase.auth.signInAnonymously()` (kurzes Settle-Delay damit Token am Client gesetzt ist).
3. ServerFn `claimPin({ pin })` → RPC `clar_tag.claim_pin(_pin)` → setzt `family_members.user_id = auth.uid()`, markiert Invite als verbraucht.
4. Client: `lsSet(KEYS.onboarding, true)` + `lsSet(KEYS.activeMember, memberId)` (dieses Gerät vertritt genau dieses Mitglied → kein Admin-Switcher).
5. `queryClient.invalidateQueries(['family-context'])`
6. `signalShellReady()` → Shell weiß: Pairing fertig.
7. `navigate({ to: '/' })`

### 6.3 Auto-Submit bei QR-Scan
`/verbinden?pin=123456` → `useEffect` validiert + submitted automatisch. Kind muss nichts tippen.

### 6.4 Regeln
- 1 PIN = 1 Gerät = 1 Mitglied. Nach `claim_pin` ist der Invite verbraucht.
- 24 h gültig (in RPC erzwungen).
- Member sieht im UI nur sich selbst (forcierter `activeId = selfMemberId` in `use-family.ts`).
- Anonyme User werden bei DSGVO-Delete des Admins mitgelöscht (siehe §4.3).

---

## 7. Konventionen / Wichtige Stellen

- **Tokens, keine Hex-Farben in Components.** Alle Farben/Schatten/Gradients in `src/styles.css` als `oklch()`-Variablen.
- **Sprache:** UI immer Deutsch (auch Fehlermeldungen).
- **ServerFn-Imports:** `*.functions.ts` werden vom Client importiert; `client.server.ts` darf dort NUR per `await import(...)` innerhalb `.handler()` geladen werden (sonst leakt das Modul in den Client-Bundle). Bereits in `account.functions.ts` so umgesetzt.
- **RLS:** alle App-Tabellen RLS-aktiv. Service-Role-Operationen (Anon-User-Löschung etc.) ausschließlich über ServerFns mit `requireSupabaseAuth` + Caller-Validierung.
- **`auth-attacher`** ist in `src/start.ts` als `functionMiddleware` angehängt — niemals ersetzen, nur ergänzen.

---

## 8. Offene Punkte / TODO

1. **E-Mail-Invites** (`family_invites.kind = 'email'`) — Schema existiert, kein Flow implementiert.
2. **PIN-Rotation / Sperren** — manuelles "Neu-Pairing" eines Geräts hätte UI-Hinweis verdient (aktuell: einfach neuen PIN erzeugen, alten verfallen lassen).
3. **Realtime Member-Status** — `family_member_status` wird gelesen, aber kein Supabase-Realtime-Channel; Admin-Übersicht pollt via React Query.
4. **i18n-Infrastruktur** — alle Strings sind hartkodiert deutsch. Bei späterer FR/EN-Lokalisierung Refactor nötig.
5. **Onboarding für Member-Gerät** nach PIN-Claim: aktuell übersprungen (`KEYS.onboarding = true`). Eventuell kurzer Welcome-Screen sinnvoll.
6. **Tests** — keine Unit-/E2E-Tests im Repo. Für Emergent empfohlen: Vitest + Playwright auf `claim_pin`-RPC und `deleteMyAccount`-ServerFn.
7. **PWA / Offline** — `public/manifest.webmanifest` existiert, kein Service-Worker. Für stabile mobile Nutzung lohnt Vite-PWA-Plugin.
8. **Apple/Google Social Login** — nicht aktiviert. Bei Bedarf via Lovable `lovable.auth.signInWithOAuth('google'|'apple')` und Provider-Konfiguration in Supabase Auth.
9. **Rate-Limiting** auf `claim_pin` / `create_pin_invite` aktuell nicht enforced — Brute-Force auf 6-stelligen PINs wäre theoretisch möglich. Empfehlung: SQL-Counter pro IP/User mit Lockout.

---

## 9. Kontakt-Hooks

- Supabase-Projekt-ID: siehe `.lovable/project.json` / `wrangler.jsonc`.
- Cloudflare Worker Deploy: `bun run build` → `wrangler.jsonc`.
- Lovable Preview: `https://id-preview--<project-id>.lovable.app`.
