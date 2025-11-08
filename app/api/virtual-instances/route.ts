import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { virtualInstances, userSubscriptions, virtualProcessorTypes } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

// GET /api/virtual-instances - Get user's virtual instances
export async function GET(request: NextRequest) {
  try {
    // TODO: Replace with actual authentication
    const userId = "sample-user-id"; // From session

    // const session = await auth();
    // if (!session) {
    //   return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    // }

    const instances = await db
      .select({
        instance: virtualInstances,
        processorType: virtualProcessorTypes,
      })
      .from(virtualInstances)
      .leftJoin(
        virtualProcessorTypes,
        eq(virtualInstances.processorTypeId, virtualProcessorTypes.id)
      )
      .where(eq(virtualInstances.userId, userId));

    return NextResponse.json({
      success: true,
      instances: instances.map(i => ({
        ...i.instance,
        processorType: i.processorType,
      })),
    });
  } catch (error: any) {
    console.error('Error fetching virtual instances:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch virtual instances' },
      { status: 500 }
    );
  }
}

// POST /api/virtual-instances - Create a new virtual instance
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { subscriptionId, name, description, configuration } = body;

    // TODO: Replace with actual authentication
    const userId = "sample-user-id"; // From session

    // const session = await auth();
    // if (!session) {
    //   return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    // }

    // Verify subscription belongs to user and is active
    const subscription = await db
      .select()
      .from(userSubscriptions)
      .where(
        and(
          eq(userSubscriptions.id, subscriptionId),
          eq(userSubscriptions.userId, userId),
          eq(userSubscriptions.status, 'active')
        )
      )
      .limit(1);

    if (!subscription || subscription.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Valid subscription not found' },
        { status: 404 }
      );
    }

    const processorTypeId = subscription[0].processorTypeId;
    if (!processorTypeId) {
      return NextResponse.json(
        { success: false, error: 'Subscription has no processor type' },
        { status: 400 }
      );
    }

    // Check subscription limits (max instances)
    const existingInstances = await db
      .select()
      .from(virtualInstances)
      .where(
        and(
          eq(virtualInstances.userId, userId),
          eq(virtualInstances.subscriptionId, subscriptionId)
        )
      );

    // TODO: Check against subscription plan limits
    // if (existingInstances.length >= subscription[0].plan.maxVirtualInstances) {
    //   return NextResponse.json({ error: 'Subscription instance limit reached' }, { status: 400 });
    // }

    // Create virtual instance
    const newInstance = await db.insert(virtualInstances).values({
      userId,
      subscriptionId,
      processorTypeId,
      name,
      description,
      status: 'stopped',
      configuration: configuration || {},
      pinAssignments: {},
      totalRuntimeHours: '0',
    }).returning();

    return NextResponse.json({
      success: true,
      instance: newInstance[0],
      message: 'Virtual instance created successfully',
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating virtual instance:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create virtual instance' },
      { status: 500 }
    );
  }
}
