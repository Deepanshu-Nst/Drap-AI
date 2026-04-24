export interface Saree {
  id: string;
  name: string;
  type: string;
  color: string;
  colorHex: string;
  image: string;
  price: string;
}

export interface ModelAngle {
  id: number;
  label: string;
  description: string;
  image: string;
  angle: string;
}

export interface ProcessingStep {
  id: string;
  label: string;
  description: string;
  duration: number; // ms
  icon: string;
}

export const SAREE_SAMPLES: Saree[] = [
  {
    id: 'saree-1',
    name: 'Royal Kanjivaram',
    type: 'Silk',
    color: 'Royal Blue',
    colorHex: '#1A3A8F',
    image: '/images/saree1.png',
    price: '₹18,500',
  },
  {
    id: 'saree-2',
    name: 'Crimson Banarasi',
    type: 'Silk',
    color: 'Crimson Red',
    colorHex: '#8B1A1A',
    image: '/images/saree2.png',
    price: '₹22,000',
  },
  {
    id: 'saree-3',
    name: 'Emerald Temple Silk',
    type: 'Kanjivaram',
    color: 'Emerald Green',
    colorHex: '#145A32',
    image: '/images/saree3.png',
    price: '₹25,000',
  },
  {
    id: 'saree-4',
    name: 'Violet Peacock',
    type: 'Banarasi',
    color: 'Royal Violet',
    colorHex: '#4A148C',
    image: '/images/saree4.png',
    price: '₹19,800',
  },
];

export const MODEL_ANGLES: ModelAngle[] = [
  { id: 1, label: 'Front View', description: 'Classic front-facing full body', image: '/images/model_1.png', angle: '0°' },
  { id: 2, label: 'Side Profile', description: 'Elegant left side silhouette', image: '/images/model_2.png', angle: '90°' },
  { id: 3, label: '¾ Front Right', description: 'Three-quarter diagonal view', image: '/images/model_3.png', angle: '45°' },
  { id: 4, label: 'Back View', description: 'Full pallu drape reveal', image: '/images/model_4.png', angle: '180°' },
  { id: 5, label: 'Dynamic Walk', description: 'Motion capture walking pose', image: '/images/model_5.png', angle: '135°' },
  { id: 6, label: 'Low Angle', description: 'Dramatic upward perspective', image: '/images/model_6.png', angle: '270°' },
  { id: 7, label: 'Detail Close-up', description: 'Fabric & border texture reveal', image: '/images/model_7.png', angle: '30°' },
  { id: 8, label: 'Seated Pose', description: 'Graceful seated editorial', image: '/images/model_8.png', angle: '60°' },
  { id: 9, label: '¾ Back Left', description: 'Three-quarter rear diagonal', image: '/images/model_9.png', angle: '225°' },
  { id: 10, label: 'Overhead Shot', description: "Bird's-eye artistic view", image: '/images/model_10.png', angle: '315°' },
];

export const PROCESSING_STEPS: ProcessingStep[] = [
  {
    id: 'analyze',
    label: 'Fabric Analysis',
    description: 'Extracting color, texture & weave patterns',
    duration: 1800,
    icon: '🔬',
  },
  {
    id: 'model-gen',
    label: 'Model Generation',
    description: 'Synthesizing photorealistic fashion model',
    duration: 2200,
    icon: '👗',
  },
  {
    id: 'drape',
    label: 'Drape Simulation',
    description: 'Physics-based saree draping calculation',
    duration: 2500,
    icon: '✨',
  },
  {
    id: 'lighting',
    label: 'Studio Lighting',
    description: 'Applying professional lighting rigs',
    duration: 1500,
    icon: '💡',
  },
  {
    id: 'multi-angle',
    label: 'Multi-Angle Render',
    description: 'Generating 10 viewpoint variations',
    duration: 3000,
    icon: '🎬',
  },
  {
    id: 'compile',
    label: 'Video Compilation',
    description: 'Assembling 20-second showcase reel',
    duration: 2000,
    icon: '🎞️',
  },
];

export const STATS = [
  { value: '10x', label: 'Faster than photoshoot' },
  { value: '98%', label: 'Visual accuracy' },
  { value: '10', label: 'Angles per saree' },
  { value: '20s', label: 'Compilation video' },
];

export const FEATURES = [
  {
    icon: '⚡',
    title: 'Instant Generation',
    desc: 'From upload to gallery in under 30 seconds. No booking, no studio, no waiting.',
  },
  {
    icon: '🎯',
    title: '360° Coverage',
    desc: '10 curated angles covering every buyer perspective — front, back, side & dynamic poses.',
  },
  {
    icon: '🎥',
    title: 'Video Showcase',
    desc: 'Auto-compiled 20-second reel ready for Instagram, website & marketplace listings.',
  },
  {
    icon: '📐',
    title: 'Photorealistic Drape',
    desc: 'AI-powered physics simulation replicates authentic saree draping with silk texture.',
  },
];

export const TESTIMONIALS = [
  {
    name: 'Priya Mehta',
    role: 'Founder, Rasa Boutique',
    quote: 'DrapAI cut our photoshoot costs by 80%. The output is indistinguishable from real shoots.',
    avatar: '👩‍💼',
  },
  {
    name: 'Arjun Srinivasan',
    role: 'CTO, Silkthread Marketplace',
    quote: 'We onboarded 400 new SKUs in a week. This is the infrastructure Indian fashion needed.',
    avatar: '👨‍💻',
  },
  {
    name: 'Nalini Iyer',
    role: 'Head of Digital, Taneira',
    quote: 'The multi-angle gallery increased our add-to-cart rate by 34% in the first month.',
    avatar: '👩‍🎨',
  },
];
