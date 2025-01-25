import { z } from 'zod';

export const allFlightsOutputSchema = z.array(z.object({
    code: z.string(),
    city: z.string(),
    timezone: z.string(),
    location: z.object({
        latitute: z.number().optional(),
        longitude: z.number().optional()
    })
}));

export type AllFlightsOutput = z.infer<typeof allFlightsOutputSchema>;