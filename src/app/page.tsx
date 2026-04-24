'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import HeroSection from '@/components/HeroSection';
import UploadSection from '@/components/UploadSection';
import ProcessingPipeline from '@/components/ProcessingPipeline';
import GallerySection from '@/components/GallerySection';
import VideoSection from '@/components/VideoSection';

import { MODEL_ANGLES, type Saree } from '@/lib/mockData';

type Phase = 'idle' | 'processing' | 'done';

export default function HomePage() {
  const [selectedSaree, setSelectedSaree] = useState<Saree | null>(null);
  const [phase, setPhase] = useState<Phase>('idle');
  const [showResults, setShowResults] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[] | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const urlToBase64 = async (url: string): Promise<string> => {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const [isVisualComplete, setIsVisualComplete] = useState(false);

  const handleSareeSelected = async (saree: Saree, file?: File) => {
    setSelectedSaree(saree);
    setPhase('processing');
    setShowResults(false);
    setIsDemoMode(false);
    setIsVisualComplete(false);

    // Smooth scroll to processing
    setTimeout(() => {
      document.getElementById('processing')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);

    let apiSucceeded = false;
    let finalUrls: string[] | null = null;
    let isFallback = false;

    try {
      let base64Image = '';
      if (file) {
        base64Image = await fileToBase64(file);
      } else if (saree.image) {
        base64Image = await urlToBase64(saree.image);
      }

      // Call the generation API
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: base64Image,
          sareeName: saree.name,
          angles: MODEL_ANGLES,
        }),
      });

      const data = await res.json();

      if (data.fallback) {
        console.warn(data.message);
        isFallback = true;
      } else {
        const predictionIds = data.predictionIds;
        let isComplete = false;
        
        while (!isComplete) {
          await new Promise((resolve) => setTimeout(resolve, 3000));
          
          const statusRes = await fetch('/api/status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ predictionIds }),
          });
          const statusData = await statusRes.json();
          
          if (statusData.fallback) {
            isFallback = true;
            break;
          }
          
          if (statusData.allCompleted) {
            isComplete = true;
            apiSucceeded = true;
            finalUrls = statusData.results.map((r: any) => {
              return Array.isArray(r.output) ? r.output[0] : r.output;
            });
          }
        }
      }
    } catch (error) {
      console.error('Pipeline error:', error);
      isFallback = true;
    }

    if (isFallback) {
      setIsDemoMode(true);
      setGeneratedImages(null);
    } else if (apiSucceeded) {
      setGeneratedImages(finalUrls);
    }

    setPhase('done');
    setShowResults(true);
    
    setTimeout(() => {
      document.getElementById('gallery')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 800);
  };

  const handleProcessingComplete = () => {
    setIsVisualComplete(true);
  };

  return (
    <main className="relative bg-[var(--bg-primary)]">
      {/* Hero */}
      <HeroSection />

      {/* Upload / Select */}
      <UploadSection
        onSareeSelected={handleSareeSelected}
        selectedSaree={selectedSaree}
      />

      {/* Processing pipeline */}
      {selectedSaree && (
        <ProcessingPipeline
          saree={selectedSaree}
          phase={phase}
          onComplete={handleProcessingComplete}
          onStart={() => { }}
        />
      )}

      {/* Gallery — shown after processing done */}
      <AnimatePresence>
        {showResults && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
          >
            <GallerySection isVisible={showResults} generatedImages={generatedImages} isDemoMode={isDemoMode} />
            <VideoSection isVisible={showResults} generatedImages={generatedImages} isDemoMode={isDemoMode} />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
