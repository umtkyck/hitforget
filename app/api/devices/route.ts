import { NextRequest, NextResponse } from 'next/server';
import { db, devices } from '@/lib/db';
import { eq } from 'drizzle-orm';

// GET /api/devices - List all devices or filter by status
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const deviceType = searchParams.get('type');

    let query = db.select().from(devices);

    if (status) {
      query = query.where(eq(devices.status, status));
    }

    if (deviceType) {
      query = query.where(eq(devices.deviceType, deviceType));
    }

    const result = await query;

    return NextResponse.json({
      success: true,
      devices: result,
      count: result.length,
    });
  } catch (error) {
    console.error('Error fetching devices:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch devices' },
      { status: 500 }
    );
  }
}

// POST /api/devices - Create a new device (admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { deviceType, slotNumber, rackId } = body;

    if (!deviceType || !slotNumber || !rackId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const newDevice = await db.insert(devices).values({
      deviceType,
      slotNumber,
      rackId,
      status: 'available',
      healthStatus: {
        temperature: 0,
        voltage: 0,
        lastCheck: new Date().toISOString(),
      },
    }).returning();

    return NextResponse.json({
      success: true,
      device: newDevice[0],
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating device:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create device' },
      { status: 500 }
    );
  }
}
