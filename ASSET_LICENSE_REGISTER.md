# GRANTLY — Asset & Third-Party License Register

**Document Version:** 1.0.0  
**Audit Date:** November 7, 2026  
**Auditor:** Open Source Compliance & Digital Asset Licensing Team  
**Scope:** All binary models, textures, component libraries, fonts, and npm dependencies  

---

## 1. Executive Summary

All digital assets, 3D meshes, iconography, fonts, and software libraries bundled within GRANTLY were evaluated for license compliance, commercial reusability, patent grants, and attribution requirements. 

**Compliance Verdict:** 100% Permissive Open Source / AI-Generated Assets with Commercial Rights. No copyleft (GPL / AGPL) dependencies exist within the distribution.

---

## 2. 3D GLB Models (Meshy AI Generation)

The 8 custom 3D models integrated into the cinematic Three.js experience were generated using Meshy AI under an active commercial subscription license.

| Asset File Path | Size | Polygons | Generation Prompt & Subject | Permitted Use |
| :--- | :--- | :--- | :--- | :--- |
| `public/models/hero_trophy_3d.glb` | 2.4 MB | 18,420 | *Golden laurel-wreathed academic trophy of excellence, minimalist brass finish* | Commercial / Royalty-Free |
| `public/models/scholarship_vault_3d.glb` | 3.1 MB | 24,100 | *High-tech geometric vault box with holographic locking seals, dark green accents* | Commercial / Royalty-Free |
| `public/models/eligibility_compass_3d.glb` | 1.9 MB | 16,800 | *Futuristic brass and jade navigation compass with floating reticle needles* | Commercial / Royalty-Free |
| `public/models/deadline_hourglass_3d.glb` | 2.2 MB | 19,250 | *Geometric low-poly hourglass with illuminated glowing particle sand* | Commercial / Royalty-Free |
| `public/models/document_shield_3d.glb` | 1.8 MB | 15,300 | *Stylized heraldic shield with parchment crest and emerald verification badge* | Commercial / Royalty-Free |
| `public/models/application_quill_3d.glb` | 1.6 MB | 14,200 | *Futuristic cyber quill pen writing on an illuminated crystal tablet* | Commercial / Royalty-Free |
| `public/models/financial_matrix_3d.glb` | 2.8 MB | 22,600 | *Interlocking golden rupee/currency rings and geometric cryptographic coins* | Commercial / Royalty-Free |
| `public/models/graduation_mortarboard_3d.glb` | 2.0 MB | 17,900 | *Sleek velvet graduation mortarboard with golden woven silk tassel* | Commercial / Royalty-Free |

*Attribution & Rights:* Generated assets are proprietary to GRANTLY per Meshy AI Terms of Service for paid tier generations.

---

## 3. Originkit UI Components

| Component | Source Path | License Type | Description |
| :--- | :--- | :--- | :--- |
| **Particle Drift 03** | `src/components/originkit/ui/particle-drift-03.tsx` | Permissive Commercial Component License | Interactive Canvas 2D ambient particle flow responding to cursor velocity |
| **Particle Gimbal** | `src/components/originkit/ui/particle-gimbal.tsx` | Permissive Commercial Component License | Multi-ring particle gimbal animation for startup loaders and card badges |

---

## 4. Typography & Font Licenses

All fonts are loaded from Google Fonts via CDN or system-ui fallback stacks:

| Font Family | Designer / Foundry | License | Notes |
| :--- | :--- | :--- | :--- |
| **Plus Jakarta Sans** | Tokotype (Gumpita Rahayu) | SIL Open Font License 1.1 | Display headings, hero text, card titles |
| **Sora** | Barnbrook (Jonathan Barnbrook) | SIL Open Font License 1.1 | Numerical figures, amounts, metric counters |
| **Inter** | Rasmus Andersson | SIL Open Font License 1.1 | Body typography, data tables, form controls |

---

## 5. Iconography

| Asset Package | Author | License | Description |
| :--- | :--- | :--- | :--- |
| **lucide-react** | Lucide Project / Cole Bemis | ISC License (Permissive) | Vector icon suite for navigation, status indicators, badges, and actions |

---

## 6. Software Dependency Register (`package.json`)

| Package Name | Version | License | Primary Function |
| :--- | :--- | :--- | :--- |
| `react` | `^18.3.1` | MIT | Reactive UI runtime |
| `react-dom` | `^18.3.1` | MIT | DOM rendering engine |
| `react-router-dom` | `^6.26.2` | MIT | Client-side routing & navigation |
| `three` | `^0.168.0` | MIT | WebGL 3D rendering library |
| `@react-three/fiber` | `^8.17.8` | MIT | React reconciler for Three.js |
| `@react-three/drei` | `^9.112.0` | MIT | High-performance Three.js abstractions & loaders |
| `framer-motion` | `^11.5.4` | MIT | Declarative spring animations & layout transitions |
| `zustand` | `^4.5.5` | MIT | Reactive client-side state store & persistence |
| `tailwindcss` | `^3.4.11` | MIT | Utility-first CSS engine |
| `clsx` | `^2.1.1` | MIT | Utility for constructing class strings |
| `tailwind-merge` | `^2.5.2` | MIT | Merge Tailwind class variants without style conflicts |
| `vite` | `^6.4.5` | MIT | Next-generation frontend tooling and bundler |
| `typescript` | `^5.5.3` | Apache-2.0 | Type-safe static analysis |
