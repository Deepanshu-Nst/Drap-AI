import { NextRequest, NextResponse } from 'next/server';
import { Groq } from 'groq-sdk';
import { createJob, updateJob } from '@/lib/jobStore';

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

function parseBase64(dataUri: string) {
  const matches = dataUri.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    return { mimeType: 'image/jpeg', base64Data: dataUri };
  }
  return { mimeType: matches[1], base64Data: matches[2] };
}

function buildPrompt(angleLabel: string, analysis: SareeAnalysis | null, sareeName: string) {
  const modelIdentity = "25-year-old high fashion South Asian female model, sharp jawline, elegant features, olive skin, sleek pulled-back hair";
  
  if (!analysis) {
    return `full body shot, ${angleLabel} perspective, ${modelIdentity} wearing an authentic traditional Indian ${sareeName} saree, exquisite intricate embroidery, rich fabric texture, graceful draping, high fashion editorial photography, professional studio lighting, 8k resolution, photorealistic, cinematic lighting, vogue style`;
  }

  return `full body shot, ${angleLabel} perspective, ${modelIdentity} wearing a traditional Indian ${sareeName} saree. Saree details: Primary Color: ${analysis.primary_color}. Secondary Color: ${analysis.secondary_color}. Borders: ${analysis.border}. Motifs: ${analysis.motifs}. Fabric: ${analysis.fabric}. Texture: ${analysis.texture}. Draping Style: ${analysis.drape_style}. Category: ${analysis.category}. Vibe: ${analysis.vibe}. Exquisite intricate embroidery, highly detailed, photorealistic fabric, graceful draping, high fashion editorial photography, professional studio lighting, 8k resolution, cinematic lighting, vogue style`;
}

// Background task to run HF Inference with retries
async function runHuggingFaceGeneration(jobId: string, prompt: string, hfToken: string, seed: number) {
  updateJob(jobId, { status: 'processing' });

  const maxRetries = 3;
  let attempt = 0;

  // Dynamically import to avoid top-level require issues
  const { HfInference } = await import('@huggingface/inference');
  const hf = new HfInference(hfToken);

  while (attempt < maxRetries) {
    try {
      const blob = await hf.textToImage({
        model: 'black-forest-labs/FLUX.1-schnell',
        inputs: prompt,
        parameters: {
          seed: seed,
          num_inference_steps: 4,
        }
      });

      // Read image blob and convert to base64 so frontend can display it
      const arrayBuffer = await blob.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64Image = `data:image/jpeg;base64,${buffer.toString('base64')}`;

      updateJob(jobId, { status: 'succeeded', output: base64Image });
      return;

    } catch (error: any) {
      console.error(`HF Generation error on job ${jobId}:`, error);
      attempt++;
      await new Promise(r => setTimeout(r, 2000 * attempt));
    }
  }

  updateJob(jobId, { status: 'failed', error: 'Exceeded max retries or rate limit' });
}

export async function POST(req: NextRequest) {
  try {
    const { image, sareeName, angles } = await req.json();

    const groqApiKey = process.env.GROQ_API_KEY;
    const hfToken = process.env.HF_TOKEN;

    if (!groqApiKey || !hfToken) {
      return NextResponse.json({ fallback: true, message: 'Demo Mode: GROQ_API_KEY or HF_TOKEN missing.' });
    }

    let analysis: SareeAnalysis | null = null;

    // Phase 1: Groq Vision Extraction
    if (image) {
      try {
        const groq = new Groq({ apiKey: groqApiKey });
        const { mimeType, base64Data } = parseBase64(image);

        // Ensure the base64 string is properly formatted for Groq
        const groqImageUrl = `data:${mimeType};base64,${base64Data}`;

        const promptText = `Analyze this saree fabric image. 
Return a strictly formatted JSON object with the following keys:
- "primary_color": dominant color
- "secondary_color": secondary or accent color
- "border": exact description of border patterns
- "motifs": description of prints or embroidery motifs
- "fabric": apparent fabric material (e.g. silk, cotton)
- "texture": visual texture
- "drape_style": most suitable draping style
- "category": type of saree (e.g. Banarasi, Kanjivaram)
- "vibe": stylistic mood

Anti-hallucination rules: 
1. Only describe what you explicitly see in the fabric.
2. If unsure, return "unknown" for that key.`;

        const chatCompletion = await groq.chat.completions.create({
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: promptText },
                { type: "image_url", image_url: { url: groqImageUrl } }
              ]
            }
          ],
          model: "meta-llama/llama-4-scout-17b-16e-instruct",
          response_format: { type: "json_object" }
        });

        const textResponse = chatCompletion.choices[0]?.message?.content;
        if (textResponse) {
          analysis = JSON.parse(textResponse) as SareeAnalysis;
          console.log("Groq Analysis:", analysis);
        }
      } catch (groqError) {
        console.error("Groq Extraction Error:", groqError);
      }
    }

    // Phase 2: Hugging Face Background Jobs
    const predictionIds: string[] = [];
    const baseSeed = Math.floor(Math.random() * 1000000);

    for (let i = 0; i < angles.length; i++) {
      const angle = angles[i];
      const jobId = `job_${Date.now()}_${i}`;
      createJob(jobId);
      predictionIds.push(jobId);

      const finalPrompt = buildPrompt(angle.label, analysis, sareeName);
      
      // Start background task (don't await)
      runHuggingFaceGeneration(jobId, finalPrompt, hfToken, baseSeed).catch(e => console.error(e));
    }

    return NextResponse.json({ fallback: false, predictionIds, analysis });

  } catch (error) {
    console.error('Error in /api/generate:', error);
    return NextResponse.json({ fallback: true, message: 'Demo Mode: Pipeline failed.' });
  }
}
