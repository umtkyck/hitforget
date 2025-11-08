import { NextRequest, NextResponse } from 'next/server';
import { db, favorites } from '@/lib/db';
import { requireAuth } from '@/lib/auth/middleware';
import { eq, and } from 'drizzle-orm';

// GET /api/favorites - Get user's favorites
export async function GET(request: NextRequest) {
  const authResult = await requireAuth();
  if ('status' in authResult) return authResult;

  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type'); // 'provider' or 'user'

    let query = db.select()
      .from(favorites)
      .where(eq(favorites.userId, authResult.user.id as string));

    if (type) {
      query = query.where(eq(favorites.favoriteType, type));
    }

    const userFavorites = await query;

    return NextResponse.json({
      success: true,
      favorites: userFavorites,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/favorites - Add to favorites
export async function POST(request: NextRequest) {
  const authResult = await requireAuth();
  if ('status' in authResult) return authResult;

  try {
    const body = await request.json();
    const { favoriteType, favoriteProviderId, favoriteUserId } = body;

    if (!favoriteType || (!favoriteProviderId && !favoriteUserId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid request' },
        { status: 400 }
      );
    }

    // Check if already favorited
    const existing = await db.select()
      .from(favorites)
      .where(
        and(
          eq(favorites.userId, authResult.user.id as string),
          favoriteProviderId
            ? eq(favorites.favoriteProviderId, favoriteProviderId)
            : eq(favorites.favoriteUserId, favoriteUserId)
        )
      );

    if (existing.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Already in favorites' },
        { status: 400 }
      );
    }

    const newFavorite = await db.insert(favorites).values({
      userId: authResult.user.id as string,
      favoriteType,
      favoriteProviderId,
      favoriteUserId,
    }).returning();

    return NextResponse.json({
      success: true,
      favorite: newFavorite[0],
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/favorites/:id - Remove from favorites
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAuth();
  if ('status' in authResult) return authResult;

  try {
    // Verify ownership
    const favorite = await db.select()
      .from(favorites)
      .where(eq(favorites.id, params.id))
      .limit(1);

    if (favorite.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Favorite not found' },
        { status: 404 }
      );
    }

    if (favorite[0].userId !== authResult.user.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    await db.delete(favorites).where(eq(favorites.id, params.id));

    return NextResponse.json({
      success: true,
      message: 'Removed from favorites',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
