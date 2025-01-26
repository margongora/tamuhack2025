import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
    server: {
        OPENAI_API_KEY: z.string(),
    },
    client: {
        NEXT_PUBlIC_GOOGLE_MAPS_API_KEY: z.string(),
    },
});