# BTechPath AI OS - The Engineering Intelligence Platform

An intelligent, multi-module web platform for engineering students and administrators, designed in **Stitch** under the **Lumina Intelligence** design system and implemented with zero build dependencies.

---

## 🚀 Live Pages & Modules

| Page | File | Stitch Origin | Description |
| :--- | :--- | :--- | :--- |
| **Landing Page** | [`index.html`](index.html) | Screen `03bc8bdfab684cbd944e6fb9aa952ccf` | High-impact hero, **interactive Neural Particle Mesh Canvas**, 3D parallax mockup, animated counters, and module showcase. |
| **Auth Flow** | [`login.html`](login.html) | Screen `4e270d8ab4f14756ad008732a5de32ed` | Dual Login & Sign Up switcher, **3D tilt card**, animated SVG energy beam, Google SSO, and 1-Click Demo Logins. |
| **Command Center** | [`dashboard.html`](dashboard.html) | Screen `fbcd07d7dc1d4b9d96cc03c5854d70f2` | Student home dashboard with **interactive Daily Tasks checklist**, breathing flame streak glow, and 3D launch cards. |
| **3D Flashcards** | [`flashcards.html`](flashcards.html) | High-Impact Active Recall | **3D card flip physics**, B.Tech CS core subject decks (OS, DBMS, Networks, Algorithms), and Spaced Repetition scheduling. |
| **Coding IDE** | [`ide.html`](ide.html) | Screen `00181b7593f241e5871610782f33e1ac` | In-browser code editor with **stepped testcase progress runner** and progressive AI Big-O complexity analyzer. |
| **Doubt Solver** | [`doubt-solver.html`](doubt-solver.html) | Screen `015aadfd93f74169a740e0f16bec5118` | 24/7 AI tutor chat with **laser scanner animation** and progressive solution derivation. |
| **Mock Interview** | [`mock-interview.html`](mock-interview.html) | Screen `f8d7d08edc834c5db93d945475854af0` | Split-screen simulated technical interview with **live oscillating audio waveform** & scorecard reveal. |
| **Resume Builder** | [`resume-builder.html`](resume-builder.html) | Screen `30c7f0237d53432bb1c39a82d820cb0d` | **Dynamic ATS score meter spring animation**, Google XYZ bullet enhancer, and PDF export progress flow. |
| **Skill Roadmap** | [`roadmap.html`](roadmap.html) | Screen `c7263af296f742b69b8dbcc3362c9602` | **Living SVG energy beam flow** with interactive milestone node unlock physics. |
| **Onboarding** | [`onboarding.html`](onboarding.html) | Screen `6dbb20cd12b34510b3171af848827f37` | 3-step personalized track selection (AI/ML, Fullstack, Systems, DSA) with smooth motion transitions. |
| **Admin Center** | [`admin.html`](admin.html) | Screen `ca23bff0df244065b00504d19a8e26d0` | Global platform analytics with animated counters, 3D tilt metrics, and batch directory. |

---

## 🎨 Design System: Lumina Intelligence

- **Palette**: Deep Space Twilight (`#12131b`), Elevated Surface Containers (`#1f1f27` - `#34343d`), Soft Violet/Indigo (`#5865f2`, `#bec2ff`), and Success Teal (`#3cddc7`).
- **Typography**: Plus Jakarta Sans (Headlines & Body) and Geist (Labels & Monospace UI).
- **Icons**: Google Material Symbols Outlined.

---

## 💻 How to Run Locally

Because all styles, fonts, icons, and scripts are loaded natively via CDN or modular vanilla JavaScript:

1. **Directly open in any modern browser**:
   - Double-click [`login.html`](login.html) or [`index.html`](index.html).
2. **Or serve via Python**:
   ```bash
   python -m http.server 8080
   ```
   and navigate to `http://localhost:8080/login.html`.
3. **Or serve via VS Code / Node.js**:
   - Open with "Live Server" extension, or `npx serve .`

---

## 🔒 Security, Secret Management & Git History Rotation Warning

> [!WARNING]
> ### Mandatory Secret Rotation Notice
> If this repository or any previous commit history ever contained real API keys, passwords, tokens, or client secrets (such as earlier `.env.example` revisions or development scratchpads), **those credentials remain accessible in Git history (`git log`) until purged**.
>
> **Before deploying to production or making this repository public, ROTATE ALL OF THE FOLLOWING CREDENTIALS IMMEDIATELY:**
> 1. **Supabase Service Role Key**: Regenerate in the Supabase Dashboard (`Project Settings -> API -> Service Role Key`).
> 2. **OpenRouter API Key**: Revoke and generate a new key in your OpenRouter account.
> 3. **Google Gemini API Key**: Revoke and re-issue via Google AI Studio / Google Cloud Console.
> 4. **Google OAuth Client Secret**: Reset in Google Cloud Console (`APIs & Services -> Credentials -> OAuth 2.0 Client IDs`).
> 5. **Any Stripe / Third-Party Keys**: Re-roll via provider dashboard if ever tested.

### Architecture & Client-Server Boundary Rules

To prevent accidental secret leakage, TechPath adheres to strict zero-leak principles:

1. **Zero Hardcoded Secrets**: No passwords, tokens, API keys, or connection strings may exist as string literals anywhere in code, configuration files, utility scripts, or comments.
2. **Supabase Key Exposure & Row Level Security (RLS)**:
   - **`SUPABASE_ANON_KEY`**: Designed for client-side usage, but **ONLY IF Row Level Security (RLS) is enabled on all tables**. In TechPath, all database tables strictly enforce PostgreSQL RLS policies.
   - **`SUPABASE_SERVICE_ROLE_KEY`**: **STRICTLY SERVER-SIDE ONLY**. Bypasses all RLS checks; it must NEVER be returned in client APIs or referenced in browser JavaScript.
3. **AI Provider API Keys (OpenRouter / Gemini / OpenAI)**:
   - Handled exclusively on the backend server (`server.js`).
   - Browser features query server endpoints (e.g. `/api/ai/doubt`, `/api/ai/notes`), which inject credentials server-side and never reveal API keys to the browser.
4. **Environment Files & Git Hygiene**:
   - `.env` contains active credentials and is strictly ignored in `.gitignore`.
   - `.env.example` contains non-sensitive generic placeholders (`your-key-here`). Real secrets must NEVER be added to `.env.example`.
5. **Logs & API Responses**:
   - `/api/config` explicitly returns only client-safe parameters (`supabaseUrl`, `supabaseAnonKey`, `appUrl`, `isAIConfigured`, `aiProvider`, `supportEmail`).
   - Console logs, error handlers, and authentication recovery endpoints redact or mask tokens and sensitive identifiers.
