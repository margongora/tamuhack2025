import { z } from "zod";

export const messagesInputSchema = z.object({
    messages: z.array(z.object({
        role: z.string(),
        content: z.string(),
    })),
});