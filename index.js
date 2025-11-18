import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { getJson } from 'serpapi';

import * as fs from 'fs'; // temp file writing

dotenv.config();

const app = express();
const port = 3000;
const SERPAPI_KEY = process.env.SERPAPI_API_KEY;

app.use(express.json());
app.use(cors({ origin: 'http://localhost:5173' }));

app.get('/', (req, res) => {
  res.send('Hello World!');
});

async function searchFlights(departure, destination, departDate, returnDate) {
  let data;
  try {
    data = fs.readFileSync("data.json");
  } catch (error) {
    console.error(error);

    throw error;
  }

  return JSON.parse(data); // temp bypass to avoid API calls during dev

  // try { 
  //   const json = await getJson({
  //     engine: "google_flights",
  //     api_key: SERPAPI_KEY,
  //     departure_id: departure,
  //     arrival_id: destination,
  //     type: 1, // 1 for round trip, 2 for one way, 3 for multi-city
  //     outbound_date: departDate,
  //     return_date: returnDate,
  //     currency: "GBP",
  //   });

  //   console.log(json.best_flights || json.flights);
  //   const data = JSON.stringify(json.best_flights);
  //   fs.writeFile("data.json", data, (error) => {
  //     // throwing the error
  //     // in case of a writing problem
  //     if (error) {
  //       // logging the error
  //       console.error(error);

  //       throw error;
  //     }

  //     console.log("data.json written correctly");
  //   });
  //   return json.best_flights || json.flights || [];
  // } catch (error) {
  //   console.error(`Error searching flights: ${error}`);
  //   return [];
  // }
}

app.post('/api/chat/message', async (req, res) => {
    console.log(`Message from client: ${req.body.message}`);
    const flights = await searchFlights("LGW", "CPH", "2025-12-06", "2025-12-13");
    res.send({ reply: `There is a flight on ${flights[0].flights[0].departure_airport.time} from London to Copenhagen for £${flights[0].price} with ${flights[0].flights[0].airline} (${flights[0].flights[0].flight_number}).` });
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});