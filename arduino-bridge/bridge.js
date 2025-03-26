// Serial Bridge between Arduino and Web App
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

// Create Express server
const app = express();
app.use(cors());
app.use(express.json());

// Track button state
let buttonState = 'released';
let isConnected = false;

// Logs directory
const LOG_DIR = path.join(__dirname, 'logs');

// Create logs directory if it doesn't exist
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

// Log function
function logMessage(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] [${type.toUpperCase()}] ${message}\n`;
  
  fs.appendFile(path.join(LOG_DIR, 'bridge.log'), logEntry, (err) => {
    if (err) console.error('Error writing to log file:', err);
  });
  
  console.log(`${type.toUpperCase()}: ${message}`);
}

// Auto-detect Arduino port
async function findArduinoPort() {
  try {
    logMessage('Searching for Arduino port...');
    
    const { SerialPortInfo } = require('@serialport/bindings-cpp');
    const availablePorts = await SerialPortInfo.list();
    
    // Common Arduino identifiers
    const arduinoIdentifiers = [
      { manufacturer: /arduino/i },
      { manufacturer: /wch/i },      // CH340 chips used in many Arduino clones
      { vendorId: '2341' },          // Official Arduino
      { vendorId: '1A86' }           // CH340 chips
    ];
    
    // Try to find Arduino port
    const arduinoPort = availablePorts.find(port => {
      return arduinoIdentifiers.some(identifier => {
        for (const key in identifier) {
          const pattern = identifier[key];
          if (pattern instanceof RegExp) {
            if (port[key] && pattern.test(port[key])) return true;
          } else {
            if (port[key] === pattern) return true;
          }
        }
        return false;
      });
    });
    
    if (arduinoPort) {
      logMessage(`Found Arduino on port: ${arduinoPort.path}`);
      return arduinoPort.path;
    }
    
    // If no Arduino found, look for the most likely serial port
    // On Windows, this is typically a COM port
    const comPort = availablePorts.find(port => /^COM\d+/i.test(port.path));
    if (comPort) {
      logMessage(`No Arduino identifier found, trying COM port: ${comPort.path}`);
      return comPort.path;
    }
    
    // On Mac/Linux, try typical Arduino paths
    const macLinuxPorts = availablePorts.find(port => 
      /ttyACM\d+/i.test(port.path) || 
      /ttyUSB\d+/i.test(port.path) || 
      /cu\.usbmodem/i.test(port.path)
    );
    
    if (macLinuxPorts) {
      logMessage(`No Arduino identifier found, trying typical path: ${macLinuxPorts.path}`);
      return macLinuxPorts.path;
    }
    
    // Default to COM4 if no ports found (common Windows Arduino port)
    logMessage('No suitable ports found, defaulting to COM4');
    return 'COM4';
  } catch (error) {
    logMessage(`Error detecting Arduino port: ${error.message}`, 'error');
    return 'COM4'; // Default to COM4
  }
}

// Connect to Arduino
async function connectToArduino() {
  try {
    const portPath = await findArduinoPort();
    
    logMessage(`Attempting to connect to Arduino on ${portPath}...`);
    
    // Set up Serial connection
    const port = new SerialPort({
      path: portPath,
      baudRate: 9600
    });
    
    // Create a parser to read lines from Arduino
    const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }));
    
    // Listen for data from Arduino
    parser.on('data', (data) => {
      logMessage(`Arduino says: ${data}`);
      
      if (data === 'BUTTON_PRESSED') {
        buttonState = 'pressed';
        logMessage('Button was pressed!');
      } else if (data === 'BUTTON_RELEASED') {
        buttonState = 'released';
      } else if (data === 'Arduino ready') {
        logMessage('Arduino is ready and initialized');
      }
    });
    
    // Handle errors
    port.on('error', (err) => {
      isConnected = false;
      logMessage(`Serial port error: ${err.message}`, 'error');
      logMessage('Please make sure:', 'error');
      logMessage(`1. The Arduino is properly connected to ${portPath}`, 'error');
      logMessage('2. The Arduino IDE Serial Monitor is CLOSED', 'error');
      logMessage(`3. No other program is using ${portPath}`, 'error');
      
      // Try to reconnect after a delay
      setTimeout(() => {
        logMessage('Attempting to reconnect...');
        connectToArduino();
      }, 5000);
    });
    
    // Handle open connection
    port.on('open', () => {
      isConnected = true;
      logMessage('Serial port opened successfully');
    });
    
    return port;
  } catch (error) {
    logMessage(`Failed to connect to Arduino: ${error.message}`, 'error');
    return null;
  }
}

// Initialize the connection
let port;
connectToArduino().then(p => {
  port = p;
});

// API endpoint to get button state
app.get('/button-state', (req, res) => {
  res.json({ 
    state: buttonState,
    connected: isConnected 
  });
  
  // Reset button state after it's been read
  if (buttonState === 'pressed') {
    buttonState = 'released';
  }
});

// Add a test endpoint
app.get('/test', (req, res) => {
  res.json({ 
    status: 'Bridge server is running',
    arduino: isConnected ? 'connected' : 'disconnected'
  });
});

// Add a health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    arduino: isConnected ? 'connected' : 'disconnected',
    uptime: process.uptime()
  });
});

// Start server
const PORT = 3001; // Different from your main app (3000)
app.listen(PORT, () => {
  logMessage(`Arduino bridge running on http://localhost:${PORT}`);
  logMessage('Waiting for Arduino data...');
});

// Process termination handling
process.on('SIGINT', () => {
  logMessage('Closing serial port and exiting...');
  if (port && port.isOpen) {
    port.close();
  }
  process.exit(0);
}); 