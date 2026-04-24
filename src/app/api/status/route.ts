import { NextRequest, NextResponse } from 'next/server';
import { getJob } from '@/lib/jobStore';

export async function POST(req: NextRequest) {
  try {
    const { predictionIds } = await req.json();

    const results = [];
    let allCompleted = true;

    for (const id of predictionIds) {
      const job = getJob(id);
      
      if (!job) {
        // Job not found, maybe server restarted
        return NextResponse.json({ fallback: true, message: 'Job not found in memory.' });
      }

      if (job.status !== 'succeeded' && job.status !== 'failed') {
        allCompleted = false;
      }

      results.push({
        id: job.id,
        status: job.status,
        output: job.output, 
        error: job.error,
      });
    }

    return NextResponse.json({ allCompleted, results });

  } catch (error) {
    console.error('Error in /api/status:', error);
    return NextResponse.json({ fallback: true, message: 'Failed to poll status.' });
  }
}
