/**
 * HitForget Virtual Processor Demo
 * Arduino Uno - LED Blink Application
 *
 * This sketch demonstrates basic Arduino functionality in a virtual environment.
 * No physical hardware required!
 *
 * Hardware Configuration (Virtual):
 * - LED connected to pin D13 (built-in LED)
 * - Blink interval: 1 second
 *
 * Features Demonstrated:
 * - Digital pin control (digitalWrite)
 * - Serial communication
 * - Timing with delay()
 * - Loop execution
 */

// Pin definitions
#define LED_PIN 13

// Global variables
int blinkCount = 0;
unsigned long startTime;

void setup() {
  // Initialize serial communication at 9600 baud
  Serial.begin(9600);

  // Wait for serial port to connect (for virtual processor)
  delay(1000);

  // Print startup banner
  Serial.println("╔════════════════════════════════════════╗");
  Serial.println("║   HitForget Virtual Arduino Uno R3     ║");
  Serial.println("║   LED Blink Demo Application           ║");
  Serial.println("╚════════════════════════════════════════╝");
  Serial.println();
  Serial.println("🚀 Virtual Processor Started!");
  Serial.println("📍 No Physical Hardware Required");
  Serial.println("🤖 AI-Powered Embedded Development");
  Serial.println();

  // Configure LED pin as output
  pinMode(LED_PIN, OUTPUT);
  Serial.print("⚙️  Configured Pin ");
  Serial.print(LED_PIN);
  Serial.println(" as OUTPUT");

  // Initial state
  digitalWrite(LED_PIN, LOW);
  Serial.println("💡 LED initially OFF");
  Serial.println();
  Serial.println("────────────────────────────────────────");
  Serial.println("Starting blink sequence...");
  Serial.println("────────────────────────────────────────");
  Serial.println();

  // Record start time
  startTime = millis();
}

void loop() {
  // Increment blink counter
  blinkCount++;

  // Calculate uptime
  unsigned long uptime = (millis() - startTime) / 1000;

  // Turn LED ON
  digitalWrite(LED_PIN, HIGH);
  Serial.print("🟢 LED ON  | Blink #");
  Serial.print(blinkCount);
  Serial.print(" | Uptime: ");
  Serial.print(uptime);
  Serial.println("s");

  // Wait 1 second
  delay(1000);

  // Turn LED OFF
  digitalWrite(LED_PIN, LOW);
  Serial.print("⚫ LED OFF | Blink #");
  Serial.print(blinkCount);
  Serial.print(" | Uptime: ");
  Serial.print(uptime + 1);
  Serial.println("s");

  // Wait 1 second
  delay(1000);

  // Print status every 10 blinks
  if (blinkCount % 10 == 0) {
    Serial.println();
    Serial.println("📊 Status Report:");
    Serial.print("   Total Blinks: ");
    Serial.println(blinkCount);
    Serial.print("   Runtime: ");
    Serial.print(uptime);
    Serial.println(" seconds");
    Serial.print("   Memory Free: ");
    Serial.print(freeMemory());
    Serial.println(" bytes");
    Serial.println();
  }
}

// Helper function to calculate free memory
int freeMemory() {
  extern int __heap_start, *__brkval;
  int v;
  return (int) &v - (__brkval == 0 ? (int) &__heap_start : (int) __brkval);
}
