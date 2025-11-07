import { auth } from "@/lib/auth/config";
import { NextResponse } from "next/server";

export async function requireAuth() {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  return { session, user: session.user };
}

export async function requireAdmin() {
  const result = await requireAuth();

  if ('user' in result) {
    // @ts-ignore
    if (result.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }
    return result;
  }

  return result;
}
