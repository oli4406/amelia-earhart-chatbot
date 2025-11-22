import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { getJson } from 'serpapi';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import * as fs from 'fs';

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 3000);
const SERPAPI_KEY = process.env.SERPAPI_API_KEY;

// parse JSON and enable CORS once
app.use(express.json());

app.use(
  cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'OPTIONS'],
    credentials: true,
  })
);

// quick health + debug endpoints (do not expose in production)
app.get('/', (req, res) => res.send('OK'));
app.get('/debug/headers', (req, res) => res.json({ headers: req.headers }));

// request logger
app.use((req, res, next) => {
  console.log(new Date().toISOString(), req.method, req.url);
  next();
});

// connect to MongoDB
mongoose
  .connect('mongodb://localhost:27017/amelia-earhart-chatbot')
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch(error => {
    console.error('Error connecting to MongoDB:', error);
  });

// define User schema for table
const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    firstName: { type: String },
    lastName: { type: String },
  },
  { timestamps: true }
);

//define Message schema for table
const messageSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    question: { type: String, required: true },
    answer: { type: String, required: true },
    ts: { type: Date, default: Date.now },
  },
  { timestamps: true }
);
const Message = mongoose.models.Message || mongoose.model('Message', messageSchema);

const User = mongoose.models.User || mongoose.model('User', UserSchema);

// auth middleware
const TokenVerificationSecret = (req, res, next) => {
  const raw = req.headers['authorization'] || '';
  const token = raw.replace(/^Bearer\s+/i, '') || null;
  if (!token) return res.status(401).send({ message: 'Access Denied. No token provided.' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
    next();
  } catch (err) {
    return res.status(401).send({ message: 'Invalid Token' });
  }
};

// register
app.post('/api/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;
    if (!email || !password || !firstName || !lastName) return res.status(400).send({ message: 'Please enter all fields to continue' });
    const existingUser = await User.findOne({ email });

    if (existingUser) return res.status(409).send({ message: 'User already exists' });
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = new User({ email, passwordHash, firstName, lastName });
    await newUser.save();
    res.status(201).send({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).send({ message: 'Error registering user' });
  }
});

// get user (protected)
app.get('/api/user', TokenVerificationSecret, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-passwordHash');
    if (!user) return res.status(404).send({ message: 'User not found' });
    res.send(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).send({ message: 'Error fetching user data' });
  }
});

// login (POST only)
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).send({ message: 'Email and password required' });
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).send({ message: 'Invalid email or password' });
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(401).send({ message: 'Invalid email or password' });
    const token = jwt.sign({ _id: user._id, email: user.email }, process.env.JWT_SECRET || 'dev_secret', {
      expiresIn: '1h',
    });
    res.send({ token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).send({ message: 'Error logging in' });
  }
});

const fallbackText =
  "I am sorry, my instruments seem to be playing up. Flying may not be all plain sailing, but the fun of it is worth the price.";

// Define the flight search function declaration for Gemini
const searchFlightsFunctionDeclaration = {
  name: 'searchFlights',
  description: 'Returns the best flight between two airports on specified dates.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      origin: { type: SchemaType.STRING, description: 'IATA code of the departure airport' },
      destination: { type: SchemaType.STRING, description: 'IATA code of the arrival airport' },
      departure_date: { type: SchemaType.STRING, description: 'YYYY-MM-DD departure date' },
      return_date: { type: SchemaType.STRING, nullable: true, description: 'YYYY-MM-DD return date or null if not specified by user' },
    },
    required: ['origin', 'destination', 'departure_date'],
  },
};

// Generation config with function declaration
const config = {
  systemInstruction: `
  You are Amelia Earhart, the pioneering aviator. You are knowledgeable about aviation and love to help people find flights. Speak with confidence, calmness, and a love of flight. Keep replies concise.

  CRITICAL PERSONA AND FORMATTING RULES:
  1. Style: Your tone must be warm, enthusiastic, and highly conversational, reflecting a pioneering spirit and love of adventure.
  2. Diction: Use vocabulary and phrasing common to a mid-20th-century American aviator. Examples include: "Splendid," "Grand," "A fine journey," "A clear path," "The skies await," "Plain sailing," "By Jove," or "That's the ticket."
  2. No Markdown Lists: Do NOT use asterisks (*), bullet points, or numbering to present flight details. Integrate the information smoothly into your sentences.
  3. Conciseness: Only provide departure/arrival times/dates, airlines, and final price unless the user explicitly asks for more detail. You may include layover info if relevant, but do not mention flight duration.
  4. Currency: All prices MUST be prefixed with the British Pound sign (£). The currency for all flight data is GBP.
  5. Format: For round trips, clearly state the outbound and return flight details in simple sentences.

  CRITICAL DATE RULES:
  1. The user's message will be prefixed with the [Current Date: YYYY-MM-DD].
  2. You MUST use this [Current Date] as your reference point for all relative dates (e.g., "tomorrow", "next weekend", "this Friday").
  3. The user's actual query will follow "User:".

  FLIGHT SEARCH RULES:
  1. If the user gives a vague reference such as "next weekend", "this Friday", "tomorrow", convert it to an exact upcoming date.
  2. If the user gives a day + month without a year, always assume the next occurence of that date in the future.
  3. If the user give only a day number (e.g., "6th"), infer the nearest upcoming matching date.
  4. If the user gives a month but no year (e.g., "December 6"), assume the next upcoming.
  5. If the user gives no date at all, assume the soonest reasonable date for flight availability.
  6. Assume all flights are one-way unless the user explicitly states they want a return flight. If the user wants a return flight but does not specify a return date or trip duration, assume a return flight one week after the departure date.
  7. Never ask the user for a year unless completely unavoidable.

  You must infer missing details and make reasonable assumptions instead of asking clarifying questions.`,
  tools: [
    {
      functionDeclarations: [searchFlightsFunctionDeclaration],
    },
  ],
};

// Configure the Gemini client
const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Get the model with the specified model and configuration
const model = ai.getGenerativeModel({
  model: 'gemini-2.5-flash',
  systemInstruction: config.systemInstruction,
  tools: config.tools,
});

// Start a new chat session and pass in the initial greeting
const chat = model.startChat({
  history: [],
});

async function searchFlights(departure, destination, departDate, returnDate) {
  console.log(`Searching flights from ${departure} to ${destination} departing on ${departDate} returning on ${returnDate || 'N/A'}`);
  let data;
  try {
    data = fs.readFileSync('BackEnd/data.json', 'utf8');
  } catch (error) {
    console.error(error);
    throw error;
  }

  // set type to 1 for round trip, 2 for one way, 3 for multi-city
  const flightType = returnDate ? 1 : 2;

  return JSON.parse(data); // temp bypass to avoid API calls during dev
}

app.post('/api/chat/message', async (req, res) => {
  if (!req.body || typeof req.body.message !== 'string') {
    return res.status(400).send({ reply: fallbackText });
  }

  if (req.body.message.substring(0, 5) !== '[DEV]') {
    return res.send({
      reply:
        "Better do a good deed near at home than go far away to burn incense.\n\nPrefix your message with [DEV] to access the gemini (to reduce the usage during testing)",
    });
  }

  console.log(`Message from client: ${req.body.message}`);

  // Get current date for context
  const today = new Date().toISOString().split('T')[0];
  const userMessage = req.body.message;
  const messageWithDate = `\n  [Current Date: ${today}]\n  User: ${userMessage}`;

  try {
    const initialResponse = await chat.sendMessage(messageWithDate);
    console.log(`Initial chat response: \n${JSON.stringify(initialResponse)}\n`);

    const structuredResponse = initialResponse.response || initialResponse;

    const functionCallPart = structuredResponse.candidates?.[0]?.content?.parts?.find(part => part.functionCall);

    if (!functionCallPart) {
      console.log('Model returned text, no function call detected.');
      const responseText = structuredResponse.candidates?.[0]?.content?.parts?.[0]?.text || fallbackText;
      return res.send({ reply: responseText });
    }

    const tool_call = functionCallPart.functionCall;
    console.log(`Tool call detected: ${JSON.stringify(tool_call)}`);

    let result;
    if (tool_call.name === 'searchFlights') {
      console.log(`Invoking searchFlights with arguments: ${JSON.stringify(tool_call.args)}`);
      result = await searchFlights(tool_call.args.origin, tool_call.args.destination, tool_call.args.departure_date, tool_call.args.return_date);
    }

    console.log(`tool_call result (stringified):\n${JSON.stringify(result)}\n`);

    const finalResponse = await chat.sendMessage([
      {
        functionResponse: {
          name: tool_call.name,
          response: { flights: result },
        },
      },
    ]);

    const responseText = finalResponse.response?.candidates?.[0]?.content?.parts?.[0]?.text || fallbackText;
    console.log(`Final chat response: \n${responseText}\n`);
    return res.send({ reply: responseText });
  } catch (error) {
    console.error(`Error handling chat message: ${error}`);
    return res.status(500).send({ reply: fallbackText });
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});