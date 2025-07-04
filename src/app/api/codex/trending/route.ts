import { NextResponse } from "next/server";
import { Codex } from "@codex-data/sdk";

const apiKey = process.env.NEXT_PRIVATE_CODEX_API_KEY as string;

export async function GET(request: Request) {
    try {
        // Check if API key is provided
        if (!apiKey) {
            return NextResponse.json(
                { error: 'API key not configured' },
                { status: 500 }
            );
        }

        console.log(request.headers.get('Authorization'));
        
        // Initialize SDK within the function to avoid build-time issues
        const sdk = new Codex(apiKey);
        
        const response = await sdk.queries.token({
            input: {
                address: "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c",
                networkId: 56,
            },
        });

        return NextResponse.json(response);

    } catch (error) {
        console.error('Error fetching trending tokens:', error);
        return NextResponse.json(
            {
                error: 'Failed to fetch trending tokens',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
