import { NextRequest, NextResponse } from 'next/server';
import { db, hardwareProviders, devices } from '@/lib/db';
import { requireAuth } from '@/lib/auth/middleware';
import { eq } from 'drizzle-orm';

// GET /api/providers/:id - Get provider details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const provider = await db.select()
      .from(hardwareProviders)
      .where(eq(hardwareProviders.id, params.id))
      .limit(1);

    if (provider.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Provider not found' },
        { status: 404 }
      );
    }

    // Get provider's devices
    const providerDevices = await db.select()
      .from(devices)
      .where(eq(devices.providerId, params.id));

    return NextResponse.json({
      success: true,
      provider: {
        ...provider[0],
        devices: providerDevices,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/providers/:id - Update provider profile
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAuth();
  if ('status' in authResult) return authResult;

  try {
    const body = await request.json();
    const { businessName, description, website, location } = body;

    // Verify ownership
    const provider = await db.select()
      .from(hardwareProviders)
      .where(eq(hardwareProviders.id, params.id))
      .limit(1);

    if (provider.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Provider not found' },
        { status: 404 }
      );
    }

    if (provider[0].userId !== authResult.user.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const updated = await db.update(hardwareProviders)
      .set({
        businessName,
        description,
        website,
        location,
        updatedAt: new Date(),
      })
      .where(eq(hardwareProviders.id, params.id))
      .returning();

    return NextResponse.json({
      success: true,
      provider: updated[0],
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
