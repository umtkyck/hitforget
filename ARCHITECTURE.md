# HitForget - System Architecture

## Technology Stack (Vercel-Optimized)

### Frontend & Web Application
- **Framework**: Next.js 14+ (App Router)
- **Deployment**: Vercel
- **UI Library**: shadcn/ui + Tailwind CSS
- **State Management**: Zustand + React Query
- **Real-time**: Pusher / Ably (Vercel-compatible WebSocket)
- **Video Streaming**: WebRTC + LiveKit
- **Charts**: Recharts / visx
- **Terminal**: Xterm.js

### Backend Services
- **API**: Next.js API Routes (Edge Functions)
- **Device Services**: Node.js microservices (separate deployment)
- **Database**: Vercel Postgres / Supabase
- **Cache**: Vercel KV (Redis)
- **File Storage**: Vercel Blob / AWS S3
- **Queue**: Inngest (Vercel-compatible) / BullMQ

### Infrastructure
- **Hosting**: Vercel (Frontend + API)
- **Device Backend**: Railway / Fly.io (long-running services)
- **Containers**: Docker
- **Orchestration**: Kubernetes (for device racks)
- **VPN**: WireGuard
- **Monitoring**: Vercel Analytics + Sentry

### Database Schema
- **Primary**: PostgreSQL (relational data)
- **Cache**: Redis (sessions, device states)
- **Time-series**: TimescaleDB (metrics)
- **Blob**: S3-compatible (firmware, videos)

### AI Integration
- **OpenAI**: GPT-4 Turbo (code generation)
- **Anthropic**: Claude 3 Opus (reasoning)
- **Vercel AI SDK**: Unified AI interface
- **LangChain**: Agent orchestration

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Internet                                 │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     │ HTTPS
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Vercel Edge Network                           │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │           Next.js Application (App Router)                 │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐  │ │
│  │  │  Dashboard   │  │ Device Canvas│  │  Test Editor    │  │ │
│  │  │    Pages     │  │    Pages     │  │     Pages       │  │ │
│  │  └──────────────┘  └──────────────┘  └─────────────────┘  │ │
│  └────────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              API Routes (Edge Functions)                   │ │
│  │  /api/devices | /api/builds | /api/tests | /api/ai       │ │
│  └────────────────────────────────────────────────────────────┘ │
└──────────────────────┬──────────────────────────────────────────┘
                       │
       ┌───────────────┼───────────────┐
       │               │               │
       ▼               ▼               ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│   Vercel    │ │   Vercel    │ │   Vercel    │
│  Postgres   │ │     KV      │ │    Blob     │
│  (Database) │ │   (Redis)   │ │  (Storage)  │
└─────────────┘ └─────────────┘ └─────────────┘
       │
       │ Private Network (VPN/VPC)
       ▼
┌─────────────────────────────────────────────────────────────────┐
│              Device Backend (Railway/Fly.io)                     │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────────┐  │
│  │ Device Manager │  │ Build Service  │  │  AI Orchestrator │  │
│  │  (Node.js)     │  │  (Containers)  │  │   (LangChain)    │  │
│  └────────┬───────┘  └────────┬───────┘  └────────┬─────────┘  │
│           │                   │                    │             │
│           └───────────────────┼────────────────────┘             │
│                               │                                  │
│  ┌────────────────────────────▼──────────────────────────────┐  │
│  │              Message Queue (Inngest/BullMQ)               │  │
│  └────────────────────────────┬──────────────────────────────┘  │
└─────────────────────────────┬─┴──────────────────────────────────┘
                              │
                              │ Device Control Network
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                 Hardware Infrastructure                          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                Device Rack Controllers                    │  │
│  │  (Raspberry Pi 4 running device agents)                  │  │
│  │                                                            │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │  │
│  │  │  Agent 1 │  │  Agent 2 │  │  Agent N │  │  Camera  │ │  │
│  │  │ (Serial) │  │  (JTAG)  │  │  (GPIO)  │  │  Agent   │ │  │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘ │  │
│  └───────┼─────────────┼─────────────┼─────────────┼────────┘  │
│          │             │             │             │            │
│  ┌───────▼─────────────▼─────────────▼─────────────▼────────┐  │
│  │             USB Hub + Programmers + PDU                   │  │
│  └───────┬─────────────┬─────────────┬─────────────┬────────┘  │
│          │             │             │             │            │
│  ┌───────▼─────┐ ┌─────▼─────┐ ┌─────▼─────┐ ┌────▼──────┐   │
│  │ Raspberry Pi│ │  Arduino  │ │   STM32   │ │   FPGA    │   │
│  │  (slot 1)   │ │ (slot 2)  │ │ (slot 3)  │ │ (slot 4)  │   │
│  └─────────────┘ └───────────┘ └───────────┘ └───────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## Database Schema

### PostgreSQL Tables

```sql
-- Users & Authentication
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  key_hash VARCHAR(255) NOT NULL,
  last_used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- AI Provider Keys (encrypted)
CREATE TABLE ai_provider_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL, -- 'openai', 'anthropic', 'github'
  encrypted_key TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Projects
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  repository_url TEXT,
  hardware_type VARCHAR(100), -- 'raspberry_pi', 'arduino', 'stm32', 'fpga'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Devices (Hardware Inventory)
CREATE TABLE devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_type VARCHAR(100) NOT NULL, -- 'raspberry_pi_4', 'arduino_uno', etc.
  slot_number INTEGER NOT NULL,
  rack_id VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'available', -- 'available', 'in_use', 'maintenance', 'failed'
  current_session_id UUID,
  health_status JSONB, -- {temperature, voltage, last_check}
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(rack_id, slot_number)
);

-- Device Sessions (Reservations)
CREATE TABLE device_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  device_id UUID REFERENCES devices(id) ON DELETE SET NULL,
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'completed', 'failed'
  started_at TIMESTAMP DEFAULT NOW(),
  ended_at TIMESTAMP,
  duration_seconds INTEGER,
  cost_usd DECIMAL(10, 2)
);

-- Builds
CREATE TABLE builds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  build_number SERIAL,
  git_commit_sha VARCHAR(40),
  status VARCHAR(50) DEFAULT 'queued', -- 'queued', 'building', 'success', 'failed'
  toolchain_version VARCHAR(100),
  build_log_url TEXT,
  artifacts_url TEXT,
  sbom_url TEXT,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Test Runs
CREATE TABLE test_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  build_id UUID REFERENCES builds(id) ON DELETE CASCADE,
  device_session_id UUID REFERENCES device_sessions(id) ON DELETE SET NULL,
  test_type VARCHAR(50), -- 'unit', 'integration', 'hardware', 'visual'
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'running', 'passed', 'failed'
  test_results JSONB, -- {passed: 10, failed: 2, skipped: 1}
  video_url TEXT,
  log_url TEXT,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- AI Agent Executions
CREATE TABLE ai_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  agent_type VARCHAR(50), -- 'code_generator', 'test_generator', 'error_analyzer'
  prompt TEXT,
  model VARCHAR(100), -- 'gpt-4', 'claude-3-opus'
  tokens_used INTEGER,
  cost_usd DECIMAL(10, 4),
  response TEXT,
  status VARCHAR(50) DEFAULT 'completed',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Usage Metrics (Time-series data)
CREATE TABLE usage_metrics (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  metric_type VARCHAR(50), -- 'device_time', 'test_run', 'ai_tokens', 'storage_gb'
  metric_value DECIMAL(10, 2),
  metadata JSONB,
  timestamp TIMESTAMP DEFAULT NOW()
);

-- Invoices
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  billing_period_start DATE NOT NULL,
  billing_period_end DATE NOT NULL,
  device_charges_usd DECIMAL(10, 2) DEFAULT 0,
  ai_charges_usd DECIMAL(10, 2) DEFAULT 0,
  storage_charges_usd DECIMAL(10, 2) DEFAULT 0,
  total_usd DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'paid', 'overdue'
  paid_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_builds_project_id ON builds(project_id);
CREATE INDEX idx_devices_status ON devices(status);
CREATE INDEX idx_device_sessions_user_id ON device_sessions(user_id);
CREATE INDEX idx_test_runs_build_id ON test_runs(build_id);
CREATE INDEX idx_usage_metrics_timestamp ON usage_metrics(timestamp);
CREATE INDEX idx_ai_executions_user_id ON ai_executions(user_id);
```

### Redis Cache Structure

```
# Device state cache (expire: 60s)
device:{device_id}:state = {status, temperature, voltage, last_heartbeat}

# Session cache (expire: 3600s)
session:{session_id} = {user_id, device_id, started_at}

# Build queue
queue:builds = [build_id_1, build_id_2, ...]

# Active connections (WebSocket)
connections:user:{user_id} = [connection_id_1, connection_id_2]

# Rate limiting (expire: 60s)
ratelimit:api:{user_id}:{endpoint} = count

# AI token usage (expire: 2592000s = 30 days)
usage:ai:{user_id}:{month} = total_tokens
```

## API Architecture

### Next.js API Routes

```
app/
├── api/
│   ├── auth/
│   │   ├── [...nextauth]/route.ts      # NextAuth.js
│   │   └── session/route.ts            # Session management
│   ├── users/
│   │   ├── route.ts                    # GET /api/users (list)
│   │   ├── [id]/route.ts               # GET/PUT/DELETE /api/users/:id
│   │   └── [id]/api-keys/route.ts      # Manage API keys
│   ├── projects/
│   │   ├── route.ts                    # GET/POST /api/projects
│   │   ├── [id]/route.ts               # GET/PUT/DELETE /api/projects/:id
│   │   ├── [id]/builds/route.ts        # POST /api/projects/:id/builds
│   │   └── [id]/prompt/route.ts        # POST /api/projects/:id/prompt (AI)
│   ├── devices/
│   │   ├── route.ts                    # GET /api/devices (available)
│   │   ├── [id]/route.ts               # GET /api/devices/:id
│   │   ├── [id]/reserve/route.ts       # POST /api/devices/:id/reserve
│   │   ├── [id]/release/route.ts       # POST /api/devices/:id/release
│   │   ├── [id]/console/route.ts       # GET /api/devices/:id/console (SSE)
│   │   └── [id]/camera/route.ts        # GET /api/devices/:id/camera (stream)
│   ├── builds/
│   │   ├── route.ts                    # GET /api/builds
│   │   ├── [id]/route.ts               # GET /api/builds/:id
│   │   ├── [id]/flash/route.ts         # POST /api/builds/:id/flash
│   │   ├── [id]/logs/route.ts          # GET /api/builds/:id/logs
│   │   └── [id]/artifacts/route.ts     # GET /api/builds/:id/artifacts
│   ├── tests/
│   │   ├── route.ts                    # POST /api/tests (run test)
│   │   ├── [id]/route.ts               # GET /api/tests/:id
│   │   ├── [id]/results/route.ts       # GET /api/tests/:id/results
│   │   └── [id]/video/route.ts         # GET /api/tests/:id/video
│   ├── ai/
│   │   ├── generate-code/route.ts      # POST /api/ai/generate-code
│   │   ├── generate-tests/route.ts     # POST /api/ai/generate-tests
│   │   ├── analyze-error/route.ts      # POST /api/ai/analyze-error
│   │   └── chat/route.ts               # POST /api/ai/chat (streaming)
│   └── webhooks/
│       ├── github/route.ts             # POST /api/webhooks/github
│       └── stripe/route.ts             # POST /api/webhooks/stripe
```

### WebSocket/Real-time Architecture (Pusher/Ably)

```typescript
// Client subscribes to channels
const channel = pusher.subscribe('device.{device_id}');

// Events from device
channel.bind('console.output', (data) => {
  // Serial console output
});

channel.bind('camera.frame', (data) => {
  // Camera frame update
});

channel.bind('status.change', (data) => {
  // Device status change
});

// Build progress channel
const buildChannel = pusher.subscribe('build.{build_id}');
buildChannel.bind('progress', (data) => {
  // Build progress update (0-100%)
});
```

## Device Backend Architecture

### Microservices

#### 1. Device Manager Service
```
Responsibilities:
  - Device inventory management
  - Health monitoring
  - Session allocation
  - Power control (PDU)

Tech Stack:
  - Node.js / Express
  - PostgreSQL connection
  - Redis for caching
  - MQTT for device communication
```

#### 2. Build Service
```
Responsibilities:
  - Container orchestration (Docker)
  - Compilation (ARM GCC, PlatformIO)
  - Artifact storage
  - SBOM generation

Tech Stack:
  - Node.js / Python
  - Docker API
  - S3 for artifact storage
  - BullMQ for job queue
```

#### 3. Flash Service
```
Responsibilities:
  - Firmware flashing (OpenOCD, avrdude)
  - Programmer management (ST-Link, J-Link)
  - Verification

Tech Stack:
  - Node.js with child_process
  - USB device access
  - Serial port communication
```

#### 4. Test Runner Service
```
Responsibilities:
  - Test orchestration
  - Video recording
  - Visual analysis (AI)
  - Result aggregation

Tech Stack:
  - Node.js / Python
  - OpenCV (video processing)
  - TensorFlow/PyTorch (AI models)
  - FFmpeg (video encoding)
```

#### 5. AI Orchestrator Service
```
Responsibilities:
  - Multi-agent coordination
  - Prompt management
  - Token usage tracking
  - Retry logic

Tech Stack:
  - Node.js / Python
  - LangChain
  - OpenAI SDK
  - Anthropic SDK
```

### Device Agent Architecture

Each device rack has a controller (Raspberry Pi 4) running multiple agents:

```
Rack Controller (Raspberry Pi 4)
├── Serial Agent (Node.js)
│   ├── Manages serial connections (/dev/ttyUSB*)
│   ├── WebSocket proxy to cloud
│   └── Log buffering
├── Debug Agent (Python)
│   ├── OpenOCD/pyOCD wrapper
│   ├── GDB server tunneling
│   └── SWD/JTAG control
├── GPIO Agent (Node.js)
│   ├── Pin control (relay, reset)
│   ├── Logic analyzer mode
│   └── PWM generation
├── Camera Agent (Python)
│   ├── Video capture (OpenCV)
│   ├── H.264 encoding
│   ├── WebRTC streaming
│   └── Snapshot capture
└── Health Monitor (Node.js)
    ├── Temperature sensors
    ├── Power monitoring
    ├── Heartbeat to cloud
    └── Auto-recovery
```

## Deployment Architecture

### Vercel Deployment

```yaml
# vercel.json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"],  # US East (primary)
  "env": {
    "DATABASE_URL": "@database-url",
    "KV_URL": "@kv-url",
    "BLOB_READ_WRITE_TOKEN": "@blob-token",
    "OPENAI_API_KEY": "@openai-key",
    "ANTHROPIC_API_KEY": "@anthropic-key",
    "PUSHER_APP_ID": "@pusher-app-id",
    "PUSHER_KEY": "@pusher-key",
    "PUSHER_SECRET": "@pusher-secret"
  },
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  }
}
```

### Device Backend Deployment (Railway)

```yaml
# railway.toml
[build]
builder = "DOCKERFILE"
dockerfilePath = "Dockerfile.device-backend"

[deploy]
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10

[[services]]
name = "device-manager"
type = "web"
port = 3001

[[services]]
name = "build-service"
type = "worker"
command = "node services/build-service/index.js"

[[services]]
name = "test-runner"
type = "worker"
command = "node services/test-runner/index.js"

[[services]]
name = "ai-orchestrator"
type = "worker"
command = "node services/ai-orchestrator/index.js"
```

### Kubernetes for Device Racks

```yaml
# k8s/device-agents.yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: device-agent
spec:
  selector:
    matchLabels:
      app: device-agent
  template:
    metadata:
      labels:
        app: device-agent
    spec:
      hostNetwork: true  # Access to USB devices
      containers:
      - name: serial-agent
        image: hitforget/serial-agent:latest
        securityContext:
          privileged: true  # USB access
        volumeMounts:
        - name: usb-devices
          mountPath: /dev
      - name: camera-agent
        image: hitforget/camera-agent:latest
        resources:
          limits:
            memory: "512Mi"
            cpu: "500m"
      volumes:
      - name: usb-devices
        hostPath:
          path: /dev
```

## Security Architecture

### Authentication & Authorization

```
┌─────────────────────────────────────────────────┐
│          NextAuth.js (OAuth 2.0)                │
├─────────────────────────────────────────────────┤
│  Providers:                                     │
│  - Google OAuth                                 │
│  - GitHub OAuth                                 │
│  - Email Magic Link                             │
├─────────────────────────────────────────────────┤
│  JWT Token (httpOnly cookie)                    │
│  - user_id                                      │
│  - email                                        │
│  - roles: ['user', 'admin']                     │
│  - expires_at                                   │
└─────────────────────────────────────────────────┘
         │
         v
┌─────────────────────────────────────────────────┐
│         RBAC (Role-Based Access Control)        │
├─────────────────────────────────────────────────┤
│  Roles:                                         │
│  - user: basic access                           │
│  - premium: more resources                      │
│  - admin: full access                           │
│  - support: read-only                           │
└─────────────────────────────────────────────────┘
```

### Encryption Strategy

```
┌─────────────────────────────────────────────────┐
│              Data at Rest                       │
├─────────────────────────────────────────────────┤
│  - Database: AES-256 (transparent encryption)   │
│  - Blob Storage: Server-side encryption         │
│  - Secrets: Vercel Environment Variables        │
│  - AI Keys: AES-256 with per-user keys          │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│              Data in Transit                    │
├─────────────────────────────────────────────────┤
│  - HTTPS: TLS 1.3 (Vercel automatic)            │
│  - WebSocket: WSS (TLS)                         │
│  - Device VPN: WireGuard                        │
│  - Internal: mTLS (service-to-service)          │
└─────────────────────────────────────────────────┘
```

### Network Isolation

```
Internet
   │
   └─► Vercel Edge (HTTPS only)
          │
          ├─► Next.js App (public)
          │
          └─► API Routes
                 │
                 └─► VPN/VPC Peering
                        │
                        └─► Device Backend (private network)
                               │
                               └─► Device Racks (isolated VLANs)
```

## Monitoring & Observability

### Logging Stack
```
Application Logs → Vercel Logs → Datadog/Axiom
Device Logs → Fluentd → Elasticsearch → Kibana
Build Logs → S3 → Athena (queryable)
```

### Metrics
```
- Vercel Analytics (frontend performance)
- Prometheus (device metrics)
- Grafana (visualization)
- Custom dashboards (device utilization, build times)
```

### Alerting
```
- PagerDuty (critical infrastructure)
- Slack (team notifications)
- Email (user notifications)
```

### Tracing
```
- OpenTelemetry (distributed tracing)
- Sentry (error tracking)
- LogRocket (session replay)
```

## Scalability Strategy

### Horizontal Scaling
- **Frontend**: Vercel auto-scales globally
- **API**: Vercel Edge Functions (auto-scale)
- **Device Backend**: Kubernetes HPA (Horizontal Pod Autoscaler)
- **Database**: Read replicas, connection pooling (PgBouncer)

### Vertical Scaling
- **Device Racks**: Add more slots per rack
- **Build Workers**: Larger instances for faster builds

### Geographic Scaling
- **Phase 1**: Single region (US East)
- **Phase 2**: Multi-region (US, EU)
- **Phase 3**: Global (APAC)

## Disaster Recovery

### Backup Strategy
```
- Database: Daily snapshots (retained 30 days)
- Blob Storage: Versioning enabled
- Configuration: Git-based (Infrastructure as Code)
```

### Recovery Objectives
- **RTO (Recovery Time Objective)**: 1 hour
- **RPO (Recovery Point Objective)**: 5 minutes

### Failover Plan
```
1. Primary database fails → Promote read replica
2. Device rack fails → Redirect to backup rack
3. Vercel outage → Cloudflare Pages backup (static site)
```

## Cost Optimization

### Vercel Costs
- **Bandwidth**: Optimize images, CDN caching
- **Function Execution**: Use Edge Functions where possible
- **Database**: Connection pooling, query optimization

### Infrastructure Costs
- **Device Backend**: Spot instances for non-critical workloads
- **Storage**: Lifecycle policies (archive old builds)
- **AI**: Cache frequent responses, optimize prompts

### Monitoring
- Cost alerts at 80%, 90%, 100% of budget
- Per-customer cost attribution
- Monthly cost review and optimization

---

**Architecture Version**: 1.0.0
**Last Updated**: 2025-11-07
**Status**: Design Phase
