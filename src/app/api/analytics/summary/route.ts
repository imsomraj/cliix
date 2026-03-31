import { NextResponse } from 'next/server';

import { analyticsService } from '@/lib/services/analytics-service';

export async function GET() {
  try {
    const summary = await analyticsService.getSummary();
    return NextResponse.json(summary);
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({ error: 'Failed to fetch analytics summary' }, { status: 500 });
  }
}
