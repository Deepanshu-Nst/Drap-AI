import { NextRequest, NextResponse } from 'next/server';

interface SareeAnalysis {
  primary_color: string;
  secondary_color: string;
  border: string;
  motifs: string;
  fabric: string;
  texture: string;
  drape_style: string;
  category: string;
  vibe: string;
}

function buildPrompt(angleLabel: string, analysis: SareeAnalysis | null, sareeName: string) {
  const modelIdentity = "25-year-old high fashion South Asian female model, sharp jawline, elegant features, olive skin, sleek pulled-back hair";
  
  if (!analysis) {
    return `full body shot, ${angleLabel} perspective, ${modelIdentity} wearing an authentic traditional Indian ${sareeName} saree, exquisite intricate embroidery, rich fabric texture, graceful draping, high fashion editorial photography, professional studio lighting, 8k resolution, photorealistic, cinematic lighting, vogue style`;
  }

  // Priority: color > border > motifs > fabric > pose
  return `full body shot, ${modelIdentity} wearing a traditional Indian ${sareeName} saree. Primary Color: ${analysis.primary_color}, Secondary Color: ${analysis.secondary_color}. Borders: ${analysis.border}. Motifs: ${analysis.motifs}. Fabric: ${analysis.fabric}. Texture: ${analysis.texture}. Category: ${analysis.category}. Draping Style: ${analysis.drape_style}. Pose: ${angleLabel} perspective. Vibe: ${analysis.vibe}. Exquisite intricate embroidery, highly detailed, photorealistic fabric, graceful draping, high fashion editorial photography, professional studio lighting, 8k resolution, cinematic lighting, vogue style`;
}

export async function POST(req: NextRequest) {
  try {
    const { angleLabel, analysis, sareeName, seed } = await req.json();

    const hfToken = process.env.HF_TOKEN;

    if (!hfToken) {
      return NextResponse.json({ fallback: true, message: 'missing_token' }, { status: 400 });
    }

    const { HfInference } = await import('@huggingface/inference');
    const hf = new HfInference(hfToken);
    
    const finalPrompt = buildPrompt(angleLabel, analysis, sareeName);

    try {
      const blob = await hf.textToImage({
        model: 'black-forest-labs/FLUX.1-schnell',
        inputs: finalPrompt,
        parameters: {
          seed: seed,
          num_inference_steps: 4,
        }
      }, { outputType: 'blob' });

      // Read image blob and convert to base64
      const arrayBuffer = await blob.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64Image = `data:image/jpeg;base64,${buffer.toString('base64')}`;

      return NextResponse.json({ success: true, image: base64Image });

    } catch (hfError: any) {
      console.error(`HF Generation error for angle ${angleLabel}:`, hfError.message || hfError);
      
      let errorReason = 'unknown';
      if (hfError.message?.includes('503') || hfError.message?.includes('loading')) {
        errorReason = 'model_loading';
      } else if (hfError.message?.includes('429') || hfError.message?.includes('rate')) {
        errorReason = 'rate_limit';
      } else if (hfError.name === 'AbortError' || hfError.message?.includes('timeout')) {
        errorReason = 'timeout';
      }

      return NextResponse.json({ fallback: true, reason: errorReason }, { status: 500 });
    }

  } catch (error) {
    console.error('Error in /api/generateImage:', error);
    return NextResponse.json({ fallback: true, reason: 'internal_error' }, { status: 500 });
  }
}
