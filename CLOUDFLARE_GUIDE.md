# 🚀 One-Click Cloudflare Deployment Guide

Your project is built with **React + Vite**, which is **100% compatible and optimized for Cloudflare**.

---

## 🔍 Why the previous build failed:
In the Cloudflare build log:
```text
If are uploading a directory of assets, you can either:
- Specify the path to the directory of assets via the command line: (ex: `npx wrangler deploy --assets=./dist`)
- Or add the following to your "wrangler.toml" file:

[assets]
directory = "./dist"
```
Cloudflare's build system (`wrangler deploy`) looks for the `[assets]` block when deploying static assets. Without it, Wrangler expects a backend Worker script (`main = "src/index.ts"`).

We have updated `wrangler.toml` with:
```toml
name = "pksim"
compatibility_date = "2024-09-23"

[assets]
directory = "./dist"
not_found_handling = "single-page-application"
```

Now Cloudflare knows to upload the `./dist` folder and handle Single Page Application (SPA) routing automatically.

---

## ⚡ How to Deploy Now:

1. **Commit & Push** your updated code to GitHub (including the updated `wrangler.toml`).
2. Go to your Cloudflare dashboard under **Deployments**.
3. Click **Retry deployment** (or push a new commit to trigger automatic deployment).
4. The deployment will succeed and your site will be live!

---

## 📁 Settings in Cloudflare Dashboard (If creating a fresh project):
- **Framework preset**: `Vite`
- **Build command**: `npm run build`
- **Build output directory**: `dist`
- **Root directory**: `/`
