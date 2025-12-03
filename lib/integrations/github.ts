import { Octokit } from "@octokit/rest";

export class GitHubIntegration {
  private octokit: Octokit;

  constructor(accessToken: string) {
    this.octokit = new Octokit({ auth: accessToken });
  }

  /**
   * List repositories for authenticated user
   */
  async listRepositories() {
    const { data } = await this.octokit.repos.listForAuthenticatedUser({
      sort: 'updated',
      per_page: 100,
    });
    return data;
  }

  /**
   * Get repository details
   */
  async getRepository(owner: string, repo: string) {
    const { data } = await this.octokit.repos.get({ owner, repo });
    return data;
  }

  /**
   * Get file contents from repository
   */
  async getFileContents(owner: string, repo: string, path: string, ref?: string) {
    const { data } = await this.octokit.repos.getContent({
      owner,
      repo,
      path,
      ref,
    });

    if (Array.isArray(data)) {
      throw new Error('Path points to a directory, not a file');
    }

    if (data.type !== 'file') {
      throw new Error('Path does not point to a file');
    }

    // Decode base64 content
    const content = Buffer.from(data.content, 'base64').toString('utf-8');
    return {
      content,
      sha: data.sha,
      size: data.size,
      path: data.path,
    };
  }

  /**
   * Create or update file in repository
   */
  async createOrUpdateFile(
    owner: string,
    repo: string,
    path: string,
    content: string,
    message: string,
    sha?: string
  ) {
    const { data } = await this.octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path,
      message,
      content: Buffer.from(content).toString('base64'),
      sha, // Required for updates
    });
    return data;
  }

  /**
   * Create a webhook for CI/CD integration
   */
  async createWebhook(owner: string, repo: string, webhookUrl: string, secret: string) {
    const { data } = await this.octokit.repos.createWebhook({
      owner,
      repo,
      config: {
        url: webhookUrl,
        content_type: 'json',
        secret,
      },
      events: ['push', 'pull_request'],
      active: true,
    });
    return data;
  }

  /**
   * Create commit status (for CI/CD checks)
   */
  async createCommitStatus(
    owner: string,
    repo: string,
    sha: string,
    state: 'pending' | 'success' | 'failure' | 'error',
    targetUrl?: string,
    description?: string
  ) {
    const { data } = await this.octokit.repos.createCommitStatus({
      owner,
      repo,
      sha,
      state,
      target_url: targetUrl,
      description,
      context: 'Visucan Hardware Tests',
    });
    return data;
  }

  /**
   * Get pull request files
   */
  async getPullRequestFiles(owner: string, repo: string, pullNumber: number) {
    const { data } = await this.octokit.pulls.listFiles({
      owner,
      repo,
      pull_number: pullNumber,
    });
    return data;
  }

  /**
   * Create pull request comment
   */
  async createPullRequestComment(
    owner: string,
    repo: string,
    pullNumber: number,
    body: string
  ) {
    const { data } = await this.octokit.issues.createComment({
      owner,
      repo,
      issue_number: pullNumber,
      body,
    });
    return data;
  }
}

/**
 * GitLab Integration
 */
export class GitLabIntegration {
  private baseUrl: string;
  private accessToken: string;

  constructor(accessToken: string, baseUrl = 'https://gitlab.com/api/v4') {
    this.accessToken = accessToken;
    this.baseUrl = baseUrl;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'PRIVATE-TOKEN': this.accessToken,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`GitLab API error: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * List projects
   */
  async listProjects() {
    return this.request('/projects?membership=true&order_by=updated_at');
  }

  /**
   * Get project
   */
  async getProject(projectId: string) {
    return this.request(`/projects/${encodeURIComponent(projectId)}`);
  }

  /**
   * Get file contents
   */
  async getFileContents(projectId: string, filePath: string, ref = 'main') {
    const encoded = encodeURIComponent(filePath);
    const data = await this.request(
      `/projects/${encodeURIComponent(projectId)}/repository/files/${encoded}?ref=${ref}`
    );

    return {
      content: Buffer.from(data.content, 'base64').toString('utf-8'),
      sha: data.blob_id,
      size: data.size,
      path: filePath,
    };
  }

  /**
   * Create or update file
   */
  async createOrUpdateFile(
    projectId: string,
    filePath: string,
    content: string,
    commitMessage: string,
    branch = 'main'
  ) {
    const encoded = encodeURIComponent(filePath);

    return this.request(
      `/projects/${encodeURIComponent(projectId)}/repository/files/${encoded}`,
      {
        method: 'PUT',
        body: JSON.stringify({
          branch,
          content,
          commit_message: commitMessage,
        }),
      }
    );
  }

  /**
   * Create commit status
   */
  async createCommitStatus(
    projectId: string,
    sha: string,
    state: 'pending' | 'running' | 'success' | 'failed' | 'canceled',
    targetUrl?: string,
    description?: string
  ) {
    return this.request(
      `/projects/${encodeURIComponent(projectId)}/statuses/${sha}`,
      {
        method: 'POST',
        body: JSON.stringify({
          state,
          target_url: targetUrl,
          description,
          name: 'Visucan Hardware Tests',
        }),
      }
    );
  }

  /**
   * Create merge request comment
   */
  async createMergeRequestComment(
    projectId: string,
    mergeRequestIid: number,
    body: string
  ) {
    return this.request(
      `/projects/${encodeURIComponent(projectId)}/merge_requests/${mergeRequestIid}/notes`,
      {
        method: 'POST',
        body: JSON.stringify({ body }),
      }
    );
  }
}
