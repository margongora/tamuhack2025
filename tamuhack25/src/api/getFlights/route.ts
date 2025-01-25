import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 30;

export async function GET(req: NextRequest) {
    try {
        return NextResponse.json({
            
        });
    }
    catch (e) {
        console.error(e);
        return new Response("Internal Server Error", { status: 500 });
    }
}