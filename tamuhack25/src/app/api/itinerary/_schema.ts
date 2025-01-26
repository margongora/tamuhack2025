import { z } from 'zod'

export const TravelDestinationSchema = z.object({
    title: z.string(),
    description: z.string(),
    latitude: z.number(),
    longitude: z.number(),
    note: z.union([z.string(), z.null()])
})

export const TravelItinerarySchema = z.object({
    description: z.string(),
    destinations: z.array(TravelDestinationSchema)
})

export type TravelDestination = z.infer<typeof TravelDestinationSchema>

export type TravelItinerary = z.infer<typeof TravelItinerarySchema>