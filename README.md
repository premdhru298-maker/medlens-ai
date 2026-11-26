# MedLens AI — Medical Report Explainer & Symptom Triage Assistant

An AI-powered clinical communication web application built with **Next.js (App Router, TypeScript)**, **Tailwind CSS**, and **Google Gemini API (`gemini-3.5-flash` with automatic fallback)**.

🔗 **Live Deployed App:** [https://medlens-ai-theta.vercel.app](https://medlens-ai-theta.vercel.app)  
📦 **GitHub Repository:** [https://github.com/premdhru298-maker/medlens-ai](https://github.com/premdhru298-maker/medlens-ai)

> **Disclaimer:** MedLens AI provides educational health information only and is **not** a substitute for professional medical diagnosis, advice, or treatment. Always consult a qualified physician for medical decisions.

---

## Key Features

- **Multimodal Lab Report Explainer**
  - Upload medical reports as **PDF, PNG, JPG, or WEBP** (up to 10 MB) or paste raw lab text.
  - Structured JSON extraction of biomarkers with observed values, reference ranges, status pills (`Normal`, `Borderline`, `High`, `Low`), and plain-language explanations.
  - Built-in **1-Click Sample Reports** (CBC, Lipid + HbA1c, Liver Function Test) for instant demos.
- **Safe Symptom Triage Assistant**
  - Interactive symptom intake (symptom chips, duration, severity slider 1–10, age group, existing conditions).
  - Hard-coded **Red-Flag Safety Floor** that always flags critical keywords (e.g., chest pain, breathing difficulty, sudden neurological deficits) as `Emergency Care Now`.
  - Suggests educational possibilities, warning signs, safe supportive care, recommended specialist, and questions to ask your doctor.
- **English & Hinglish Support**
  - Switch explanations between clear English and easy-to-understand Hinglish.
- **Privacy-First Local History & Print Export**
  - Analysis history is saved in browser `localStorage` (not stored in external databases), with print/PDF export support.
- **Built-in Demo Mode Fallback**
  - Works seamlessly out of the box even before adding an API key; automatically upgrades to **Live Gemini AI** once `GEMINI_API_KEY` is configured.

---

## Architecture

```text
Browser UI (React / Next.js Client Components)
  ├── Lab Report Explainer  ──▶ POST /api/analyze-report (FormData: PDF/Image/Text)
  ├── Symptom Triage        ──▶ POST /api/triage         (JSON: symptoms + metadata)
  └── Status Check          ──▶ GET  /api/health         (checks GEMINI_API_KEY)
                                      │
                                      ▼
                     Server API Routes (Next.js App Router)
                      ├── Live Mode: @google/genai (gemini-3.5-flash + JSON Schema)
                      └── Demo Mode: Deterministic clinical sample fallback
```

---

## Getting Started Locally

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables (optional for Demo Mode, required for Live AI):**
   Copy `.env.example` to `.env.local` and add your free key from [Google AI Studio](https://aistudio.google.com/apikey):
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Deploy on Vercel (Free)

1. Push this repository to **GitHub**.
2. Import the repository on [Vercel](https://vercel.com/new).
3. Add `GEMINI_API_KEY` under **Project Settings → Environment Variables**.
4. Click **Deploy**.
