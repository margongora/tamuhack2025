import { z } from 'zod';

export const allFlightsOutputSchema = z.array(z.object({
    code: z.string(),
    city: z.string(),
    timezone: z.string(),
    location: z.object({
        latitude: z.number(),
        longitude: z.number()
    })
}));

export type AllFlightsOutput = z.infer<typeof allFlightsOutputSchema>;