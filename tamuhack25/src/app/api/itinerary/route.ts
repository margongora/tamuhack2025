import { NextRequest } from "next/server";

import {OpenAI} from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import { z } from "zod";

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const TravelDestinationSchema = z.object({
    title: z.string(),
    description: z.string(),
    latitude: z.number(),
    longitude: z.number(),
    note: z.union([z.string(), z.null()])
})

const TravelItinerarySchema = z.object({
    description: z.string(),
    destinations: z.array(TravelDestinationSchema)
})
  

export async function POST(request: NextRequest) {
    const res = await request.json()

    const completion = await client.beta.chat.completions.parse({
        model: 'gpt-4o-mini',
        messages: [
            { role: 'system', content: "You are a travel planning assistant. Write a fun, descriptive list of 5 travel destinations for the user to visit in the city of their choice. Only choose destinations that are likely to be available while the user is visiting. If there's important information regarding logistics, make a note of it in your response. Record the latitude and longitude of each location. Sort them in the order they should be visited to reduce time spent commuting."},
            { role: 'user', content: `I am visiting ${res.city}, ${res.state} on ${res.date}.` },
        ],
        response_format: zodResponseFormat(TravelItinerarySchema, 'travel_itinerary'),
    });

    const message = completion.choices[0]?.message;
    if (message?.parsed) {
        return new Response(JSON.stringify(message.parsed));
    }

    return new Response("Internal Server Error", { status: 500 });
}