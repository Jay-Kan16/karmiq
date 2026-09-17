# 🚀 KaamSaathi Render Deployment Guide

This guide walks you step-by-step through deploying the full-stack **KaamSaathi** application on [Render](https://render.com).

The project is configured for **Unified Full-Stack Deployment**:
- A single Render Web Service builds both the React Vite frontend and the Express Node.js backend.
- The backend serves both the `/api/*` endpoints and the production React client assets (`dist/index.html`).
- **Benefits**: Single free tier service, zero CORS complications, no cold-start delay between frontend and backend.

---

## 1. Push Latest Code to GitHub

Open your terminal in the project root and run:

```bash
git add .
git commit -m "Configure full-stack project for Render deployment"
git push origin main
```

> **Security Note**: Your `.env` and `backend/.env` files containing your database password are protected by `.gitignore` and will never be committed to GitHub.

---

## 2. Deploy on Render

You can deploy using either **Option A (Blueprint - Quickest)** or **Option B (Manual Web Service)**.

### Option A: One-Click Blueprint (Recommended)
1. Go to the [Render Blueprints Dashboard](https://dashboard.render.com/blueprints).
2. Click **New Blueprint Instance**.
3. Select your repository: `Jay-Kan16/karmiq`.
4. Render will automatically read [`render.yaml`](file:///c:/Users/jayesh%20dangi/Downloads/kaamsaathi-real-fullstack/render.yaml).
5. When prompted for `MONGO_URI`, paste your MongoDB Atlas connection string:
   ```text
   mongodb+srv://jayeshdangi9371_db_user:DJqIGQKGozSgyFYT@cluster0.apyhprk.mongodb.net/kaamsaathi?retryWrites=true&w=majority
   ```
6. Click **Apply**. Render will automatically provision the service, generate a secure `JWT_SECRET`, build both apps, and go live!

---

### Option B: Manual Web Service Setup
If you prefer setting up via the Render UI:

1. Go to [Render Dashboard](https://dashboard.render.com) and click **New +** -> **Web Service**.
2. Select **Build and deploy from a Git repository** and pick `Jay-Kan16/karmiq`.
3. Configure the service settings:
   - **Name**: `kaamsaathi` (or any preferred name)
   - **Language / Runtime**: `Node`
   - **Branch**: `main`
   - **Build Command**:
     ```bash
     npm run build:all
     ```
   - **Start Command**:
     ```bash
     npm run start
     ```
   - **Plan**: `Free`

4. Scroll down to **Environment Variables** and add:
   | Key | Value | Notes |
   | :--- | :--- | :--- |
   | `NODE_ENV` | `production` | Enables production optimizations |
   | `MONGO_URI` | `mongodb+srv://jayeshdangi9371_db_user:DJqIGQKGozSgyFYT@cluster0.apyhprk.mongodb.net/kaamsaathi?retryWrites=true&w=majority` | Your MongoDB Atlas connection |
   | `JWT_SECRET` | `generate-a-strong-secret-key-32-chars` | Enter any long random string |
   | `CLIENT_URL` | `https://kaamsaathi.onrender.com` | Optional: Your Render URL once created |
   | `PLIVO_AUTH_ID` | `Your Plivo Auth ID` | From Plivo Console |
   | `PLIVO_AUTH_TOKEN` | `Your Plivo Auth Token` | From Plivo Console |
   | `PLIVO_NUMBER` | `+9180XXXXXXXX` | Your rented Plivo Virtual Number in E.164 |
   | `BACKEND_URL` | `https://kaamsaathi.onrender.com` | Your live backend URL for webhooks |

5. Under **Advanced Settings**:
   - **Health Check Path**: `/api/health`
6. Click **Create Web Service**.

---

## 3. Ensure MongoDB Atlas Allows Render Access

Because Render uses dynamic cloud IPs on the free tier:
1. Log in to [MongoDB Atlas](https://cloud.mongodb.com).
2. In the left navigation, click **Network Access** under Security.
3. Verify that an entry exists for `0.0.0.0/0` (Allow Access from Anywhere).
   - If not, click **Add IP Address** -> select **Allow Access from Anywhere** -> click **Confirm**.

---

## 4. Verification After Deployment

Once Render finishes building:
1. **Health Check**: Open `https://your-service-name.onrender.com/api/health` in your browser.
   - It should return:
     ```json
     {"success":true,"data":{"status":"ok"}}
     ```
2. **Frontend UI**: Open `https://your-service-name.onrender.com` to see the KaamSaathi home page.
3. **Database & Auth Test**:
   - Register a new user or login with an existing demo account.
   - Test "Find Workers" radar search, job booking, and real-time status transitions.

---

## 5. Summary of Key Files Configured

- [`render.yaml`](file:///c:/Users/jayesh%20dangi/Downloads/kaamsaathi-real-fullstack/render.yaml) — Render Infrastructure as Code definition.
- [`package.json`](file:///c:/Users/jayesh%20dangi/Downloads/kaamsaathi-real-fullstack/package.json) — Unified `build:all` and `start` scripts.
- [`backend/src/app.ts`](file:///c:/Users/jayesh%20dangi/Downloads/kaamsaathi-real-fullstack/backend/src/app.ts) — Static asset hosting, SPA catch-all routing, relaxed Helmet CSP for maps/assets.
- [`src/services/api.ts`](file:///c:/Users/jayesh%20dangi/Downloads/kaamsaathi-real-fullstack/src/services/api.ts) — Dynamic API base URL (`import.meta.env.VITE_API_URL` or deployed Render URL).

