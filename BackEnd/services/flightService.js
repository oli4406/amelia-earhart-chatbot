import { getJson } from 'serpapi';

const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 10000);

/**
 * Searches for flights using the SerpAPI Google Flights engine.
 * Tries multiple dates if no departure date is given.
 * Supports filtering, storting, price caps, and airline inclusion/exclusion.
 * @async
 * @function searchFlights
 * @param {string} origin - IATA of departure airport(s), comma-separated.
 * @param {string} destination - Destination IATA code.
 * @param {string} departure_date - YYYY-MM-DD departure.
 * @param {string} flight_type - 1=one-way, 2=round-trip.
 * @param {string} [return_date] - YYYY-MM-DD return date.
 * @param {string} [exclude_airlines] - Comma-separated airline codes to exclude.
 * @param {string} [include_airlines] - Comma-separated airline codes to include.
 * @param {string} [max_price] - Upper price limit.
 * @param {string} [sort_by] - Defines the sorting order of the results. 1=top flights (default), 2=price, 3=departure time, 4=arrival time, 5=duration, 6=emissions
 * @returns {Promise<Object[]|null>} List of flights or null on error.
 */
export async function searchFlights(origin, destination, departure_date, flight_type, return_date, exclude_airlines, include_airlines, max_price, sort_by) {
  console.log(`Searching flights from ${origin} to ${destination} departing on ${departure_date} returning on ${return_date || 'N/A'}`);

  try {
    const SERPAPI_KEY = globalThis.process.env.SERPAPI_API_KEY;

    if (!SERPAPI_KEY) {
      console.error("SERP API KEY NOT SET")
      return null
    }

    if (departure_date && !/^\d{4}-\d{2}-\d{2}$/.test(departure_date)) {
      throw new Error("Invalid departure_date format");
    }

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
      const json = await getJson({
        ...request_data,
        signal: controller.signal
      });

      const status = json.search_metadata.status;
      const error = json.error;

      if (status === "Success") {
        if (error === "Google Flights hasn't returned any results for this query.") {
          console.error(error)
          return []
        } else {
          return json.best_flights || json.flights || [];
        }
      }
    }
  } catch (error) {
    console.error(`Error searching flights: ${error}`);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export default searchFlights;
