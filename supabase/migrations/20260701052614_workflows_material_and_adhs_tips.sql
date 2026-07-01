-- =========================
-- workflows: material + adhs_tips
-- Damit importierte Bibliotheks-Routinen ihre Material-Liste und die
-- ADHS-Stolperfallen-Notiz behalten. Bestehende Zeilen kriegen ein leeres
-- Material-Array; adhs_tips bleibt für sie NULL.
-- =========================

ALTER TABLE clar_tag.workflows
  ADD COLUMN IF NOT EXISTS material JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS adhs_tips TEXT;
