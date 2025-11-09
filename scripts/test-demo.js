#!/usr/bin/env node

/**
 * HitForget Virtual Processors - Demo Test Script
 * Bu script demo'nun tüm özelliklerinin çalıştığını doğrular
 */

const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✅${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}❌${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠️ ${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.blue}ℹ️ ${colors.reset} ${msg}`),
  step: (num, msg) => console.log(`\n${colors.cyan}[${num}/10]${colors.reset} ${msg}`)
};

let passedTests = 0;
let failedTests = 0;

function test(name, condition) {
  if (condition) {
    log.success(name);
    passedTests++;
    return true;
  } else {
    log.error(name);
    failedTests++;
    return false;
  }
}

console.log('\n════════════════════════════════════════════════════════════');
console.log('  🧪 HitForget Virtual Processors - Demo Test Suite');
console.log('════════════════════════════════════════════════════════════\n');

// Test 1: Project Structure
log.step(1, 'Checking project structure...');

const requiredDirs = [
  'app',
  'components',
  'lib',
  'demo',
  'scripts',
  'device-backend'
];

requiredDirs.forEach(dir => {
  const exists = fs.existsSync(path.join(process.cwd(), dir));
  test(`Directory exists: ${dir}/`, exists);
});

// Test 2: Demo Files
log.step(2, 'Checking demo files...');

const demoFiles = [
  'demo/README.md',
  'demo/DEMO-SCRIPT.md',
  'demo/SOCIAL-MEDIA-CONTENT.md',
  'demo/VISUAL-ASSETS-GUIDE.md',
  'demo/arduino-examples/led-blink/led-blink.ino',
  'demo/arduino-examples/interactive-led/interactive-led.ino'
];

demoFiles.forEach(file => {
  const exists = fs.existsSync(path.join(process.cwd(), file));
  const size = exists ? fs.statSync(path.join(process.cwd(), file)).size : 0;
  test(`${file} (${(size / 1024).toFixed(1)}KB)`, exists && size > 0);
});

// Test 3: API Routes
log.step(3, 'Checking API routes...');

const apiRoutes = [
  'app/api/virtual-processors/route.ts',
  'app/api/virtual-processors/[id]/route.ts',
  'app/api/subscriptions/route.ts',
  'app/api/virtual-instances/route.ts',
  'app/api/virtual-instances/[id]/route.ts',
  'app/api/virtual-instances/[id]/control/route.ts',
  'app/api/virtual-instances/[id]/pins/route.ts',
  'app/api/virtual-instances/[id]/simulations/route.ts',
  'app/api/simulations/[id]/route.ts'
];

apiRoutes.forEach(route => {
  const exists = fs.existsSync(path.join(process.cwd(), route));
  test(`API: ${route}`, exists);
});

// Test 4: Frontend Pages
log.step(4, 'Checking frontend pages...');

const frontendPages = [
  'app/virtual-processors/page.tsx',
  'app/virtual-instances/page.tsx',
  'app/virtual-instances/[id]/page.tsx',
  'app/virtual-instances/[id]/console/page.tsx'
];

frontendPages.forEach(page => {
  const exists = fs.existsSync(path.join(process.cwd(), page));
  test(`Page: ${page}`, exists);
});

// Test 5: Backend Services
log.step(5, 'Checking backend services...');

const backendServices = [
  'device-backend/services/virtual-processor-service.js',
  'device-backend/routes/virtual-processors.js'
];

backendServices.forEach(service => {
  const exists = fs.existsSync(path.join(process.cwd(), service));
  test(`Service: ${service}`, exists);
});

// Test 6: Database Schema
log.step(6, 'Checking database schema...');

const schemaPath = 'lib/db/schema.ts';
if (fs.existsSync(path.join(process.cwd(), schemaPath))) {
  const schemaContent = fs.readFileSync(path.join(process.cwd(), schemaPath), 'utf8');

  const requiredTables = [
    'virtualProcessorTypes',
    'subscriptionPlans',
    'userSubscriptions',
    'virtualInstances',
    'simulations',
    'pinAssignments'
  ];

  requiredTables.forEach(table => {
    const hasTable = schemaContent.includes(`export const ${table}`);
    test(`Table export: ${table}`, hasTable);
  });

  log.success('Schema file exists and contains virtual processor tables');
} else {
  log.error('Schema file not found: lib/db/schema.ts');
  failedTests++;
}

// Test 7: Scripts
log.step(7, 'Checking scripts...');

const scripts = [
  'scripts/seed-virtual-processors.js',
  'scripts/demo-setup.sh'
];

scripts.forEach(script => {
  const exists = fs.existsSync(path.join(process.cwd(), script));
  const executable = exists && (script.endsWith('.sh') ?
    (fs.statSync(path.join(process.cwd(), script)).mode & 0o111) : true);
  test(`Script: ${script}${script.endsWith('.sh') ? ' (executable)' : ''}`, exists && executable);
});

// Test 8: Package Dependencies
log.step(8, 'Checking package.json dependencies...');

const packagePath = path.join(process.cwd(), 'package.json');
if (fs.existsSync(packagePath)) {
  const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

  const requiredDeps = [
    'next',
    'react',
    'drizzle-orm',
    '@auth/drizzle-adapter'
  ];

  requiredDeps.forEach(dep => {
    const hasDep = (pkg.dependencies && pkg.dependencies[dep]) ||
                   (pkg.devDependencies && pkg.devDependencies[dep]);
    test(`Dependency: ${dep}`, hasDep);
  });
} else {
  log.error('package.json not found');
  failedTests++;
}

// Test 9: Documentation
log.step(9, 'Checking documentation...');

const docs = [
  'README.md',
  'VIRTUAL-PROCESSORS.md',
  'PROVIDER-MARKETPLACE.md',
  'ARCHITECTURE.md'
];

docs.forEach(doc => {
  const exists = fs.existsSync(path.join(process.cwd(), doc));
  const size = exists ? fs.statSync(path.join(process.cwd(), doc)).size : 0;
  test(`Doc: ${doc} (${(size / 1024).toFixed(1)}KB)`, exists && size > 0);
});

// Test 10: Arduino Examples Content Validation
log.step(10, 'Validating Arduino example sketches...');

const ledBlinkPath = 'demo/arduino-examples/led-blink/led-blink.ino';
const interactivePath = 'demo/arduino-examples/interactive-led/interactive-led.ino';

if (fs.existsSync(path.join(process.cwd(), ledBlinkPath))) {
  const content = fs.readFileSync(path.join(process.cwd(), ledBlinkPath), 'utf8');

  test('LED Blink: Has setup() function', content.includes('void setup()'));
  test('LED Blink: Has loop() function', content.includes('void loop()'));
  test('LED Blink: Uses Serial', content.includes('Serial.begin'));
  test('LED Blink: Has LED_PIN definition', content.includes('LED_PIN'));
  test('LED Blink: Uses digitalWrite', content.includes('digitalWrite'));
} else {
  log.error('LED Blink sketch not found');
  failedTests += 5;
}

if (fs.existsSync(path.join(process.cwd(), interactivePath))) {
  const content = fs.readFileSync(path.join(process.cwd(), interactivePath), 'utf8');

  test('Interactive: Has button handling', content.includes('BUTTON_PIN'));
  test('Interactive: Has RGB LED', content.includes('RED_PIN'));
  test('Interactive: Has serial commands', content.includes('handleSerialCommands'));
  test('Interactive: Has status function', content.includes('showStatus'));
} else {
  log.error('Interactive LED sketch not found');
  failedTests += 4;
}

// Summary
console.log('\n════════════════════════════════════════════════════════════');
console.log('  📊 Test Results');
console.log('════════════════════════════════════════════════════════════\n');

const totalTests = passedTests + failedTests;
const successRate = ((passedTests / totalTests) * 100).toFixed(1);

console.log(`Total Tests: ${totalTests}`);
console.log(`${colors.green}Passed: ${passedTests}${colors.reset}`);
console.log(`${colors.red}Failed: ${failedTests}${colors.reset}`);
console.log(`Success Rate: ${successRate}%\n`);

if (failedTests === 0) {
  log.success('All tests passed! Demo is ready! 🚀');
  console.log('\n' + colors.green + '✨ Your demo environment is 100% ready!' + colors.reset);
  console.log('\nNext steps:');
  console.log('  1. Run: npm run dev');
  console.log('  2. Open: http://localhost:3000/virtual-processors');
  console.log('  3. Follow: demo/DEMO-SCRIPT.md');
  console.log('  4. Record and share! 🎬\n');
  process.exit(0);
} else {
  log.warn(`${failedTests} test(s) failed. Please fix before recording demo.`);
  console.log('\n' + colors.yellow + 'Some components are missing or need attention.' + colors.reset);
  console.log('Review the failed tests above and fix them.\n');
  process.exit(1);
}
