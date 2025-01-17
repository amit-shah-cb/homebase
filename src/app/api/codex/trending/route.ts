import { NextResponse } from "next/server";
import { Codex } from "@codex-data/sdk";

const apiKey = process.env.NEXT_PRIVATE_CODEX_API_KEY as string;

const sdk = new Codex(apiKey);

export async function GET(request: Request) {
    try {
        console.log(request.headers.get('Authorization'));
        const response = await sdk.queries
            .token({
                input: {
                    address: "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c",
                    networkId: 56,
                },
            })


        const data = await response.token;
        return NextResponse.json(data);

    } catch (error) {
        console.error('Error fetching trending tokens:', error);
        return NextResponse.json(
            {
                error: 'Failed to fetch trending tokens'
            },
            { status: 500 }
        );
    }
}
