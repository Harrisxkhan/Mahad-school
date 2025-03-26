# 5th Grade Homework Helper

A voice-based homework helper for elementary students supporting English and Urdu. This application includes an activation system for permanent installation in schools and Arduino button integration for easy interaction.

## Features

- Voice-based interface for natural interaction
- Supports both English and Urdu languages
- Activation system for one-time setup on school computers
- Arduino button integration for physical interaction
- Web-based application, accessible from any browser

## Project Structure

```
homework-helper/
├── api/              # API modules for activation and other server features
├── arduino-bridge/   # Bridge server to connect Arduino hardware
├── public/           # Client-side web application files
├── .env              # Environment variables (API keys, etc.)
├── package.json      # Project dependencies and scripts
├── server.js         # Main application server
└── README.md         # Project documentation
```

## Prerequisites

1. Node.js 14 or higher
2. Arduino (for physical button functionality)
3. OpenAI API key (to access GPT-4o Realtime API)

## Setup Instructions

### Web Application Setup

1. Clone the repository:
   ```
   git clone https://github.com/your-username/homework-helper.git
   cd homework-helper
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory with your OpenAI API key:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   PORT=3000
   ```

4. Start the application:
   ```
   npm start
   ```

5. Access the application at: http://localhost:3000

### Arduino Setup

1. Connect your Arduino to your computer via USB

2. Upload the `ArduinoButtonBridge.ino` sketch using the Arduino IDE:
   - Open Arduino IDE
   - Open the sketch file from the repository
   - Select your Arduino board from Tools > Board
   - Select the correct port from Tools > Port
   - Click the Upload button

3. Install the Arduino bridge dependencies:
   ```
   cd arduino-bridge
   npm install
   ```

4. Start the Arduino bridge:
   ```
   npm start
   ```

**Note:** You can also run both the main application and Arduino bridge simultaneously using:
```
npm run dev:all
```

## Usage Instructions

### Activation Process

1. When accessing the application for the first time on a new computer, you'll see an activation screen.
2. Enter one of the valid activation codes provided to your school.
3. The system will be permanently activated on that computer.
4. On subsequent visits, the system will automatically bypass the activation screen.

### Using the Homework Helper

1. Once activated, you'll see the main interface with a microphone button.
2. Click the microphone button to start recording (or press the physical Arduino button if connected).
3. Ask your homework question in English or Urdu.
4. Click the button again when finished asking the question.
5. The AI helper will respond both verbally and with text on screen.

## Valid Activation Codes (For Testing)

- `SCHOOL2023`
- `EDUHELPER`
- `HOMEWORKAPP` 

## Arduino Button Integration

This application supports a physical button connected to an Arduino for easier interaction, particularly useful in classroom settings. When the button is pressed, it activates the microphone in the web application.

### Button Wiring Instructions

1. Connect a pushbutton to Arduino digital pin 2 and ground.
2. The Arduino sketch uses the internal pull-up resistor, so no external resistor is needed.
3. The built-in LED on pin 13 will light up when the button is pressed.

## Deploying to Replit

1. Create a new Replit project
2. Import from GitHub using the repository URL
3. Set up the environment variables in the Replit Secrets tab:
   - Add `OPENAI_API_KEY` with your OpenAI API key
4. Run the application using the "Run" button

## License

This project is licensed under the MIT License - see the LICENSE file for details. 