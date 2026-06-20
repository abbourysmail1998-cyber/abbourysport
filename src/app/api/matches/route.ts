import { NextResponse } from "next/server";
import { db } from "@/db";
import { matches } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const leagueId = searchParams.get("leagueId");

    let query = db.select().from(matches);

    const conditions = [];
    if (status) conditions.push(eq(matches.status, status));
    if (leagueId) conditions.push(eq(matches.leagueId, Number(leagueId)));

    const allMatches = conditions.length > 0
      ? await db.select().from(matches).where(and(...conditions))
      : await db.select().from(matches);

    return NextResponse.json(allMatches);
  } catch (error) {
    console.error("Error fetching matches:", error);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (body.matchDate) {
      body.matchDate = new Date(body.matchDate);
    }
    const [match] = await db.insert(matches).values(body).returning();
    return NextResponse.json(match);
  } catch (error) {
    console.error("Error creating match:", error);
    return NextResponse.json({ error: "Failed to create match" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...data } = body;
    if (data.matchDate) {
      data.matchDate = new Date(data.matchDate);
    }
    const [updated] = await db.update(matches).set(data).where(eq(matches.id, id)).returning();
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating match:", error);
    return NextResponse.json({ error: "Failed to update match" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = Number(searchParams.get("id"));
    await db.delete(matches).where(eq(matches.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting match:", error);
    return NextResponse.json({ error: "Failed to delete match" }, { status: 500 });
  }
}
