const int buttonPin = 2;      // The pin with the button attached
const int ledPin = 13;        // Built-in LED

// Variables to track the button state
bool lastButtonState = HIGH;  // Start with button not pressed (HIGH with INPUT_PULLUP)
bool wasPressed = false;      // Flag to track if we've sent the press message

void setup() {
  // Initialize serial communication at 9600 baud rate
  Serial.begin(9600);
  
  // Set up the button pin with internal pull-up resistor
  pinMode(buttonPin, INPUT_PULLUP);
  
  // Set up the LED pin
  pinMode(ledPin, OUTPUT);
  
  // Send a message when Arduino starts
  Serial.println("Arduino ready");
  
  // Blink LED 3 times to show it's ready
  for (int i = 0; i < 3; i++) {
    digitalWrite(ledPin, HIGH);
    delay(100);
    digitalWrite(ledPin, LOW);
    delay(100);
  }
}

void loop() {
  // Read the current button state
  bool buttonState = digitalRead(buttonPin);
  
  // Button is pressed (LOW because of INPUT_PULLUP)
  if (buttonState == LOW && lastButtonState == HIGH) {
    // Button was just pressed
    digitalWrite(ledPin, HIGH);  // Turn on LED
    Serial.println("BUTTON_PRESSED");
    wasPressed = true;
    delay(50);  // Small debounce delay
  }
  else if (buttonState == HIGH && lastButtonState == LOW) {
    // Button was just released
    digitalWrite(ledPin, LOW);  // Turn off LED
    Serial.println("BUTTON_RELEASED");
    wasPressed = false;
    delay(50);  // Small debounce delay
  }
  
  // Save the current state for next comparison
  lastButtonState = buttonState;
  
  // If button is held down, blink the LED to show it's active
  if (wasPressed && millis() % 1000 < 500) {
    digitalWrite(ledPin, HIGH);
  } else if (wasPressed) {
    digitalWrite(ledPin, LOW);
  }
} 