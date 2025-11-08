import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { virtualInstances } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

// POST /api/virtual-instances/[id]/control - Control virtual instance (start, stop, restart)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { action } = body; // 'start', 'stop', 'restart'

    // TODO: Replace with actual authentication
    const userId = "sample-user-id"; // From session

    // Verify ownership
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

    const currentInstance = instance[0];

    if (action === 'start') {
      if (currentInstance.status === 'running') {
        return NextResponse.json(
          { success: false, error: 'Instance is already running' },
          { status: 400 }
        );
      }

      // TODO: Actually start the virtual processor using simulation service
      // await simulationService.startInstance(params.id);

      const updated = await db
        .update(virtualInstances)
        .set({
          status: 'running',
          lastStartedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(virtualInstances.id, params.id))
        .returning();

      return NextResponse.json({
        success: true,
        instance: updated[0],
        message: 'Virtual instance started successfully',
      });
    } else if (action === 'stop') {
      if (currentInstance.status !== 'running') {
        return NextResponse.json(
          { success: false, error: 'Instance is not running' },
          { status: 400 }
        );
      }

      // TODO: Actually stop the virtual processor
      // await simulationService.stopInstance(params.id);

      // Calculate runtime hours
      const startTime = currentInstance.lastStartedAt;
      const runtimeSeconds = startTime
        ? Math.floor((Date.now() - new Date(startTime).getTime()) / 1000)
        : 0;
      const runtimeHours = runtimeSeconds / 3600;
      const totalRuntime = parseFloat(currentInstance.totalRuntimeHours || '0') + runtimeHours;

      const updated = await db
        .update(virtualInstances)
        .set({
          status: 'stopped',
          lastStoppedAt: new Date(),
          totalRuntimeHours: totalRuntime.toFixed(2),
          updatedAt: new Date(),
        })
        .where(eq(virtualInstances.id, params.id))
        .returning();

      return NextResponse.json({
        success: true,
        instance: updated[0],
        message: 'Virtual instance stopped successfully',
        runtimeHours: runtimeHours.toFixed(2),
      });
    } else if (action === 'restart') {
      // TODO: Actually restart the virtual processor
      // await simulationService.restartInstance(params.id);

      const updated = await db
        .update(virtualInstances)
        .set({
          status: 'running',
          lastStartedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(virtualInstances.id, params.id))
        .returning();

      return NextResponse.json({
        success: true,
        instance: updated[0],
        message: 'Virtual instance restarted successfully',
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid action. Use: start, stop, or restart' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Error controlling virtual instance:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to control virtual instance' },
      { status: 500 }
    );
  }
}
