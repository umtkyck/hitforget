import { pgTable, uuid, varchar, text, timestamp, integer, decimal, jsonb, serial, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users & Authentication
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  name: varchar('name', { length: 255 }),
  avatarUrl: text('avatar_url'),
  role: varchar('role', { length: 50 }).default('user'), // 'user', 'premium', 'admin'
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const apiKeys = pgTable('api_keys', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  keyHash: varchar('key_hash', { length: 255 }).notNull(),
  lastUsedAt: timestamp('last_used_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const aiProviderKeys = pgTable('ai_provider_keys', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  provider: varchar('provider', { length: 50 }).notNull(), // 'openai', 'anthropic', 'github'
  encryptedKey: text('encrypted_key').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Projects
export const projects = pgTable('projects', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  repositoryUrl: text('repository_url'),
  hardwareType: varchar('hardware_type', { length: 100 }), // 'raspberry_pi', 'arduino', 'stm32', 'fpga'
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Hardware Providers (Users who share their devices)
export const hardwareProviders = pgTable('hardware_providers', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull().unique(),
  businessName: varchar('business_name', { length: 255 }),
  description: text('description'),
  website: text('website'),
  location: varchar('location', { length: 255 }),
  isVerified: boolean('is_verified').default(false),
  rating: decimal('rating', { precision: 3, scale: 2 }).default('0'), // 0.00 - 5.00
  totalReviews: integer('total_reviews').default(0),
  totalDevices: integer('total_devices').default(0),
  totalBookings: integer('total_bookings').default(0),
  revenueSharePercentage: integer('revenue_share_percentage').default(70), // Provider gets 70%, platform gets 30%
  status: varchar('status', { length: 50 }).default('pending'), // 'pending', 'active', 'suspended'
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Devices (Hardware Inventory)
export const devices = pgTable('devices', {
  id: uuid('id').primaryKey().defaultRandom(),
  providerId: uuid('provider_id').references(() => hardwareProviders.id, { onDelete: 'cascade' }), // null = platform owned
  deviceType: varchar('device_type', { length: 100 }).notNull(), // 'raspberry_pi_4', 'arduino_uno', etc.
  deviceName: varchar('device_name', { length: 255 }).notNull(), // Custom name by provider
  description: text('description'),
  imageUrl: text('image_url'),
  slotNumber: integer('slot_number').notNull(),
  rackId: varchar('rack_id', { length: 50 }).notNull(),
  status: varchar('status', { length: 50 }).default('available'), // 'available', 'in_use', 'maintenance', 'failed'
  isPublic: boolean('is_public').default(true), // Public in marketplace
  hourlyRateUsd: decimal('hourly_rate_usd', { precision: 10, scale: 2 }).default('1.00'),
  currentSessionId: uuid('current_session_id'),
  healthStatus: jsonb('health_status'), // {temperature, voltage, last_check}
  specifications: jsonb('specifications'), // {cpu, ram, storage, etc.}
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Device Sessions (Reservations)
export const deviceSessions = pgTable('device_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  projectId: uuid('project_id').references(() => projects.id, { onDelete: 'cascade' }).notNull(),
  deviceId: uuid('device_id').references(() => devices.id, { onDelete: 'set null' }),
  status: varchar('status', { length: 50 }).default('active'), // 'active', 'completed', 'failed'
  startedAt: timestamp('started_at').defaultNow(),
  endedAt: timestamp('ended_at'),
  durationSeconds: integer('duration_seconds'),
  costUsd: decimal('cost_usd', { precision: 10, scale: 2 }),
});

// Builds
export const builds = pgTable('builds', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').references(() => projects.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  buildNumber: serial('build_number'),
  gitCommitSha: varchar('git_commit_sha', { length: 40 }),
  status: varchar('status', { length: 50 }).default('queued'), // 'queued', 'building', 'success', 'failed'
  toolchainVersion: varchar('toolchain_version', { length: 100 }),
  buildLogUrl: text('build_log_url'),
  artifactsUrl: text('artifacts_url'),
  sbomUrl: text('sbom_url'),
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Test Runs
export const testRuns = pgTable('test_runs', {
  id: uuid('id').primaryKey().defaultRandom(),
  buildId: uuid('build_id').references(() => builds.id, { onDelete: 'cascade' }).notNull(),
  deviceSessionId: uuid('device_session_id').references(() => deviceSessions.id, { onDelete: 'set null' }),
  testType: varchar('test_type', { length: 50 }), // 'unit', 'integration', 'hardware', 'visual'
  status: varchar('status', { length: 50 }).default('pending'), // 'pending', 'running', 'passed', 'failed'
  testResults: jsonb('test_results'), // {passed: 10, failed: 2, skipped: 1}
  videoUrl: text('video_url'),
  logUrl: text('log_url'),
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

// AI Agent Executions
export const aiExecutions = pgTable('ai_executions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  projectId: uuid('project_id').references(() => projects.id, { onDelete: 'cascade' }),
  agentType: varchar('agent_type', { length: 50 }), // 'code_generator', 'test_generator', 'error_analyzer'
  prompt: text('prompt'),
  model: varchar('model', { length: 100 }), // 'gpt-4', 'claude-3-opus'
  tokensUsed: integer('tokens_used'),
  costUsd: decimal('cost_usd', { precision: 10, scale: 4 }),
  response: text('response'),
  status: varchar('status', { length: 50 }).default('completed'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Usage Metrics
export const usageMetrics = pgTable('usage_metrics', {
  id: serial('id').primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  metricType: varchar('metric_type', { length: 50 }), // 'device_time', 'test_run', 'ai_tokens', 'storage_gb'
  metricValue: decimal('metric_value', { precision: 10, scale: 2 }),
  metadata: jsonb('metadata'),
  timestamp: timestamp('timestamp').defaultNow(),
});

// Invoices
export const invoices = pgTable('invoices', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  billingPeriodStart: timestamp('billing_period_start').notNull(),
  billingPeriodEnd: timestamp('billing_period_end').notNull(),
  deviceChargesUsd: decimal('device_charges_usd', { precision: 10, scale: 2 }).default('0'),
  aiChargesUsd: decimal('ai_charges_usd', { precision: 10, scale: 2 }).default('0'),
  storageChargesUsd: decimal('storage_charges_usd', { precision: 10, scale: 2 }).default('0'),
  totalUsd: decimal('total_usd', { precision: 10, scale: 2 }).notNull(),
  status: varchar('status', { length: 50 }).default('pending'), // 'pending', 'paid', 'overdue'
  paidAt: timestamp('paid_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Favorites (Users can favorite providers or other users)
export const favorites = pgTable('favorites', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  favoriteType: varchar('favorite_type', { length: 50 }).notNull(), // 'provider', 'user'
  favoriteProviderId: uuid('favorite_provider_id').references(() => hardwareProviders.id, { onDelete: 'cascade' }),
  favoriteUserId: uuid('favorite_user_id').references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow(),
});

// Ratings & Reviews
export const ratings = pgTable('ratings', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  providerId: uuid('provider_id').references(() => hardwareProviders.id, { onDelete: 'cascade' }).notNull(),
  deviceId: uuid('device_id').references(() => devices.id, { onDelete: 'set null' }),
  sessionId: uuid('session_id').references(() => deviceSessions.id, { onDelete: 'set null' }),
  rating: integer('rating').notNull(), // 1-5 stars
  review: text('review'),
  response: text('response'), // Provider's response
  isVerified: boolean('is_verified').default(false), // Verified purchase
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Bookings (Advanced reservations)
export const bookings = pgTable('bookings', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  deviceId: uuid('device_id').references(() => devices.id, { onDelete: 'cascade' }).notNull(),
  providerId: uuid('provider_id').references(() => hardwareProviders.id, { onDelete: 'cascade' }).notNull(),
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time').notNull(),
  durationHours: integer('duration_hours').notNull(),
  hourlyRate: decimal('hourly_rate', { precision: 10, scale: 2 }).notNull(),
  totalCost: decimal('total_cost', { precision: 10, scale: 2 }).notNull(),
  status: varchar('status', { length: 50 }).default('pending'), // 'pending', 'confirmed', 'in_progress', 'completed', 'cancelled'
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Provider Earnings
export const providerEarnings = pgTable('provider_earnings', {
  id: uuid('id').primaryKey().defaultRandom(),
  providerId: uuid('provider_id').references(() => hardwareProviders.id, { onDelete: 'cascade' }).notNull(),
  sessionId: uuid('session_id').references(() => deviceSessions.id, { onDelete: 'set null' }),
  bookingId: uuid('booking_id').references(() => bookings.id, { onDelete: 'set null' }),
  deviceId: uuid('device_id').references(() => devices.id, { onDelete: 'set null' }),
  grossAmount: decimal('gross_amount', { precision: 10, scale: 2 }).notNull(),
  platformFee: decimal('platform_fee', { precision: 10, scale: 2 }).notNull(),
  netAmount: decimal('net_amount', { precision: 10, scale: 2 }).notNull(),
  status: varchar('status', { length: 50 }).default('pending'), // 'pending', 'processing', 'paid'
  paidAt: timestamp('paid_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  projects: many(projects),
  apiKeys: many(apiKeys),
  aiProviderKeys: many(aiProviderKeys),
  deviceSessions: many(deviceSessions),
  builds: many(builds),
  aiExecutions: many(aiExecutions),
  usageMetrics: many(usageMetrics),
  invoices: many(invoices),
  hardwareProvider: one(hardwareProviders),
  favorites: many(favorites),
  ratings: many(ratings),
  bookings: many(bookings),
}));

export const hardwareProvidersRelations = relations(hardwareProviders, ({ one, many }) => ({
  user: one(users, {
    fields: [hardwareProviders.userId],
    references: [users.id],
  }),
  devices: many(devices),
  ratings: many(ratings),
  bookings: many(bookings),
  earnings: many(providerEarnings),
}));

export const devicesRelations = relations(devices, ({ one }) => ({
  provider: one(hardwareProviders, {
    fields: [devices.providerId],
    references: [hardwareProviders.id],
  }),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  user: one(users, {
    fields: [projects.userId],
    references: [users.id],
  }),
  builds: many(builds),
  deviceSessions: many(deviceSessions),
  aiExecutions: many(aiExecutions),
}));

export const buildsRelations = relations(builds, ({ one, many }) => ({
  project: one(projects, {
    fields: [builds.projectId],
    references: [projects.id],
  }),
  user: one(users, {
    fields: [builds.userId],
    references: [users.id],
  }),
  testRuns: many(testRuns),
}));

export const testRunsRelations = relations(testRuns, ({ one }) => ({
  build: one(builds, {
    fields: [testRuns.buildId],
    references: [builds.id],
  }),
  deviceSession: one(deviceSessions, {
    fields: [testRuns.deviceSessionId],
    references: [deviceSessions.id],
  }),
}));
