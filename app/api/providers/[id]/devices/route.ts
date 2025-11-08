import { NextRequest, NextResponse } from 'next/server';
import { db, devices, hardwareProviders } from '@/lib/db';
import { requireAuth } from '@/lib/auth/middleware';
import { eq } from 'drizzle-orm';

// GET /api/providers/:id/devices - Get provider's devices
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const providerDevices = await db.select()
      .from(devices)
      .where(eq(devices.providerId, params.id));

    return NextResponse.json({
      success: true,
      devices: providerDevices,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/providers/:id/devices - Add a device
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAuth();
  if ('status' in authResult) return authResult;

  try {
    // Verify provider ownership
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

    const body = await request.json();
    const {
      deviceType,
      deviceName,
      description,
      imageUrl,
      slotNumber,
      rackId,
      hourlyRateUsd,
      isPublic,
      specifications,
    } = body;

    const newDevice = await db.insert(devices).values({
      providerId: params.id,
      deviceType,
      deviceName,
      description,
      imageUrl,
      slotNumber,
      rackId,
      hourlyRateUsd: hourlyRateUsd || '1.00',
      isPublic: isPublic !== false,
      specifications,
      status: 'available',
    }).returning();

    // Update provider's total devices count
    await db.update(hardwareProviders)
      .set({
        totalDevices: provider[0].totalDevices + 1,
      })
      .where(eq(hardwareProviders.id, params.id));

    return NextResponse.json({
      success: true,
      device: newDevice[0],
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
