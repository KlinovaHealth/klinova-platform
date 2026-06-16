<div align="center">

# Klinova

**Healthcare that speaks your language.**

Telemedicine and digital health for West Africa — across Togo, Ghana, Benin, and Côte d'Ivoire.

[klinova.co](https://klinova.co) · Lomé, Togo

</div>

---

Klinova lets people see a trusted doctor from their phone, get a prescription, and find medicine nearby — by app, web, or WhatsApp, paid with mobile money. Built for the languages, phones, and payment methods of the region.

**Available in:** Français · English

**Regional languages spoken in the coverage area** (not yet on platform):
Eʋe (Togo · Ghana · Bénin) · Kabiyè (Togo) · Kotokoli (Togo) · Fon (Bénin · Togo) · Twi (Ghana) · Dioula (Côte d'Ivoire) · Baoulé (Côte d'Ivoire)

## This repository

The Klinova web platform. Today it holds the marketing website; it's structured to grow into the patient app, doctor app, and backend services.

```
klinova-platform/
├── website/                 # Next.js marketing site (deployed to klinova.co)
│   ├── app/
│   │   ├── page.jsx         # Homepage
│   │   ├── layout.jsx       # Global layout, SEO, fonts
│   │   └── globals.css      # Base styles
│   ├── public/              # Logos + favicon
│   ├── package.json
│   └── next.config.js
├── README.md
├── DEPLOY.md                # Step-by-step deploy guide (GitHub → Vercel → Cloudflare)
└── .gitignore
```

Planned: `/app` (React Native patient & doctor apps), `/backend` (API & core services), `/docs` (architecture, design system).

## Quick start

```bash
cd website
npm install
npm run dev          # http://localhost:3000
```

Build for production:

```bash
npm run build
npm start
```

## Deploy

The site auto-deploys to **klinova.co** on every push to `main` via Vercel.
First-time setup (≈20 min) is documented step by step in **[DEPLOY.md](./DEPLOY.md)**.

## Updating the site

```bash
git add .
git commit -m "Update: <what changed>"
git push origin main
# Vercel redeploys automatically in ~30s
```

## Tech stack

| Layer       | Tool                | Why |
|-------------|---------------------|-----|
| Framework   | Next.js 14          | Fast, static-friendly, Vercel-native |
| UI          | React 18            | Components |
| Styling     | Inline CSS          | Zero build-time CSS dependency; reliable in production |
| Hosting     | Vercel              | Auto-deploy from GitHub, global CDN |
| DNS / WAF   | Cloudflare          | Domain, DDoS protection, peace of mind |
| Fonts       | Fraunces · Plus Jakarta Sans | Care + credibility; clean UI |

## Brand

- **Colors:** Green `#0E6B4F` · Gold `#D99A2B` · Ivory `#F5EFE3` · Ink `#15302A`
- **Type:** Fraunces (headings), Plus Jakarta Sans (UI)
- **Voice:** Warm, trustworthy, plain-spoken. West African, not sterile clinical tech.
- **Tagline:** *Healthcare that speaks your language.*

## Team

Donald Daglo · Edem Daglo · Mawuli Jules Koudemon

## Contact

[contact@klinova.co](mailto:contact@klinova.co) · Lomé, Togo · [klinova.co](https://klinova.co)

---

<sub>© 2026 Klinova. All rights reserved.</sub>
