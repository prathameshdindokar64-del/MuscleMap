# How to Start the MuscleMap Platform

This guide walks you through launching the MuscleMap application (Backend API + 3D Frontend).

---

## 📁 Project Structure

```
Aissms Hackthon/
├── Backeknd/                  # Express + TypeScript + SQLite + Gemini AI API
│   ├── src/
│   ├── .env                   # Backend environment variables
│   └── package.json
├── Frontend/
│   └── musclemap-frontend/    # React 19 + Vite + Three.js + Tailwind CSS
│       ├── src/
│       ├── .env               # Frontend environment variables
│       └── package.json
└── HOW_TO_START.md            # This instruction file
```

---

## 🔑 Demo Account for Judges

A pre-populated clinical demo account with **6 real body pain hotspots** (Lower Back, Neck, Left Shoulder, Right Knee, Upper Back, Left Hip) and full history logs is saved in the database:

- **Email**: `judge@musclemap.com`
- **Password**: `judge123`
- **Name**: `Dr. Alex Vance (Clinical Reviewer)`

Click **Sign In** in the top navigation bar, enter these credentials, and you will immediately see:
1. **3D Body Heatmap** with 6 active glowing hotspots reflecting real clinical history.
2. **Assessment Panel > History** tab populated with historical timeline, pain graphs, exercises, and PDF export.

---

## ⚡ Quick Start

You need to run the **Backend** and **Frontend** simultaneously in **two separate terminal windows**.

### 1️⃣ Terminal 1: Start Backend (API Server)

```powershell
cd "c:\Users\prath\Downloads\Aissms Hackthon\Backeknd"
npm run dev
```

- **Server URL**: [http://localhost:4000](http://localhost:4000)
- **Database**: SQLite database stored locally at `Backeknd/musclemap.sqlite`
- **Features**: REST API, Gemini AI integration, JWT Authentication, PDF export

> **Tip (Database Seeding)**:
> If the database ever needs to be initialized or re-populated with exercises and muscle regions, run:
> ```powershell
> npm run seed
> ```

---

### 2️⃣ Terminal 2: Start Frontend (Vite + React)

```powershell
cd "c:\Users\prath\Downloads\Aissms Hackthon\Frontend\musclemap-frontend"
npm run dev
```

- **App URL**: [http://localhost:5173](http://localhost:5173)
- Automatically forwards API requests to `http://localhost:4000`.

---

### 3️⃣ Open in Browser

Once both services are running, open your web browser and navigate to:

👉 **[http://localhost:5173](http://localhost:5173)**

---

## ⚙️ Environment Configuration

Both `.env` files are already set up:

| Component | File Path | Key Variables |
| :--- | :--- | :--- |
| **Backend** | `Backeknd/.env` | `PORT=4000`<br>`ALLOWED_ORIGIN=http://localhost:5173`<br>`GEMINI_API_KEY=...`<br>`JWT_SECRET=...` |
| **Frontend** | `Frontend/musclemap-frontend/.env` | `VITE_API_BASE_URL=http://localhost:4000` |

---

## 🛠️ Additional Useful Commands

### Backend (`Backeknd/`)
- `npm run dev` — Run development server with live reload (`nodemon`)
- `npm run build` — Compile TypeScript to `dist/`
- `npm start` — Run compiled production server
- `npm run seed` — Seed initial muscle regions and exercises into SQLite

### Frontend (`Frontend/musclemap-frontend/`)
- `npm run dev` — Launch Vite dev server
- `npm run build` — Typecheck and build production bundle into `dist/`
- `npm run preview` — Locally preview the production build
