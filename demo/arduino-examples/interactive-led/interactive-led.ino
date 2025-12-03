/**
 * Visucan Virtual Processor Demo
 * Arduino Uno - Interactive LED Control
 *
 * This advanced demo shows interactive virtual hardware:
 * - Button input detection
 * - LED output control
 * - Serial commands
 * - Real-time status monitoring
 *
 * Virtual Hardware Setup:
 * - LED: Pin D13 (OUTPUT)
 * - Button: Pin D2 (INPUT_PULLUP)
 * - RGB LED: Pins D9, D10, D11 (PWM)
 *
 * Serial Commands:
 * - '1' = Turn LED ON
 * - '0' = Turn LED OFF
 * - 'R' = Red color
 * - 'G' = Green color
 * - 'B' = Blue color
 * - 'S' = Show status
 */

// Pin definitions
#define LED_PIN 13
#define BUTTON_PIN 2
#define RED_PIN 9
#define GREEN_PIN 10
#define BLUE_PIN 11

// State variables
bool ledState = false;
bool lastButtonState = HIGH;
int buttonPressCount = 0;
unsigned long lastDebounceTime = 0;
const unsigned long debounceDelay = 50;

// Color variables
int currentColor = 0; // 0=off, 1=red, 2=green, 3=blue, 4=white

void setup() {
  Serial.begin(9600);
  delay(1000);

  // Print colorful banner
  Serial.println();
  Serial.println("  ██╗  ██╗██╗████████╗███████╗ ██████╗ ██████╗  ██████╗ ███████╗████████╗");
  Serial.println("  ██║  ██║██║╚══██╔══╝██╔════╝██╔═══██╗██╔══██╗██╔════╝ ██╔════╝╚══██╔══╝");
  Serial.println("  ███████║██║   ██║   █████╗  ██║   ██║██████╔╝██║  ███╗█████╗     ██║   ");
  Serial.println("  ██╔══██║██║   ██║   ██╔══╝  ██║   ██║██╔══██╗██║   ██║██╔══╝     ██║   ");
  Serial.println("  ██║  ██║██║   ██║   ██║     ╚██████╔╝██║  ██║╚██████╔╝███████╗   ██║   ");
  Serial.println("  ╚═╝  ╚═╝╚═╝   ╚═╝   ╚═╝      ╚═════╝ ╚═╝  ╚═╝ ╚═════╝ ╚══════╝   ╚═╝   ");
  Serial.println();
  Serial.println("  🌐 Virtual Arduino Uno R3 - Interactive LED Control");
  Serial.println("  🚀 No Physical Hardware Required!");
  Serial.println("  🤖 Powered by AI + Cloud Simulation");
  Serial.println();
  Serial.println("════════════════════════════════════════════════════════════════════════");
  Serial.println();

  // Configure pins
  pinMode(LED_PIN, OUTPUT);
  pinMode(BUTTON_PIN, INPUT_PULLUP);
  pinMode(RED_PIN, OUTPUT);
  pinMode(GREEN_PIN, OUTPUT);
  pinMode(BLUE_PIN, OUTPUT);

  // Initial states
  digitalWrite(LED_PIN, LOW);
  analogWrite(RED_PIN, 0);
  analogWrite(GREEN_PIN, 0);
  analogWrite(BLUE_PIN, 0);

  Serial.println("✅ Pin Configuration:");
  Serial.println("   📍 D13  → LED (OUTPUT)");
  Serial.println("   📍 D2   → Button (INPUT_PULLUP)");
  Serial.println("   📍 D9   → RGB Red (PWM)");
  Serial.println("   📍 D10  → RGB Green (PWM)");
  Serial.println("   📍 D11  → RGB Blue (PWM)");
  Serial.println();

  Serial.println("📝 Available Commands:");
  Serial.println("   1 → LED ON");
  Serial.println("   0 → LED OFF");
  Serial.println("   R → Red Color");
  Serial.println("   G → Green Color");
  Serial.println("   B → Blue Color");
  Serial.println("   W → White Color");
  Serial.println("   S → Show Status");
  Serial.println();
  Serial.println("🎮 Press virtual button or send serial commands!");
  Serial.println("════════════════════════════════════════════════════════════════════════");
  Serial.println();
}

void loop() {
  // Handle button input with debouncing
  handleButton();

  // Handle serial commands
  handleSerialCommands();

  // Small delay to prevent overwhelming serial output
  delay(10);
}

void handleButton() {
  int buttonState = digitalRead(BUTTON_PIN);

  // Check if button state changed
  if (buttonState != lastButtonState) {
    lastDebounceTime = millis();
  }

  // Debounce logic
  if ((millis() - lastDebounceTime) > debounceDelay) {
    if (buttonState == LOW && lastButtonState == HIGH) {
      // Button pressed!
      buttonPressCount++;
      ledState = !ledState;
      digitalWrite(LED_PIN, ledState);

      Serial.println("──────────────────────────────────────");
      Serial.print("🔘 BUTTON PRESSED! (#");
      Serial.print(buttonPressCount);
      Serial.println(")");
      Serial.print("💡 LED Status: ");
      Serial.println(ledState ? "🟢 ON" : "⚫ OFF");
      Serial.println("──────────────────────────────────────");
    }
  }

  lastButtonState = buttonState;
}

void handleSerialCommands() {
  if (Serial.available() > 0) {
    char command = Serial.read();

    Serial.println();
    Serial.print("📨 Received Command: '");
    Serial.print(command);
    Serial.println("'");

    switch (command) {
      case '1':
        ledState = true;
        digitalWrite(LED_PIN, HIGH);
        Serial.println("✅ LED turned ON");
        break;

      case '0':
        ledState = false;
        digitalWrite(LED_PIN, LOW);
        Serial.println("✅ LED turned OFF");
        break;

      case 'R':
      case 'r':
        setColor(255, 0, 0);
        currentColor = 1;
        Serial.println("✅ RGB Color: 🔴 RED");
        break;

      case 'G':
      case 'g':
        setColor(0, 255, 0);
        currentColor = 2;
        Serial.println("✅ RGB Color: 🟢 GREEN");
        break;

      case 'B':
      case 'b':
        setColor(0, 0, 255);
        currentColor = 3;
        Serial.println("✅ RGB Color: 🔵 BLUE");
        break;

      case 'W':
      case 'w':
        setColor(255, 255, 255);
        currentColor = 4;
        Serial.println("✅ RGB Color: ⚪ WHITE");
        break;

      case 'S':
      case 's':
        showStatus();
        break;

      default:
        Serial.println("❌ Unknown command");
        Serial.println("💡 Try: 1, 0, R, G, B, W, or S");
    }

    Serial.println();
  }
}

void setColor(int red, int green, int blue) {
  analogWrite(RED_PIN, red);
  analogWrite(GREEN_PIN, green);
  analogWrite(BLUE_PIN, blue);
}

void showStatus() {
  Serial.println();
  Serial.println("════════════════════════════════════════");
  Serial.println("📊 SYSTEM STATUS");
  Serial.println("════════════════════════════════════════");

  Serial.print("⏱️  Uptime: ");
  Serial.print(millis() / 1000);
  Serial.println(" seconds");

  Serial.print("💡 Main LED (D13): ");
  Serial.println(ledState ? "🟢 ON" : "⚫ OFF");

  Serial.print("🎨 RGB Color: ");
  switch (currentColor) {
    case 0:
      Serial.println("⚫ OFF");
      break;
    case 1:
      Serial.println("🔴 RED");
      break;
    case 2:
      Serial.println("🟢 GREEN");
      break;
    case 3:
      Serial.println("🔵 BLUE");
      break;
    case 4:
      Serial.println("⚪ WHITE");
      break;
  }

  Serial.print("🔘 Button Presses: ");
  Serial.println(buttonPressCount);

  Serial.print("💾 Free Memory: ");
  Serial.print(freeMemory());
  Serial.println(" bytes");

  Serial.println("════════════════════════════════════════");
}

int freeMemory() {
  extern int __heap_start, *__brkval;
  int v;
  return (int) &v - (__brkval == 0 ? (int) &__heap_start : (int) __brkval);
}
