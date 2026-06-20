import { NextResponse } from "next/server";
import { db } from "@/db";
import { socialLinks } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const links = await db.select().from(socialLinks).orderBy(socialLinks.order);
    return NextResponse.json(links);
  } catch (error) {
    console.error("Error fetching social links:", error);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const [link] = await db.insert(socialLinks).values(body).returning();
    return NextResponse.json(link);
  } catch (error) {
    console.error("Error creating social link:", error);
    return NextResponse.json({ error: "Failed to create social link" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...data } = body;
    const [updated] = await db.update(socialLinks).set(data).where(eq(socialLinks.id, id)).returning();
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating social link:", error);
    return NextResponse.json({ error: "Failed to update social link" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = Number(searchParams.get("id"));
    await db.delete(socialLinks).where(eq(socialLinks.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting social link:", error);
    return NextResponse.json({ error: "Failed to delete social link" }, { status: 500 });
  }
}
