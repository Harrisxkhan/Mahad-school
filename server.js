import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import { verifyActivationCode, generateActivationToken } from './api/activation.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const LOG_DIR = 'logs';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create logs directory if it doesn't exist
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR);
}

// Logger middleware
const logger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const log = `[${timestamp}] ${req.method} ${req.url}\n`;
  
  fs.appendFile(join(LOG_DIR, 'access.log'), log, (err) => {
    if (err) console.error('Error writing to log file:', err);
  });
  
  next();
};

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(join(__dirname, 'public')));
app.use(logger);

// Activation API endpoint
app.post("/api/activate", (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({ 
        success: false, 
        error: "Activation code is required" 
      });
    }
    
    const isValid = verifyActivationCode(code);
    
    if (isValid) {
      // Generate activation token
      const token = generateActivationToken();
      
      // Log successful activation
      const activationLog = `[${new Date().toISOString()}] Activation successful with code: ${code}\n`;
      fs.appendFile(join(LOG_DIR, 'activations.log'), activationLog, (err) => {
        if (err) console.error('Error writing to activations log:', err);
      });
      
      return res.json({ 
        success: true, 
        message: "Activation successful", 
        token 
      });
    } else {
      // Log failed activation attempt
      const failedLog = `[${new Date().toISOString()}] Failed activation attempt with code: ${code}\n`;
      fs.appendFile(join(LOG_DIR, 'failed_activations.log'), failedLog, (err) => {
        if (err) console.error('Error writing to failed activations log:', err);
      });
      
      return res.status(400).json({ 
        success: false, 
        error: "Invalid activation code" 
      });
    }
  } catch (error) {
    console.error("Activation error:", error);
    
    // Log error
    const errorLog = `[${new Date().toISOString()}] Activation error: ${error.message}\n`;
    fs.appendFile(join(LOG_DIR, 'error.log'), errorLog, (err) => {
      if (err) console.error('Error writing to error log:', err);
    });
    
    return res.status(500).json({ 
      success: false, 
      error: "Server error during activation" 
    });
  }
});

// Verify activation token endpoint
app.post("/api/verify-token", (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ 
        success: false, 
        error: "Token is required" 
      });
    }
    
    // In a real app, you'd verify the token against a database
    // For this example, we'll just check if it starts with our prefix
    const isValid = token.startsWith('HW_HELPER_');
    
    return res.json({ 
      success: true, 
      valid: isValid 
    });
  } catch (error) {
    console.error("Token verification error:", error);
    return res.status(500).json({ 
      success: false, 
      error: "Server error during token verification" 
    });
  }
});

// Endpoint to get ephemeral key for WebRTC connection
app.get("/session", async (req, res) => {
  try {
    console.log("Session request received");
    console.log("Using API key:", process.env.OPENAI_API_KEY ? "API key exists" : "API key missing");
    
    // Check if API key exists
    if (!process.env.OPENAI_API_KEY) {
      console.error("API key is missing");
      return res.status(500).json({ error: "API key is missing" });
    }
    
    const apiUrl = "https://api.openai.com/v1/realtime/sessions";
    console.log("Making request to:", apiUrl);
    
    const requestBody = {
      model: "gpt-4o-realtime-preview",
      voice: "alloy",
      instructions: `You are a friendly, patient, and educational homework helper designed specifically for students up to 5th grade. 

LANGUAGE SUPPORT:
- Respond in the same language the student uses (English or Urdu)
- If the student switches languages mid-conversation, adapt accordingly

EDUCATIONAL APPROACH:
- Provide clear, simple explanations appropriate for elementary school students
- Break down complex concepts into easy-to-understand steps
- Use examples relevant to a child's everyday experience
- Encourage critical thinking rather than just giving answers
- If a question is beyond 5th grade level, provide a simplified explanation suitable for their age

TONE AND STYLE:
- Maintain a warm, encouraging, and supportive tone
- Use positive reinforcement and praise effort
- Be patient and never condescending
- Speak clearly and use simple vocabulary
- Include occasional gentle humor appropriate for children

SUBJECT AREAS:
- Basic mathematics (arithmetic, fractions, decimals, basic geometry)
- Elementary science (animals, plants, weather, simple physics)
- Language arts (grammar, spelling, reading comprehension)
- Social studies (basic geography, history, civics)
- Basic Urdu language skills when questions are asked in Urdu

BOUNDARIES:
- Focus exclusively on educational content
- Avoid any inappropriate content
- Do not help with tasks that appear to be tests or quizzes
- Instead of solving problems directly, guide students through the process

VISUAL DESCRIPTIONS:
- When explaining visual concepts, describe them clearly in words
- For math problems, explain step-by-step how to solve them verbally`
    };
    
    console.log("Request body:", JSON.stringify(requestBody));
    
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });
    
    console.log("Response status:", response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        errorData = { raw_error: errorText };
      }
      
      console.error("OpenAI API error:", errorData);
      
      // Log error to file
      const errorLog = `[${new Date().toISOString()}] OpenAI API error: ${JSON.stringify(errorData)}\n`;
      fs.appendFile(join(LOG_DIR, 'error.log'), errorLog, (err) => {
        if (err) console.error('Error writing to error log:', err);
      });
      
      return res.status(response.status).json({
        error: "OpenAI API error",
        details: errorData,
        status: response.status
      });
    }
    
    const data = await response.json();
    console.log("Session created successfully");
    
    // Log successful session
    const sessionLog = `[${new Date().toISOString()}] Session created: ${data.id}\n`;
    fs.appendFile(join(LOG_DIR, 'sessions.log'), sessionLog, (err) => {
      if (err) console.error('Error writing to sessions log:', err);
    });
    
    res.json(data);
  } catch (error) {
    console.error("Server error:", error.message);
    console.error(error.stack);
    
    // Log error to file
    const errorLog = `[${new Date().toISOString()}] Server error: ${error.message}\n${error.stack}\n`;
    fs.appendFile(join(LOG_DIR, 'error.log'), errorLog, (err) => {
      if (err) console.error('Error writing to error log:', err);
    });
    
    res.status(500).json({ 
      error: "Failed to get session token",
      message: error.message,
      stack: error.stack
    });
  }
});

// Add a test endpoint to verify server is running
app.get("/test", (req, res) => {
  res.json({ status: "Server is running" });
});

// Add health check endpoint
app.get("/health", (req, res) => {
  const health = {
    uptime: process.uptime(),
    timestamp: Date.now(),
    status: 'OK'
  };
  res.json(health);
});

// Add version endpoint
app.get("/version", (req, res) => {
  res.json({ 
    version: "1.1.0",
    name: "5th Grade Homework Helper",
    description: "A voice-based homework helper for elementary students"
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`API Key exists: ${Boolean(process.env.OPENAI_API_KEY)}`);
}); 