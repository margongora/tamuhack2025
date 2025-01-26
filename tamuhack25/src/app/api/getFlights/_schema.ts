import { z } from 'zod';

export const allFlightsInputSchema = z.object({
    date: z.string(),
})

export type AllFlightsInput = z.infer<typeof allFlightsInputSchema>;

export const flightSchema = z.object({
    flightNumber: z.string(),
    origin: z.object({
        code: z.string(),
        city: z.string(),
        timezone: z.string(),
        location: z.object({
            latitude: z.number(),
            longitude: z.number()
        })
    }),
    destination: z.object({
        code: z.string(),
        city: z.string(),
        timezone: z.string(),
        location: z.object({
            latitude: z.number(),
            longitude: z.number()
        })
    }),
    distance: z.number(),
    duration: z.object({
        locale: z.string(),
        hours: z.number(),
        minutes: z.number()
    }),
    departureTime: z.string(),
    arrivalTime: z.string(),
    aircraft: z.object({
        model: z.string(),
        passengerCapacity: z.object({
            total: z.number(),
            main: z.number(),
            first: z.number(),
        }),
        speed: z.number(),
    }),
});

export type Flight = z.infer<typeof flightSchema>;

export const allFlightsOutputSchema = z.array(flightSchema);

export type AllFlightsOutput = z.infer<typeof allFlightsOutputSchema>;