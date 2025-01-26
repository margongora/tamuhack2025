import { z } from 'zod';

export const airportSchema = z.object({
    code: z.string(),
    city: z.string(),
    timezone: z.string(),
    location: z.object({
        latitude: z.number(),
        longitude: z.number()
    })
})

export const allAirportsOutputSchema = z.array(airportSchema);

export type Airport = z.infer<typeof airportSchema>;
export type AllAirportsOutput = z.infer<typeof allAirportsOutputSchema>;