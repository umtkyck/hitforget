import { NextRequest, NextResponse } from 'next/server';
import { GitHubIntegration } from '@/lib/integrations/github';
import { requireAuth } from '@/lib/auth/middleware';

// GET /api/integrations/github/repos
export async function GET(request: NextRequest) {
  const authResult = await requireAuth();
  if ('status' in authResult) return authResult;

  const { searchParams } = request.nextUrl;
  const accessToken = searchParams.get('token');

  if (!accessToken) {
    return NextResponse.json(
      { success: false, error: 'GitHub access token required' },
      { status: 400 }
    );
  }

  try {
    const github = new GitHubIntegration(accessToken);
    const repos = await github.listRepositories();

    return NextResponse.json({
      success: true,
      repositories: repos.map((repo) => ({
        id: repo.id,
        name: repo.name,
        fullName: repo.full_name,
        private: repo.private,
        url: repo.html_url,
        defaultBranch: repo.default_branch,
        updatedAt: repo.updated_at,
      })),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/integrations/github/webhook
// Handle GitHub webhook events
export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('x-hub-signature-256');
    const event = request.headers.get('x-github-event');
    const body = await request.json();

    // TODO: Verify webhook signature

    if (event === 'push') {
      // Handle push event - trigger build
      const { repository, ref, commits } = body;

      console.log(`Push to ${repository.full_name} on ${ref}`);
      console.log(`Commits:`, commits.length);

      // TODO: Trigger build for this project
      // - Find project by repository URL
      // - Queue build job
      // - Update commit status

      return NextResponse.json({
        success: true,
        message: 'Push event received',
      });
    }

    if (event === 'pull_request') {
      // Handle PR event - run tests
      const { action, pull_request, repository } = body;

      console.log(`PR ${action}: ${pull_request.title}`);

      // TODO: Trigger hardware tests for PR
      // - Queue test job
      // - Post comment with test results
      // - Update PR status

      return NextResponse.json({
        success: true,
        message: 'Pull request event received',
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Event received but not handled',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
