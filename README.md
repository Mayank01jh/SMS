# Study Material Studio (SMS)

> AI-powered study material synthesizer that transforms complex topics and lecture notes into rigorous Study Guides, high-density Single-Page Revision Cards, and interactive Flashcard Quizzes.

---

## 🏛 System Architecture

- **Frontend (Vercel)**:
  - React 19 + Vite SPA
  - Dual-column interactive editor for Study Guides and Revision Cards
  - Interactive Flashcard Quiz mode with 3D flip animations and self-assessment scoring
  - Distraction-free Focus mode (`Ctrl+J`)
  - Live in-document search with regex-safe keyword highlighting (`Ctrl+K`)
  - Multi-format exports: `.md` (Markdown), `.html` (standalone offline document), and Print / PDF
  - Local auto-save and session history tracker
  - Configured with `vercel.json`

- **Backend (Render)**:
  - Node.js & Express API in `/server`
  - Health check endpoint: `GET /api/health`
  - Synthesis proxy endpoint: `POST /api/synthesize`
  - Securely handles server-side API keys for OpenAI (`gpt-4o`, `gpt-4o-mini`) and Google Gemini (`gemini-1.5-flash`, `gemini-1.5-pro`)
  - Configured with `render.yaml` for 1-click Render Blueprint deployment

---

## 🚀 Deployment Guide

### 1. Deploy Backend on Render

1. Go to [Render.com](https://render.com) and create an account or sign in.
2. Click **New +** > **Web Service** (or **Blueprint** using `render.yaml`).
3. Connect your Git repository.
4. Set the following configuration:
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. (Optional) Add Environment Variables:
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `GEMINI_API_KEY`: Your Google Gemini API key
6. Click **Create Web Service**. Once deployed, copy your Render URL (e.g., `https://sms-backend.onrender.com`).

---

### 2. Deploy Frontend on Vercel

1. Go to [Vercel.com](https://vercel.com) and sign in with GitHub.
2. Click **Add New...** > **Project** and import your repository.
3. Vercel automatically detects Vite:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. In **Environment Variables**, add:
   - `VITE_API_URL`: Your Render backend URL (e.g. `https://sms-backend.onrender.com`)
5. Click **Deploy**. Your frontend is live!

---

## 💻 Local Development

### Run Frontend:
```bash
npm install
npm run dev
```

### Run Backend:
```bash
cd server
npm install
npm start
```
