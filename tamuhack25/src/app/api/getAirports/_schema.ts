import { z } from 'zod';

export const allAirportsOutputSchema = z.array(z.object({
    code: z.string(),
    city: z.string(),
    timezone: z.string(),
    location: z.object({
        latitude: z.number(),
        longitude: z.number()
    })
}));

export type AllAirportsOutput = z.infer<typeof allAirportsOutputSchema>;