import { allFlightsOutputSchema } from "@/app/api/getFlights/_schema";

export async function getAllFlights() {
    try {
        
        // fetch data from the API https://flight-engine-rp1w.onrender.com/airports/all
        const response = await fetch("/api/getFlights");

        // check if the response is ok
        if (!response.ok) {
            return new Response("API Error", { status: response.status });
        }

        // parse the response as JSON
        const data = await response.json();

        const flights = allFlightsOutputSchema.parse(data);

        return flights;
    } catch (e) {
        console.error(e);
        return null;
    }
}