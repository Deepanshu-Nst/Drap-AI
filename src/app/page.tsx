'use client';

import { useState, useRef } from 'react';
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
  const [isVisualComplete, setIsVisualComplete] = useState(false);

  // Concurrency & Progress state
  const [completedAngles, setCompletedAngles] = useState(0);
  const [analysisState, setAnalysisState] = useState<'idle' | 'analyzing' | 'generating' | 'done'>('idle');
  const [isGenerating, setIsGenerating] = useState(false);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const analysisCacheRef = useRef<Record<string, any>>({});

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

  const handleSareeSelected = async (saree: Saree, file?: File) => {
    if (isGenerating) return; // Prevent duplicate clicks
    setIsGenerating(true);
    
    setSelectedSaree(saree);
    setPhase('processing');
    setShowResults(false);
    setIsDemoMode(false);
    setIsVisualComplete(false);
    setCompletedAngles(0);
    setAnalysisState('analyzing');

    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    // Smooth scroll to processing
    setTimeout(() => {
      document.getElementById('processing')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);

    try {
      let base64Image = '';
      if (file) {
        base64Image = await fileToBase64(file);
      } else if (saree.image) {
        base64Image = await urlToBase64(saree.image);
      }

      // Check Cache
      let analysisData = analysisCacheRef.current[base64Image];
      let baseSeed = Math.floor(Math.random() * 1000000);

      // Analyze phase
      if (!analysisData) {
        const analyzeRes = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64Image }),
          signal
        });
        const analyzeJson = await analyzeRes.json();
        
        if (analyzeJson.fallback) {
          throw new Error('Analyze failed');
        }
        
        analysisData = analyzeJson.analysis;
        baseSeed = analyzeJson.baseSeed || baseSeed;
        analysisCacheRef.current[base64Image] = analysisData;
      }

      if (signal.aborted) throw new Error('Aborted');

      setAnalysisState('generating');

      const finalUrls: string[] = [];
      let completedCount = 0;

      // Concurrency Limit = 2
      const concurrencyLimit = 2;
      let currentIndex = 0;

      const generateNext = async (): Promise<void> => {
        if (signal.aborted) throw new Error('Aborted');
        if (currentIndex >= MODEL_ANGLES.length) return;

        const angleIndex = currentIndex++;
        const angle = MODEL_ANGLES[angleIndex];
        
        let attempts = 0;
        let successUrl = '';
        
        while (attempts < 3) {
          if (signal.aborted) throw new Error('Aborted');
          try {
            const res = await fetch('/api/generateImage', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                angleLabel: angle.label,
                analysis: analysisData,
                sareeName: saree.name,
                seed: baseSeed
              }),
              signal
            });
            const json = await res.json();
            
            if (json.success && json.image) {
              successUrl = json.image;
              break;
            } else {
              console.warn(`Attempt ${attempts + 1} failed for angle ${angle.label}: ${json.reason}`);
            }
          } catch (e: any) {
            if (e.name === 'AbortError') throw e;
            console.error(`Fetch error for angle ${angle.label}:`, e);
          }
          
          attempts++;
          if (attempts < 3) await new Promise(r => setTimeout(r, 4000 * attempts)); // Increased Backoff
        }
        
        if (successUrl) {
          finalUrls[angleIndex] = successUrl;
        } else {
          console.error(`Failed to generate angle ${angle.label} after 3 attempts. Using fallback.`);
          finalUrls[angleIndex] = base64Image || saree.image; // Saree-specific fallback to avoid mixing model identities
        }
        
        completedCount++;
        setCompletedAngles(completedCount);
        
        return generateNext();
      };

      const workers = Array(concurrencyLimit).fill(null).map(() => generateNext());
      await Promise.all(workers);

      if (signal.aborted) return; // Exit if user cancelled

      setGeneratedImages(finalUrls);
      setPhase('done');
      setAnalysisState('done');
      setShowResults(true);
      
      setTimeout(() => {
        document.getElementById('gallery')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 800);

    } catch (error: any) {
      if (error.name === 'AbortError' || error.message === 'Aborted') {
        console.log('Generation cancelled by user.');
        setPhase('idle');
        setAnalysisState('idle');
      } else {
        console.error('Pipeline error:', error);
        setIsDemoMode(true);
        setGeneratedImages(null);
        setPhase('done');
        setShowResults(true);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleProcessingComplete = () => {
    setIsVisualComplete(true);
  };

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  return (
    <main className="relative bg-[var(--bg-primary)]">
      <HeroSection />

      <UploadSection
        onSareeSelected={handleSareeSelected}
        selectedSaree={selectedSaree}
      />

      {selectedSaree && (
        <ProcessingPipeline
          saree={selectedSaree}
          phase={phase}
          onComplete={handleProcessingComplete}
          onStart={() => { }}
          onCancel={isGenerating ? handleCancel : undefined}
          completedAngles={completedAngles}
          totalAngles={MODEL_ANGLES.length}
          analysisState={analysisState}
        />
      )}

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
