import { NextRequest, NextResponse } from 'next/server';
import { db, projects } from '@/lib/db';
import { eq } from 'drizzle-orm';

// GET /api/projects - List all projects for the authenticated user
export async function GET(request: NextRequest) {
  try {
    // TODO: Get user ID from session
    const userId = 'temp-user-id'; // Replace with actual auth

    const userProjects = await db.select()
      .from(projects)
      .where(eq(projects.userId, userId))
      .orderBy(projects.createdAt);

    return NextResponse.json({
      success: true,
      projects: userProjects,
      count: userProjects.length,
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

// POST /api/projects - Create a new project
export async function POST(request: NextRequest) {
  try {
    // TODO: Get user ID from session
    const userId = 'temp-user-id'; // Replace with actual auth

    const body = await request.json();
    const { name, description, hardwareType, repositoryUrl } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Project name is required' },
        { status: 400 }
      );
    }

    const newProject = await db.insert(projects).values({
      userId,
      name,
      description: description || null,
      hardwareType: hardwareType || null,
      repositoryUrl: repositoryUrl || null,
    }).returning();

    return NextResponse.json({
      success: true,
      project: newProject[0],
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create project' },
      { status: 500 }
    );
  }
}
