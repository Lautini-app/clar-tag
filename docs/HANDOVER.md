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
| Auth | Supabase-Session aus `access_token` + `refresh_token` von `home.lautini.ch` |
| Sprache | Deutsch (UI), TypeScript strict |

### Wichtige Pakete
`@supabase/supabase-js`, `@tanstack/react-router`, `@tanstack/react-start`, `@tanstack/react-query`, `zod`, `lucide-react`, `class-variance-authority`.

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
    einstellungen.tsx     # Settings, Familie, Gefahrenzone
    onboarding.tsx
    routinen*.tsx, run.$workflowId.tsx, statistiken.tsx, ruhe*.tsx, entscheiden*.tsx
  components/
    AppShell.tsx, BottomNav.tsx, CountdownCard.tsx, RingTimer.tsx, ...
    family/MemberDialog.tsx           # Familienmitglieder bearbeiten
    settings/DeleteAccountDialog.tsx  # DSGVO-Delete-Dialog (Texteingabe "LÖSCHEN")
  hooks/
    use-auth.ts, use-family.ts, use-settings.ts, use-member-status.ts
  lib/
    family.functions.ts          # ServerFns: getFamilyContext, upsert/remove Member, renameFamily
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
| `family_invites` | Legacy-Einladungen aus früherem Pairing-Flow. Wird von der App aktuell nicht verwendet. |
| `family_member_status` | Live-Status (welcher Schritt läuft gerade) für Admin-Übersicht. |

RLS-Helper (`SECURITY DEFINER`):
- `is_family_admin(_family_id)` — true wenn `auth.uid()` der Family-Admin ist
- `is_family_member(_family_id)` — true wenn `auth.uid()` als Member verlinkt ist

Policies decken: Admin = full CRUD auf Family + Members + Invites; Member = read siblings + read/write own status.

### RPCs
Die DB enthält noch Legacy-RPCs für den früheren PIN-Pairing-Flow; die App ruft sie nicht mehr auf.

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

### 4.1 Token-Start über clar by lautini
1. `home.lautini.ch` öffnet die App mit URL-Parametern `access_token` und `refresh_token`.
2. `src/hooks/use-auth.ts` liest diese Parameter beim Boot, ruft `supabase.auth.setSession(...)` auf und entfernt die Token danach aus der Adresszeile.
3. Ohne aktive Session zeigt `AppShell` ausschließlich: `Bitte öffne die App über clar by lautini`.
4. Es gibt keine App-eigene Login-, Passwort-Reset- oder PIN-Verbindungsoberfläche.
5. ServerFns mit `.middleware([requireSupabaseAuth])` lesen Bearer-Token (via `auth-attacher`, global in `src/start.ts` als `functionMiddleware` registriert).

### 4.2 DSGVO-Löschung
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
| `clar:ready` | — | Bridge installiert |
| `clar:needs-session` | — | Boot, keine Supabase-Session vorhanden |
| `clar:signed-in` | `{ userId }` | `onAuthStateChange('SIGNED_IN')` oder Boot mit Session |
| `clar:signed-out` | — | `onAuthStateChange('SIGNED_OUT')` |

Symmetrisch zum bestehenden `clar.log`-Contract.

---

## 6. Launch-Vertrag

- Die App wird von **clar by lautini** (`home.lautini.ch`) geöffnet.
- Erwartete URL-Parameter: `access_token` und `refresh_token`.
- Ohne Token/Session rendert die App nur den Hinweis `Bitte öffne die App über clar by lautini`.
- Entfernte App-Oberflächen: `/login`, `/verbinden`, E-Mail/Passwort-Login, Passwort-Recovery, PIN-Eingabe, PIN-/QR-Erzeugung.
- Member sieht im UI nur sich selbst (forcierter `activeId = selfMemberId` in `use-family.ts`), sobald die Session von clar by lautini die entsprechende Family-Zuordnung liefert.

---

## 7. Konventionen / Wichtige Stellen

- **Tokens, keine Hex-Farben in Components.** Alle Farben/Schatten/Gradients in `src/styles.css` als `oklch()`-Variablen.
- **Sprache:** UI immer Deutsch (auch Fehlermeldungen).
- **ServerFn-Imports:** `*.functions.ts` werden vom Client importiert; `client.server.ts` darf dort NUR per `await import(...)` innerhalb `.handler()` geladen werden (sonst leakt das Modul in den Client-Bundle). Bereits in `account.functions.ts` so umgesetzt.
- **RLS:** alle App-Tabellen RLS-aktiv. Service-Role-Operationen (Anon-User-Löschung etc.) ausschließlich über ServerFns mit `requireSupabaseAuth` + Caller-Validierung.
- **`auth-attacher`** ist in `src/start.ts` als `functionMiddleware` angehängt — niemals ersetzen, nur ergänzen.

---

## 8. Offene Punkte / TODO

1. **Legacy-Invite-Schema** — `family_invites` und PIN-RPCs existieren noch in Migrationen/DB-Types, werden von der App aber nicht mehr genutzt.
2. **Realtime Member-Status** — `family_member_status` wird gelesen, aber kein Supabase-Realtime-Channel; Admin-Übersicht pollt via React Query.
3. **i18n-Infrastruktur** — alle Strings sind hartkodiert deutsch. Bei späterer FR/EN-Lokalisierung Refactor nötig.
4. **Tests** — keine Unit-/E2E-Tests im Repo. Für Emergent empfohlen: Vitest + Playwright auf Token-Bootstrap und `deleteMyAccount`-ServerFn.
5. **PWA / Offline** — `public/manifest.webmanifest` existiert, kein Service-Worker. Für stabile mobile Nutzung lohnt Vite-PWA-Plugin.

---

## 9. Kontakt-Hooks

- Supabase-Projekt-ID: siehe `.lovable/project.json` / `wrangler.jsonc`.
- Cloudflare Worker Deploy: `bun run build` → `wrangler.jsonc`.
- Lovable Preview: `https://id-preview--<project-id>.lovable.app`.
