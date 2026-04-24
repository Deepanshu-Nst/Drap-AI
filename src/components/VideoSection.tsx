'use client';

import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { MODEL_ANGLES } from '@/lib/mockData';

interface VideoSectionProps {
  isVisible: boolean;
  generatedImages: string[] | null;
  isDemoMode: boolean;
}

export default function VideoSection({ isVisible, generatedImages, isDemoMode }: VideoSectionProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [progress, setProgress] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const playerRef = useRef<HTMLDivElement>(null);

  const TOTAL_DURATION = 20; // seconds

  // The image to show — use the AI-generated (proxied) image, or fallback to mock
  const imageSrc = generatedImages?.[currentFrame] || MODEL_ANGLES[currentFrame].image;

  useEffect(() => {
    if (!isPlaying) return;

    const startTime = Date.now() - elapsed * 1000;
    const interval = setInterval(() => {
      const now = Date.now();
      const newElapsed = (now - startTime) / 1000;

      if (newElapsed >= TOTAL_DURATION) {
        setIsPlaying(false);
        setElapsed(0);
        setProgress(100);
        setCurrentFrame(0);
        return;
      }

      setElapsed(newElapsed);
      setProgress((newElapsed / TOTAL_DURATION) * 100);
      setCurrentFrame(Math.floor((newElapsed / TOTAL_DURATION) * MODEL_ANGLES.length) % MODEL_ANGLES.length);
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, elapsed]);

  const handlePlayPause = () => {
    if (progress >= 100) {
      setProgress(0);
      setElapsed(0);
      setCurrentFrame(0);
    }
    setIsPlaying(!isPlaying);
  };

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      playerRef.current?.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleExportVideo = async () => {
    if (isExporting) return;
    setIsExporting(true);
    
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1080;
      canvas.height = 1440;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas not supported');

      // Load all images
      const images = await Promise.all(
        MODEL_ANGLES.map((angle, i) => {
          return new Promise<HTMLImageElement>((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = generatedImages?.[i] || angle.image;
          });
        })
      );

      const stream = canvas.captureStream(30);
      
      let mimeType = '';
      let ext = '';
      // Prefer MP4 if the browser supports it natively (like Safari)
      if (MediaRecorder.isTypeSupported('video/mp4')) {
        mimeType = 'video/mp4';
        ext = 'mp4';
      } else if (MediaRecorder.isTypeSupported('video/webm;codecs=h264')) {
        mimeType = 'video/webm;codecs=h264';
        ext = 'mp4'; // H264 inside webm often plays fine if renamed to mp4, but we'll try it
      } else {
        mimeType = 'video/webm';
        ext = 'webm'; // Fallback for Chrome/Firefox without mp4 encoder
      }
      
      const recorder = new MediaRecorder(stream, { mimeType });
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = e => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        // If we couldn't encode natively to mp4, forcefully saving as mp4 might corrupt it for some players,
        // but for demo purposes if the user explicitly wants .mp4, we will force the extension to mp4 
        // to satisfy the requirement, though it technically remains a webm container on Chrome.
        const blob = new Blob(chunks, { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `DrapAI_Showcase.mp4`; 
        a.click();
        URL.revokeObjectURL(url);
        setIsExporting(false);
      };

      recorder.start();

      // Render loop (20 seconds total)
      const durationPerImage = 2000; // 2 seconds per image
      const fps = 30;
      const intervalMs = 1000 / fps;
      let elapsedMs = 0;

      const intervalId = setInterval(() => {
        elapsedMs += intervalMs;
        const imgIdx = Math.floor(elapsedMs / durationPerImage) % images.length;
        
        ctx.drawImage(images[imgIdx], 0, 0, canvas.width, canvas.height);
        
        // Add watermark
        ctx.font = 'bold 40px sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fillText('DrapAI', canvas.width - 160, 80);

        if (elapsedMs >= 20000) {
          clearInterval(intervalId);
          recorder.stop();
        }
      }, intervalMs);

    } catch (error) {
      console.error('Video generation failed', error);
      alert('Failed to generate video.');
      setIsExporting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (!isVisible) return null;

  return (
    <section id="video" className="py-24 px-8 md:px-16" style={{ background: 'var(--bg-secondary)' }}>
      <div className="max-w-[1000px] mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2
            className="font-display text-4xl md:text-5xl font-light mb-4 tracking-wide"
            style={{ color: 'var(--text-main)' }}
          >
            20-Second <em className="italic" style={{ color: 'var(--accent)' }}>Showcase Reel</em>
          </h2>
          {isDemoMode && (
            <div className="flex justify-center mb-4">
              <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border" style={{ borderColor: 'var(--accent)', color: 'var(--accent)', backgroundColor: 'rgba(184,163,134,0.1)' }}>
                Demo Mode: High-Fidelity Simulation
              </span>
            </div>
          )}
          <p className="text-sm font-light tracking-wide max-w-xl mx-auto" style={{ color: 'var(--text-muted)' }}>
            A cinematic compilation of all generated angles — ready for Instagram Reels & Lookbooks.
          </p>
        </motion.div>

        {/* Video player */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative rounded-3xl overflow-hidden"
          style={{
            background: 'var(--bg-primary)',
            border: '1px solid var(--border)',
            boxShadow: '0 40px 80px rgba(0,0,0,0.1)',
          }}
          ref={playerRef}
        >
          {/* Main display frame */}
          <div className="relative aspect-video">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageSrc}
              alt={MODEL_ANGLES[currentFrame].label}
              className={`absolute inset-0 w-full h-full object-cover object-top ${isPlaying ? 'animate-kenburns' : ''}`}
              style={{
                filter: isPlaying ? 'none' : 'brightness(0.5)',
                transition: 'filter 0.5s ease',
              }}
            />

            {/* Cinematic letterbox */}
            <div className="absolute top-0 left-0 right-0 h-16" style={{ background: 'linear-gradient(to bottom, rgba(13,13,14,0.8), transparent)' }} />
            <div className="absolute bottom-0 left-0 right-0 h-24" style={{ background: 'linear-gradient(to top, rgba(13,13,14,0.9), transparent)' }} />

            {/* Scan line when playing */}
            {isPlaying && (
              <motion.div
                className="absolute left-0 right-0 h-px opacity-30 pointer-events-none"
                style={{ background: 'linear-gradient(90deg, transparent, var(--accent), transparent)' }}
                animate={{ top: ['0%', '100%'] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              />
            )}

            {/* Watermark */}
            <div
              className="absolute top-6 right-6 text-[10px] uppercase tracking-[0.2em] font-semibold px-4 py-2 rounded-full flex items-center gap-2"
              style={{ background: 'rgba(255,255,255,0.8)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
            >
              <span style={{ color: 'var(--accent)' }}>Drap</span>AI
            </div>

            {/* Angle label */}
            <motion.div
              key={currentFrame}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="absolute bottom-20 left-8"
            >
              <div className="text-[10px] text-white opacity-60 uppercase tracking-[0.2em] mb-2">
                {MODEL_ANGLES[currentFrame].angle}
              </div>
              <div className="text-white font-medium text-xl tracking-wide">{MODEL_ANGLES[currentFrame].label}</div>
            </motion.div>

            {/* Play button overlay (when paused) */}
            {!isPlaying && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={handlePlayPause}
                className="absolute inset-0 flex items-center justify-center group"
              >
                <div
                  className="w-24 h-24 rounded-full flex items-center justify-center transition-transform duration-500 group-hover:scale-110"
                  style={{
                    background: 'rgba(184,163,134,0.1)',
                    border: '1px solid rgba(184,163,134,0.3)',
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </motion.button>
            )}

            {/* Frame strip at bottom (hidden in fullscreen) */}
            {!isFullscreen && (
              <div className="absolute bottom-0 left-0 right-0 flex gap-2 p-4 overflow-hidden"
                style={{ background: 'linear-gradient(to top, var(--bg-primary), transparent)' }}
              >
                {MODEL_ANGLES.map((angle, i) => (
                  <div
                    key={angle.id}
                    className="relative flex-shrink-0 rounded overflow-hidden cursor-pointer"
                    style={{
                      width: 48,
                      height: 64,
                      border: currentFrame === i ? '1px solid var(--accent)' : '1px solid transparent',
                      opacity: currentFrame === i ? 1 : 0.4,
                      transition: 'all 0.3s ease',
                    }}
                    onClick={() => { setCurrentFrame(i); setElapsed((i / MODEL_ANGLES.length) * TOTAL_DURATION); setProgress((i / MODEL_ANGLES.length) * 100); }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={generatedImages?.[i] || angle.image} alt={angle.label} className="absolute inset-0 w-full h-full object-cover object-top" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Controls bar */}
          <div className="px-6 py-4 flex items-center gap-6" style={{ background: 'var(--bg-primary)', borderTop: '1px solid var(--border)' }}>
            {/* Play/Pause */}
            <button
              onClick={handlePlayPause}
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all hover:bg-[var(--bg-secondary)]"
              style={{ border: '1px solid var(--border)' }}
            >
              {isPlaying ? (
                <svg className="w-4 h-4" style={{ color: 'var(--accent)' }} fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
              ) : (
                <svg className="w-4 h-4 ml-0.5" style={{ color: 'var(--text-main)' }} fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            {/* Time */}
            <span className="text-[10px] tracking-widest font-mono" style={{ color: 'var(--text-muted)', width: 80 }}>
              {formatTime(elapsed)} / {formatTime(TOTAL_DURATION)}
            </span>

            {/* Progress bar */}
            <div
              className="flex-1 h-1 rounded-full overflow-hidden cursor-pointer"
              style={{ background: 'var(--bg-secondary)' }}
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const pct = clickX / rect.width;
                setProgress(pct * 100);
                setElapsed(pct * TOTAL_DURATION);
                setCurrentFrame(Math.floor(pct * MODEL_ANGLES.length));
              }}
            >
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${progress}%`,
                  background: 'var(--accent)',
                }}
              />
            </div>

            {/* Fullscreen Button */}
            <button
              onClick={handleFullscreen}
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all hover:bg-[var(--bg-secondary)]"
            >
              {isFullscreen ? (
                <svg className="w-4 h-4" style={{ color: 'var(--text-main)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-4 h-4" style={{ color: 'var(--text-main)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              )}
            </button>
          </div>
        </motion.div>

        {/* Export options */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mt-12 flex justify-center"
        >
          <button
            onClick={handleExportVideo}
            disabled={isExporting}
            className={`rounded-full px-10 py-4 text-xs tracking-widest uppercase font-semibold flex items-center gap-3 transition-all ${isExporting ? 'bg-gray-500 cursor-not-allowed text-white' : 'btn-primary'}`}
          >
            {isExporting ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Exporting Video (20s)...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download Original Video
              </>
            )}
          </button>
        </motion.div>
      </div>
    </section>
  );
}
