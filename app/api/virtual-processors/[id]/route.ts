import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { virtualProcessorTypes } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// GET /api/virtual-processors/[id] - Get details of a specific processor type
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const processor = await db
      .select()
      .from(virtualProcessorTypes)
      .where(eq(virtualProcessorTypes.id, params.id))
      .limit(1);

    if (!processor || processor.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Virtual processor type not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      processor: processor[0]
    });
  } catch (error: any) {
    console.error('Error fetching virtual processor:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch virtual processor' },
      { status: 500 }
    );
  }
}

// PUT /api/virtual-processors/[id] - Update processor type (Admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    // TODO: Add authentication and admin role check
    // const session = await auth();
    // if (!session || session.user.role !== 'admin') {
    //   return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    // }

    const updated = await db
      .update(virtualProcessorTypes)
      .set({
        ...body,
        updatedAt: new Date(),
      })
      .where(eq(virtualProcessorTypes.id, params.id))
      .returning();

    if (!updated || updated.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Virtual processor type not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      processor: updated[0]
    });
  } catch (error: any) {
    console.error('Error updating virtual processor:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update virtual processor' },
      { status: 500 }
    );
  }
}

// DELETE /api/virtual-processors/[id] - Delete processor type (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Add authentication and admin role check
    // const session = await auth();
    // if (!session || session.user.role !== 'admin') {
    //   return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    // }

    // Soft delete by marking as inactive
    const updated = await db
      .update(virtualProcessorTypes)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(virtualProcessorTypes.id, params.id))
      .returning();

    if (!updated || updated.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Virtual processor type not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Virtual processor type deactivated successfully'
    });
  } catch (error: any) {
    console.error('Error deleting virtual processor:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete virtual processor' },
      { status: 500 }
    );
  }
}
