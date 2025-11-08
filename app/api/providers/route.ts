import { NextRequest, NextResponse } from 'next/server';
import { db, hardwareProviders, devices } from '@/lib/db';
import { requireAuth } from '@/lib/auth/middleware';
import { eq } from 'drizzle-orm';

// GET /api/providers - List all providers (marketplace)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const verified = searchParams.get('verified');

    let query = db.select().from(hardwareProviders);

    if (verified === 'true') {
      query = query.where(eq(hardwareProviders.isVerified, true));
    }

    const providers = await query;

    return NextResponse.json({
      success: true,
      providers: providers.map(p => ({
        id: p.id,
        businessName: p.businessName,
        description: p.description,
        location: p.location,
        rating: p.rating,
        totalReviews: p.totalReviews,
        totalDevices: p.totalDevices,
        isVerified: p.isVerified,
      })),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/providers - Become a provider
export async function POST(request: NextRequest) {
  const authResult = await requireAuth();
  if ('status' in authResult) return authResult;

  try {
    const body = await request.json();
    const { businessName, description, website, location } = body;

    // Check if user is already a provider
    const existing = await db.select()
      .from(hardwareProviders)
      .where(eq(hardwareProviders.userId, authResult.user.id as string));

    if (existing.length > 0) {
      return NextResponse.json(
        { success: false, error: 'User is already a provider' },
        { status: 400 }
      );
    }

    const newProvider = await db.insert(hardwareProviders).values({
      userId: authResult.user.id as string,
      businessName,
      description,
      website,
      location,
      status: 'pending', // Requires admin approval
    }).returning();

    return NextResponse.json({
      success: true,
      provider: newProvider[0],
      message: 'Provider application submitted. Pending approval.',
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
