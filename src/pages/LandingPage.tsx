import React, { Suspense } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useSpring, useReducedMotion } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/Button';
import { AssembleIntro } from '@/components/intro/AssembleIntro';
import { ScrollModelCanvas } from '@/three/models/ScrollModelCanvas';
import { useSEO } from '@/hooks/useSEO';
import {
  ArrowRight,
  ShieldCheck,
  ChevronDown,
  CheckCircle2,
} from 'lucide-react';

// Lazy-load the primary Hero 3D Canvas
const GrantlyCanvas = React.lazy(() => import('@/three/GrantlyCanvas'));

export const LandingPage: React.FC = () => {
  const settings = useAppStore((state) => state.settings);
  const prefersReduced = useReducedMotion();
  const shouldReduceMotion = prefersReduced || settings.reducedMotion;

  // Global scroll progress indicator for smooth cinematic feedback
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 30,
    restDelta: 0.001,
  });

  useSEO({
    title: 'GRANTLY — Intelligence Layer for Student Scholarships',
    description: 'Autonomous multi-factor matching, document readiness audits, deadline tracking, and unified eligibility for higher education grants.',
  });

  return (
    <div className="relative selection:bg-[#3E5A3F]/50 selection:text-[#D9C7A3] bg-transparent text-[#F5F7F5] min-h-screen overflow-x-hidden font-sans">
      {/* Top Scroll Progress Indicator */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#3E5A3F] via-[#8CA98C] to-[#D9C7A3] origin-left z-50 pointer-events-none"
        style={{ scaleX }}
      />

      {/* 12-Agent Self-Assembling Intro Animation */}
      <AssembleIntro />

      {/* Main Content Sections Layer */}
      <div className="relative z-10 flex flex-col">
        {/* =======================================================================
            SECTION 01: MINIMALIST CINEMATIC HERO (First Viewport)
            Visually dominant, fits within 100svh without clipping
            ======================================================================= */}
        <section className="relative min-h-[100svh] flex flex-col justify-between px-6 sm:px-10 lg:px-16 pt-24 pb-8 sm:pt-28 sm:pb-12">
          <div className="w-full max-w-7xl mx-auto my-auto py-4 sm:py-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              
              {/* Left Column: Minimalist Typography & Single Primary CTA */}
              <motion.div
                initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                className="lg:col-span-7 space-y-6 text-left"
              >
                {/* Brand Category Tag */}
                <div data-assemble="hero-tag" className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1F2A1F]/80 border border-[#3E5A3F]/50 backdrop-blur-md text-[11px] font-mono tracking-[0.25em] text-[#8CA98C] uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D9C7A3] animate-pulse"></span>
                  <span>Higher Education Capital</span>
                </div>

                {/* Minimalist Editorial Headline */}
                <div data-assemble="hero-headline" className="space-y-1">
                  <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl xl:text-8xl font-normal tracking-tight text-[#F5F7F5] leading-[1.02]">
                    <span data-assemble="hero-headline-1" className="block font-medium">Your next chapter</span>
                    <span data-assemble="hero-headline-2" className="block text-[#D9C7A3] font-light">starts here.</span>
                  </h1>
                </div>

                {/* Minimal Supporting Line */}
                <p data-assemble="hero-subtext" className="text-base sm:text-lg text-[#8CA98C] font-normal leading-relaxed max-w-md">
                  Find the opportunities that can take you further.
                </p>

                {/* Single Primary Action */}
                <div data-assemble="hero-cta" className="pt-3">
                  <Link to="/explore" className="inline-block relative z-20">
                    <Button
                      size="lg"
                      variant="primary"
                      rightIcon={<ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                      className="bg-[#D9C7A3] hover:bg-[#F5F7F5] text-[#0B0F0D] font-medium px-8 py-4 rounded-full shadow-[0_0_25px_rgba(217,199,163,0.25)] hover:shadow-[0_0_35px_rgba(217,199,163,0.4)] hover:-translate-y-0.5 transition-all text-sm tracking-wide"
                    >
                      Explore opportunities
                    </Button>
                  </Link>
                </div>
              </motion.div>

              {/* Right Column: Free-Floating 3D Emerald Crystal Centerpiece */}
              <motion.div
                data-assemble="hero-canvas"
                initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="lg:col-span-5 relative flex items-center justify-center min-h-[340px] sm:min-h-[440px] lg:min-h-[480px]"
              >
                {/* Soft ambient radial aura behind the sphere */}
                <div className="absolute w-72 h-72 rounded-full bg-[#3E5A3F]/15 blur-3xl pointer-events-none" />

                {/* 3D WebGL Gateway & Sphere (Free-floating, no rectangular cage) */}
                <div className="relative w-full h-[340px] sm:h-[440px] lg:h-[480px] flex items-center justify-center pointer-events-auto">
                  <Suspense
                    fallback={
                      <div className="flex flex-col items-center justify-center space-y-2 opacity-50">
                        <div className="w-8 h-8 rounded-full border-2 border-[#3E5A3F]/40 border-t-[#D9C7A3] animate-spin" />
                        <span className="text-[10px] font-mono text-[#8CA98C] tracking-widest">
                          INITIALIZING 3D ENVIRONMENT
                        </span>
                      </div>
                    }
                  >
                    <GrantlyCanvas className="w-full h-full" reducedMotion={shouldReduceMotion} />
                  </Suspense>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Minimalist Scroll Prompt */}
          <div data-assemble="scroll-prompt" className="relative z-10 w-full flex justify-center pb-2">
            <a
              href="#how-it-works"
              className="group flex flex-col items-center gap-1.5 text-[10px] uppercase font-mono tracking-[0.25em] text-[#8CA98C] hover:text-[#D9C7A3] transition-colors"
            >
              <span>Scroll to discover</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#D9C7A3] group-hover:translate-y-1 transition-transform" />
            </a>
          </div>
        </section>

        {/* =======================================================================
            SECTION 02: DISCOVER OPPORTUNITIES (Scholarship Certificate Model)
            Environment: Forest-green (#3E5A3F / #1F2A1F)
            ======================================================================= */}
        <section id="how-it-works" className="py-32 sm:py-40 relative px-6 sm:px-10 lg:px-16 border-t border-[#1F2A1F]/60">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
              
              {/* Left Column: Free-Floating 3D Certificate Model (Angled for full visibility) */}
              <motion.div
                data-assemble="discovery-model"
                initial={shouldReduceMotion ? false : { opacity: 0, x: -24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="lg:col-span-6 relative flex items-center justify-center min-h-[360px] sm:min-h-[440px]"
              >
                <div className="absolute w-72 h-72 rounded-full bg-[#3E5A3F]/12 blur-3xl pointer-events-none" />
                <ScrollModelCanvas
                  modelPath="/models/optimized/certificate.glb"
                  nextModelPath="/models/optimized/medallion.glb"
                  scale={1.35}
                  initialRotation={[0.2, -0.35, 0.08]}
                  accentColor="#8CA98C"
                  spinSpeed={0.2}
                  className="w-full h-[360px] sm:h-[440px]"
                />
              </motion.div>

              {/* Right Column: Editorial Narrative */}
              <motion.div
                data-assemble="discovery-text"
                initial={shouldReduceMotion ? false : { opacity: 0, x: 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="lg:col-span-6 space-y-6 text-left"
              >
                <span data-assemble="discovery-tag" className="font-mono text-xs uppercase tracking-[0.25em] text-[#8CA98C] block">
                  01 / Discovery
                </span>
                <h2 data-assemble="discovery-heading" className="text-3xl sm:text-5xl font-display font-medium text-[#F5F7F5] tracking-tight leading-[1.08]">
                  Verified scholarships. <br />
                  <span className="text-[#D9C7A3]">Direct to you.</span>
                </h2>
                <p className="text-base text-[#8CA98C] leading-relaxed max-w-lg">
                  Access 36 verified national, state, and institutional endowments without bureaucratic noise, broken application portals, or ambiguous requirements.
                </p>

                {/* Minimalist Value Tags */}
                <div data-assemble="discovery-pills" className="flex flex-wrap gap-2.5 pt-2">
                  <span className="px-3.5 py-1.5 rounded-full bg-[#1F2A1F] border border-[#3E5A3F]/40 text-xs font-mono text-[#F5F7F5]">
                    National Fellowships
                  </span>
                  <span className="px-3.5 py-1.5 rounded-full bg-[#1F2A1F] border border-[#3E5A3F]/40 text-xs font-mono text-[#F5F7F5]">
                    State Domicile Grants
                  </span>
                  <span className="px-3.5 py-1.5 rounded-full bg-[#1F2A1F] border border-[#3E5A3F]/40 text-xs font-mono text-[#F5F7F5]">
                    Private Research Trust Funds
                  </span>
                </div>

                <div data-assemble="discovery-btn" className="pt-3">
                  <Link
                    to="/explore"
                    className="inline-flex items-center text-sm font-medium text-[#D9C7A3] hover:text-[#F5F7F5] transition-colors group"
                  >
                    <span>Browse all opportunities</span>
                    <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* =======================================================================
            SECTION 03: FIND YOUR MATCH (Academic Medallion Model)
            Environment: Dark sage-green (#8CA98C / #1F2A1F)
            ======================================================================= */}
        <section className="py-32 sm:py-40 relative px-6 sm:px-10 lg:px-16 border-t border-[#1F2A1F]/60">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
              
              {/* Left Column: Editorial Narrative */}
              <motion.div
                data-assemble="matching-text"
                initial={shouldReduceMotion ? false : { opacity: 0, x: -24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="lg:col-span-6 space-y-6 text-left order-2 lg:order-1"
              >
                <span data-assemble="matching-tag" className="font-mono text-xs uppercase tracking-[0.25em] text-[#D9C7A3] block">
                  02 / Matching Engine
                </span>
                <h2 data-assemble="matching-heading" className="text-3xl sm:text-5xl font-display font-medium text-[#F5F7F5] tracking-tight leading-[1.08]">
                  Matched by logic. <br />
                  <span className="text-[#8CA98C]">Not guesswork.</span>
                </h2>
                <p className="text-base text-[#8CA98C] leading-relaxed max-w-lg">
                  Every scholarship is evaluated mathematically against academic scores, income thresholds, and state domicile with 100% deterministic precision.
                </p>

                {/* Verification Criteria */}
                <div data-assemble="matching-criteria" className="space-y-2.5 pt-2 font-mono text-xs text-[#F5F7F5]">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#D9C7A3]" />
                    <span>Academic GPA & Merit Threshold Validation</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#D9C7A3]" />
                    <span>Family Annual Income Verification</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#D9C7A3]" />
                    <span>Domicile, Course Stream & Category Quotas</span>
                  </div>
                </div>

                <div data-assemble="matching-btn" className="pt-3">
                  <Link
                    to="/onboarding"
                    className="inline-flex items-center text-sm font-medium text-[#D9C7A3] hover:text-[#F5F7F5] transition-colors group"
                  >
                    <span>Calculate your score</span>
                    <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </motion.div>

              {/* Right Column: Free-Floating 3D Medallion Model */}
              <motion.div
                data-assemble="matching-model"
                initial={shouldReduceMotion ? false : { opacity: 0, x: 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="lg:col-span-6 relative flex items-center justify-center min-h-[360px] sm:min-h-[440px] order-1 lg:order-2"
              >
                <div className="absolute w-72 h-72 rounded-full bg-[#D9C7A3]/10 blur-3xl pointer-events-none" />
                <ScrollModelCanvas
                  modelPath="/models/optimized/medallion.glb"
                  nextModelPath="/models/optimized/folder.glb"
                  scale={1.3}
                  initialRotation={[0.15, 0.25, 0]}
                  accentColor="#D9C7A3"
                  spinSpeed={0.25}
                  className="w-full h-[360px] sm:h-[440px]"
                />
              </motion.div>
            </div>
          </div>
        </section>

        {/* =======================================================================
            SECTION 04: MANAGE APPLICATIONS (Academic Folder Model)
            Environment: Deep forest (#1F2A1F / #3E5A3F)
            ======================================================================= */}
        <section className="py-32 sm:py-40 relative px-6 sm:px-10 lg:px-16 border-t border-[#1F2A1F]/60">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
              
              {/* Left Column: Free-Floating 3D Folder Model */}
              <motion.div
                data-assemble="tracker-model"
                initial={shouldReduceMotion ? false : { opacity: 0, x: -24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="lg:col-span-6 relative flex items-center justify-center min-h-[360px] sm:min-h-[440px]"
              >
                <div className="absolute w-72 h-72 rounded-full bg-[#3E5A3F]/15 blur-3xl pointer-events-none" />
                <ScrollModelCanvas
                  modelPath="/models/optimized/folder.glb"
                  nextModelPath="/models/optimized/book.glb"
                  scale={1.25}
                  initialRotation={[0.2, -0.3, 0.05]}
                  accentColor="#8CA98C"
                  spinSpeed={0.22}
                  className="w-full h-[360px] sm:h-[440px]"
                />
              </motion.div>

              {/* Right Column: Editorial Narrative */}
              <motion.div
                data-assemble="tracker-text"
                initial={shouldReduceMotion ? false : { opacity: 0, x: 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="lg:col-span-6 space-y-6 text-left"
              >
                <span data-assemble="tracker-tag" className="font-mono text-xs uppercase tracking-[0.25em] text-[#8CA98C] block">
                  03 / Application Cockpit
                </span>
                <h2 data-assemble="tracker-heading" className="text-3xl sm:text-5xl font-display font-medium text-[#F5F7F5] tracking-tight leading-[1.08]">
                  Manage every milestone. <br />
                  <span className="text-[#D9C7A3]">Never miss a window.</span>
                </h2>
                <p className="text-base text-[#8CA98C] leading-relaxed max-w-lg">
                  Track requirements, deadline countdowns, and document readiness in a consolidated student workspace.
                </p>

                <div data-assemble="tracker-btn" className="pt-3">
                  <Link
                    to="/tracker"
                    className="inline-flex items-center text-sm font-medium text-[#D9C7A3] hover:text-[#F5F7F5] transition-colors group"
                  >
                    <span>Open Application Tracker</span>
                    <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* =======================================================================
            SECTION 05: KNOWLEDGE & RESOURCES (Open Book Model)
            Environment: Champagne-accented (#D9C7A3 / #B08D57)
            ======================================================================= */}
        <section className="py-32 sm:py-40 relative px-6 sm:px-10 lg:px-16 border-t border-[#1F2A1F]/60">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
              
              {/* Left Column: Editorial Narrative */}
              <motion.div
                data-assemble="knowledge-text"
                initial={shouldReduceMotion ? false : { opacity: 0, x: -24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="lg:col-span-6 space-y-6 text-left order-2 lg:order-1"
              >
                <span data-assemble="knowledge-tag" className="font-mono text-xs uppercase tracking-[0.25em] text-[#D9C7A3] block">
                  04 / Knowledge Blueprints
                </span>
                <h2 data-assemble="knowledge-heading" className="text-3xl sm:text-5xl font-display font-medium text-[#F5F7F5] tracking-tight leading-[1.08]">
                  Knowledge that elevates <br />
                  <span className="text-[#8CA98C]">your application.</span>
                </h2>
                <p className="text-base text-[#8CA98C] leading-relaxed max-w-lg">
                  Access proven frameworks for Statements of Purpose, bonafide verification guidelines, and interview prep tailored to prestigious endowments.
                </p>

                <div data-assemble="knowledge-btn" className="pt-3">
                  <Link
                    to="/vault"
                    className="inline-flex items-center text-sm font-medium text-[#D9C7A3] hover:text-[#F5F7F5] transition-colors group"
                  >
                    <span>View Resource Vault</span>
                    <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </motion.div>

              {/* Right Column: Free-Floating 3D Book Model (Tilted for visible pages) */}
              <motion.div
                data-assemble="knowledge-model"
                initial={shouldReduceMotion ? false : { opacity: 0, x: 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="lg:col-span-6 relative flex items-center justify-center min-h-[360px] sm:min-h-[440px] order-1 lg:order-2"
              >
                <div className="absolute w-72 h-72 rounded-full bg-[#D9C7A3]/10 blur-3xl pointer-events-none" />
                <ScrollModelCanvas
                  modelPath="/models/optimized/book.glb"
                  nextModelPath="/models/optimized/cap.glb"
                  scale={1.3}
                  initialRotation={[0.6, 0.25, -0.1]}
                  accentColor="#D9C7A3"
                  spinSpeed={0.2}
                  className="w-full h-[360px] sm:h-[440px]"
                />
              </motion.div>
            </div>
          </div>
        </section>

        {/* =======================================================================
            SECTION 06: ACADEMIC MILESTONES (Graduation Cap Model)
            Environment: Forest Sage & Champagne
            ======================================================================= */}
        <section id="about" className="py-32 sm:py-40 relative px-6 sm:px-10 lg:px-16 border-t border-[#1F2A1F]/60">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
              
              {/* Left Column: Free-Floating 3D Graduation Cap Model */}
              <motion.div
                data-assemble="milestones-model"
                initial={shouldReduceMotion ? false : { opacity: 0, x: -24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="lg:col-span-6 relative flex items-center justify-center min-h-[360px] sm:min-h-[440px]"
              >
                <div className="absolute w-72 h-72 rounded-full bg-[#3E5A3F]/15 blur-3xl pointer-events-none" />
                <ScrollModelCanvas
                  modelPath="/models/optimized/cap.glb"
                  nextModelPath="/models/optimized/pillar.glb"
                  scale={1.25}
                  initialRotation={[0.45, 0.35, -0.1]}
                  accentColor="#8CA98C"
                  spinSpeed={0.24}
                  className="w-full h-[360px] sm:h-[440px]"
                />
              </motion.div>

              {/* Right Column: Editorial Narrative & Statistics */}
              <motion.div
                data-assemble="milestones-stats"
                initial={shouldReduceMotion ? false : { opacity: 0, x: 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="lg:col-span-6 space-y-6 text-left"
              >
                <span data-assemble="milestones-tag" className="font-mono text-xs uppercase tracking-[0.25em] text-[#8CA98C] block">
                  05 / Academic Mission
                </span>
                <h2 data-assemble="milestones-heading" className="text-3xl sm:text-5xl font-display font-medium text-[#F5F7F5] tracking-tight leading-[1.08]">
                  Built for every student's <br />
                  <span className="text-[#D9C7A3]">highest ambition.</span>
                </h2>
                <p className="text-base text-[#8CA98C] leading-relaxed max-w-lg">
                  Higher education funding should not depend on personal networks. GRANTLY bridges the capital gap with transparency and verified access.
                </p>

                {/* Animated Stat Numbers */}
                <div data-assemble="milestones-metrics" className="grid grid-cols-3 gap-6 pt-2 font-mono text-xs text-[#F5F7F5] border-t border-[#1F2A1F]/70 pt-6">
                  <div>
                    <span className="block text-2xl sm:text-3xl font-light font-display text-[#D9C7A3]">36</span>
                    <span className="text-[#8CA98C] text-[11px]">Verified Schemes</span>
                  </div>
                  <div>
                    <span className="block text-2xl sm:text-3xl font-light font-display text-[#F5F7F5]">100%</span>
                    <span className="text-[#8CA98C] text-[11px]">Deterministic Rules</span>
                  </div>
                  <div>
                    <span className="block text-2xl sm:text-3xl font-light font-display text-[#B08D57]">₹3.82 Cr</span>
                    <span className="text-[#8CA98C] text-[11px]">Indexed Pool</span>
                  </div>
                </div>

                <div data-assemble="milestones-btn" className="pt-3">
                  <Link
                    to="/compare"
                    className="inline-flex items-center text-sm font-medium text-[#D9C7A3] hover:text-[#F5F7F5] transition-colors group"
                  >
                    <span>Compare all schemes</span>
                    <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* =======================================================================
            SECTION 07: FINAL INVITATION (Architectural Pillar Model)
            Environment: Dark final invitation with Gold detailing (#B08D57 / #0B0F0D)
            ======================================================================= */}
        <section className="py-32 sm:py-44 relative px-6 sm:px-10 lg:px-16 border-t border-[#1F2A1F]/60 text-center">
          <div className="max-w-4xl mx-auto space-y-10">
            
            {/* Free-Floating Architectural Pillar Model */}
            <motion.div
              data-assemble="final-pillar"
              initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.92 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="flex justify-center"
            >
              <div className="relative w-56 h-56 flex items-center justify-center">
                <div className="absolute w-52 h-52 rounded-full bg-[#B08D57]/10 blur-3xl pointer-events-none" />
                <ScrollModelCanvas
                  modelPath="/models/optimized/pillar.glb"
                  scale={1.35}
                  initialRotation={[0.1, 0.4, 0]}
                  accentColor="#B08D57"
                  spinSpeed={0.25}
                  className="w-full h-full"
                />
              </div>
            </motion.div>

            {/* Final Text Invitation */}
            <div data-assemble="final-cta" className="space-y-4 max-w-2xl mx-auto">
              <span data-assemble="final-tag" className="font-mono text-xs uppercase tracking-[0.25em] text-[#D9C7A3] block">
                06 / Your Gateway
              </span>
              <h2 data-assemble="final-heading" className="text-3xl sm:text-5xl lg:text-6xl font-display font-medium text-[#F5F7F5] tracking-tight leading-[1.06]">
                Your future begins today.
              </h2>
              <p className="text-base text-[#8CA98C] leading-relaxed max-w-lg mx-auto">
                Set up your student profile in under three minutes and discover the scholarships you qualify for.
              </p>
            </div>

            {/* Action Buttons */}
            <div data-assemble="final-buttons" className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link to="/onboarding">
                <Button
                  size="lg"
                  variant="primary"
                  rightIcon={<ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                  className="bg-[#D9C7A3] hover:bg-[#F5F7F5] text-[#0B0F0D] font-medium px-8 py-4 rounded-full shadow-[0_0_25px_rgba(217,199,163,0.3)] hover:-translate-y-0.5 transition-all text-sm tracking-wide"
                >
                  Get started
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-[#3E5A3F]/60 text-[#F5F7F5] hover:bg-[#1F2A1F] hover:border-[#D9C7A3]/40 px-7 py-4 rounded-full hover:-translate-y-0.5 transition-all text-sm tracking-wide"
                >
                  Platform overview
                </Button>
              </Link>
            </div>

            {/* Hackathon Context Note */}
            <div data-assemble="final-shield" className="pt-12">
              <div className="p-4 rounded-xl border border-[#3E5A3F]/30 bg-[#1F2A1F]/40 backdrop-blur max-w-lg mx-auto flex items-center gap-3 text-left">
                <ShieldCheck className="w-5 h-5 text-[#D9C7A3] shrink-0" />
                <p className="text-xs text-[#8CA98C] leading-relaxed">
                  GRANTLY is a scholarship discovery and management frontend engineered for THE OUTPOST hackathon. All 36 opportunity records represent realistic academic grant scenarios.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default LandingPage;
