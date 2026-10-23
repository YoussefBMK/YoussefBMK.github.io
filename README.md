# Youssef Ben Mbarek · 贝苏宇 — Engineering Portfolio

Static, dependency-free portfolio: `index.html` + `assets/` (CSS, JS, self-hosted fonts, WebP images, H.264 videos).
No build step and no third-party requests, so it also loads in mainland China.

## Run locally
Any static server works, e.g.
```
npx http-server . -p 8137
```

## Deploy (GitHub Pages)
Push to a repository and enable **Settings → Pages → Deploy from branch → `main` / root**.
A repository named `<username>.github.io` is served at `https://<username>.github.io/`.

## Editing notes
- Chinese headings use a subset of Noto Serif SC (`assets/fonts/notoserifsc-sub.woff2`) that only contains
  the characters on the page. If you add new Chinese text, regenerate the subset or the new characters
  will fall back to a system font.
- Print / “Save as PDF” has its own stylesheet (`@media print` in `assets/css/main.css`).

Fonts: Archivo, JetBrains Mono, Noto Serif SC — SIL Open Font License.
