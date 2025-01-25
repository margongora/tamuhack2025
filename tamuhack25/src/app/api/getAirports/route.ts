import { NextRequest, NextResponse } from "next/server";
import { allAirportsOutputSchema } from "./_schema";

export const maxDuration = 30;

export async function GET(req: NextRequest) {
    try {

        // fetch data from the API https://flight-engine-rp1w.onrender.com/airports/all
        const response = await fetch("https://flight-engine-rp1w.onrender.com/airports/all");

        // check if the response is ok
        if (!response.ok) {
            return new Response("API Error", { status: response.status });
        }

        // parse the response as JSON
        const data = await response.json();

        const flights = allAirportsOutputSchema.parse(data);

        console.log(flights);

        return new Response(JSON.stringify(flights), {
            headers: {
                "content-type": "application/json",
            },
        });
    }
    catch (e) {
        console.error(e);
        return new Response("Internal Server Error", { status: 500 });
    }
}