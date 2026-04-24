import { NextResponse } from 'next/server';
import https from 'https';
import http from 'http';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get('url');

  if (!imageUrl) {
    return new NextResponse('Missing url parameter', { status: 400 });
  }

  try {
    const data = await new Promise<Buffer>((resolve, reject) => {
      const protocol = imageUrl.startsWith('https') ? https : http;
      const req = protocol.get(
        imageUrl,
        {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            Accept: 'image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
          },
          timeout: 60000, // 60s – image generation can be slow
        },
        (res) => {
          // Follow redirects
          if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
            const redirectProtocol = res.headers.location.startsWith('https') ? https : http;
            redirectProtocol.get(
              res.headers.location,
              {
                headers: {
                  'User-Agent':
                    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
                  Accept: 'image/*,*/*;q=0.8',
                },
                timeout: 60000,
              },
              (redirectRes) => {
                if (redirectRes.statusCode !== 200) {
                  reject(new Error(`Redirect status ${redirectRes.statusCode}`));
                  return;
                }
                const chunks: Buffer[] = [];
                redirectRes.on('data', (chunk: Buffer) => chunks.push(chunk));
                redirectRes.on('end', () => resolve(Buffer.concat(chunks)));
                redirectRes.on('error', reject);
              },
            ).on('error', reject);
            return;
          }

          if (res.statusCode !== 200) {
            reject(new Error(`Status ${res.statusCode}`));
            return;
          }
          const chunks: Buffer[] = [];
          res.on('data', (chunk: Buffer) => chunks.push(chunk));
          res.on('end', () => resolve(Buffer.concat(chunks)));
          res.on('error', reject);
        },
      );
      req.on('error', reject);
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });
    });

    const contentType = 'image/jpeg';

    return new NextResponse(new Uint8Array(data), {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    console.error('Proxy error:', message);
    return new NextResponse(`Failed to fetch image: ${message}`, { status: 502 });
  }
}
