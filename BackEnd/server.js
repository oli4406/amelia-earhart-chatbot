import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { getJson } from 'serpapi';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
const port = Number(globalThis.process.env.PORT || 3000);
const SERPAPI_KEY = globalThis.process.env.SERPAPI_API_KEY;

// parse JSON and enable CORS once
app.use(express.json());

app.use(
  cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'OPTIONS'],
    credentials: true,
  })
);

const fallbackText ="I am sorry, my instruments seem to be playing up. Flying may not be all plain sailing, but the fun of it is worth the price.";

// Define the flight search function declaration for Gemini
const searchFlightsFunctionDeclaration = {
  name: 'searchFlights',
  description: 'Returns the best flight between two airports on specified dates.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      origin: { type: SchemaType.STRING, description: 'IATA code of the departure airport. You can specify multiple departure airports by separating them with a comma. For example, CDG,ORY,/m/04jpl. For searching multiple airports in one region (such as London), you MUST specify multiple airports, instead of using the region identify (WRONG: LON - CORRECT: LGW,LHR,STN,LCY,SEN).' },
      destination: { type: SchemaType.STRING, description: 'IATA code of the arrival airport. You can specify multiple departure airports by separating them with a comma. For example, CDG,ORY,/m/04jpl' },
      departure_date: { type: SchemaType.STRING, description: 'Optional YYYY-MM-DD departure date, if not specified the first available flight will be returned' },
      flight_type: { type: SchemaType.STRING, description: '1 for round trip, 2 for one way, 3 for multi-city' },
      return_date: { type: SchemaType.STRING, description: 'YYYY-MM-DD return date. Required if type is set to 1' },
      exclude_airlines: { type: SchemaType.STRING, description: 'Parameter defines the airline codes to be excluded. Split multiple airlines with comma. It can\'t be used together with include_airlines. Each airline code should be a 2-character IATA code consisting of either two uppercase letters or one uppercase letter and one digit.' },
      include_airlines: { type: SchemaType.STRING, description: 'Parameter defines the airline codes to be included. Split multiple airlines with comma. It can\'t be used together with exclude_airlines. Each airline code should be a 2-character IATA code consisting of either two uppercase letters or one uppercase letter and one digit.' },
      max_price: { type: SchemaType.STRING, description: 'Parameter defines the maximum ticket price. Default to unlimited.' },
      sort_by: { type: SchemaType.STRING, description: 'Parameter defines the sorting order of the results. Available options: 1 - Top flights (default), 2 - Price, 3 - Departure timem, 4 - Arrival time, 5 - Duration, 6 - Emissions' },
    },
    required: ['flight_type'],
  },
};

// Generation config with function declaration
const config = {
  systemInstruction: `
  You are Amelia Earhart, the pioneering aviator. You are knowledgeable about aviation and love to help people find flights. Speak with confidence, calmness, and a love of flight. Keep replies concise.

  CRITICAL PERSONA AND FORMATTING RULES:
  1. Style: Your tone must be warm, enthusiastic, and highly conversational, reflecting a pioneering spirit and love of adventure.
  2. Diction: Use vocabulary and phrasing common to a mid-20th-century American aviator. Examples include: "Splendid," "Grand," "A fine journey," "A clear path," "The skies await," "Plain sailing," "By Jove," or "That's the ticket."
  2. No Markdown Lists: Do NOT use asterisks (*), bullet points, or numbering to present flight details. Integrate the information smoothly into your sentences. Create a new paragraph using '/n' where appropriate to paragraphs greater than 600 characters long. If you are telling the user about multiple flights, make a new paragraph for each flight.
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
  5. Assume all flights are one-way unless the user explicitly states they want a return flight. If the user wants a return flight but does not specify a return date or trip duration, assume a return flight one week after the departure date.
  6. Never ask the user for a year unless completely unavoidable.

  You must infer missing details and make reasonable assumptions instead of asking clarifying questions.`,
  tools: [
    {
      functionDeclarations: [searchFlightsFunctionDeclaration],
    },
  ],
};

// Configure the Gemini client
const ai = new GoogleGenerativeAI(globalThis.process.env.GEMINI_API_KEY);

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

async function searchFlights(origin, destination, departure_date, flight_type, return_date, exclude_airlines, include_airlines, max_price, sort_by) {
  console.log(`Searching flights from ${origin} to ${destination} departing on ${departure_date} returning on ${return_date || 'N/A'}`);

  try {
    const request_data = {
      engine: "google_flights",
      api_key: SERPAPI_KEY,
      type: flight_type,
      currency: "GBP",
    };

    if (origin) { request_data['departure_id'] = origin};
    if (destination) { request_data['arrival_id'] = destination};
    if (departure_date) { request_data['outbound_date'] = departure_date};
    if (return_date) { request_data['return_date'] = return_date};
    if (exclude_airlines) { request_data['exclude_airlines'] = exclude_airlines
    } else if (include_airlines) { request_data['include_airlines'] = include_airlines};
    if (max_price) { request_data['max_price'] = max_price};
    if (sort_by) { request_data['sort_by'] = sort_by};

    console.log(`API Request data: \n${JSON.stringify(request_data)}\n\n`)

    // If departure_date is not specified, try up to 5 times, incrementing the date each time
    let attempts = 0;
    let flights = [];
    if (!departure_date) {
      let date = new Date();
      while (attempts < 5 && (!flights || flights.length === 0)) {
        // Format date as YYYY-MM-DD
        const formattedDate = date.toISOString().split('T')[0];
        request_data['outbound_date'] = formattedDate;
        console.log(`Attempt ${attempts + 1}: Trying departure_date ${formattedDate}`);
        const json = await getJson(request_data);
        flights = json.best_flights || json.flights || [];
        if (flights && flights.length > 0) {
          console.log(`Flights found on attempt ${attempts + 1}`);
          break;
        }
        // Increment date by one day
        date.setDate(date.getDate() + 1);
        attempts++;
      }
      return flights;
    } else {
      const json = await getJson(request_data);
      console.log(json.best_flights || json.flights);
      return json.best_flights || json.flights || [];
    }
  } catch (error) {
    console.error(`Error searching flights: ${error}`);
    return [];
  }
}

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
    req.user = jwt.verify(token, globalThis.process.env.JWT_SECRET || 'dev_secret');
    next();
  } catch (err) {
    console.error(`An error occured: ${err}`)
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
    const token = jwt.sign({ _id: user._id, email: user.email }, globalThis.process.env.JWT_SECRET || 'dev_secret', {
      expiresIn: '1h',
    });
    res.send({ token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).send({ message: "Error logging in" });
  }
});

app.post('/api/chat/message', async (req, res) => {
  if (!req.body || typeof req.body.message !== 'string') {
    return res.status(400).send({ reply: fallbackText })
  }

  if (req.body.message.substring(0,5) != "[DEV]") { // TEMP bypass to reduce usage during testing
    return res.send({ reply: "Better do a good deed near at home than go far away to burn incense.\n\nPrefix your message with [DEV] to access the gemini (to reduce the usage during testing)" });
  }

  console.log(`Message from client: ${req.body.message}`);

  // Get current date for context
  const today = new Date().toISOString().split('T')[0];
  const userMessage = req.body.message;
  const messageWithDate = `[Current Date: ${today}]
  User: ${userMessage}`;

  try {
    const initialResponse = await chat.sendMessage(messageWithDate);
    console.log(`Initial chat response: \n${JSON.stringify(initialResponse)}\n`);

    const structuredResponse = initialResponse.response || initialResponse;

    const functionCallPart = structuredResponse.candidates?.[0]?.content?.parts?.find(part => part.functionCall);

    if (!functionCallPart) {
      // No function call detected, return the text response
      console.log("Model returned text, no function call detected.");
      const responseText = structuredResponse.candidates?.[0]?.content?.parts?.[0]?.text || fallbackText;
      return res.send({ reply: responseText });
    }

    const tool_call = functionCallPart.functionCall;
    console.log(`Tool call detected: ${JSON.stringify(tool_call)}`);

    let result;
    if (tool_call.name === 'searchFlights') {
      const args = tool_call.args;
      console.log(`Invoking searchFlights with arguments: ${JSON.stringify(args)}`);
      result = await searchFlights(args.origin, args.destination, args.departure_date, args.flight_type, args.return_date || '', args.exclude_airlines || '', args.include_airlines || '', args.max_price || '', args.sort_by || '');
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

    const responseText = finalResponse.response.candidates?.[0]?.content?.parts?.[0]?.text || fallbackText;

    console.log(`Final chat response: \n${responseText}\n`);
    
    return res.send({ reply: responseText });

  } catch (error) {
    console.error(`Error handling chat message: ${error}`);
    return res.status(500).send({ reply: fallbackText });
  }
});

app.get('/', (req, res) => {
  console.log(`IP ${req.ip} accessed the backend root endpoint.`);
  res.send('Amelia Earhart Chatbot Backend is running.');
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});