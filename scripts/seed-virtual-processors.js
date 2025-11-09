/**
 * Seed Script for Virtual Processor Demo
 * Creates Arduino Uno virtual processor type with sample configuration
 *
 * Usage: node scripts/seed-virtual-processors.js
 */

const { db } = require('../lib/db');
const { virtualProcessorTypes, subscriptionPlans } = require('../lib/db/schema');

async function seedVirtualProcessors() {
  console.log('🌱 Seeding virtual processors...');

  try {
    // 1. Arduino Uno
    const arduinoUno = await db.insert(virtualProcessorTypes).values({
      name: 'Arduino Uno R3',
      category: 'arduino',
      architecture: 'AVR ATmega328P',
      description: 'The classic Arduino board - perfect for learning embedded programming. 16MHz CPU, 32KB Flash, 2KB RAM. Ideal for LED projects, sensors, and IoT prototypes.',
      imageUrl: 'https://images.unsplash.com/photo-1553406830-ef2513450d76?w=400',
      specifications: {
        mcu: 'atmega328p',
        cpu: '16MHz',
        ram: '2KB SRAM',
        flash: '32KB',
        eeprom: '1KB',
        digitalPins: 14,
        analogPins: 6,
        pwmPins: 6,
        voltage: '5V',
      },
      simulatorEngine: 'simavr',
      monthlyPrice: '9.99',
      yearlyPrice: '99.99',
      features: [
        'UART Serial',
        'I2C',
        'SPI',
        '6x PWM',
        'Analog Input',
        'External Interrupts',
        'Watchdog Timer',
      ],
      isActive: true,
    }).returning();

    console.log('✅ Created Arduino Uno R3:', arduinoUno[0].id);

    // 2. STM32F401 (ARM Cortex-M4)
    const stm32 = await db.insert(virtualProcessorTypes).values({
      name: 'STM32F401 Discovery',
      category: 'stm32',
      architecture: 'ARM Cortex-M4',
      description: '32-bit ARM microcontroller with FPU. 84MHz, 256KB Flash, 64KB RAM. Perfect for real-time applications, DSP, and motor control.',
      imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400',
      specifications: {
        cpu: '84MHz ARM Cortex-M4',
        ram: '64KB SRAM',
        flash: '256KB',
        fpu: true,
        dma: '12 channels',
        timers: '11 timers',
        gpio: '81 I/O pins',
        voltage: '3.3V',
      },
      simulatorEngine: 'qemu',
      monthlyPrice: '14.99',
      yearlyPrice: '149.99',
      features: [
        'Hardware FPU',
        'DMA Controller',
        'USB 2.0 OTG',
        '3x SPI',
        '3x I2C',
        '3x USART',
        'ADC (12-bit)',
      ],
      isActive: true,
    }).returning();

    console.log('✅ Created STM32F401:', stm32[0].id);

    // 3. Raspberry Pi 4 Model B
    const raspberryPi = await db.insert(virtualProcessorTypes).values({
      name: 'Raspberry Pi 4 Model B',
      category: 'raspberry_pi',
      architecture: 'ARM Cortex-A72',
      description: 'Full Linux computer on a board. Quad-core 1.5GHz, up to 8GB RAM. Run Python, Node.js, Docker. Perfect for AI/ML edge computing.',
      imageUrl: 'https://images.unsplash.com/photo-1593642532400-2682810df593?w=400',
      specifications: {
        cpu: 'Quad-core Cortex-A72 @ 1.5GHz',
        ram: '4GB LPDDR4',
        gpu: 'VideoCore VI',
        storage: 'microSD card',
        ethernet: 'Gigabit',
        wireless: 'WiFi 5, Bluetooth 5.0',
        usb: '2x USB 3.0, 2x USB 2.0',
        gpio: '40 pins',
      },
      simulatorEngine: 'qemu',
      monthlyPrice: '19.99',
      yearlyPrice: '199.99',
      features: [
        'Full Linux OS',
        'Python/Node.js',
        'Docker Support',
        'GPIO Access',
        'HDMI Output',
        'Camera Interface',
        'WiFi/Bluetooth',
      ],
      isActive: true,
    }).returning();

    console.log('✅ Created Raspberry Pi 4:', raspberryPi[0].id);

    // 4. ESP32 DevKit
    const esp32 = await db.insert(virtualProcessorTypes).values({
      name: 'ESP32 DevKit V1',
      category: 'arduino',
      architecture: 'Xtensa LX6',
      description: 'WiFi + Bluetooth microcontroller. Dual-core 240MHz, 520KB RAM. Perfect for IoT, smart home, and wireless projects.',
      imageUrl: 'https://images.unsplash.com/photo-1601370690183-1c7796ecec61?w=400',
      specifications: {
        cpu: 'Dual-core Xtensa LX6 @ 240MHz',
        ram: '520KB SRAM',
        flash: '4MB',
        wifi: '802.11 b/g/n',
        bluetooth: 'BLE 4.2',
        gpio: '36 pins',
        adc: '18 channels 12-bit',
        dac: '2 channels 8-bit',
      },
      simulatorEngine: 'renode',
      monthlyPrice: '12.99',
      yearlyPrice: '129.99',
      features: [
        'WiFi Built-in',
        'Bluetooth LE',
        'Touch Sensors',
        'Hall Sensor',
        'Temperature Sensor',
        'Low Power Modes',
        'Arduino Compatible',
      ],
      isActive: true,
    }).returning();

    console.log('✅ Created ESP32 DevKit:', esp32[0].id);

    // Create Subscription Plans
    const basicPlan = await db.insert(subscriptionPlans).values({
      name: 'Basic Virtual',
      description: 'Perfect for hobbyists and learners. Single virtual processor with generous simulation time.',
      priceUsd: '9.99',
      billingInterval: 'monthly',
      maxVirtualInstances: 1,
      maxSimulationHours: 100,
      maxStorageGB: 5,
      features: [
        '1 Virtual Processor Instance',
        '100 Simulation Hours/Month',
        '5GB Storage',
        'Serial Console Access',
        'Pin Assignment',
        'Community Support',
      ],
      isActive: true,
    }).returning();

    console.log('✅ Created Basic Plan:', basicPlan[0].id);

    const proPlan = await db.insert(subscriptionPlans).values({
      name: 'Pro Virtual',
      description: 'For serious developers and small teams. Multiple instances, priority support, and advanced features.',
      priceUsd: '29.99',
      billingInterval: 'monthly',
      maxVirtualInstances: 5,
      maxSimulationHours: 500,
      maxStorageGB: 25,
      features: [
        '5 Virtual Processor Instances',
        '500 Simulation Hours/Month',
        '25GB Storage',
        'Priority Support',
        'Advanced Debugging',
        'API Access',
        'Team Collaboration',
      ],
      isActive: true,
    }).returning();

    console.log('✅ Created Pro Plan:', proPlan[0].id);

    const enterprisePlan = await db.insert(subscriptionPlans).values({
      name: 'Enterprise Virtual',
      description: 'Unlimited virtual processors for organizations. Custom solutions, dedicated support, and SLA.',
      priceUsd: '99.99',
      billingInterval: 'monthly',
      maxVirtualInstances: 999,
      maxSimulationHours: 9999,
      maxStorageGB: 100,
      features: [
        'Unlimited Instances',
        'Unlimited Simulation Time',
        '100GB Storage',
        'Dedicated Support',
        'Custom Simulator Config',
        'SSO Integration',
        'SLA 99.9% Uptime',
        'White-label Option',
      ],
      isActive: true,
    }).returning();

    console.log('✅ Created Enterprise Plan:', enterprisePlan[0].id);

    console.log('\n🎉 Seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log('  - 4 Virtual Processor Types');
    console.log('  - 3 Subscription Plans');
    console.log('\n🚀 Ready for demo!');

    return {
      processors: [arduinoUno[0], stm32[0], raspberryPi[0], esp32[0]],
      plans: [basicPlan[0], proPlan[0], enterprisePlan[0]],
    };
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  seedVirtualProcessors()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { seedVirtualProcessors };
