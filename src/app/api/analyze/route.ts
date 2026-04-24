import { NextRequest, NextResponse } from 'next/server';
import { Groq } from 'groq-sdk';

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

export async function POST(req: NextRequest) {
  try {
    const { image } = await req.json();

    const groqApiKey = process.env.GROQ_API_KEY;

    if (!groqApiKey) {
      return NextResponse.json({ fallback: true, message: 'Demo Mode: GROQ_API_KEY missing.' });
    }

    let analysis: SareeAnalysis | null = null;
    const baseSeed = Math.floor(Math.random() * 1000000);

    // Groq Vision Extraction
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

    return NextResponse.json({ fallback: false, analysis, baseSeed });

  } catch (error) {
    console.error('Error in /api/analyze:', error);
    return NextResponse.json({ fallback: true, message: 'Demo Mode: Analyze failed.' });
  }
}
