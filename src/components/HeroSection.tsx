'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useState } from 'react';
import { STATS, FEATURES } from '@/lib/mockData';

export default function HeroSection() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  return (
    <section
      id="hero"
      className="relative min-h-screen overflow-hidden"
      style={{ backgroundColor: 'var(--bg-primary)' }}
      onMouseMove={(e) => {
        setMousePos({
          x: (e.clientX / window.innerWidth - 0.5) * 20,
          y: (e.clientY / window.innerHeight - 0.5) * 10,
        });
      }}
    >
      {/* Subtle minimalist grid background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `linear-gradient(var(--border) 1px, transparent 1px),
                           linear-gradient(90deg, var(--border) 1px, transparent 1px)`,
          backgroundSize: '100px 100px',
          maskImage: 'radial-gradient(ellipse at center, black 20%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black 20%, transparent 80%)'
        }}
      />

      {/* Ambient Glows */}
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(184,163,134,0.05) 0%, transparent 70%)',
          top: '20%',
          right: '10%',
          filter: 'blur(60px)',
        }}
        animate={{ scale: [1, 1.05, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Nav */}
      <nav className="relative z-20 flex items-center justify-between px-8 py-8 md:px-16 max-w-[1600px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
          className="flex items-center gap-2"
        >
          <span className="text-2xl font-display font-medium tracking-wide" style={{ color: 'var(--text-main)' }}>
            Drap<span style={{ color: 'var(--accent)' }}>AI</span>
          </span>
        </motion.div>


        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.23, 1, 0.32, 1] }}
          className="flex items-center gap-6"
        >
          <a
            href="#demo"
            className="inline-flex items-center btn-primary rounded-full px-7 py-3 text-xs tracking-wide uppercase font-semibold"
          >
            Start Visualizing
          </a>
        </motion.div>
      </nav>

      {/* Hero content */}
      <div className="relative z-10 max-w-[1600px] mx-auto px-8 md:px-16 pt-20 pb-32 flex flex-col lg:flex-row items-center gap-24 min-h-[80vh]">
        {/* Left copy */}
        <div className="flex-1 max-w-3xl">

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.1, ease: [0.23, 1, 0.32, 1] }}
            className="font-display text-6xl md:text-7xl lg:text-[5.5rem] font-light leading-[1.1] mb-8"
            style={{ color: 'var(--text-main)' }}
          >
            From <span className="italic text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-light) 100%)' }}>fabric</span>
            <br />
            to runway model
            <br />
            in seconds.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.23, 1, 0.32, 1] }}
            className="text-lg md:text-xl leading-relaxed mb-12"
            style={{ color: 'var(--text-muted)', maxWidth: '600px', fontWeight: 300 }}
          >
            DrapAI transforms any apparel image into a photorealistic multi-angle gallery
            powered by real-time Agentic AI. No studios. No models. Just flawless execution.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.23, 1, 0.32, 1] }}
            className="flex flex-wrap gap-5 mb-16"
          >
            <a
              href="#demo"
              className="btn-primary inline-flex items-center gap-3 rounded-full px-8 py-4 text-sm tracking-wide uppercase font-semibold"
            >
              <span>Upload Fabric</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4, ease: [0.23, 1, 0.32, 1] }}
            className="flex gap-12"
          >
            {STATS.slice(0, 3).map((stat, i) => (
              <div key={stat.label} className="flex flex-col">
                <div
                  className="text-3xl font-display font-medium mb-2"
                  style={{ color: 'var(--text-main)' }}
                >
                  {stat.value}
                </div>
                <div className="text-[10px] tracking-widest uppercase font-semibold" style={{ color: 'var(--text-muted)' }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right: hero model image - Awwwards level presentation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          transition={{ duration: 1.5, delay: 0.2, ease: [0.23, 1, 0.32, 1] }}
          className="flex-shrink-0 relative w-full max-w-[320px] sm:max-w-sm lg:w-[440px] lg:max-w-none mt-12 lg:mt-0"
          style={{
            transform: `perspective(1000px) rotateY(${mousePos.x * 0.05}deg) rotateX(${-mousePos.y * 0.05}deg)`,
            transition: 'transform 0.1s ease-out',
          }}
        >
          <div
            className="relative overflow-hidden rounded-2xl w-full aspect-[3/4] lg:h-[600px]"
            style={{
              boxShadow: '0 30px 60px rgba(0,0,0,0.1), 0 0 0 1px var(--border)',
              background: 'var(--bg-secondary)'
            }}
          >
            <Image
              src="/images/hero_banner.png"
              alt="AI-generated fashion model"
              fill
              className="object-cover object-top opacity-90 transition-opacity duration-700 hover:opacity-100"
              sizes="440px"
              priority
            />

            {/* Gradient Overlay for sophisticated look */}
            <div className="absolute inset-0"
              style={{
                background: 'linear-gradient(to top, var(--bg-primary) 0%, transparent 40%)',
              }}
            />

            {/* Overlay label */}
            <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.2em] mb-2" style={{ color: 'var(--accent)' }}>Real-Time AI</div>
                <div className="text-white text-lg font-medium tracking-wide">Dynamic Generation</div>
              </div>
              <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center backdrop-blur-sm">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
