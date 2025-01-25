import { allAirportsOutputSchema } from "@/app/api/getAirports/_schema";

export async function getAllAirports() {
    try {
        
        // fetch data from the API https://flight-engine-rp1w.onrender.com/airports/all
        const response = await fetch("/api/getAirports");

        // check if the response is ok
        if (!response.ok) {
            return new Response("API Error", { status: response.status });
        }

        // parse the response as JSON
        const data = await response.json();

        const flights = allAirportsOutputSchema.parse(data);

        return flights;
    } catch (e) {
        console.error(e);
        return null;
    }
}