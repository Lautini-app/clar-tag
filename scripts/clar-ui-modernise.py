#!/usr/bin/env python3
"""Eng begrenzter Gestaltungs-Patch. Keine Daten-, Auth-, Abo- oder Ablaufänderung."""
from pathlib import Path
import hashlib
import json
import os
import re
import subprocess

APP = os.environ.get('GITHUB_REPOSITORY', '').rsplit('/', 1)[-1].removeprefix('clar-')
assert APP in {'tag', 'heim', 'markt', 'log'}, 'Unbekannte App'
assert subprocess.check_output(['git', 'branch', '--show-current'], text=True).strip() == 'design/clar-ui-modernisation', 'Nur auf dem Design-Branch ausführen'
PALETTES = {
 'tag': ('#2F9A68', '#24794F', '#E6F4EC', '#1D6843', '#76C89B', '#16392A'),
 'heim': ('#7A5CB0', '#7554A5', '#F0EAF8', '#5E418B', '#BCA1E1', '#332444'),
 'markt': ('#D4941A', '#946100', '#FBF0D8', '#785000', '#EAC16B', '#403219'),
 'log': ('#3D8BD4', '#276FAB', '#E7F1FC', '#215F92', '#88BFF0', '#1D324B'),
}
brand, primary, soft, deep, night, night_soft = PALETTES[APP]
CSS = '''/* clar: gemeinsame visuelle Ebene. Keine Elemente verstecken oder umsortieren.
   Status-, Countdown-, Händler-, Kategorien- und Diagrammfarben bleiben erhalten.
   Kräftigere Interaktionsfarben sichern die Lesbarkeit auf weissen Flächen. */
:root:root {
  --clar-app: BRAND;
  --clar-font: "Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --background: #F7F3EC;
  --foreground: #1B2A4A;
  --card: #FFFFFF;
  --card-foreground: #1B2A4A;
  --popover: #FFFFFF;
  --popover-foreground: #1B2A4A;
  --primary: PRIMARY;
  --primary-foreground: #FFFFFF;
  --primary-soft: SOFT;
  --primary-deep: DEEP;
  --secondary: SOFT;
  --secondary-foreground: DEEP;
  --muted: #F0ECE5;
  --muted-foreground: #626C7E;
  --accent: SOFT;
  --accent-foreground: DEEP;
  --border: #E5E0D8;
  --input: #BAC2CE;
  --ring: PRIMARY;
  --sidebar: #FFFFFF;
  --sidebar-foreground: #1B2A4A;
  --sidebar-primary: PRIMARY;
  --sidebar-primary-foreground: #FFFFFF;
  --sidebar-accent: SOFT;
  --sidebar-accent-foreground: DEEP;
  --sidebar-border: #E5E0D8;
  --sidebar-ring: PRIMARY;
  --clar-card-shadow: 0 2px 5px rgb(27 42 74 / 3%), 0 10px 26px rgb(27 42 74 / 5%);
}
DARK
body { font-family: var(--clar-font); -webkit-font-smoothing: antialiased; }
h1, h2, h3, h4, .font-display, .font-serif {
  font-family: var(--clar-font);
  letter-spacing: -0.025em;
}
:where(h1, h2, h3) { text-wrap: pretty; }
:where(button, input, select, textarea) { font-family: inherit; }
/* Bestehende Kartengeometrie und Bedienelemente bleiben erhalten. */
.bg-card[class*="rounded-"], [data-slot="card"], .clar-surface {
  box-shadow: var(--clar-card-shadow);
}
:where(input[type="checkbox"], input[type="radio"], input[type="range"]) { accent-color: var(--primary); }
:where(button, a, input, textarea, select, [role="slider"], [role="checkbox"]):focus-visible {
  outline: 2px solid var(--ring);
  outline-offset: 3px;
}
:where(nav) a.text-primary, :where(nav) button.text-primary {
  background-color: var(--primary-soft);
  border-radius: 0.85rem;
}
:where(svg.lucide) { stroke-width: 1.8; }
.clar-brand {
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.2rem 0.7rem;
  max-width: 100%;
  color: var(--foreground);
  font-family: var(--clar-font);
  vertical-align: middle;
}
.clar-brand-main { display: inline-flex; align-items: center; gap: 0.5rem; }
.clar-wordmark { font-size: 1.5rem; font-weight: 700; letter-spacing: -0.055em; line-height: 1.15; white-space: nowrap; }
.clar-brand-separator { color: var(--clar-app); }
.clar-brand-dots { width: 19px; height: 19px; flex: 0 0 19px; }
.clar-brand-byline { font-size: 0.75rem; font-weight: 400; color: var(--muted-foreground); letter-spacing: 0; line-height: 1.4; white-space: nowrap; }
.clar-brand-header { margin-bottom: 1.25rem; padding-bottom: 1rem; border-bottom: 1px solid var(--border); }
@media (forced-colors: active) {
  :where(button, a, input, textarea, select):focus-visible { outline-color: Highlight; }
}
'''
DARK = '''.dark.dark {
  --clar-app: NIGHT;
  --background: #141D2C;
  --foreground: #F2F4F8;
  --card: #1E2A3D;
  --card-foreground: #F2F4F8;
  --popover: #1E2A3D;
  --popover-foreground: #F2F4F8;
  --primary: NIGHT;
  --primary-foreground: #142033;
  --primary-soft: NIGHTSOFT;
  --primary-deep: NIGHT;
  --secondary: NIGHTSOFT;
  --secondary-foreground: #F2F4F8;
  --muted: #293549;
  --muted-foreground: #B2BDCE;
  --accent: NIGHTSOFT;
  --accent-foreground: #F2F4F8;
  --border: #3A475B;
  --input: #64748B;
  --ring: NIGHT;
  --sidebar: #1E2A3D;
  --sidebar-foreground: #F2F4F8;
  --sidebar-primary: NIGHT;
  --sidebar-primary-foreground: #142033;
  --sidebar-accent: NIGHTSOFT;
  --sidebar-accent-foreground: #F2F4F8;
  --sidebar-border: #3A475B;
  --sidebar-ring: NIGHT;
  --clar-card-shadow: 0 5px 20px rgb(0 0 0 / 15%);
}'''
# clar-log setzt schon heute class="dark", rendert aber absichtlich hell.
if APP == 'log':
 CSS = CSS.replace(':root:root {', ':root:root, .dark.dark {').replace('DARK', '')
else:
 CSS = CSS.replace('DARK', DARK)
for key, val in [('NIGHTSOFT', night_soft), ('NIGHT', night), ('BRAND', brand), ('PRIMARY', primary), ('SOFT', soft), ('DEEP', deep)]:
 CSS = CSS.replace(key, val)

COMPONENT = '''type ClarApp = "tag" | "heim" | "markt" | "log";

/** Reine Marken-Darstellung, ohne Zustand, Navigation oder Datenzugriff. */
export function ClarBrand({ app, className = "", showByline = true }: {
  app: ClarApp;
  className?: string;
  showByline?: boolean;
}) {
  return (
    <span className={`clar-brand ${className}`}>
      <span className="clar-brand-main">
        <span className="clar-wordmark">clar<span className="clar-brand-separator">·</span>{app}</span>
        <svg className="clar-brand-dots" viewBox="0 0 20 20" aria-hidden="true" focusable="false">
          <circle cx="5" cy="5" r="4" fill="#2F9A68" />
          <circle cx="15" cy="5" r="4" fill="#7A5CB0" />
          <circle cx="5" cy="15" r="4" fill="#D4941A" />
          <circle cx="15" cy="15" r="4" fill="#3D8BD4" />
        </svg>
      </span>
      {showByline && <span className="clar-brand-byline">by Lautini</span>}
    </span>
  );
}
'''
before = {str(p): p.read_bytes() for p in Path('src').rglob('*') if p.is_file()}
changed = {}
def write(path, content):
 p = Path(path)
 p.parent.mkdir(parents=True, exist_ok=True)
 p.write_text(content, encoding='utf-8')
 changed[str(p)] = content

def replace_once(path, old, new):
 t = Path(path).read_text(encoding='utf-8')
 assert t.count(old) == 1, f'{path}: Stelle nicht eindeutig. Abbruch ohne Push.'
 write(path, t.replace(old, new, 1))

def brand_import(path):
 write(path, 'import { ClarBrand } from "@/components/ClarBrand";\n' + Path(path).read_text(encoding='utf-8'))

write('src/clar-ui.css', CSS)
write('src/components/ClarBrand.tsx', COMPONENT)
replace_once('src/styles.css', '@import "tw-animate-css";', '@import "tw-animate-css";\n@import "./clar-ui.css";')

if APP == 'tag':
 path = 'src/routes/index.tsx'
 replace_once(path, '      <MemberSwitcher />', '      <div className="clar-brand-header"><ClarBrand app="tag" /></div>\n      <MemberSwitcher />')
 brand_import(path)
elif APP == 'heim':
 write('src/components/brand.tsx', '''import { ClarBrand } from "./ClarBrand";

export function Brand({ className }: { className?: string }) {
  return <ClarBrand app="heim" className={className} />;
}
''')
 old = Path('src/components/app-header.tsx').read_text(encoding='utf-8')
 assert '<header' in old and '/>' in old and 'onClick' not in old and len(old) < 400
 write('src/components/app-header.tsx', '''import { ClarBrand } from "./ClarBrand";

export function AppHeader() {
  return (
    <header
      className="mx-auto flex max-w-[480px] items-center justify-between px-5 pb-4"
      style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 16px)" }}
    >
      <ClarBrand app="heim" />
    </header>
  );
}
''')
 replace_once('src/components/clarheim-shell.tsx', '''style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}''', '''style={{ fontFamily: "var(--clar-font)" }}''')
 replace_once('src/components/clarheim-shell.tsx', '''style={{ backgroundColor: "#faf7f0", color: "#1a1a1a" }}''', '''style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}''')
 replace_once('src/components/clarheim-shell.tsx', '''style={{ color: "#6b6b6b" }}''', '''style={{ color: "var(--muted-foreground)" }}''')
 replace_once('src/routes/__root.tsx', 'background: "#2E5C3E",', 'background: "var(--primary)",')
elif APP == 'markt':
 path = 'src/routes/app.tsx'
 replace_once(path, '<span className="text-primary">Clar</span> Markt', '<ClarBrand app="markt" showByline={false} />')
 replace_once(path, 'radial-gradient(60% 60% at 50% 0%, var(--sage-soft), transparent 70%)', 'radial-gradient(60% 60% at 50% 0%, var(--primary-soft), transparent 70%)')
 brand_import(path)
else:
 path = 'src/routes/_authenticated.tsx'
 old = '''        <div className="mb-3 flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary/20 text-primary">
            <span className="text-sm font-bold">c.</span>
          </div>
          <span className="text-sm font-medium tracking-tight text-foreground">
            clar.<span className="text-muted-foreground">log</span>
          </span>
        </div>'''
 replace_once(path, old, '        <div className="clar-brand-header"><ClarBrand app="log" /></div>')
 brand_import(path)

for path, content in before.items():
 assert path in changed or Path(path).read_bytes() == content, f'Nicht erlaubte Änderung: {path}'
for path, new in changed.items():
 if path not in before or not path.endswith('.tsx'): continue
 old = before[path].decode('utf-8')
 for pattern in [r'\bon[A-Z]\w*\s*=', r'\buse(?:State|Effect|Memo|Callback|Ref)\b', r'\bsupabase\b', r'\b(?:navigate|redirect)\s*\(', r'\b(?:fetch|setItem|removeItem)\s*\(']:
  assert re.findall(pattern, old) == re.findall(pattern, new), f'Interaktions-/Datenmarker verändert: {path}'
report = {
 'app': APP, 'branch': 'design/clar-ui-modernisation',
 'changed_source_files': sorted(changed),
 'untouched_source_files': len(before) - sum(p in before for p in changed),
 'unchanged_logic_markers': True,
 'note': 'Statische Kontrolle, kein Ersatz für angemeldete End-to-End-Tests.',
 'source_hashes': {p: hashlib.sha256(Path(p).read_bytes()).hexdigest() for p in sorted(changed)},
}
Path('ui-refresh-report.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(json.dumps(report, ensure_ascii=False, indent=2))
