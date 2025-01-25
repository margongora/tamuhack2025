import { NextRequest, NextResponse } from "next/server";
import { allFlightsInputSchema, allFlightsOutputSchema } from "./_schema";

export const maxDuration = 30;

export async function POST(req: NextRequest) {
    try {

        const inputBody = await req.json();

        const input = allFlightsInputSchema.parse(inputBody);

        // ensure date string follows the format "YYYY-MM-DD"
        if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date)) {
            return new Response("Invalid date format", { status: 400 });
        }

        // fetch data from the API https://flight-engine-rp1w.onrender.com/airports/all
        const response = await fetch("https://flight-engine-rp1w.onrender.com/flights?date=" + input.date);

        // check if the response is ok
        if (!response.ok) {
            return new Response("API Error", { status: response.status });
        }

        // parse the response as JSON
        const data = await response.json();

        const flights = allFlightsOutputSchema.parse(data);

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