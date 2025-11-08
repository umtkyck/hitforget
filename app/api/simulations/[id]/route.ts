import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { simulations, virtualInstances } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

// GET /api/simulations/[id] - Get simulation details and output
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Replace with actual authentication
    const userId = "sample-user-id"; // From session

    // Get simulation with instance info
    const simulation = await db
      .select({
        simulation: simulations,
        instance: virtualInstances,
      })
      .from(simulations)
      .leftJoin(
        virtualInstances,
        eq(simulations.instanceId, virtualInstances.id)
      )
      .where(
        and(
          eq(simulations.id, params.id),
          eq(simulations.userId, userId)
        )
      )
      .limit(1);

    if (!simulation || simulation.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Simulation not found' },
        { status: 404 }
      );
    }

    // TODO: Get live serial output from simulation service
    // const liveOutput = await simulationService.getSerialOutput(params.id);

    return NextResponse.json({
      success: true,
      simulation: {
        ...simulation[0].simulation,
        instance: simulation[0].instance,
      },
    });
  } catch (error: any) {
    console.error('Error fetching simulation:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch simulation' },
      { status: 500 }
    );
  }
}

// PUT /api/simulations/[id] - Update simulation (pause, resume, stop)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { action } = body; // 'pause', 'resume', 'stop'

    // TODO: Replace with actual authentication
    const userId = "sample-user-id"; // From session

    // Verify ownership
    const existing = await db
      .select()
      .from(simulations)
      .where(
        and(
          eq(simulations.id, params.id),
          eq(simulations.userId, userId)
        )
      )
      .limit(1);

    if (!existing || existing.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Simulation not found' },
        { status: 404 }
      );
    }

    let newStatus = existing[0].status;
    const now = new Date();

    if (action === 'pause') {
      newStatus = 'paused';
      // TODO: Pause simulation in service
      // await simulationService.pauseSimulation(params.id);
    } else if (action === 'resume') {
      newStatus = 'running';
      // TODO: Resume simulation in service
      // await simulationService.resumeSimulation(params.id);
    } else if (action === 'stop') {
      newStatus = 'stopped';
      // TODO: Stop simulation and collect output
      // const output = await simulationService.stopSimulation(params.id);

      const startTime = existing[0].startedAt;
      const durationSeconds = startTime
        ? Math.floor((now.getTime() - new Date(startTime).getTime()) / 1000)
        : 0;

      const updated = await db
        .update(simulations)
        .set({
          status: newStatus,
          stoppedAt: now,
          durationSeconds,
          // serialOutput: output.serialOutput,
        })
        .where(eq(simulations.id, params.id))
        .returning();

      return NextResponse.json({
        success: true,
        simulation: updated[0],
        message: 'Simulation stopped successfully',
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid action. Use: pause, resume, or stop' },
        { status: 400 }
      );
    }

    const updated = await db
      .update(simulations)
      .set({ status: newStatus })
      .where(eq(simulations.id, params.id))
      .returning();

    return NextResponse.json({
      success: true,
      simulation: updated[0],
      message: `Simulation ${action}d successfully`,
    });
  } catch (error: any) {
    console.error('Error updating simulation:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update simulation' },
      { status: 500 }
    );
  }
}

// DELETE /api/simulations/[id] - Delete simulation record
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Replace with actual authentication
    const userId = "sample-user-id"; // From session

    // Verify ownership
    const existing = await db
      .select()
      .from(simulations)
      .where(
        and(
          eq(simulations.id, params.id),
          eq(simulations.userId, userId)
        )
      )
      .limit(1);

    if (!existing || existing.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Simulation not found' },
        { status: 404 }
      );
    }

    if (existing[0].status === 'running') {
      return NextResponse.json(
        { success: false, error: 'Cannot delete a running simulation. Please stop it first.' },
        { status: 400 }
      );
    }

    await db
      .delete(simulations)
      .where(eq(simulations.id, params.id));

    return NextResponse.json({
      success: true,
      message: 'Simulation deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting simulation:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete simulation' },
      { status: 500 }
    );
  }
}
