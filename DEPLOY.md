# Deploy Klinova to klinova.co

From zip on your computer → live website. About 20 minutes, no prior DevOps experience needed.
You'll do four things: **GitHub → push code → Vercel → Cloudflare DNS.**

> You already have: the domain `klinova.co` (on Cloudflare) and Google Workspace email. Good. This guide gets the site live on that domain.

---

## Before you start

Install these once (skip any you already have):
- **Node.js 18+** — https://nodejs.org (pick the LTS version)
- **Git** — https://git-scm.com/downloads
- A **GitHub** account — https://github.com
- A **Vercel** account — https://vercel.com (sign up *with GitHub*, it's easier)

Unzip `klinova-platform.zip` somewhere you'll find it (e.g. your Desktop).

---

## Step 1 — Create the GitHub repository (3 min)

1. Go to https://github.com/new
2. **Repository name:** `klinova-platform`
3. **Visibility:** Public *(investors and collaborators may look — that's fine and normal)*
4. **Do NOT** check "Add a README" (your zip already has one)
5. Click **Create repository**
6. Leave that page open — you'll need the commands it shows.

---

## Step 2 — Push the code to GitHub (5 min)

Open a terminal (**Terminal** on Mac, **Git Bash** on Windows), then:

```bash
# go into the unzipped folder (adjust the path to where you unzipped it)
cd ~/Desktop/klinova-platform

# start git and make the first commit
git init
git add .
git commit -m "Initial commit: Klinova website"

# connect to your new GitHub repo (copy YOUR url from the GitHub page)
git remote add origin https://github.com/YOUR-USERNAME/klinova-platform.git
git branch -M main
git push -u origin main
```

Refresh the GitHub page — your files are now there. ✅

> First push asks you to sign in to GitHub. If it asks for a password, use a **Personal Access Token** (GitHub → Settings → Developer settings → Personal access tokens), not your account password.

---

## Step 3 — Deploy on Vercel (5 min)

1. Go to https://vercel.com/new
2. **Import** your `klinova-platform` repo (authorize GitHub access if asked)
3. Vercel shows project settings. Set **ONE** thing:
   - **Root Directory** → click **Edit** → choose **`website`**
   - *(Framework "Next.js" is auto-detected. Leave everything else as-is.)*
4. Click **Deploy**
5. Wait ~60 seconds. You'll get a live preview URL like `klinova-platform.vercel.app`. Open it — the site should load. ✅

---

## Step 4 — Connect klinova.co (5 min + DNS wait)

### In Vercel
1. Open your project → **Settings** → **Domains**
2. Type `klinova.co` → **Add**
3. Also add `www.klinova.co` (Vercel will offer to redirect it — accept)
4. Vercel shows the DNS records you need. Keep this tab open.

Typically:
- An **A record** for `klinova.co` → `76.76.21.21`
- A **CNAME** for `www` → `cname.vercel-dns.com`

*(Use whatever Vercel actually shows you — it's authoritative.)*

### In Cloudflare
1. Log in → select **klinova.co** → **DNS** → **Records**
2. Add the records Vercel gave you:
   - **A** · Name `@` · IPv4 `76.76.21.21` · Proxy status **DNS only (grey cloud)**
   - **CNAME** · Name `www` · Target `cname.vercel-dns.com` · Proxy status **DNS only (grey cloud)**
3. Save.

> **Important:** set those records to **DNS only (grey cloud)**, not Proxied (orange), during setup. Vercel needs to verify and issue the SSL certificate. You can revisit later if you want Cloudflare proxying.

### Wait
DNS takes 5–30 minutes to propagate. Then visit **https://klinova.co** — your site is live, with HTTPS handled automatically. ✅

---

## You're live. What changed vs. before

- Website: **https://klinova.co**
- Auto-deploy: every `git push` to `main` redeploys in ~30s
- HTTPS: automatic, free, auto-renewing
- Global CDN: fast everywhere, including West Africa

---

## Making updates later

Edit files in `website/`, then:

```bash
cd ~/Desktop/klinova-platform
git add .
git commit -m "Update: describe the change"
git push origin main
```

Check klinova.co in ~30 seconds.

### Common edits
- **Text / wording:** `website/app/page.jsx` (all copy is near the top, in the `text` object — `en` and `fr`)
- **Colors:** `website/app/page.jsx`, the `C = { ... }` block at the very top
- **Languages list:** `website/app/page.jsx`, the `LANGS` array and `LANG_LINE`
- **Logo / favicon:** replace files in `website/public/`

---

## Troubleshooting

**Site works on `.vercel.app` but `klinova.co` shows an error**
→ DNS still propagating, or records set to Proxied. Wait, and confirm grey-cloud (DNS only) in Cloudflare.

**Vercel build fails**
→ Confirm **Root Directory = `website`** (Settings → General). That's the usual cause.

**`git push` rejected / auth error**
→ Use a Personal Access Token as your password (see note in Step 2).

**Want to undo a bad deploy**
→ Vercel → Deployments → pick a previous good one → **Promote to Production**. Instant rollback.

---

## After launch — suggested next moves

1. Verify email: send/receive on `contact@klinova.co` (Google Workspace)
2. Defensive domains: register `klinova.org`, `.tg`, `.gh`, `.africa` and redirect to `klinova.co`
3. Get the pilot live: real users, consults, pharmacy transactions
4. Land one government/NGO letter of intent
5. Build the raise kit: deck, one-pager, data room

You've got everything you need. Ship it.
