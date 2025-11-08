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

// ============================================================
// VIRTUAL PROCESSOR SIMULATION SYSTEM
// ============================================================

// Virtual Processor Types (Catalog of available virtual processors)
export const virtualProcessorTypes = pgTable('virtual_processor_types', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(), // 'Arduino Uno', 'STM32F401', 'Raspberry Pi 4'
  category: varchar('category', { length: 100 }).notNull(), // 'arduino', 'stm32', 'raspberry_pi', 'fpga'
  architecture: varchar('architecture', { length: 100 }).notNull(), // 'AVR', 'ARM Cortex-M4', 'ARM Cortex-A72'
  description: text('description'),
  imageUrl: text('image_url'),
  specifications: jsonb('specifications'), // {cpu: '16MHz', ram: '2KB', flash: '32KB', pins: 14}
  simulatorEngine: varchar('simulator_engine', { length: 100 }), // 'simavr', 'qemu', 'renode'
  isActive: boolean('is_active').default(true),
  monthlyPrice: decimal('monthly_price', { precision: 10, scale: 2 }).default('9.99'),
  yearlyPrice: decimal('yearly_price', { precision: 10, scale: 2 }).default('99.99'),
  features: jsonb('features'), // ['pin_assignment', 'uart', 'i2c', 'spi', 'pwm']
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Subscription Plans
export const subscriptionPlans = pgTable('subscription_plans', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(), // 'Basic Virtual', 'Pro Virtual', 'Enterprise'
  description: text('description'),
  priceUsd: decimal('price_usd', { precision: 10, scale: 2 }).notNull(),
  billingInterval: varchar('billing_interval', { length: 50 }).notNull(), // 'monthly', 'yearly'
  maxVirtualInstances: integer('max_virtual_instances').default(1),
  maxSimulationHours: integer('max_simulation_hours').default(100), // Hours per month
  maxStorageGB: integer('max_storage_gb').default(5),
  features: jsonb('features'), // ['unlimited_builds', 'priority_support', 'custom_pins']
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// User Subscriptions
export const userSubscriptions = pgTable('user_subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  planId: uuid('plan_id').references(() => subscriptionPlans.id, { onDelete: 'set null' }),
  processorTypeId: uuid('processor_type_id').references(() => virtualProcessorTypes.id, { onDelete: 'set null' }),
  status: varchar('status', { length: 50 }).default('active'), // 'active', 'cancelled', 'expired', 'paused'
  billingInterval: varchar('billing_interval', { length: 50 }).notNull(), // 'monthly', 'yearly'
  currentPeriodStart: timestamp('current_period_start').notNull(),
  currentPeriodEnd: timestamp('current_period_end').notNull(),
  cancelAt: timestamp('cancel_at'),
  canceledAt: timestamp('canceled_at'),
  stripeSubscriptionId: varchar('stripe_subscription_id', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Virtual Instances (User's virtual processor instances)
export const virtualInstances = pgTable('virtual_instances', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  subscriptionId: uuid('subscription_id').references(() => userSubscriptions.id, { onDelete: 'cascade' }).notNull(),
  processorTypeId: uuid('processor_type_id').references(() => virtualProcessorTypes.id, { onDelete: 'cascade' }).notNull(),
  name: varchar('name', { length: 255 }).notNull(), // User-defined name
  description: text('description'),
  status: varchar('status', { length: 50 }).default('stopped'), // 'running', 'stopped', 'error'
  configuration: jsonb('configuration'), // Custom settings, peripherals enabled, clock speed
  pinAssignments: jsonb('pin_assignments'), // {D2: 'LED', D3: 'Button', A0: 'Sensor'}
  firmwareUrl: text('firmware_url'), // Last uploaded firmware
  snapshotUrl: text('snapshot_url'), // VM snapshot for faster boot
  ipAddress: varchar('ip_address', { length: 50 }), // For network-enabled simulations
  vnc_port: integer('vnc_port'), // For GUI simulations (Raspberry Pi)
  lastStartedAt: timestamp('last_started_at'),
  lastStoppedAt: timestamp('last_stopped_at'),
  totalRuntimeHours: decimal('total_runtime_hours', { precision: 10, scale: 2 }).default('0'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Simulations (Simulation sessions)
export const simulations = pgTable('simulations', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  instanceId: uuid('instance_id').references(() => virtualInstances.id, { onDelete: 'cascade' }).notNull(),
  projectId: uuid('project_id').references(() => projects.id, { onDelete: 'set null' }),
  buildId: uuid('build_id').references(() => builds.id, { onDelete: 'set null' }),
  status: varchar('status', { length: 50 }).default('running'), // 'running', 'paused', 'stopped', 'completed', 'failed'
  firmwarePath: text('firmware_path'), // Path to HEX/BIN/ELF file
  startedAt: timestamp('started_at').defaultNow(),
  stoppedAt: timestamp('stopped_at'),
  durationSeconds: integer('duration_seconds'),
  serialOutput: text('serial_output'), // Captured serial output
  logUrl: text('log_url'),
  resultsUrl: text('results_url'), // Generated artifacts (screenshots, videos, data)
  testResults: jsonb('test_results'), // Automated test results
  errorMessage: text('error_message'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Pin Assignments (Virtual hardware pin configurations)
export const pinAssignments = pgTable('pin_assignments', {
  id: uuid('id').primaryKey().defaultRandom(),
  instanceId: uuid('instance_id').references(() => virtualInstances.id, { onDelete: 'cascade' }).notNull(),
  pinNumber: varchar('pin_number', { length: 50 }).notNull(), // 'D2', 'A0', 'GPIO17'
  pinMode: varchar('pin_mode', { length: 50 }).notNull(), // 'INPUT', 'OUTPUT', 'INPUT_PULLUP', 'PWM', 'ANALOG'
  connectedComponent: varchar('connected_component', { length: 255 }), // 'LED', 'Button', 'Temp Sensor', 'Motor'
  componentConfig: jsonb('component_config'), // {color: 'red', resistance: '220ohm'}
  initialValue: integer('initial_value'), // Initial state (HIGH/LOW or analog value)
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
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
  subscriptions: many(userSubscriptions),
  virtualInstances: many(virtualInstances),
  simulations: many(simulations),
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

// Virtual Processor Relations
export const virtualProcessorTypesRelations = relations(virtualProcessorTypes, ({ many }) => ({
  subscriptions: many(userSubscriptions),
  instances: many(virtualInstances),
}));

export const subscriptionPlansRelations = relations(subscriptionPlans, ({ many }) => ({
  subscriptions: many(userSubscriptions),
}));

export const userSubscriptionsRelations = relations(userSubscriptions, ({ one, many }) => ({
  user: one(users, {
    fields: [userSubscriptions.userId],
    references: [users.id],
  }),
  plan: one(subscriptionPlans, {
    fields: [userSubscriptions.planId],
    references: [subscriptionPlans.id],
  }),
  processorType: one(virtualProcessorTypes, {
    fields: [userSubscriptions.processorTypeId],
    references: [virtualProcessorTypes.id],
  }),
  instances: many(virtualInstances),
}));

export const virtualInstancesRelations = relations(virtualInstances, ({ one, many }) => ({
  user: one(users, {
    fields: [virtualInstances.userId],
    references: [users.id],
  }),
  subscription: one(userSubscriptions, {
    fields: [virtualInstances.subscriptionId],
    references: [userSubscriptions.id],
  }),
  processorType: one(virtualProcessorTypes, {
    fields: [virtualInstances.processorTypeId],
    references: [virtualProcessorTypes.id],
  }),
  simulations: many(simulations),
  pinAssignments: many(pinAssignments),
}));

export const simulationsRelations = relations(simulations, ({ one }) => ({
  user: one(users, {
    fields: [simulations.userId],
    references: [users.id],
  }),
  instance: one(virtualInstances, {
    fields: [simulations.instanceId],
    references: [virtualInstances.id],
  }),
  project: one(projects, {
    fields: [simulations.projectId],
    references: [projects.id],
  }),
  build: one(builds, {
    fields: [simulations.buildId],
    references: [builds.id],
  }),
}));

export const pinAssignmentsRelations = relations(pinAssignments, ({ one }) => ({
  instance: one(virtualInstances, {
    fields: [pinAssignments.instanceId],
    references: [virtualInstances.id],
  }),
}));
