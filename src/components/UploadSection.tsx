'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useRef, useState } from 'react';
import { SAREE_SAMPLES, type Saree } from '@/lib/mockData';

interface UploadSectionProps {
  onSareeSelected: (saree: Saree, file?: File) => void;
  selectedSaree: Saree | null;
}

export default function UploadSection({ onSareeSelected, selectedSaree }: UploadSectionProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [hoveredSample, setHoveredSample] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const url = URL.createObjectURL(file);
    const virtualSaree: Saree = {
      id: 'uploaded',
      name: 'Custom Fabric',
      type: 'Custom Upload',
      color: 'Custom',
      colorHex: '#B8A386',
      image: url,
      price: 'Custom',
    };
    onSareeSelected(virtualSaree, file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <section id="demo" className="py-32 px-8 md:px-16" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-[1200px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-3 rounded-full px-4 py-2 mb-6 text-[10px] font-semibold tracking-[0.2em] uppercase"
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              color: 'var(--text-muted)',
            }}
          >
            Step 1
          </div>
          <h2
            className="font-display text-4xl md:text-5xl font-light mb-6 tracking-wide"
            style={{ color: 'var(--text-main)' }}
          >
            Upload your <span className="italic" style={{ color: 'var(--accent)' }}>Fabric</span>
          </h2>
          <p className="text-sm tracking-wide font-light max-w-xl mx-auto" style={{ color: 'var(--text-muted)' }}>
            Provide a clear image of the textile. Our Agentic AI will handle the rest.
          </p>
        </motion.div>

        <div className="flex flex-col items-center justify-center gap-16">
          {/* Main Upload Dropzone - App Like */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
            className="w-full max-w-2xl"
          >
            <motion.div
              className="relative rounded-3xl overflow-hidden cursor-pointer group"
              style={{
                border: isDragging ? '1px solid var(--accent)' : '1px solid var(--border)',
                background: isDragging ? 'rgba(184,163,134,0.05)' : 'var(--bg-secondary)',
                minHeight: '400px',
                transition: 'all 0.5s cubic-bezier(0.23, 1, 0.32, 1)',
              }}
              animate={isDragging ? { scale: 1.02 } : { scale: 1 }}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
              />

              <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
                <motion.div
                  animate={{ y: isDragging ? -10 : 0 }}
                  transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                  className="w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-colors duration-500"
                  style={{ 
                    background: 'var(--bg-primary)', 
                    border: '1px solid var(--border)',
                    color: isDragging ? 'var(--accent)' : 'var(--text-muted)'
                  }}
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </motion.div>
                
                <div className="text-center">
                  <div className="text-lg font-medium tracking-wide mb-2 transition-colors duration-500" style={{ color: isDragging ? 'var(--accent)' : 'var(--text-main)' }}>
                    {isDragging ? 'Release to upload' : 'Drag & drop your fabric'}
                  </div>
                  <div className="text-xs tracking-widest uppercase font-semibold mb-8" style={{ color: 'var(--text-muted)' }}>
                    PNG, JPG, WEBP • Max 10MB
                  </div>
                  <div className="btn-outline rounded-full px-8 py-3 text-xs tracking-wide uppercase font-semibold pointer-events-none group-hover:bg-[var(--bg-primary)] group-hover:border-[var(--text-muted)] group-hover:text-[var(--text-main)] transition-all duration-500">
                    Browse Files
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Sleek Horizontal Samples Strip */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.23, 1, 0.32, 1] }}
            className="w-full flex flex-col items-center"
          >
            <h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] mb-8" style={{ color: 'var(--text-muted)' }}>
              Or test with a sample
            </h3>
            <div className="flex flex-wrap justify-center gap-6">
              {SAREE_SAMPLES.map((saree, i) => (
                <div
                  key={saree.id}
                  className="relative group"
                  onMouseEnter={() => setHoveredSample(saree.id)}
                  onMouseLeave={() => setHoveredSample(null)}
                >
                  <button
                    onClick={() => onSareeSelected(saree)}
                    className="w-16 h-16 rounded-full overflow-hidden relative transition-all duration-500"
                    style={{
                      border: selectedSaree?.id === saree.id ? '2px solid var(--accent)' : '1px solid var(--border)',
                      opacity: hoveredSample && hoveredSample !== saree.id ? 0.4 : 1,
                      transform: hoveredSample === saree.id ? 'scale(1.1)' : 'scale(1)',
                    }}
                  >
                    <Image
                      src={saree.image}
                      alt={saree.name}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </button>
                  
                  {/* Hover Tooltip */}
                  <AnimatePresence>
                    {hoveredSample === saree.id && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap px-4 py-2 rounded-lg text-xs font-medium tracking-wide z-10"
                        style={{ background: 'var(--bg-secondary)', color: 'var(--text-main)', border: '1px solid var(--border)', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                      >
                        {saree.name}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
