import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Health Check API
 *
 * Purpose: Keep Supabase free tier database active
 *
 * Supabase free tier pauses projects after 7 days of inactivity.
 * This endpoint should be called regularly by an external cron service
 * (e.g., UptimeRobot, Cron-job.org) to prevent automatic pausing.
 *
 * Recommended frequency: Once per week
 *
 * Setup external cron:
 * 1. Go to https://cron-job.org or https://uptimerobot.com
 * 2. Create a new monitor/job
 * 3. URL: https://yourdomain.com/api/health
 * 4. Interval: Weekly (or every 5 days to be safe)
 * 5. Method: GET
 *
 * @returns JSON response with database status
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Simple query to keep database active
    const result = await prisma.$queryRaw`SELECT 1 as health_check`;

    // Get current timestamp from database
    const timeResult = await prisma.$queryRaw<Array<{ now: Date }>>`SELECT NOW() as now`;

    const responseTime = Date.now() - startTime;

    return NextResponse.json(
      {
        status: 'healthy',
        database: 'connected',
        timestamp: new Date().toISOString(),
        dbTime: timeResult[0]?.now,
        responseTime: `${responseTime}ms`,
        message: 'Database is active and responding'
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'X-Health-Check': 'supabase-keepalive'
        }
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const responseTime = Date.now() - startTime;

    console.error('Health check failed:', errorMessage);

    return NextResponse.json(
      {
        status: 'unhealthy',
        database: 'disconnected',
        timestamp: new Date().toISOString(),
        responseTime: `${responseTime}ms`,
        error: errorMessage,
        message: 'Database connection failed. Please check Supabase dashboard.'
      },
      {
        status: 503,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'X-Health-Check': 'supabase-keepalive'
        }
      }
    );
  }
}
