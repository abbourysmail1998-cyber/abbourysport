import { NextResponse } from "next/server";
import { db } from "@/db";
import { leagues } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const allLeagues = await db.select().from(leagues).orderBy(leagues.order);
    return NextResponse.json(allLeagues);
  } catch (error) {
    console.error("Error fetching leagues:", error);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const [league] = await db.insert(leagues).values(body).returning();
    return NextResponse.json(league);
  } catch (error) {
    console.error("Error creating league:", error);
    return NextResponse.json({ error: "Failed to create league" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...data } = body;
    const [updated] = await db.update(leagues).set(data).where(eq(leagues.id, id)).returning();
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating league:", error);
    return NextResponse.json({ error: "Failed to update league" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = Number(searchParams.get("id"));
    await db.delete(leagues).where(eq(leagues.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting league:", error);
    return NextResponse.json({ error: "Failed to delete league" }, { status: 500 });
  }
}
