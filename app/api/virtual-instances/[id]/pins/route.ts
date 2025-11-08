import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { pinAssignments, virtualInstances } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

// GET /api/virtual-instances/[id]/pins - Get pin assignments for instance
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Replace with actual authentication
    const userId = "sample-user-id"; // From session

    // Verify instance ownership
    const instance = await db
      .select()
      .from(virtualInstances)
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

    // Get all pin assignments
    const pins = await db
      .select()
      .from(pinAssignments)
      .where(eq(pinAssignments.instanceId, params.id));

    return NextResponse.json({
      success: true,
      pins,
    });
  } catch (error: any) {
    console.error('Error fetching pin assignments:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch pin assignments' },
      { status: 500 }
    );
  }
}

// POST /api/virtual-instances/[id]/pins - Create or update pin assignment
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const {
      pinNumber,
      pinMode,
      connectedComponent,
      componentConfig,
      initialValue,
      description,
    } = body;

    // TODO: Replace with actual authentication
    const userId = "sample-user-id"; // From session

    // Verify instance ownership
    const instance = await db
      .select()
      .from(virtualInstances)
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

    // Check if pin assignment already exists
    const existingPin = await db
      .select()
      .from(pinAssignments)
      .where(
        and(
          eq(pinAssignments.instanceId, params.id),
          eq(pinAssignments.pinNumber, pinNumber)
        )
      )
      .limit(1);

    if (existingPin && existingPin.length > 0) {
      // Update existing pin assignment
      const updated = await db
        .update(pinAssignments)
        .set({
          pinMode,
          connectedComponent,
          componentConfig: componentConfig || {},
          initialValue,
          description,
          updatedAt: new Date(),
        })
        .where(eq(pinAssignments.id, existingPin[0].id))
        .returning();

      return NextResponse.json({
        success: true,
        pin: updated[0],
        message: 'Pin assignment updated successfully',
      });
    } else {
      // Create new pin assignment
      const newPin = await db.insert(pinAssignments).values({
        instanceId: params.id,
        pinNumber,
        pinMode,
        connectedComponent,
        componentConfig: componentConfig || {},
        initialValue,
        description,
      }).returning();

      return NextResponse.json({
        success: true,
        pin: newPin[0],
        message: 'Pin assignment created successfully',
      }, { status: 201 });
    }
  } catch (error: any) {
    console.error('Error creating/updating pin assignment:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to save pin assignment' },
      { status: 500 }
    );
  }
}

// DELETE /api/virtual-instances/[id]/pins - Delete all pin assignments or specific pin
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const pinNumber = searchParams.get('pin');

    // TODO: Replace with actual authentication
    const userId = "sample-user-id"; // From session

    // Verify instance ownership
    const instance = await db
      .select()
      .from(virtualInstances)
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

    if (pinNumber) {
      // Delete specific pin
      await db
        .delete(pinAssignments)
        .where(
          and(
            eq(pinAssignments.instanceId, params.id),
            eq(pinAssignments.pinNumber, pinNumber)
          )
        );

      return NextResponse.json({
        success: true,
        message: `Pin ${pinNumber} assignment deleted successfully`,
      });
    } else {
      // Delete all pins for this instance
      await db
        .delete(pinAssignments)
        .where(eq(pinAssignments.instanceId, params.id));

      return NextResponse.json({
        success: true,
        message: 'All pin assignments deleted successfully',
      });
    }
  } catch (error: any) {
    console.error('Error deleting pin assignments:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete pin assignments' },
      { status: 500 }
    );
  }
}
