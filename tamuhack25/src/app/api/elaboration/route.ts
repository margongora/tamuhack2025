import { NextRequest } from "next/server";

import { OpenAI } from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import { z } from "zod";
import { messagesInputSchema } from "./_schema";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";




const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
    const res = await request.json()

    const messages = messagesInputSchema.parse(res).messages as ChatCompletionMessageParam[];

    messages.unshift(
        { role: 'system', content: "You are a travel planning assistant. Answer questions to the best of your ability and provide as much detail as possible. Only use plaintext" }
    );

    const completion = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages,
    });

    const message = completion.choices[0]?.message.content;

    // return the new message
    return new Response(JSON.stringify(message));
}