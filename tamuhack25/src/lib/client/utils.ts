import { allAirportsOutputSchema } from "@/app/api/getAirports/_schema";
import { allFlightsOutputSchema } from "@/app/api/getFlights/_schema";
import { TravelItinerarySchema } from "@/app/api/itinerary/_schema";
import { z } from "zod";

export async function getAllAirports() {
    try {

        // fetch data from the API https://flight-engine-rp1w.onrender.com/airports/all
        const response = await fetch("/api/getAirports");

        // check if the response is ok
        if (!response.ok) {
            throw new Error("API Error");
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

// get all flights on a specific date (YYYY-MM-DD)
export async function getAllFlights(date: string) {
    try {

        // fetch data from the API https://flight-engine-rp1w.onrender.com/airports/all
        const response = await fetch("/api/getFlights", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ date }),
        });

        // check if the response is ok
        if (!response.ok) {
            throw new Error("API Error");
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

export async function getItinerary(city: string, code: string, date: string) {
    try {

        // fetch data from the API https://flight-engine-rp1w.onrender.com/airports/all
        const response = await fetch("/api/itinerary", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ city, code, date }),
        });

        // check if the response is ok
        if (!response.ok) {
            throw new Error("API Error");
        }

        // parse the response as JSON
        const data = TravelItinerarySchema.parse(await response.json());

        return data;
    } catch (e) {
        console.error(e);
        return null;
    }
}

export type Place = {
    displayName: string;
    formattedAddress: string;
    location: {
        latitude: number;
        longitude: number;
    };
}

export const PlaceSchema = z.object({
    displayName: z.object({
        text: z.string(),
        languageCode: z.string(),
    }),
    formattedAddress: z.string(),
    location: z.object({
        latitude: z.number(),
        longitude: z.number(),
    }),
});

export const PlacesSchema = z.array(PlaceSchema);

export const PlacesResponseSchema = z.object({
    contextualContents: z.unknown(),
    places: PlacesSchema,
});

export type PlacesResponse = z.infer<typeof PlacesResponseSchema>;


export async function getPlaceFromName(name: string) {
    try {

        /*
        // curl -X POST -d '{
  "textQuery" : "Spicy Vegetarian Food in Sydney, Australia"
}' \
-H 'Content-Type: application/json' -H 'X-Goog-Api-Key: API_KEY' \
-H 'X-Goog-FieldMask: places.displayName,places.formattedAddress,places.priceLevel' \
'https://places.googleapis.com/v1/places:searchText'
// */

        // fetch data from the API https://flight-engine-rp1w.onrender.com/airports/all
        const response = await fetch("https://places.googleapis.com/v1/places:searchText", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Goog-Api-Key": "AIzaSyAOsk3zgPK7ZQWWWa7VTjg2zvU6WMla27U",
                "X-Goog-FieldMask": "*",
            },
            body: JSON.stringify({ textQuery: name }),
        });

        // check if the response is ok
        if (!response.ok) {
            throw new Error("API Error" + response.statusText + response.status + process.env.NEXT_PUBlIC_GOOGLE_MAPS_API_KEY);
        }

        // parse the response as JSON
        const data = await response.json();

        return PlacesResponseSchema.parse(data).places;

    }
    catch (e) {
        console.error(e)
        return null;
    }
}

export async function elaboratePlace(description: string, question: string) {
    try {

        // fetch data from the API https://flight-engine-rp1w.onrender.com/airports/all
        const response = await fetch("/api/elaboration", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ messages: [{ role: 'assistant', content: description }, { role: 'user', content: question }] }),
        });

        // check if the response is ok
        if (!response.ok) {
            throw new Error("API Error");
        }

        // parse the response as JSON
        const data = await response.json();

        console.log(data);

        return data as string;

    } catch (e) {
        console.error(e);
        return null;
    }
}