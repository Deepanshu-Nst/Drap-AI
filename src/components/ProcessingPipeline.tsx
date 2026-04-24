'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { PROCESSING_STEPS, type Saree } from '@/lib/mockData';

type Phase = 'idle' | 'processing' | 'done';

interface ProcessingPipelineProps {
  saree: Saree | null;
  phase: Phase;
  onComplete: () => void;
  onStart: () => void;
  onCancel?: () => void;
  completedAngles?: number;
  totalAngles?: number;
  analysisState?: 'idle' | 'analyzing' | 'generating' | 'done';
}

export default function ProcessingPipeline({ saree, phase, onComplete, onStart, onCancel, completedAngles = 0, totalAngles = 10, analysisState = 'idle' }: ProcessingPipelineProps) {
  const [currentStep, setCurrentStep] = useState(-1);
  const [stepProgress, setStepProgress] = useState(0);
  const [overallProgress, setOverallProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalDuration = PROCESSING_STEPS.reduce((acc, s) => acc + s.duration, 0);

  useEffect(() => {
    if (phase !== 'processing') {
      setCurrentStep(-1);
      setStepProgress(0);
      setOverallProgress(0);
      return;
    }

    let elapsed = 0;
    let stepIdx = 0;
    let stepElapsed = 0;

    const tick = () => {
      const dt = 80; // ms per tick
      stepElapsed += dt;
      elapsed += dt;

      const step = PROCESSING_STEPS[stepIdx];
      if (!step) return;

      const prog = Math.min((stepElapsed / step.duration) * 100, 100);
      setStepProgress(prog);
      setCurrentStep(stepIdx);
      setOverallProgress(Math.min((elapsed / totalDuration) * 100, 100));

      if (stepElapsed >= step.duration) {
        stepIdx++;
        stepElapsed = 0;
        if (stepIdx >= PROCESSING_STEPS.length) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setOverallProgress(100);
          setTimeout(onComplete, 600);
        }
      }
    };

    intervalRef.current = setInterval(tick, 80);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [phase, onComplete, totalDuration, analysisState]);

  if (!saree && phase === 'idle') return null;

  return (
    <section
      id="processing"
      className="py-24 px-8 md:px-16"
      style={{ background: 'linear-gradient(160deg, #1A1A1A 0%, #2D2522 100%)' }}
    >
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-6 text-xs font-semibold tracking-widest uppercase"
            style={{ background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.3)', color: 'var(--gold-light)' }}
          >
            Step 2 of 3
          </div>
          <h2
            className="font-display text-4xl md:text-5xl font-light mb-4 text-white"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {analysisState === 'analyzing' && <>AI is <em style={{ color: 'var(--gold)' }}>Analyzing</em> Your Saree</>}
            {analysisState === 'generating' && <>AI is <em style={{ color: 'var(--gold)' }}>Generating</em> Angles</>}
            {analysisState === 'done' && <><em style={{ color: 'var(--gold)' }}>Completed</em> Processing</>}
            {analysisState === 'idle' && <>AI is <em style={{ color: 'var(--gold)' }}>Processing</em> Your Saree</>}
          </h2>
          <p className="text-lg" style={{ color: 'rgba(255,255,255,0.5)' }}>
            {analysisState === 'analyzing' ? 'Extracting fabric, motifs, and texture details...' : 
             analysisState === 'generating' ? `Generating angle ${completedAngles + 1} of ${totalAngles}...` :
             'Our 6-stage AI pipeline transforms your fabric into a photorealistic model shoot.'}
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left: Saree preview + overall progress */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            {/* Selected saree card */}
            <div
              className="rounded-2xl overflow-hidden"
              style={{ border: '1px solid rgba(201,168,76,0.2)', background: 'rgba(255,255,255,0.03)' }}
            >
              <div className="relative h-48">
                <Image src={saree?.image || '/images/saree1.png'} alt="Processing saree" fill className="object-cover" />

                {/* Animated scan overlay when processing */}
                <AnimatePresence>
                  {phase === 'processing' && (
                    <motion.div
                      className="absolute inset-0"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <motion.div
                        className="absolute left-0 right-0 h-0.5"
                        style={{ background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.8), transparent)' }}
                        animate={{ top: ['0%', '100%'] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      />
                      <div className="absolute inset-0" style={{ background: 'rgba(201,168,76,0.05)' }} />
                    </motion.div>
                  )}
                </AnimatePresence>

                {phase === 'done' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute inset-0 flex items-center justify-center"
                    style={{ background: 'rgba(26,26,26,0.6)' }}
                  >
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center"
                      style={{ background: 'var(--gold)' }}
                    >
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </motion.div>
                )}
              </div>
              <div className="p-4">
                <div className="text-white font-semibold text-sm mb-0.5">{saree?.name}</div>
                <div className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{saree?.type} · {saree?.color}</div>
              </div>
            </div>

            {/* Overall progress bar */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <div className="text-sm font-medium text-white">Overall Progress</div>
                <div className="text-sm font-semibold" style={{ color: 'var(--gold)' }}>
                  {Math.round(overallProgress)}%
                </div>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background: 'linear-gradient(90deg, var(--gold-dark), var(--gold), var(--gold-light))',
                    width: `${overallProgress}%`,
                  }}
                  transition={{ duration: 0.1 }}
                />
              </div>
            </div>

            {/* CTA when idle */}
            {phase === 'idle' && saree && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={onStart}
                className="w-full btn-primary rounded-2xl py-4 text-base font-semibold flex items-center justify-center gap-3 pulse-gold"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Generate AI Visualization
              </motion.button>
            )}

            {phase === 'processing' && (
              <div className="flex flex-col items-center justify-center gap-3 py-2">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: 'var(--gold)' }}
                        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-white">
                    {analysisState === 'analyzing' ? 'Analyzing saree...' : `Generating ${completedAngles}/${totalAngles}`}
                  </span>
                </div>
                {onCancel && (
                  <button 
                    onClick={onCancel}
                    className="text-xs uppercase tracking-widest text-red-400 hover:text-red-300 transition-colors border border-red-500/30 rounded-full px-4 py-1"
                  >
                    Cancel Generation
                  </button>
                )}
              </div>
            )}
          </motion.div>

          {/* Right: pipeline steps */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            {PROCESSING_STEPS.map((step, i) => {
              const isActive = phase === 'processing' && currentStep === i;
              const isDone = phase === 'done' || (phase === 'processing' && currentStep > i);

              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-xl p-4 transition-all duration-300"
                  style={{
                    background: isActive
                      ? 'rgba(201,168,76,0.12)'
                      : isDone
                      ? 'rgba(201,168,76,0.06)'
                      : 'rgba(255,255,255,0.04)',
                    border: isActive
                      ? '1px solid rgba(201,168,76,0.4)'
                      : isDone
                      ? '1px solid rgba(201,168,76,0.2)'
                      : '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <div className="flex items-center gap-4">
                    {/* Step icon */}
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg"
                      style={{
                        background: isDone
                          ? 'var(--gold)'
                          : isActive
                          ? 'rgba(201,168,76,0.2)'
                          : 'rgba(255,255,255,0.06)',
                        transition: 'all 0.3s ease',
                      }}
                    >
                      {isDone ? (
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        step.icon
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div
                          className="text-sm font-semibold"
                          style={{ color: isActive || isDone ? 'white' : 'rgba(255,255,255,0.4)' }}
                        >
                          {step.label}
                        </div>
                        {isActive && (
                          <div className="text-xs font-semibold" style={{ color: 'var(--gold)' }}>
                            {Math.round(stepProgress)}%
                          </div>
                        )}
                        {isDone && (
                          <div className="text-xs font-semibold" style={{ color: 'var(--gold)' }}>Done ✓</div>
                        )}
                      </div>
                      <div className="text-xs mb-2" style={{ color: 'rgba(255,255,255,0.35)' }}>
                        {step.description}
                      </div>

                      {/* Step progress bar */}
                      <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                        <motion.div
                          className="h-full rounded-full"
                          style={{
                            background: isDone
                              ? 'var(--gold)'
                              : 'linear-gradient(90deg, var(--gold-dark), var(--gold-light))',
                            width: isDone ? '100%' : isActive ? `${stepProgress}%` : '0%',
                          }}
                          transition={{ duration: 0.1 }}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
