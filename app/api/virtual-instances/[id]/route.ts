import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { virtualInstances, virtualProcessorTypes } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

// GET /api/virtual-instances/[id] - Get virtual instance details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Replace with actual authentication
    const userId = "sample-user-id"; // From session

    const instance = await db
      .select({
        instance: virtualInstances,
        processorType: virtualProcessorTypes,
      })
      .from(virtualInstances)
      .leftJoin(
        virtualProcessorTypes,
        eq(virtualInstances.processorTypeId, virtualProcessorTypes.id)
      )
      .where(
        and(
          eq(virtualInstances.id, params.id),
          eq(virtualInstances.userId, userId)
        )
      )
      .limit(1);

    if (!instance || instance.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Virtual instance not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      instance: {
        ...instance[0].instance,
        processorType: instance[0].processorType,
      },
    });
  } catch (error: any) {
    console.error('Error fetching virtual instance:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch virtual instance' },
      { status: 500 }
    );
  }
}

// PUT /api/virtual-instances/[id] - Update virtual instance
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { name, description, configuration, pinAssignments } = body;

    // TODO: Replace with actual authentication
    const userId = "sample-user-id"; // From session

    // Verify ownership
    const existing = await db
      .select()
      .from(virtualInstances)
      .where(
        and(
          eq(virtualInstances.id, params.id),
          eq(virtualInstances.userId, userId)
        )
      )
      .limit(1);

    if (!existing || existing.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Virtual instance not found' },
        { status: 404 }
      );
    }

    const updated = await db
      .update(virtualInstances)
      .set({
        name: name ?? existing[0].name,
        description: description ?? existing[0].description,
        configuration: configuration ?? existing[0].configuration,
        pinAssignments: pinAssignments ?? existing[0].pinAssignments,
        updatedAt: new Date(),
      })
      .where(eq(virtualInstances.id, params.id))
      .returning();

    return NextResponse.json({
      success: true,
      instance: updated[0],
    });
  } catch (error: any) {
    console.error('Error updating virtual instance:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update virtual instance' },
      { status: 500 }
    );
  }
}

// DELETE /api/virtual-instances/[id] - Delete virtual instance
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Replace with actual authentication
    const userId = "sample-user-id"; // From session

    // Verify ownership and that instance is not running
    const existing = await db
      .select()
      .from(virtualInstances)
      .where(
        and(
          eq(virtualInstances.id, params.id),
          eq(virtualInstances.userId, userId)
        )
      )
      .limit(1);

    if (!existing || existing.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Virtual instance not found' },
        { status: 404 }
      );
    }

    if (existing[0].status === 'running') {
      return NextResponse.json(
        { success: false, error: 'Cannot delete a running instance. Please stop it first.' },
        { status: 400 }
      );
    }

    await db
      .delete(virtualInstances)
      .where(eq(virtualInstances.id, params.id));

    return NextResponse.json({
      success: true,
      message: 'Virtual instance deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting virtual instance:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete virtual instance' },
      { status: 500 }
    );
  }
}
