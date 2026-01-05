# 🚀 AdGenius Deployment Guide

This guide will help you deploy the AdGenius Innovation Hub to free hosting platforms. We will use:
- **Render** for the **Backend** and **AI Engine** (Free Web Services)
- **Vercel** for the **Frontend** (Free Static Hosting)

---

## 📋 Prerequisites

Before starting, make sure you have these values ready (from your local `.env` files):

1. **GitHub Repository**: Ensure your code is pushed to GitHub.
2. **Environment Variables**:
   - `GEMINI_API_KEY` (for AI Engine)
   - `PEXELS_API_KEY` (for AI Engine)
   - `MONGODB_URI` (for Backend)
   - `CLOUDINARY_CLOUD_NAME`, `API_KEY`, `API_SECRET` (for Backend)
   - `VITE_AI_URL` (for Frontend - we'll get this after deploying Backend)

---

## 1️⃣ Deploy AI Engine (Render)

1. Go to [dashboard.render.com](https://dashboard.render.com/).
2. Click **New +** -> **Web Service**.
3. Connect your **GitHub Repository** (`adgenius-innovation-hub`).
4. Configure the service:
   - **Name**: `adgenius-ai-engine`
   - **Root Directory**: `ai-engine` (Important!)
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Free Tier**: Yes
5. **Environment Variables**:
   - Add `GEMINI_API_KEY`
   - Add `PEXELS_API_KEY`
   - Add `PORT` = `3000` (Render expects standard port binding)
6. Click **Create Web Service**.
7. **Copy the URL** once deployed (e.g., `https://adgenius-ai-engine.onrender.com`).

---

## 2️⃣ Deploy Backend (Render)

1. Go to [dashboard.render.com](https://dashboard.render.com/).
2. Click **New +** -> **Web Service**.
3. Connect the **same GitHub Repository**.
4. Configure the service:
   - **Name**: `adgenius-backend`
   - **Root Directory**: `backend` (Important!)
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Free Tier**: Yes
5. **Environment Variables**:
   - Add `MONGODB_URI`
   - Add `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
   - Add `AI_ENGINE_URL` -> Paste the URL from Step 1 (e.g., `https://adgenius-ai-engine.onrender.com`)
6. Click **Create Web Service**.
7. **Copy the URL** once deployed (e.g., `https://adgenius-backend.onrender.com`).

---

## 3️⃣ Deploy Frontend (Vercel)

1. Go to [vercel.com](https://vercel.com).
2. Click **Add New** -> **Project**.
3. Import your **GitHub Repository**.
4. Configure:
   - **Root Directory**: Click "Edit" and select `adgen-frontend-master` folder.
   - **Build Command**: `npm run build` (should be auto-detected)
   - **Output Directory**: `dist` (should be auto-detected)
5. **Environment Variables**:
   - `VITE_AI_URL` -> **Important**: Use the URL of the **BACKEND** (from Step 2), NOT the AI Engine.
     - Example: `https://adgenius-backend.onrender.com`
     - **Note**: Do NOT add a trailing slash `/`.
6. Click **Deploy**.

---

## 4️⃣ Final Verification

1. Open your deployed Vercel URL.
2. Go to **Prompt Chat**.
3. Type: `"Create a test ad"`
4. Check if it generates a layout. This confirms:
   - Frontend -> Backend (Vercel -> Render)
   - Backend -> AI Engine (Render -> Render)
   - AI Engine -> Gemini (Render -> Google)

---

## ⚠️ Important Troubleshooting

- **Cold Starts**: Render's free tier spins down services after inactivity. The first request might take **30-60 seconds**.
- **CORS Issues**: If you see CORS errors in the browser console, you might need to update the `cors` configuration in `backend/src/server.js` and `ai-engine/src/index.js` to allow your Vercel domain.
  - Currently, we use `app.use(cors())` which allows *all* origins. This is fine for Hackathons.
