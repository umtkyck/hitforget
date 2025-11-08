import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { virtualProcessorTypes } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// GET /api/virtual-processors - List all available virtual processor types
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category'); // 'arduino', 'stm32', 'raspberry_pi', 'fpga'
    const isActive = searchParams.get('active') !== 'false'; // Default to active only

    let query = db.select().from(virtualProcessorTypes);

    if (isActive) {
      query = query.where(eq(virtualProcessorTypes.isActive, true)) as typeof query;
    }

    const processors = await query;

    // Filter by category if provided
    const filteredProcessors = category
      ? processors.filter(p => p.category === category)
      : processors;

    return NextResponse.json({
      success: true,
      processors: filteredProcessors,
      count: filteredProcessors.length
    });
  } catch (error: any) {
    console.error('Error fetching virtual processors:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch virtual processors' },
      { status: 500 }
    );
  }
}

// POST /api/virtual-processors - Create a new virtual processor type (Admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      category,
      architecture,
      description,
      imageUrl,
      specifications,
      simulatorEngine,
      monthlyPrice,
      yearlyPrice,
      features,
    } = body;

    // TODO: Add authentication and admin role check
    // const session = await auth();
    // if (!session || session.user.role !== 'admin') {
    //   return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    // }

    const newProcessor = await db.insert(virtualProcessorTypes).values({
      name,
      category,
      architecture,
      description,
      imageUrl,
      specifications,
      simulatorEngine,
      monthlyPrice,
      yearlyPrice,
      features,
      isActive: true,
    }).returning();

    return NextResponse.json({
      success: true,
      processor: newProcessor[0]
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating virtual processor type:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create virtual processor type' },
      { status: 500 }
    );
  }
}
