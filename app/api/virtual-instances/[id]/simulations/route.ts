import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { simulations, virtualInstances } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";

// GET /api/virtual-instances/[id]/simulations - Get simulation history
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

    // Get all simulations for this instance
    const simulationHistory = await db
      .select()
      .from(simulations)
      .where(eq(simulations.instanceId, params.id))
      .orderBy(desc(simulations.createdAt));

    return NextResponse.json({
      success: true,
      simulations: simulationHistory,
    });
  } catch (error: any) {
    console.error('Error fetching simulations:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch simulations' },
      { status: 500 }
    );
  }
}

// POST /api/virtual-instances/[id]/simulations - Start a new simulation
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { firmwarePath, projectId, buildId } = body;

    // TODO: Replace with actual authentication
    const userId = "sample-user-id"; // From session

    // Verify instance ownership and that it's running
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

    if (instance[0].status !== 'running') {
      return NextResponse.json(
        { success: false, error: 'Instance must be running to start a simulation' },
        { status: 400 }
      );
    }

    // Create simulation record
    const newSimulation = await db.insert(simulations).values({
      userId,
      instanceId: params.id,
      projectId: projectId || null,
      buildId: buildId || null,
      firmwarePath,
      status: 'running',
      startedAt: new Date(),
    }).returning();

    // TODO: Actually start the simulation with the firmware
    // await simulationService.loadFirmware(params.id, firmwarePath);
    // await simulationService.startSimulation(newSimulation[0].id);

    return NextResponse.json({
      success: true,
      simulation: newSimulation[0],
      message: 'Simulation started successfully',
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error starting simulation:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to start simulation' },
      { status: 500 }
    );
  }
}
