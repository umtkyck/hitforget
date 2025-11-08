import { NextRequest, NextResponse } from 'next/server';
import { db, ratings, hardwareProviders } from '@/lib/db';
import { requireAuth } from '@/lib/auth/middleware';
import { eq, and, sql } from 'drizzle-orm';

// GET /api/ratings - Get ratings
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const providerId = searchParams.get('providerId');
    const deviceId = searchParams.get('deviceId');

    let query = db.select().from(ratings);

    if (providerId) {
      query = query.where(eq(ratings.providerId, providerId));
    }

    if (deviceId) {
      query = query.where(eq(ratings.deviceId, deviceId));
    }

    const allRatings = await query;

    return NextResponse.json({
      success: true,
      ratings: allRatings,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/ratings - Add a rating
export async function POST(request: NextRequest) {
  const authResult = await requireAuth();
  if ('status' in authResult) return authResult;

  try {
    const body = await request.json();
    const { providerId, deviceId, sessionId, rating, review } = body;

    if (!providerId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, error: 'Invalid request' },
        { status: 400 }
      );
    }

    // Check if user already rated this provider
    const existing = await db.select()
      .from(ratings)
      .where(
        and(
          eq(ratings.userId, authResult.user.id as string),
          eq(ratings.providerId, providerId),
          sessionId ? eq(ratings.sessionId, sessionId) : sql`1=1`
        )
      );

    if (existing.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Already rated' },
        { status: 400 }
      );
    }

    // TODO: Verify that user actually used this provider's device
    const isVerified = sessionId !== null;

    const newRating = await db.insert(ratings).values({
      userId: authResult.user.id as string,
      providerId,
      deviceId,
      sessionId,
      rating,
      review,
      isVerified,
    }).returning();

    // Update provider's rating
    const providerRatings = await db.select()
      .from(ratings)
      .where(eq(ratings.providerId, providerId));

    const avgRating = providerRatings.reduce((sum, r) => sum + r.rating, 0) / providerRatings.length;

    await db.update(hardwareProviders)
      .set({
        rating: avgRating.toFixed(2),
        totalReviews: providerRatings.length,
      })
      .where(eq(hardwareProviders.id, providerId));

    return NextResponse.json({
      success: true,
      rating: newRating[0],
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
