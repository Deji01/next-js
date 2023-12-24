import { db } from "@vercel/postgres";

export const client = await db.connect();


