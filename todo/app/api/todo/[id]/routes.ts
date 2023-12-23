import db from "@/utils/db"
import { NextResponse } from "next/server"

interface Params {
    [k: string]: string;
}

export const GET = async (request: Request, { params }: { params: Params }) => {
    const data = await db.todo.findUnique({ where: { id: params.id } })
    return NextResponse.json({ data })
}

export const DELETE = async (request: Request, { params }: { params: Params }) => {
    const todo = await db.todo.delete({ where: { id: params.id } })
    return NextResponse.json({ data: todo })
}