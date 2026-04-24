'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { MODEL_ANGLES } from '@/lib/mockData';

interface GallerySectionProps {
  isVisible: boolean;
  generatedImages: string[] | null;
  isDemoMode: boolean;
}

export default function GallerySection({ isVisible, generatedImages, isDemoMode }: GallerySectionProps) {
  const [selectedAngle, setSelectedAngle] = useState<number | null>(null);
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  if (!isVisible) return null;

  const selectedAngleData = selectedAngle !== null ? MODEL_ANGLES[selectedAngle] : null;

  const handleDownload = async (imageUrl: string, filename: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed', error);
      // Fallback
      window.open(imageUrl, '_blank');
    }
  };

  return (
    <section id="gallery" className="py-24 px-8 md:px-16" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-[1400px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div
            className="inline-flex items-center gap-3 rounded-full px-4 py-2 mb-6 text-[10px] font-semibold tracking-[0.2em] uppercase"
            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}
          >
            Step 3
          </div>
          <h2
            className="font-display text-4xl md:text-5xl font-light mb-4 tracking-wide"
            style={{ color: 'var(--text-main)' }}
          >
            Your <span className="italic" style={{ color: 'var(--accent)' }}>Multi-Angle</span> Gallery
          </h2>
          {isDemoMode && (
            <div className="flex justify-center mb-4">
              <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border" style={{ borderColor: 'var(--accent)', color: 'var(--accent)', backgroundColor: 'rgba(184,163,134,0.1)' }}>
                Demo Mode: High-Fidelity Simulation
              </span>
            </div>
          )}
          <p className="text-sm font-light max-w-xl mx-auto tracking-wide" style={{ color: 'var(--text-muted)' }}>
            Click any image to view full-size. Download individually or export the entire shoot.
          </p>
        </motion.div>

        {/* Gallery grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-16">
          {MODEL_ANGLES.map((angle, i) => {
            // Use generated image if available, else fallback to mock
            const displayImage = generatedImages?.[i] || angle.image;

            return (
              <motion.div
                key={angle.id}
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
                className="gallery-card relative rounded-2xl overflow-hidden cursor-pointer group"
                style={{
                  border: selectedAngle === i ? '1px solid var(--accent)' : '1px solid var(--border)',
                  boxShadow: selectedAngle === i ? '0 0 0 2px rgba(184,163,134,0.3)' : 'none',
                  background: 'var(--bg-secondary)',
                }}
                onClick={() => setSelectedAngle(selectedAngle === i ? null : i)}
                onMouseEnter={() => setHoveredId(angle.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <div className="relative aspect-[3/4] overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={displayImage}
                    alt={angle.label}
                    className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                    style={{ transform: hoveredId === angle.id ? 'scale(1.05)' : 'scale(1)' }}
                  />

                  {/* Hover overlay */}
                  <motion.div
                    className="absolute inset-0 flex flex-col items-center justify-center gap-3 backdrop-blur-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: hoveredId === angle.id ? 1 : 0 }}
                    style={{ background: 'rgba(255,255,255,0.4)' }}
                  >
                    <div
                      className="rounded-full px-5 py-2.5 flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-white"
                      style={{ background: 'var(--accent)' }}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                      </svg>
                      View
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(displayImage, `DrapAI_Angle_${angle.id}.png`);
                      }}
                      className="rounded-full px-5 py-2.5 flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-white hover:opacity-90 transition-opacity"
                      style={{ background: 'var(--text-main)' }}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download
                    </button>
                  </motion.div>

                  {/* Angle number badge */}
                  <div
                    className="absolute top-3 left-3 rounded-full w-6 h-6 flex items-center justify-center text-[10px] font-bold text-white"
                    style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
                  >
                    {angle.id}
                  </div>

                  {/* Selected check */}
                  <AnimatePresence>
                    {selectedAngle === i && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center"
                        style={{ background: 'var(--accent)' }}
                      >
                        <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Label */}
                <div className="p-4" style={{ borderTop: '1px solid var(--border)' }}>
                  <div className="text-xs font-medium tracking-wide mb-1" style={{ color: 'var(--text-main)' }}>{angle.label}</div>
                  <div className="text-[10px] font-semibold tracking-[0.2em] uppercase" style={{ color: 'var(--text-muted)' }}>{angle.angle}</div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Expanded view */}
        <AnimatePresence>
          {selectedAngleData && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div
                className="rounded-3xl p-10 mb-16"
                style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
              >
                <div className="grid md:grid-cols-2 gap-12 items-center">
                  <div className="relative rounded-2xl overflow-hidden" style={{ height: 600, border: '1px solid var(--border)' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={generatedImages?.[Number(selectedAngle)] || selectedAngleData.image}
                      alt={selectedAngleData.label}
                      className="absolute inset-0 w-full h-full object-cover object-top"
                    />
                  </div>
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.2em] mb-4" style={{ color: 'var(--accent)' }}>
                      Angle {selectedAngleData.id} of 10
                    </div>
                    <h3
                      className="font-display text-4xl font-light mb-4"
                      style={{ color: 'var(--text-main)' }}
                    >
                      {selectedAngleData.label}
                    </h3>
                    <p className="text-sm font-light leading-relaxed mb-10" style={{ color: 'var(--text-muted)' }}>
                      {selectedAngleData.description}
                    </p>

                    <div className="grid grid-cols-2 gap-4 mb-10">
                      {[
                        { label: 'View Angle', value: selectedAngleData.angle },
                        { label: 'Resolution', value: '4K / 3840×5120' },
                        { label: 'Format', value: 'PNG (lossless)' },
                        { label: 'AI Engine', value: 'Agentic Core v2' },
                      ].map((meta) => (
                        <div key={meta.label} className="rounded-xl p-4" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)' }}>
                          <div className="text-[10px] font-semibold tracking-widest uppercase mb-1" style={{ color: 'var(--text-muted)' }}>{meta.label}</div>
                          <div className="text-sm font-medium tracking-wide" style={{ color: 'var(--text-main)' }}>{meta.value}</div>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-4">
                      <button
                        onClick={() => handleDownload(generatedImages?.[Number(selectedAngle)] || selectedAngleData.image, `DrapAI_Angle_${selectedAngleData.id}.png`)}
                        className="btn-primary rounded-full px-8 py-4 text-xs tracking-wide uppercase font-semibold flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download Image
                      </button>
                      <button
                        className="btn-outline rounded-full px-8 py-4 text-xs tracking-wide uppercase font-semibold"
                        onClick={() => setSelectedAngle(null)}
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
}
