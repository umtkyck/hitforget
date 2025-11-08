# Virtual Embedded Processor Simulation

## 🎯 Overview

HitForget now supports **Virtual Embedded Processors** - cloud-based simulation of Arduino, STM32, Raspberry Pi, and FPGA platforms. No physical hardware required!

This feature enables AI-powered development by allowing you to:
- Develop embedded applications without buying hardware
- Test firmware in a safe, simulated environment
- Generate HEX files, images, and SD card images
- Configure virtual pin assignments
- Connect AI tools (ChatGPT, Claude, Copilot) to deploy code

---

## 💡 Why Virtual Processors?

### Problem
**AI coding assistants** (ChatGPT, Claude, GitHub Copilot) can generate embedded code, but developers need:
- Physical hardware for testing ($50-$500 per board)
- Setup time (cables, drivers, installation)
- Risk of bricking hardware during development

### Solution
**Virtual Processors** provide:
- ✅ Instant access to Arduino, STM32, RPi simulations
- ✅ Zero hardware cost
- ✅ Safe experimentation (no risk of damage)
- ✅ AI tool integration
- ✅ Build artifacts (HEX, BIN, images)

---

## 🗄️ Database Schema

### 1. `virtual_processor_types` - Processor Catalog

Available virtual processor models (Arduino Uno, STM32F401, Raspberry Pi 4, etc.)

```sql
CREATE TABLE virtual_processor_types (
  id UUID PRIMARY KEY,
  name VARCHAR(255),              -- 'Arduino Uno', 'STM32F401'
  category VARCHAR(100),          -- 'arduino', 'stm32', 'raspberry_pi'
  architecture VARCHAR(100),      -- 'AVR', 'ARM Cortex-M4'
  description TEXT,
  image_url TEXT,
  specifications JSONB,           -- {cpu: '16MHz', ram: '2KB', flash: '32KB'}
  simulator_engine VARCHAR(100),  -- 'simavr', 'qemu', 'renode'
  monthly_price DECIMAL(10,2),    -- $9.99
  yearly_price DECIMAL(10,2),     -- $99.99
  features JSONB,                 -- ['uart', 'i2c', 'spi', 'pwm']
  is_active BOOLEAN,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### 2. `subscription_plans` - Subscription Tiers

```sql
CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY,
  name VARCHAR(255),              -- 'Basic Virtual', 'Pro Virtual'
  description TEXT,
  price_usd DECIMAL(10,2),
  billing_interval VARCHAR(50),   -- 'monthly', 'yearly'
  max_virtual_instances INTEGER,  -- 1, 5, unlimited
  max_simulation_hours INTEGER,   -- Hours per month
  max_storage_gb INTEGER,
  features JSONB,
  is_active BOOLEAN,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### 3. `user_subscriptions` - Active Subscriptions

```sql
CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY,
  user_id UUID,
  plan_id UUID,
  processor_type_id UUID,
  status VARCHAR(50),             -- 'active', 'cancelled', 'expired'
  billing_interval VARCHAR(50),
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  stripe_subscription_id VARCHAR(255),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### 4. `virtual_instances` - User's Virtual Processors

```sql
CREATE TABLE virtual_instances (
  id UUID PRIMARY KEY,
  user_id UUID,
  subscription_id UUID,
  processor_type_id UUID,
  name VARCHAR(255),              -- User-defined name
  description TEXT,
  status VARCHAR(50),             -- 'running', 'stopped', 'error'
  configuration JSONB,            -- Custom settings
  pin_assignments JSONB,          -- {D2: 'LED', D3: 'Button'}
  firmware_url TEXT,              -- Last uploaded firmware
  snapshot_url TEXT,              -- VM snapshot
  ip_address VARCHAR(50),
  vnc_port INTEGER,               -- For GUI simulations (RPi)
  last_started_at TIMESTAMP,
  last_stopped_at TIMESTAMP,
  total_runtime_hours DECIMAL(10,2),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### 5. `simulations` - Simulation Sessions

```sql
CREATE TABLE simulations (
  id UUID PRIMARY KEY,
  user_id UUID,
  instance_id UUID,
  project_id UUID,
  build_id UUID,
  status VARCHAR(50),             -- 'running', 'paused', 'stopped'
  firmware_path TEXT,
  started_at TIMESTAMP,
  stopped_at TIMESTAMP,
  duration_seconds INTEGER,
  serial_output TEXT,             -- Captured output
  log_url TEXT,
  results_url TEXT,
  test_results JSONB,
  error_message TEXT,
  created_at TIMESTAMP
);
```

### 6. `pin_assignments` - Virtual Pin Configuration

```sql
CREATE TABLE pin_assignments (
  id UUID PRIMARY KEY,
  instance_id UUID,
  pin_number VARCHAR(50),         -- 'D2', 'A0', 'GPIO17'
  pin_mode VARCHAR(50),           -- 'INPUT', 'OUTPUT', 'PWM'
  connected_component VARCHAR(255), -- 'LED', 'Button', 'Sensor'
  component_config JSONB,         -- {color: 'red', resistance: '220ohm'}
  initial_value INTEGER,          -- Initial state
  description TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

---

## 🔌 API Endpoints

### Virtual Processors

```typescript
// List all available virtual processor types
GET /api/virtual-processors
GET /api/virtual-processors?category=arduino
→ Response: { success: true, processors: [...] }

// Get processor type details
GET /api/virtual-processors/:id
→ Response: { success: true, processor: {...} }

// Create processor type (Admin only)
POST /api/virtual-processors
{
  "name": "Arduino Uno R3",
  "category": "arduino",
  "architecture": "AVR ATmega328P",
  "simulatorEngine": "simavr",
  "monthlyPrice": "9.99",
  "yearlyPrice": "99.99",
  "specifications": {
    "cpu": "16MHz",
    "ram": "2KB",
    "flash": "32KB",
    "pins": 14
  },
  "features": ["uart", "i2c", "spi", "pwm"]
}
```

### Subscriptions

```typescript
// Get user's subscriptions
GET /api/subscriptions
→ Response: { success: true, subscriptions: [...] }

// Subscribe to a virtual processor
POST /api/subscriptions
{
  "processorTypeId": "uuid",
  "billingInterval": "monthly" // or "yearly"
}
→ Response: { success: true, subscription: {...} }
```

### Virtual Instances

```typescript
// List user's virtual instances
GET /api/virtual-instances
→ Response: { success: true, instances: [...] }

// Create new virtual instance
POST /api/virtual-instances
{
  "subscriptionId": "uuid",
  "name": "My Arduino Project",
  "description": "LED blink test",
  "configuration": {}
}

// Get instance details
GET /api/virtual-instances/:id

// Update instance
PUT /api/virtual-instances/:id
{
  "name": "Updated Name",
  "description": "New description"
}

// Delete instance
DELETE /api/virtual-instances/:id
```

### Instance Control

```typescript
// Start/Stop/Restart instance
POST /api/virtual-instances/:id/control
{
  "action": "start" // or "stop", "restart"
}
→ Response: { success: true, instance: {...} }
```

### Pin Assignments

```typescript
// Get pin assignments
GET /api/virtual-instances/:id/pins
→ Response: { success: true, pins: [...] }

// Add/Update pin assignment
POST /api/virtual-instances/:id/pins
{
  "pinNumber": "D2",
  "pinMode": "OUTPUT",
  "connectedComponent": "LED",
  "componentConfig": { "color": "red" },
  "initialValue": 0,
  "description": "Status LED"
}

// Delete pin assignment
DELETE /api/virtual-instances/:id/pins?pin=D2
```

### Simulations

```typescript
// Get simulation history
GET /api/virtual-instances/:id/simulations
→ Response: { success: true, simulations: [...] }

// Start new simulation
POST /api/virtual-instances/:id/simulations
{
  "firmwarePath": "/uploads/firmware.hex",
  "projectId": "uuid",
  "buildId": "uuid"
}

// Get simulation details
GET /api/simulations/:id

// Control simulation
PUT /api/simulations/:id
{
  "action": "pause" // or "resume", "stop"
}

// Delete simulation
DELETE /api/simulations/:id
```

---

## 🎨 User Interface

### 1. Virtual Processors Marketplace (`/virtual-processors`)

**Features**:
- Browse all available virtual processor types
- Filter by category (Arduino, STM32, Raspberry Pi, FPGA)
- Compare monthly vs. yearly pricing
- View specifications and features
- Subscribe with one click

**Page Structure**:
```
┌─────────────────────────────────────────────────┐
│  Virtual Embedded Processors                    │
│  Simulate real hardware without physical boards │
│                                                  │
│  [All] [Arduino] [STM32] [Raspberry Pi] [FPGA] │
├─────────────────────────────────────────────────┤
│ ┌───────────────┐ ┌───────────────┐            │
│ │ Arduino Uno   │ │ STM32F401     │            │
│ │ AVR           │ │ ARM Cortex-M4 │            │
│ │ $9.99/mo      │ │ $14.99/mo     │            │
│ │ [Subscribe]   │ │ [Subscribe]   │            │
│ └───────────────┘ └───────────────┘            │
└─────────────────────────────────────────────────┘
```

### 2. My Virtual Instances (`/virtual-instances`)

**Features**:
- List all user's virtual instances
- Quick start/stop/restart controls
- View runtime statistics
- Open serial console
- Configure instances

**Instance Card**:
```
┌────────────────────────────────────┐
│ [RUNNING] [ARDUINO]                │
│ My Arduino Project                 │
│ Arduino Uno R3                     │
│                                    │
│ Total Runtime: 12.5 hrs            │
│ Last Started: 2025-11-08           │
│ Pins Configured: 5                 │
│                                    │
│ [Stop] [Restart] [Config]         │
│ [Open Console]                     │
└────────────────────────────────────┘
```

### 3. Instance Configuration (`/virtual-instances/:id`)

**Tabs**:
- **Basic Info**: Name, description, statistics
- **Pin Assignment**: Configure virtual hardware pins
- **Firmware**: Upload HEX/BIN/ELF files
- **Simulations**: View simulation history

**Pin Assignment Interface**:
```
Add New Pin Assignment:
┌────────────────────────────────────┐
│ Pin Number:  [D2___]               │
│ Pin Mode:    [OUTPUT ▼]            │
│ Component:   [LED___]              │
│ Initial:     [0_____]              │
│ Description: [Status LED_______]   │
│                     [Add Pin]      │
└────────────────────────────────────┘

Configured Pins:
┌────────────────────────────────────┐
│ [D2] [OUTPUT] LED                  │
│ Status LED                         │
│ Initial: 0              [Delete]   │
├────────────────────────────────────┤
│ [D3] [INPUT_PULLUP] Button         │
│ User input button                  │
│ Initial: 1              [Delete]   │
└────────────────────────────────────┘
```

### 4. Serial Console (`/virtual-instances/:id/console`)

**Features**:
- Real-time serial output via WebSocket
- Send commands to running firmware
- Download console output
- Control instance (start/stop/restart)

**Console Layout**:
```
┌─────────────────────────────────────────────────┐
│ Serial Console                                  │
│ [Connected] [RUNNING]                           │
├─────────────────────────────────────────────────┤
│ Terminal Output          [Download] [Clear]     │
│ ┌─────────────────────────────────────────────┐ │
│ │ === Connected to virtual processor ===      │ │
│ │ Arduino Uno bootloader v1.0                 │ │
│ │ Starting sketch...                          │ │
│ │ LED blink initialized                       │ │
│ │ > loop() iteration 1                        │ │
│ │ > loop() iteration 2                        │ │
│ │ ...                                         │ │
│ └─────────────────────────────────────────────┘ │
│ Input: [Type command...____________] [Send]     │
├─────────────────────────────────────────────────┤
│ Controls:                                       │
│ [Stop Instance] [Restart] [Disconnect]         │
└─────────────────────────────────────────────────┘
```

---

## ⚙️ Simulation Service Backend

### Architecture

The Virtual Processor Service uses different simulator engines based on processor type:

| Processor Type | Simulator Engine | Protocol |
|---------------|------------------|----------|
| Arduino (AVR) | SimAVR | GDB, Serial |
| STM32 (ARM) | QEMU | GDB, Serial, Monitor |
| Raspberry Pi | QEMU | Network, VNC, Serial |
| FPGA | Renode | Telnet, UART |

### Implementation

Located at `device-backend/services/virtual-processor-service.js`

**Key Methods**:
```javascript
startInstance(instanceId, processorType, configuration)
stopInstance(instanceId)
loadFirmware(instanceId, firmwarePath)
getSerialOutput(instanceId)
connectSerialSocket(instanceId, websocket)
```

**Example: Starting an Arduino Instance**
```javascript
const result = await virtualProcessorService.startInstance(
  'instance-uuid',
  {
    name: 'Arduino Uno',
    category: 'arduino',
    simulatorEngine: 'simavr',
    specifications: {
      mcu: 'atmega328p',
      frequency: '16000000'
    }
  },
  {
    firmware: '/uploads/sketch.hex'
  }
);
```

### Simulator Details

**QEMU (ARM/RISC-V)**:
```bash
qemu-system-arm \
  -M netduinoplus2 \
  -cpu cortex-m4 \
  -m 128K \
  -nographic \
  -serial tcp::4000,server,nowait \
  -kernel firmware.elf
```

**Renode (Multi-platform)**:
```renode
using sysbus
mach create
machine LoadPlatformDescription @platforms/cpus/stm32f4.repl
sysbus LoadELF @firmware.elf
showAnalyzer sysbus.usart1
start
```

**SimAVR (Arduino)**:
```bash
simavr \
  -m atmega328p \
  -f 16000000 \
  firmware.hex \
  -g -p 5000
```

---

## 🚀 Usage Examples

### Example 1: Subscribe and Create Instance

```bash
# 1. Browse virtual processors
GET /virtual-processors
→ Find "Arduino Uno" with ID abc123

# 2. Subscribe (monthly)
POST /api/subscriptions
{
  "processorTypeId": "abc123",
  "billingInterval": "monthly"
}
→ Get subscription ID: sub456

# 3. Create virtual instance
POST /api/virtual-instances
{
  "subscriptionId": "sub456",
  "name": "My Blink Project",
  "description": "LED blink test"
}
→ Get instance ID: inst789

# 4. Start instance
POST /api/virtual-instances/inst789/control
{ "action": "start" }

# 5. Open console
Navigate to: /virtual-instances/inst789/console
```

### Example 2: Configure Pins and Run Simulation

```bash
# 1. Add LED on pin D13
POST /api/virtual-instances/inst789/pins
{
  "pinNumber": "D13",
  "pinMode": "OUTPUT",
  "connectedComponent": "LED",
  "initialValue": 0
}

# 2. Add button on pin D2
POST /api/virtual-instances/inst789/pins
{
  "pinNumber": "D2",
  "pinMode": "INPUT_PULLUP",
  "connectedComponent": "Button",
  "initialValue": 1
}

# 3. Upload firmware (via frontend)
# User uploads blink.hex file

# 4. Start simulation
POST /api/virtual-instances/inst789/simulations
{
  "firmwarePath": "/uploads/blink.hex"
}

# 5. View output in console
WebSocket connection to ws://localhost:3001/virtual-processors/instances/inst789/serial
```

---

## 📊 Subscription Plans

### Pricing Model

| Plan | Price | Instances | Sim Hours/Month | Storage |
|------|-------|-----------|-----------------|---------|
| **Basic** | $9.99/mo | 1 | 100 hrs | 5GB |
| **Pro** | $29.99/mo | 5 | 500 hrs | 25GB |
| **Enterprise** | $99.99/mo | Unlimited | Unlimited | 100GB |

**Yearly Discount**: Save 17% (equivalent to 2 months free)

---

## 🔮 Advanced Features

### AI Tool Integration

```javascript
// Connect ChatGPT to virtual processor
const response = await openai.chat.completions.create({
  model: "gpt-4",
  messages: [{
    role: "user",
    content: "Generate Arduino code to blink LED on pin 13 every second"
  }]
});

// Deploy generated code to virtual processor
const code = response.choices[0].message.content;
// Build and flash to virtual instance
```

### Build System Integration

```javascript
// Generate HEX file from source
POST /api/builds
{
  "projectId": "uuid",
  "hardwareType": "arduino_uno",
  "sourceFiles": ["main.cpp", "config.h"]
}

// Automatically deploy to virtual instance
POST /api/virtual-instances/:id/simulations
{
  "buildId": "build-uuid"
}
```

### Visual Testing

```javascript
// Run automated tests on virtual processor
POST /api/virtual-instances/:id/simulations
{
  "firmwarePath": "/builds/test-firmware.hex",
  "testScript": {
    "steps": [
      { "action": "wait", "duration": 1000 },
      { "action": "check_pin", "pin": "D13", "expected": "HIGH" },
      { "action": "wait", "duration": 1000 },
      { "action": "check_pin", "pin": "D13", "expected": "LOW" }
    ]
  }
}
```

---

## 🎯 Summary

**Virtual Processors unlock AI-powered embedded development:**

✅ No hardware costs
✅ Instant deployment
✅ Safe experimentation
✅ AI tool integration
✅ Build & test automation
✅ Generate production artifacts (HEX, BIN, images)
✅ Pin-level simulation

**Ready to use:**
- `/virtual-processors` - Browse and subscribe
- `/virtual-instances` - Manage your instances
- `/virtual-instances/:id` - Configure pins and firmware
- `/virtual-instances/:id/console` - Real-time serial console

**Deploy URL**: https://hitforget.vercel.app/virtual-processors

🚀 **Start simulating today!**
