-- =========================
-- library_routines
-- Kuratierte Bibliothek von Routinen mit drei Feinheitsgraden,
-- Material-Listen, Varianten und ADHS-Stolperfallen-Hinweisen.
-- Lesbar für alle authentifizierten Nutzer; nur das Service-Role
-- darf via Seed-Skript einfügen/ändern.
--
-- HINWEIS: Diese Migration zielt auf das `clar_tag`-Schema (das die
-- Runtime laut auth-middleware.ts ansteuert). Sollten frühere
-- Migrationen Tabellen im `public`-Schema angelegt haben, ergänze
-- die Tabellennamen entsprechend.
-- =========================

CREATE SCHEMA IF NOT EXISTS clar_tag;

-- Timestamp-Trigger im clar_tag-Schema bereitstellen (idempotent),
-- damit die Migration unabhängig davon läuft, ob `public.update_updated_at_column`
-- bereits existiert.
CREATE OR REPLACE FUNCTION clar_tag.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = clar_tag, public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TABLE clar_tag.library_routines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  category TEXT NOT NULL,
  default_grade TEXT NOT NULL DEFAULT 'mittel'
    CHECK (default_grade IN ('grob','mittel','fein')),
  steps_grob JSONB NOT NULL DEFAULT '[]'::jsonb,
  steps_mittel JSONB NOT NULL DEFAULT '[]'::jsonb,
  steps_fein JSONB NOT NULL DEFAULT '[]'::jsonb,
  material JSONB NOT NULL DEFAULT '[]'::jsonb,
  adhs_tips TEXT,
  variants JSONB,
  is_published BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_library_routines_category
  ON clar_tag.library_routines(category, sort_order)
  WHERE is_published = true;

ALTER TABLE clar_tag.library_routines ENABLE ROW LEVEL SECURITY;

-- Alle authentifizierten Nutzer dürfen veröffentlichte Routinen lesen.
CREATE POLICY "Library routines readable" ON clar_tag.library_routines
  FOR SELECT TO authenticated USING (is_published = true);

-- Schreibzugriff ausschliesslich über Service-Role (keine RLS-Policy für INSERT/UPDATE/DELETE).
-- Das Seed-Skript arbeitet mit dem Service-Role-Key, Nutzer-Sessions können keine Einträge ändern.

CREATE TRIGGER trg_library_routines_updated_at
  BEFORE UPDATE ON clar_tag.library_routines
  FOR EACH ROW EXECUTE FUNCTION clar_tag.update_updated_at_column();
