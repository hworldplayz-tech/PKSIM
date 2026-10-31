# 🚀 One-Click Cloudflare Pages Deployment Guide

Your project is built with **React + Vite**, which is **100% compatible and optimized for Cloudflare Pages**. 
Unlike Vercel server functions that get paused when limits are exceeded, Cloudflare Pages static hosting offers **unlimited requests, unlimited bandwidth, and zero resource pauses** on their free tier.

---

## ⚡ Step-by-Step GitHub to Cloudflare Pages Deployment

### Step 1: Push your latest code to GitHub
Make sure all your latest files are committed and pushed to your GitHub repository (e.g., `main` branch).

### Step 2: Open Cloudflare Dashboard
1. Go to [https://dash.cloudflare.com/](https://dash.cloudflare.com/)
2. In the left sidebar, click **Workers & Pages** -> **Create application**
3. Select the **Pages** tab
4. Click **Connect to Git**
5. Select your GitHub account and choose your repository (`pksim` or your repo name)
6. Click **Begin setup**

### Step 3: Cloudflare Build Configuration (Auto-detected)
Set the following settings:
- **Project name**: `pksim` (or your choice)
- **Production branch**: `main` (or `master`)
- **Framework preset**: **Vite**
- **Build command**: `npm run build`
- **Build output directory**: `dist`
- **Root directory**: `/` (leave empty or default)

### Step 4: Environment Variables (Optional)
The project is already pre-configured with active Firebase settings. If you want to customize your Firebase project or ensure Node 20 is selected:
- Expand **Environment variables (advanced)**:
  - `NODE_VERSION` = `20`
  - *(Optional)* `VITE_FIREBASE_API_KEY` = `your_api_key`
  - *(Optional)* `VITE_FIREBASE_PROJECT_ID` = `your_project_id`

*(Note: `.nvmrc` and `.node-version` are already included in the repo so Cloudflare automatically uses Node 20).*

### Step 5: Click "Save and Deploy"
- Cloudflare will run `npm run build` and deploy your site in ~30 to 45 seconds.
- You will receive your free `*.pages.dev` domain (e.g., `https://pksim.pages.dev`).
- You can also add your custom domain with 1-click free SSL!

---

## 📁 Cloudflare Configuration Files Included in this Repo:
- **`public/_redirects`**: Handles Single Page Application (SPA) client-side routing so refreshes on subpaths work cleanly (`/*  /index.html  200`).
- **`public/_headers`**: Configures Cloudflare Edge caching for high-speed delivery of scripts and assets.
- **`wrangler.toml`**: Official Cloudflare Pages configuration file with `pages_build_output_dir = "./dist"`.
- **`.nvmrc` & `.node-version`**: Pins the Node.js build runtime to Node 20 LTS.
- **`src/config/firebase.ts`**: Full support for both Cloudflare environment variables and instant built-in fallback.
