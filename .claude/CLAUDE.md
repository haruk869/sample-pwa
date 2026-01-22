# sample-pwa

PWA sample app (Next.js). GitHub Pages: https://haruk869.github.io/sample-pwa/

---

# Base rules

- Response/docs: Japanese (follow original language if non-Japanese)
- .claude/ content: English, minimal, no decoration. Add notes only when ambiguous
- Plans, skills: .claude/ (in repo)
- No write outside repo without confirmation

---

# This repo only

## Structure
- `/` - Unified page (PC: download / mobile: app + sheet)
- PWA: manifest.json, sw.js, icons, screenshots

## Skill set
vercel-react-best-practices applied

## PWA notes

### manifest.json

#### icons purpose
- `"purpose": "any maskable"` is deprecated
- Define `any` and `maskable` as separate entries
```json
{ "src": "icon.png", "purpose": "any" },
{ "src": "icon.png", "purpose": "maskable" }
```

#### screenshots (for PC install UI)
- PC Chrome rich install UI requires `form_factor: "wide"` screenshot
- Mobile uses `form_factor: "narrow"`
```json
"screenshots": [
  { "src": "desktop.png", "sizes": "1280x720", "form_factor": "wide" },
  { "src": "mobile.png", "sizes": "390x844", "form_factor": "narrow" }
]
```

### beforeinstallprompt event

#### Trigger conditions (Chrome)
- HTTPS
- Valid manifest.json
- Service Worker registered
- Not installed (browser remembers)
- Engagement requirements met

#### Reset install state
- Clear site data alone is insufficient
- Chrome: address bar → site settings → uninstall
- Or uninstall from chrome://apps

### iOS limitations

#### beforeinstallprompt not supported
- Safari does not support `beforeinstallprompt`
- One-button install not possible
- Need to guide "Share → Add to Home Screen"

#### iOS version detection
```javascript
const match = navigator.userAgent.match(/OS (\d+)_/);
const version = match ? parseInt(match[1], 10) : null;
```
- iOS 26+: add from "•••" menu (bottom right)
- iOS <26: add from share button (bottom)

### Service Worker

#### Cache targets
- Cache JS/CSS assets (`_next/static/`) not just HTML
- Causes offline failure on second launch otherwise

#### Cache strategy
- stale-while-revalidate recommended
- Return cache immediately, update in background

### Next.js + GitHub Pages

#### basePath setting
- Set `basePath: "/repo-name"` in `next.config.ts`
- Avoid hardcoded `href="/repo-name/..."`
- `next/link` auto-applies basePath

#### Static export
- Build with `output: "export"`
- Deploy `out/` directory to GitHub Pages

### URL parameter state
- `?source=installed` - set in manifest start_url
- `?source=qr` - identify QR code access
- `display-mode: standalone` - detect installed state
