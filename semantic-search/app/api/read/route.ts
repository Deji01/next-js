import { indexName } from "@/utils/config";
import { queryPineconeVectorStoreAndQueryLLM } from "@/utils/utils";
import { Pinecone, PineconeClient } from "@pinecone-database/pinecone";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
const body = await req.json()
const client = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY || "",
    environment: process.env.PINECONE_ENVIRONMENT || ""
   });

const text = await queryPineconeVectorStoreAndQueryLLM(client, indexName, body)

return NextResponse.json({data: text})
}