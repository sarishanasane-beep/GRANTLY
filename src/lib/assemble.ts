/**
 * GRANTLY Fully Autonomous 18-Agent Self-Assembling Website Controller
 *
 * Implements Phase 03.5 Autonomous Assembly Architecture:
 * - Single autonomous state machine owning scrolling, agent dispatch, and band verification
 * - 0–1.2s: Scanner initialization (pulsing white 'G' logo badge, 18 clustered jittering cursors, 'Scanning page...' HUD)
 * - 1.2–1.8s: Design editor activates (calibrated top/left pixel rulers, cyan alignment guides, agents scattering)
 * - 1.8–5.2s: Band 0 (Hero & Nav) assembled autonomously with 6–8 concurrent workers
 * - 5.2–17.5s: Autonomous top-to-bottom RAF scroll through Bands 1 to 6 (Discovery, Matching, Tracker, Knowledge, Milestones, Gateway, Footer)
 *   - Fresh getBoundingClientRect() measured dynamically before every selection
 *   - Stationary viewport during active box expansions
 *   - 4 white corner handles, dimension badges, media placeholders, 1 in 5 red glitch guides, smooth left-to-right clip-path wipe reveals, audio clicks
 * - 17.5–19.5s: Completion: progress reaches 100%, smooth auto-scroll back to top (0px), 18 agents fly outward off-screen, full overlay teardown, normal scroll unlocked, non-intrusive completion badge
 * - Reload & Session: Runs consistently on page reload (F5) and fresh load; does not re-trigger on internal React Router SPA transitions
 * - Skip & Replay: Instant skip (✕ / Esc) restores all elements; global window.__grantlyReplayIntro() enables seamless replay
 */

import { useAppStore } from '@/store/useAppStore';

export interface AssembleOptions {
  force?: boolean;
  speedMultiplier?: number;
  onComplete?: () => void;
  onCancel?: () => void;
}

export interface AssembleController {
  cancel: () => void;
  replay: () => void;
  isComplete: () => boolean;
}

declare global {
  interface Window {
    __grantlyReplayIntro?: () => void;
  }
}

// In-memory flag: resets on document reload, persists across client-side React Router navigation
let hasAssembledInCurrentSession = false;

// 18 Distinct, vibrant, high-contrast multiplayer agent colors
export interface AgentDef {
  id: number;
  initial: string;
  color: string;
  name: string;
}

export const AGENTS_18: AgentDef[] = [
  { id: 0, initial: 'L', color: '#38BDF8', name: 'Liam' },     // Sky Blue
  { id: 1, initial: 'C', color: '#34D399', name: 'Chloe' },    // Mint
  { id: 2, initial: 'A', color: '#F59E0B', name: 'Alex' },     // Amber
  { id: 3, initial: 'E', color: '#A78BFA', name: 'Elena' },    // Violet
  { id: 4, initial: 'J', color: '#F43F5E', name: 'Jordan' },   // Rose
  { id: 5, initial: 'O', color: '#10B981', name: 'Oliver' },   // Emerald
  { id: 6, initial: 'S', color: '#06B6D4', name: 'Sophia' },   // Cyan
  { id: 7, initial: 'M', color: '#FBBF24', name: 'Maya' },     // Warm Gold
  { id: 8, initial: 'N', color: '#818CF8', name: 'Noah' },     // Indigo
  { id: 9, initial: 'Z', color: '#EC4899', name: 'Zoe' },      // Pink
  { id: 10, initial: 'E', color: '#14B8A6', name: 'Ethan' },   // Teal
  { id: 11, initial: 'I', color: '#FB923C', name: 'Isla' },    // Orange
  { id: 12, initial: 'L', color: '#8B5CF6', name: 'Lucas' },   // Purple
  { id: 13, initial: 'M', color: '#4ADE80', name: 'Mia' },     // Lime
  { id: 14, initial: 'K', color: '#E11D48', name: 'Kai' },     // Crimson
  { id: 15, initial: 'A', color: '#0EA5E9', name: 'Aria' },    // Deep Sky
  { id: 16, initial: 'R', color: '#D946EF', name: 'Ryan' },    // Fuchsia
  { id: 17, initial: 'T', color: '#FACC15', name: 'Tara' },    // Yellow
];

interface AgentState {
  def: AgentDef;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  isBusy: boolean;
  angle: number;
  el: HTMLElement;
}

interface TargetItem {
  key: string;
  element: HTMLElement;
  bandIndex: number;
  bandName: string;
  isMedia: boolean;
  label: string;
  isAssembled: boolean;
}

export function startAssembleIntro(options: AssembleOptions = {}): AssembleController {
  const isReducedMotion = useAppStore.getState().settings?.reducedMotion ?? false;

  if (!options.force && (isReducedMotion || hasAssembledInCurrentSession)) {
    options.onComplete?.();
    return {
      cancel: () => {},
      replay: () => startAssembleIntro({ force: true, onComplete: options.onComplete }),
      isComplete: () => true,
    };
  }

  hasAssembledInCurrentSession = true;

  // Clean up any existing overlay
  document.querySelectorAll('#grantly-assemble-master-overlay').forEach((el) => el.remove());
  document.querySelectorAll('#grantly-completion-badge').forEach((el) => el.remove());

  let isCancelled = false;
  let isFinished = false;
  let speedMultiplier = options.speedMultiplier || 1.0;
  let soundEnabled = true;
  let audioCtx: AudioContext | null = null;
  let animFrameId: number | null = null;
  const timeoutIds: number[] = [];

  // Synthesized lightweight audio clicks (zero external assets)
  function playTickSound(freq = 950, type: OscillatorType = 'sine', duration = 0.025) {
    if (!soundEnabled) return;
    try {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (_) {}
  }

  // Prevent user wheel and touch from fighting autonomous scrolling during intro
  const preventScroll = (e: Event) => {
    e.preventDefault();
  };
  const preventScrollKeys = (e: KeyboardEvent) => {
    if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(e.key)) {
      e.preventDefault();
    }
  };

  window.addEventListener('wheel', preventScroll, { passive: false });
  window.addEventListener('touchmove', preventScroll, { passive: false });
  window.addEventListener('keydown', preventScrollKeys, { passive: false });

  // 1. Discover all designated targets organized by viewport band
  const bandDefinitions = [
    {
      index: 0,
      name: 'Hero & Navigation',
      selector: 'header, section:first-of-type',
      targetKeys: [
        { key: 'brand-logo', isMedia: false, label: 'BRAND LOGO' },
        { key: 'nav-explore', isMedia: false, label: 'NAV LINK' },
        { key: 'nav-how-it-works', isMedia: false, label: 'NAV LINK' },
        { key: 'nav-about', isMedia: false, label: 'NAV LINK' },
        { key: 'nav-profile', isMedia: false, label: 'NAV LINK' },
        { key: 'nav-links', isMedia: false, label: 'NAVIGATION' },
        { key: 'nav-cta', isMedia: false, label: 'LAUNCHER' },
        { key: 'hero-tag', isMedia: false, label: 'CATEGORY' },
        { key: 'hero-headline', isMedia: false, label: 'HEADLINE' },
        { key: 'hero-headline-1', isMedia: false, label: 'HEADLINE 1' },
        { key: 'hero-headline-2', isMedia: false, label: 'HEADLINE 2' },
        { key: 'hero-subtext', isMedia: false, label: 'SUBTEXT' },
        { key: 'hero-cta', isMedia: false, label: 'ACTION CTA' },
        { key: 'hero-canvas', isMedia: true, label: '3D CRYSTAL' },
        { key: 'scroll-prompt', isMedia: false, label: 'SCROLL RADAR' },
      ],
    },
    {
      index: 1,
      name: 'Discovery Section',
      selector: '#how-it-works',
      targetKeys: [
        { key: 'discovery-tag', isMedia: false, label: 'SECTION 01' },
        { key: 'discovery-heading', isMedia: false, label: 'DISCOVERY' },
        { key: 'discovery-model', isMedia: true, label: '3D CERTIFICATE' },
        { key: 'discovery-pills', isMedia: false, label: 'GRANT PILLS' },
        { key: 'discovery-btn', isMedia: false, label: 'DIRECTORY LINK' },
      ],
    },
    {
      index: 2,
      name: 'Matching Engine',
      selector: 'section:nth-of-type(3)',
      targetKeys: [
        { key: 'matching-tag', isMedia: false, label: 'SECTION 02' },
        { key: 'matching-heading', isMedia: false, label: 'LOGIC RULES' },
        { key: 'matching-criteria', isMedia: false, label: 'CRITERIA' },
        { key: 'matching-model', isMedia: true, label: '3D MEDALLION' },
        { key: 'matching-btn', isMedia: false, label: 'SCORE CALCULATOR' },
      ],
    },
    {
      index: 3,
      name: 'Application Cockpit',
      selector: 'section:nth-of-type(4)',
      targetKeys: [
        { key: 'tracker-tag', isMedia: false, label: 'SECTION 03' },
        { key: 'tracker-heading', isMedia: false, label: 'MILESTONES' },
        { key: 'tracker-model', isMedia: true, label: '3D FOLDER' },
        { key: 'tracker-btn', isMedia: false, label: 'TRACKER LINK' },
      ],
    },
    {
      index: 4,
      name: 'Knowledge Blueprints',
      selector: 'section:nth-of-type(5)',
      targetKeys: [
        { key: 'knowledge-tag', isMedia: false, label: 'SECTION 04' },
        { key: 'knowledge-heading', isMedia: false, label: 'SOP BLUEPRINTS' },
        { key: 'knowledge-model', isMedia: true, label: '3D BOOK' },
        { key: 'knowledge-btn', isMedia: false, label: 'VAULT LINK' },
      ],
    },
    {
      index: 5,
      name: 'Academic Mission',
      selector: '#about',
      targetKeys: [
        { key: 'milestones-tag', isMedia: false, label: 'SECTION 05' },
        { key: 'milestones-heading', isMedia: false, label: 'MISSION' },
        { key: 'milestones-model', isMedia: true, label: '3D CAP' },
        { key: 'milestones-metrics', isMedia: false, label: 'METRICS' },
        { key: 'milestones-btn', isMedia: false, label: 'COMPARE LINK' },
      ],
    },
    {
      index: 6,
      name: 'Opportunity Gateway & Footer',
      selector: 'section:last-of-type, footer',
      targetKeys: [
        { key: 'final-tag', isMedia: false, label: 'SECTION 06' },
        { key: 'final-heading', isMedia: false, label: 'GATEWAY' },
        { key: 'final-pillar', isMedia: true, label: '3D PILLAR' },
        { key: 'final-buttons', isMedia: false, label: 'ONBOARDING' },
        { key: 'final-shield', isMedia: false, label: 'VERIFIED BADGE' },
        { key: 'footer-brand', isMedia: false, label: 'INSIGNIA' },
        { key: 'footer-links', isMedia: false, label: 'FOOTER' },
      ],
    },
  ];

  const allTargets: TargetItem[] = [];
  const seenElements = new Set<HTMLElement>();

  bandDefinitions.forEach((band) => {
    band.targetKeys.forEach((item) => {
      const el = document.querySelector(`[data-assemble="${item.key}"]`) as HTMLElement | null;
      if (el && !seenElements.has(el)) {
        seenElements.add(el);
        allTargets.push({
          key: item.key,
          element: el,
          bandIndex: band.index,
          bandName: band.name,
          isMedia: item.isMedia,
          label: item.label,
          isAssembled: false,
        });
      }
    });
  });

  const totalTargetsCount = Math.max(1, allTargets.length);

  // Initially mask all targets with subtle clip-path / blur for clean progressive reveals
  allTargets.forEach((t) => {
    const el = t.element;
    el.style.opacity = '0';
    el.style.clipPath = 'inset(0 100% 0 0)';
    el.style.filter = 'blur(4px)';
    el.style.transition = 'none';
  });

  // 2. Master Assembly Overlay
  const masterOverlay = document.createElement('div');
  masterOverlay.id = 'grantly-assemble-master-overlay';
  masterOverlay.className = 'fixed inset-0 pointer-events-none z-[99990] overflow-hidden select-none font-sans';
  document.body.appendChild(masterOverlay);

  // 0-1.2s Scanner Veil
  const scannerVeil = document.createElement('div');
  scannerVeil.className =
    'absolute inset-0 bg-[#0B0F0D] flex flex-col items-center justify-center transition-opacity duration-600 pointer-events-none z-10';
  masterOverlay.appendChild(scannerVeil);

  // Central Pulsing White 'G' Logo Badge
  const centerLogoBadge = document.createElement('div');
  centerLogoBadge.className =
    'relative w-14 h-14 rounded-2xl bg-white shadow-[0_8px_32px_rgba(0,0,0,0.6)] flex items-center justify-center transform transition-transform duration-300';
  centerLogoBadge.innerHTML = `
    <span class="font-display font-black text-2xl text-[#0B0F0D] tracking-tighter select-none">G</span>
    <div class="absolute inset-0 rounded-2xl border-2 border-white/40 animate-ping pointer-events-none"></div>
  `;
  scannerVeil.appendChild(centerLogoBadge);

  // Top Pixel Ruler (24px high)
  const topRuler = document.createElement('div');
  topRuler.id = 'grantly-ruler-top';
  topRuler.className =
    'absolute top-0 left-0 right-0 h-6 bg-[#111613] border-b border-white/10 z-20 pointer-events-none transition-all duration-400 -translate-y-full';
  topRuler.innerHTML = `
    <div class="relative w-full h-full flex items-end pl-6 overflow-hidden">
      <canvas id="top-ruler-canvas" class="w-full h-full block"></canvas>
    </div>
  `;
  masterOverlay.appendChild(topRuler);

  // Left Pixel Ruler (24px wide)
  const leftRuler = document.createElement('div');
  leftRuler.id = 'grantly-ruler-left';
  leftRuler.className =
    'absolute top-6 left-0 bottom-0 w-6 bg-[#111613] border-r border-white/10 z-20 pointer-events-none transition-all duration-400 -translate-x-full';
  leftRuler.innerHTML = `
    <div class="relative w-full h-full flex items-start overflow-hidden">
      <canvas id="left-ruler-canvas" class="w-full h-full block"></canvas>
    </div>
  `;
  masterOverlay.appendChild(leftRuler);

  // Draw Ruler Ticks on Canvas
  function renderRulers() {
    const topCanvas = masterOverlay.querySelector('#top-ruler-canvas') as HTMLCanvasElement | null;
    const leftCanvas = masterOverlay.querySelector('#left-ruler-canvas') as HTMLCanvasElement | null;
    if (!topCanvas || !leftCanvas) return;

    const w = window.innerWidth;
    const h = window.innerHeight;

    topCanvas.width = w;
    topCanvas.height = 24;
    leftCanvas.width = 24;
    leftCanvas.height = h;

    const topCtx = topCanvas.getContext('2d');
    const leftCtx = leftCanvas.getContext('2d');
    if (!topCtx || !leftCtx) return;

    // Top Ruler
    topCtx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    topCtx.fillStyle = '#8CA98C';
    topCtx.font = '9px monospace';
    topCtx.lineWidth = 1;

    for (let x = 24; x < w; x += 10) {
      topCtx.beginPath();
      if (x % 100 === 0) {
        topCtx.moveTo(x, 10);
        topCtx.lineTo(x, 24);
        topCtx.fillText(String(x), x + 2, 9);
      } else if (x % 50 === 0) {
        topCtx.moveTo(x, 15);
        topCtx.lineTo(x, 24);
      } else {
        topCtx.moveTo(x, 19);
        topCtx.lineTo(x, 24);
      }
      topCtx.stroke();
    }

    // Left Ruler
    leftCtx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    leftCtx.fillStyle = '#8CA98C';
    leftCtx.font = '9px monospace';
    leftCtx.lineWidth = 1;

    for (let y = 0; y < h; y += 10) {
      leftCtx.beginPath();
      if (y % 100 === 0) {
        leftCtx.moveTo(10, y);
        leftCtx.lineTo(24, y);
        leftCtx.save();
        leftCtx.translate(2, y + 10);
        leftCtx.rotate(-Math.PI / 2);
        leftCtx.fillText(String(y), 0, 7);
        leftCtx.restore();
      } else if (y % 50 === 0) {
        leftCtx.moveTo(15, y);
        leftCtx.lineTo(24, y);
      } else {
        leftCtx.moveTo(19, y);
        leftCtx.lineTo(24, y);
      }
      leftCtx.stroke();
    }
  }
  renderRulers();
  window.addEventListener('resize', renderRulers);

  // Guides & Selection Layer
  const guidesLayer = document.createElement('div');
  guidesLayer.className = 'absolute inset-0 pointer-events-none z-20';
  masterOverlay.appendChild(guidesLayer);

  const selectionLayer = document.createElement('div');
  selectionLayer.className = 'absolute inset-0 pointer-events-none z-25';
  masterOverlay.appendChild(selectionLayer);

  const cursorLayer = document.createElement('div');
  cursorLayer.className = 'absolute inset-0 pointer-events-none z-30';
  masterOverlay.appendChild(cursorLayer);

  // Bottom Control HUD (Exact recreation of reference bar)
  const bottomHUD = document.createElement('div');
  bottomHUD.className =
    'fixed bottom-6 left-1/2 -translate-x-1/2 z-[99999] pointer-events-auto bg-[#18181b]/95 border border-white/10 rounded-full px-4 py-2 shadow-2xl backdrop-blur-md flex items-center gap-3 text-xs text-[#F5F7F5] select-none transition-all duration-400';
  bottomHUD.innerHTML = `
    <div id="hud-status-section" class="flex items-center gap-2.5">
      <div id="hud-scanning-spinner" class="w-3.5 h-3.5 border-2 border-white/30 border-t-[#38BDF8] rounded-full animate-spin"></div>
      <span id="hud-status-text" class="font-mono text-[11px] text-[#A1A1AA]">Scanning page...</span>
    </div>

    <div id="hud-avatars" class="hidden items-center -space-x-1.5">
      ${AGENTS_18.slice(0, 5)
        .map(
          (a) =>
            `<span class="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-black border border-black/40 shadow-sm" style="background:${a.color}">${a.initial}</span>`
        )
        .join('')}
    </div>

    <div id="hud-progress-section" class="hidden items-center gap-2 font-mono text-[11px]">
      <span id="hud-layer-counter" class="text-white font-semibold">0 / ${totalTargetsCount} layers</span>
      <div class="w-24 h-1.5 rounded-full bg-white/10 overflow-hidden">
        <div id="hud-progress-fill" class="h-full bg-gradient-to-r from-[#0284C7] to-[#38BDF8] transition-all duration-300 w-0"></div>
      </div>
    </div>

    <div class="flex items-center gap-1.5 pl-1 border-l border-white/10 text-[11px] font-mono">
      <button id="hud-tour-btn" class="px-2.5 py-0.5 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer">
        Tour
      </button>
      <button id="hud-speed-btn" class="px-2 py-0.5 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer">
        ${speedMultiplier}x
      </button>
      <button id="hud-sound-btn" class="p-1 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer" title="Toggle audio feedback">
        <svg id="hud-sound-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
        </svg>
      </button>
      <button id="hud-skip-btn" class="p-1 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer ml-0.5" title="Skip Intro (Esc)">
        ✕
      </button>
    </div>
  `;
  masterOverlay.appendChild(bottomHUD);

  const statusText = bottomHUD.querySelector('#hud-status-text') as HTMLElement;
  const scanningSpinner = bottomHUD.querySelector('#hud-scanning-spinner') as HTMLElement;
  const hudAvatars = bottomHUD.querySelector('#hud-avatars') as HTMLElement;
  const hudProgressSection = bottomHUD.querySelector('#hud-progress-section') as HTMLElement;
  const hudLayerCounter = bottomHUD.querySelector('#hud-layer-counter') as HTMLElement;
  const hudProgressFill = bottomHUD.querySelector('#hud-progress-fill') as HTMLElement;
  const speedBtn = bottomHUD.querySelector('#hud-speed-btn') as HTMLElement;
  const soundBtn = bottomHUD.querySelector('#hud-sound-btn') as HTMLElement;
  const soundIcon = bottomHUD.querySelector('#hud-sound-icon') as SVGElement;
  const skipBtn = bottomHUD.querySelector('#hud-skip-btn') as HTMLElement;
  const tourBtn = bottomHUD.querySelector('#hud-tour-btn') as HTMLElement;

  soundBtn.onclick = () => {
    soundEnabled = !soundEnabled;
    soundIcon.style.opacity = soundEnabled ? '1' : '0.4';
    if (soundEnabled) playTickSound(1000, 'sine', 0.03);
  };

  speedBtn.onclick = () => {
    if (speedMultiplier === 1.0) speedMultiplier = 2.0;
    else if (speedMultiplier === 2.0) speedMultiplier = 0.5;
    else speedMultiplier = 1.0;
    speedBtn.innerText = `${speedMultiplier}x`;
    playTickSound(1200, 'sine', 0.02);
  };

  tourBtn.onclick = () => {
    statusText.innerText = 'Tour: Autonomous Full-Page Controller';
    playTickSound(800, 'triangle', 0.04);
  };

  skipBtn.onclick = () => cleanup(true);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') cleanup(true);
  };
  window.addEventListener('keydown', handleKeyDown);

  // 3. Instantiate 18 Colored Arrow Cursors
  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;

  const agents: AgentState[] = AGENTS_18.map((def, i) => {
    const el = document.createElement('div');
    el.className = 'absolute top-0 left-0 pointer-events-none will-change-transform z-30 transition-opacity duration-300';
    el.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" class="drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]">
        <path d="M2 2L17 8.5L9.5 11L7 18.5L2 2Z" fill="${def.color}" stroke="#0B0F0D" stroke-width="1.5" stroke-linejoin="round" />
      </svg>
    `;
    cursorLayer.appendChild(el);

    const angle = (i / AGENTS_18.length) * Math.PI * 2;
    const initialRadius = 80 + (i % 3) * 35;
    const initX = centerX + Math.cos(angle) * initialRadius;
    const initY = centerY + Math.sin(angle) * initialRadius;

    return {
      def,
      x: initX,
      y: initY,
      targetX: initX,
      targetY: initY,
      isBusy: false,
      angle,
      el,
    };
  });

  // 4. Smooth 60fps Cursor Render Loop
  let frameCount = 0;
  let phase: 'scan' | 'editor' | 'idle' | 'flyout' = 'scan';

  function renderFrame() {
    if (isCancelled || isFinished) return;
    frameCount++;

    agents.forEach((agent, i) => {
      if (phase === 'scan') {
        const currentRadius = 70 + Math.sin(frameCount * 0.05 + i) * 15;
        const currentAngle = agent.angle + frameCount * 0.015;
        agent.targetX = centerX + Math.cos(currentAngle) * currentRadius;
        agent.targetY = centerY + Math.sin(currentAngle) * currentRadius;
      } else if (phase === 'idle' && !agent.isBusy) {
        agent.targetX += Math.cos(frameCount * 0.02 + i) * 0.4;
        agent.targetY += Math.sin(frameCount * 0.02 + i) * 0.4;
      }

      const lerp = phase === 'flyout' ? 0.08 : Math.min(1, 0.14 * speedMultiplier);
      agent.x += (agent.targetX - agent.x) * lerp;
      agent.y += (agent.targetY - agent.y) * lerp;
      agent.el.style.transform = `translate3d(${Math.round(agent.x)}px, ${Math.round(agent.y)}px, 0)`;
    });

    animFrameId = requestAnimationFrame(renderFrame);
  }
  animFrameId = requestAnimationFrame(renderFrame);

  // 5. Autonomous RequestAnimationFrame Smooth Scroll Tween
  function smoothScrollTo(targetY: number, durationMs = 600): Promise<void> {
    return new Promise((resolve) => {
      if (isCancelled) {
        resolve();
        return;
      }
      const startY = window.scrollY;
      const distance = targetY - startY;
      if (Math.abs(distance) < 2) {
        resolve();
        return;
      }
      const startTime = performance.now();
      const actualDuration = Math.max(300, durationMs / speedMultiplier);

      function step(now: number) {
        if (isCancelled) {
          resolve();
          return;
        }
        const elapsed = (now - startTime) / actualDuration;
        if (elapsed >= 1) {
          window.scrollTo(0, targetY);
          resolve();
        } else {
          // Smooth cubic bezier easing: in-out
          const progress =
            elapsed < 0.5 ? 4 * elapsed * elapsed * elapsed : 1 - Math.pow(-2 * elapsed + 2, 3) / 2;
          window.scrollTo(0, startY + distance * progress);
          requestAnimationFrame(step);
        }
      }
      requestAnimationFrame(step);
    });
  }

  // 6. Cleanup Function
  function cleanup(wasSkipped = false) {
    if (isCancelled) return;
    isCancelled = true;
    isFinished = true;

    if (animFrameId) cancelAnimationFrame(animFrameId);
    timeoutIds.forEach((t) => clearTimeout(t));
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('resize', renderRulers);
    window.removeEventListener('wheel', preventScroll);
    window.removeEventListener('touchmove', preventScroll);
    window.removeEventListener('keydown', preventScrollKeys);

    // Restore all target elements to 100% visible, unclipped, unblurred natural state
    document.querySelectorAll('[data-assemble]').forEach((node) => {
      const el = node as HTMLElement;
      el.style.opacity = '1';
      el.style.clipPath = 'none';
      el.style.filter = 'none';
      el.style.transform = '';
      el.style.transition = '';
    });

    if (wasSkipped) {
      masterOverlay.remove();
      options.onCancel?.();
    } else {
      masterOverlay.style.transition = 'opacity 0.5s ease-out';
      masterOverlay.style.opacity = '0';
      setTimeout(() => masterOverlay.remove(), 500);
      options.onComplete?.();
    }
  }

  // 7. Small Floating Completion Badge (Displays after clean finish)
  function showCompletionBadge() {
    const badge = document.createElement('div');
    badge.id = 'grantly-completion-badge';
    badge.className =
      'fixed bottom-6 left-1/2 -translate-x-1/2 z-[99999] pointer-events-auto bg-[#1F2A1F]/95 border border-[#3E5A3F] rounded-2xl px-6 py-3 shadow-2xl backdrop-blur-md flex items-center gap-6 text-xs text-[#F5F7F5] transition-all duration-400 opacity-0 translate-y-3';
    badge.innerHTML = `
      <div class="flex items-center gap-3">
        <div class="w-2.5 h-2.5 rounded-full bg-[#38BDF8] shadow-[0_0_12px_#38BDF8] animate-pulse"></div>
        <div>
          <span class="text-[#F5F7F5] font-semibold block text-[12px]">✦ Assembled by 18 Autonomous Agents</span>
          <span class="text-[#8CA98C] text-[10px] block font-mono">100% Deterministic Interface Ready</span>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <button id="badge-replay-btn" class="px-3.5 py-1.5 text-xs font-semibold rounded-full bg-[#3E5A3F]/70 text-[#D9C7A3] hover:bg-[#3E5A3F] border border-[#D9C7A3]/30 transition-colors flex items-center gap-1 cursor-pointer">
          ↻ Replay
        </button>
        <button id="badge-close-btn" class="p-1 rounded text-[#8CA98C] hover:text-[#F5F7F5] transition-colors cursor-pointer text-sm">
          ✕
        </button>
      </div>
    `;
    document.body.appendChild(badge);

    requestAnimationFrame(() => {
      badge.style.opacity = '1';
      badge.style.transform = 'translate(-50%, 0)';
    });

    const replayBtn = badge.querySelector('#badge-replay-btn') as HTMLElement;
    const closeBtn = badge.querySelector('#badge-close-btn') as HTMLElement;

    replayBtn.onclick = () => {
      badge.remove();
      startAssembleIntro({ force: true, onComplete: options.onComplete });
    };

    closeBtn.onclick = () => badge.remove();

    // Auto-hide badge after 8 seconds
    setTimeout(() => {
      if (badge && badge.parentElement) {
        badge.style.opacity = '0';
        badge.style.transform = 'translate(-50%, 8px)';
        setTimeout(() => badge.remove(), 400);
      }
    }, 8000);
  }

  // 8. Figma-Style Selection Box & Guides Factory
  let selectionCounter = 0;

  function spawnSelection(
    target: TargetItem,
    agent: AgentState
  ): {
    box: HTMLElement;
    guides: HTMLElement;
    revealElement: () => void;
    dismiss: () => void;
  } {
    selectionCounter++;
    // Always compute fresh bounding box
    const rect = target.element.getBoundingClientRect();
    const isGlitchRed = selectionCounter % 5 === 0;
    const accentColor = isGlitchRed ? '#EF4444' : agent.def.color || '#0284C7';
    const widthInt = Math.max(16, Math.round(rect.width));
    const heightInt = Math.max(14, Math.round(rect.height));

    // Dynamic Alignment Guides
    const guides = document.createElement('div');
    guides.className = 'absolute inset-0 pointer-events-none transition-opacity duration-200';
    guides.innerHTML = `
      <div class="absolute left-0 right-0 border-t ${
        isGlitchRed ? 'border-red-500/80' : 'border-[#0284C7]/60'
      } border-dashed pointer-events-none" style="top:${rect.top}px"></div>
      <div class="absolute top-0 bottom-0 border-l ${
        isGlitchRed ? 'border-red-500/80' : 'border-[#0284C7]/60'
      } border-dashed pointer-events-none" style="left:${rect.left}px"></div>
    `;
    guidesLayer.appendChild(guides);

    // Selection Box Container
    const box = document.createElement('div');
    box.className = 'figma-selection-box absolute pointer-events-none transition-all duration-300 ease-out';
    box.setAttribute('data-figma-box', 'true');
    box.style.left = `${rect.left}px`;
    box.style.top = `${rect.top}px`;
    box.style.width = '0px';
    box.style.height = '0px';
    box.style.border = `1.5px solid ${accentColor}`;
    box.style.borderRadius = '2px';
    box.style.boxShadow = `0 0 12px ${accentColor}44`;

    box.innerHTML = `
      <!-- 4 White Corner Handles -->
      <div class="figma-corner-handle absolute -top-[4px] -left-[4px] w-[6px] h-[6px] bg-white border border-[${accentColor}] shadow-sm"></div>
      <div class="figma-corner-handle absolute -top-[4px] -right-[4px] w-[6px] h-[6px] bg-white border border-[${accentColor}] shadow-sm"></div>
      <div class="figma-corner-handle absolute -bottom-[4px] -left-[4px] w-[6px] h-[6px] bg-white border border-[${accentColor}] shadow-sm"></div>
      <div class="figma-corner-handle absolute -bottom-[4px] -right-[4px] w-[6px] h-[6px] bg-white border border-[${accentColor}] shadow-sm"></div>

      <!-- Blue Dimension Badge -->
      <div class="figma-dimension-badge absolute -bottom-[20px] right-0 px-1.5 py-0.5 rounded-[2px] text-[10px] font-mono font-bold text-white shadow-md whitespace-nowrap pointer-events-none flex items-center gap-1" style="background:${accentColor}">
        <span>${widthInt} × ${heightInt}</span>
      </div>

      <!-- Media Placeholder for Canvas/3D models -->
      ${
        target.isMedia
          ? `<div class="absolute inset-0 bg-white/10 flex items-center justify-center pointer-events-none overflow-hidden">
               <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="1.5">
                 <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                 <circle cx="8.5" cy="8.5" r="1.5"></circle>
                 <polyline points="21 15 16 10 5 21"></polyline>
               </svg>
             </div>`
          : ''
      }
    `;
    selectionLayer.appendChild(box);

    // Expand box
    requestAnimationFrame(() => {
      box.style.width = `${rect.width}px`;
      box.style.height = `${rect.height}px`;
    });

    const revealElement = () => {
      const el = target.element;
      el.style.transition = `clip-path ${0.4 / speedMultiplier}s cubic-bezier(0.16, 1, 0.3, 1), opacity ${
        0.3 / speedMultiplier
      }s ease-out, filter ${0.25 / speedMultiplier}s ease-out`;
      el.style.opacity = '1';
      el.style.clipPath = 'inset(0 0% 0 0)';
      el.style.filter = 'blur(0px)';
      target.isAssembled = true;
      playTickSound(isGlitchRed ? 600 : 900 + Math.random() * 200);
    };

    const dismiss = () => {
      box.style.transition = 'opacity 0.2s ease-out';
      box.style.opacity = '0';
      guides.style.opacity = '0';
      setTimeout(() => {
        box.remove();
        guides.remove();
      }, 200);
    };

    return { box, guides, revealElement, dismiss };
  }

  // 9. Core Unit Assembly Procedure
  let assembledCount = 0;

  function updateHUDCounter() {
    assembledCount = allTargets.filter((t) => t.isAssembled).length;
    hudLayerCounter.innerText = `${assembledCount} / ${totalTargetsCount} layers`;
    const percent = Math.min(100, Math.round((assembledCount / totalTargetsCount) * 100));
    hudProgressFill.style.width = `${percent}%`;
  }

  async function assembleUnit(target: TargetItem, agent: AgentState): Promise<void> {
    if (isCancelled || target.isAssembled) return;

    // Fresh measurement right before selection
    const rect = target.element.getBoundingClientRect();
    if (rect.width < 5 || rect.height < 5) {
      target.element.style.opacity = '1';
      target.element.style.clipPath = 'none';
      target.element.style.filter = 'none';
      target.isAssembled = true;
      updateHUDCounter();
      return;
    }

    agent.isBusy = true;

    // 1. Move agent to element top-left corner
    agent.targetX = rect.left;
    agent.targetY = rect.top;

    await new Promise((r) => {
      const t = window.setTimeout(r, 220 / speedMultiplier);
      timeoutIds.push(t);
    });
    if (isCancelled) return;

    // 2. Spawn selection box
    const selection = spawnSelection(target, agent);

    // 3. Glide cursor toward bottom-right as box expands
    agent.targetX = rect.left + rect.width;
    agent.targetY = rect.top + rect.height;

    await new Promise((r) => {
      const t = window.setTimeout(r, 340 / speedMultiplier);
      timeoutIds.push(t);
    });
    if (isCancelled) {
      selection.dismiss();
      return;
    }

    // 4. Reveal real DOM element with clean left-to-right wipe
    selection.revealElement();
    updateHUDCounter();

    await new Promise((r) => {
      const t = window.setTimeout(r, 200 / speedMultiplier);
      timeoutIds.push(t);
    });

    // 5. Dismiss selection box
    selection.dismiss();
    agent.isBusy = false;
  }

  // 10. Autonomous Viewport Band Orchestrator
  async function runMasterTimeline() {
    // --- Phase 1: SCANNING (0 to 1.2s) ---
    await new Promise((r) => {
      const t = window.setTimeout(r, 1200 / speedMultiplier);
      timeoutIds.push(t);
    });
    if (isCancelled) return;

    // --- Phase 2: SCATTERING & EDITOR ACTIVATION (1.2 to 1.8s) ---
    phase = 'editor';
    scannerVeil.style.opacity = '0';
    setTimeout(() => scannerVeil.remove(), 600);

    topRuler.style.transform = 'translateY(0)';
    leftRuler.style.transform = 'translateX(0)';

    scanningSpinner.classList.add('hidden');
    hudAvatars.classList.remove('hidden');
    hudAvatars.classList.add('flex');
    hudProgressSection.classList.remove('hidden');
    hudProgressSection.classList.add('flex');
    updateHUDCounter();

    // Scatter 18 agents across viewport
    agents.forEach((agent, i) => {
      const quad = i % 4;
      const spreadX = quad === 0 || quad === 3 ? 0.2 : 0.8;
      const spreadY = quad < 2 ? 0.3 : 0.7;
      agent.targetX = window.innerWidth * spreadX + (Math.random() - 0.5) * 200;
      agent.targetY = window.innerHeight * spreadY + (Math.random() - 0.5) * 150;
    });

    await new Promise((r) => {
      const t = window.setTimeout(r, 550 / speedMultiplier);
      timeoutIds.push(t);
    });
    if (isCancelled) return;

    // --- Phase 3: AUTONOMOUS TOP-TO-BOTTOM BAND-BY-BAND ASSEMBLY ---
    // Start stationary at Top (Band 0)
    window.scrollTo(0, 0);

    for (let bandIdx = 0; bandIdx < bandDefinitions.length; bandIdx++) {
      if (isCancelled) return;
      const bandDef = bandDefinitions[bandIdx];

      // Update HUD status label for current band
      statusText.innerText = bandDef.name;

      // If not Band 0, autonomously tween-scroll to the band's DOM section
      if (bandIdx > 0) {
        let sectionEl = document.querySelector(bandDef.selector) as HTMLElement | null;
        if (!sectionEl && bandDef.index === 6) {
          sectionEl = document.querySelector('footer');
        }

        if (sectionEl) {
          // Compute exact scroll destination
          const targetY = Math.max(0, sectionEl.getBoundingClientRect().top + window.scrollY - 30);
          await smoothScrollTo(targetY, 650);
          // Wait 150ms for layout geometry to stabilize
          await new Promise((r) => {
            const t = window.setTimeout(r, 150 / speedMultiplier);
            timeoutIds.push(t);
          });
        }
      }

      if (isCancelled) return;

      // Collect all targets for this band
      const bandTargets = allTargets.filter((t) => t.bandIndex === bandIdx && !t.isAssembled);

      // Concurrently assemble this band's targets using 6–8 active workers
      const queue = [...bandTargets];
      const concurrency = Math.min(8, Math.max(4, queue.length));

      async function runWorker(workerId: number) {
        const agent = agents[workerId % agents.length];
        while (queue.length > 0 && !isCancelled) {
          const nextTarget = queue.shift();
          if (nextTarget) {
            await assembleUnit(nextTarget, agent);
            await new Promise((r) => {
              const t = window.setTimeout(r, 50 / speedMultiplier);
              timeoutIds.push(t);
            });
          }
        }
      }

      const workers = Array.from({ length: concurrency }, (_, i) => runWorker(i));
      await Promise.all(workers);

      // Verify all targets in this band are revealed
      bandTargets.forEach((t) => {
        if (!t.isAssembled) {
          t.element.style.opacity = '1';
          t.element.style.clipPath = 'none';
          t.element.style.filter = 'none';
          t.isAssembled = true;
        }
      });
      updateHUDCounter();
    }

    if (isCancelled) return;

    // Ensure all targets across all bands are completely revealed & unclipped before returning to top
    document.querySelectorAll('[data-assemble]').forEach((node) => {
      const el = node as HTMLElement;
      el.style.clipPath = 'none';
      el.style.opacity = '1';
      el.style.filter = 'none';
      el.style.transform = '';
      el.style.transition = '';
    });
    allTargets.forEach((t) => {
      t.isAssembled = true;
    });

    // --- Phase 4: COMPLETION & FLYOUT (100% Assembly Finished) ---
    // Mark progress 100%
    hudProgressFill.style.width = '100%';
    hudLayerCounter.innerText = `${totalTargetsCount} / ${totalTargetsCount} layers (100%)`;
    statusText.innerText = 'Assembly Complete: Returning to Top';

    // 1. Smoothly scroll back to the top
    await smoothScrollTo(0, 850);
    if (isCancelled) return;

    // 2. Fly all 18 agents outward off-screen through top-right and screen edges
    phase = 'flyout';
    agents.forEach((agent, i) => {
      const angle = -Math.PI / 4 + ((i - 9) / 18) * Math.PI;
      agent.targetX = centerX + Math.cos(angle) * (window.innerWidth + 400);
      agent.targetY = centerY + Math.sin(angle) * (window.innerHeight + 400);
    });

    // 3. Slide rulers out
    topRuler.style.transform = 'translateY(-100%)';
    leftRuler.style.transform = 'translateX(-100%)';

    await new Promise((r) => {
      const t = window.setTimeout(r, 750 / speedMultiplier);
      timeoutIds.push(t);
    });

    // 4. Complete cleanup & teardown
    cleanup(false);

    // 5. Present small completion badge
    showCompletionBadge();
  }

  // Start autonomous controller
  runMasterTimeline().catch(() => cleanup(true));

  return {
    cancel: () => cleanup(true),
    replay: () => {
      cleanup(true);
      return startAssembleIntro({ force: true, onComplete: options.onComplete });
    },
    isComplete: () => isFinished,
  };
}
