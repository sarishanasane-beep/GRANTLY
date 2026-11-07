# GRANTLY — Rethinking the Scholarship Experience

> A premium, interactive scholarship discovery and management platform that helps students explore educational funding opportunities, understand their eligibility, compare scholarships and organize their application journeys.

---

## 1. Project Overview

Higher education scholarships are often obscured behind outdated government portals, convoluted qualification criteria, and fragmented spreadsheets. Deserving students routinely miss application deadlines or fail to identify life-changing capital opportunities simply due to opaque eligibility requirements and poor UX.

**GRANTLY** reimagines this entire experience. Built with a creative studio aesthetic and architectural discipline, GRANTLY provides:
- **Transparent, rule-based eligibility evaluation**: Instantly calculates where students meet, partially meet, or miss criteria across GPA, family income, state domicile, and academic discipline.
- **Cinematic visual discovery**: Transforms scholarship search into an inspiring, scroll-driven visual journey powered by interactive 3D WebGL scenes and real-time particle simulations.
- **End-to-end applicant tracking**: Keeps students organized from preliminary discovery to document verification and submission deadlines.

---

## 2. Key Features

- **Personalized Scholarship Matching**: High-precision deterministic matching engine that ranks opportunities by match score and eligibility status (`eligible`, `potentially_eligible`, `not_eligible`).
- **Deterministic Eligibility Scoring**: Explicit breakdown of academic criteria, income limits, domicile, and category requirements without black-box approximations.
- **Scholarship Discovery & Multi-criteria Filtering**: Real-time filtering across 36 comprehensive opportunities by field of study, education level, funding amount, and deadline urgency.
- **Side-by-Side Scholarship Comparison**: Multi-parameter comparison matrix evaluating awards, obligations, criteria, and documentation requirements.
- **Application Lifecycle Tracker**: Kanban-style status workflow managing applications across *Saved*, *In Progress*, *Submitted*, and *Awarded* stages.
- **Deadline Calendar & Urgency Alerts**: Visual urgency badges flagging imminent deadlines (`< 14 days`, `< 30 days`).
- **Document Readiness Vault**: Centralized document checklist tracking student transcripts, income certificates, recommendation letters, and ID proofs.
- **Five-Step Student Onboarding**: Guided profile onboarding wizard collecting academic background, financial bracket, and target fields.
- **Cinematic 3D Landing Page**: High-performance React Three Fiber environment featuring custom 3D models with responsive camera movement and ambient lighting.
- **Autonomous 18-Agent Self-Assembling Introduction**: Multiplayer-style design-editor animation with 18 autonomous cursor agents scanning, measuring, and progressively constructing page elements.
- **Interactive Particle Background**: Real-time Originkit WebGL Particle Drift 3 background with downward gravitational drift and Champagne Gold cursor constellation connections.
- **Fully Responsive Architecture**: Fluid, accessible design system calibrated across desktop (1920px, 1440px), tablet (1024px, 768px), and mobile (375px) viewports.

---

## 3. Technology Stack

- **Core Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build System**: [Vite 6](https://vitejs.dev/)
- **Styling & Design System**: [Tailwind CSS 3](https://tailwindcss.com/)
- **State Management**: [Zustand 5](https://github.com/pmndrs/zustand)
- **3D Graphics & WebGL**:
  - [Three.js](https://threejs.org/)
  - [React Three Fiber](https://r3f.docs.pmnd.rs/) (`@react-three/fiber`)
  - [@react-three/drei](https://github.com/pmndrs/drei)
- **Animation & Motion**:
  - [GSAP 3](https://greensock.com/gsap/)
  - [Framer Motion 12](https://www.framer.com/motion/)
- **Iconography**: [Lucide React](https://lucide.dev/)
- **Interactive Background**: [Originkit Particle Drift 3](https://www.originkit.dev/)
- **Testing**: [Node Test Runner](https://nodejs.org/api/test.html) + `tsx`

---

## 4. Installation & Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### Setup Instructions

```bash
# 1. Clone the repository
git clone https://github.com/sarishanasane-beep/GRANTLY.git

# 2. Navigate to the project directory
cd GRANTLY

# 3. Install dependencies
npm install

# 4. Start the local development server
npm run dev
```

The application will be available at `http://localhost:5173`.

### Additional Scripts

```bash
# Run strict TypeScript type check & lint
npm run lint

# Execute deterministic matching engine unit tests
npm test

# Build optimized production bundle
npm run build

# Preview production build locally
npm run preview
```

---

## 5. Project Structure

```text
GRANTLY/
├── public/
│   ├── models/
│   │   ├── optimized/        # Optimized Meshy AI 3D GLB assets (1.9–7.3 MB)
│   │   │   ├── book.glb
│   │   │   ├── cap.glb
│   │   │   ├── certificate.glb
│   │   │   ├── folder.glb
│   │   │   ├── gateway.glb
│   │   │   ├── medallion.glb
│   │   │   ├── pillar.glb
│   │   │   └── sphere.glb
│   │   └── ...               # Root model aliases
│   └── vite.svg
├── src/
│   ├── assemble/             # Autonomous 18-agent assembly controller & orchestrator
│   ├── components/
│   │   ├── background/       # Global SiteBackground integrating Originkit Particle Drift 3
│   │   ├── intro/            # AssembleIntro React wrapper
│   │   ├── layout/           # AppLayout, MarketingLayout, ScrollToTop
│   │   ├── loading/          # GlobalLoader unified loading system
│   │   ├── originkit/ui/     # Official Originkit Particle Drift 3 component
│   │   └── ui/               # Badge, Button, Card, Input, Modal, SkipToContent
│   ├── data/                 # 36 Fictional scholarship catalog entries
│   ├── lib/                  # Matching engine & mathematical eligibility evaluators
│   ├── pages/                # LandingPage, DashboardPage, ExplorePage, TrackerPage, etc.
│   ├── store/                # Zustand store (profile, saved, applications, settings)
│   ├── three/                # Three.js canvases, GrantlyHeroScene, ScrollModelCanvas
│   ├── types/                # Strict TypeScript domain interfaces
│   ├── App.tsx               # Root application router & startup shell lifecycle
│   ├── index.css             # Tailwind design tokens, scrollbars, and brand themes
│   └── main.tsx              # Application entrypoint
├── tests/                    # Deterministic matching engine test suites
├── index.html                # HTML5 root document
├── package.json              # Project dependencies & scripts
├── tailwind.config.js        # GRANTLY 6-color luxury palette tokens
├── tsconfig.json             # TypeScript compiler configuration
└── vite.config.ts            # Vite bundler configuration & code-splitting rules
```

---

## 6. Demo Data Disclaimer

The 36 scholarship opportunities included in `src/data/scholarships.ts` are **fictional demonstration entries** created to showcase GRANTLY's eligibility matching algorithms, multi-criteria filtering, and application tracking workflows. They do not represent verified real-world funding opportunities.

---

## 7. 3D Assets

GRANTLY utilizes 8 custom 3D GLB models originally synthesized via Meshy AI. All models have been optimized using mesh-decimation and texture-compression pipelines, bringing individual asset sizes down to 1.9–7.3 MB (under 37 MB total) for instant client-side WebGL loading without requiring external CDN dependencies.

---

## 8. License

No license has yet been specified for this project. All rights reserved.
