import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { userSubscriptions, virtualProcessorTypes } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

// GET /api/subscriptions - Get user's subscriptions
export async function GET(request: NextRequest) {
  try {
    // TODO: Replace with actual authentication
    const userId = "sample-user-id"; // From session

    // const session = await auth();
    // if (!session) {
    //   return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    // }

    const subscriptions = await db
      .select({
        subscription: userSubscriptions,
        processorType: virtualProcessorTypes,
      })
      .from(userSubscriptions)
      .leftJoin(
        virtualProcessorTypes,
        eq(userSubscriptions.processorTypeId, virtualProcessorTypes.id)
      )
      .where(eq(userSubscriptions.userId, userId));

    return NextResponse.json({
      success: true,
      subscriptions: subscriptions.map(s => ({
        ...s.subscription,
        processorType: s.processorType,
      })),
    });
  } catch (error: any) {
    console.error('Error fetching subscriptions:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch subscriptions' },
      { status: 500 }
    );
  }
}

// POST /api/subscriptions - Create a new subscription
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { processorTypeId, billingInterval } = body;

    // TODO: Replace with actual authentication
    const userId = "sample-user-id"; // From session

    // const session = await auth();
    // if (!session) {
    //   return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    // }

    // Validate processor type exists
    const processorType = await db
      .select()
      .from(virtualProcessorTypes)
      .where(eq(virtualProcessorTypes.id, processorTypeId))
      .limit(1);

    if (!processorType || processorType.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Virtual processor type not found' },
        { status: 404 }
      );
    }

    // Check if user already has an active subscription for this processor
    const existingSubscription = await db
      .select()
      .from(userSubscriptions)
      .where(
        and(
          eq(userSubscriptions.userId, userId),
          eq(userSubscriptions.processorTypeId, processorTypeId),
          eq(userSubscriptions.status, 'active')
        )
      )
      .limit(1);

    if (existingSubscription && existingSubscription.length > 0) {
      return NextResponse.json(
        { success: false, error: 'You already have an active subscription for this processor' },
        { status: 400 }
      );
    }

    // Calculate subscription period
    const now = new Date();
    const periodEnd = new Date(now);
    if (billingInterval === 'yearly') {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    } else {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    }

    // Create subscription
    const newSubscription = await db.insert(userSubscriptions).values({
      userId,
      processorTypeId,
      billingInterval,
      status: 'active',
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
    }).returning();

    // TODO: Integrate with Stripe for payment processing
    // const stripeSubscription = await stripe.subscriptions.create({...});
    // Update with Stripe subscription ID

    return NextResponse.json({
      success: true,
      subscription: newSubscription[0],
      message: 'Subscription created successfully',
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating subscription:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create subscription' },
      { status: 500 }
    );
  }
}
