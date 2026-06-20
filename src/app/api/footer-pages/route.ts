import { NextResponse } from "next/server";
import { db } from "@/db";
import { footerPages } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");

    if (slug) {
      const [page] = await db.select().from(footerPages).where(eq(footerPages.slug, slug));
      return NextResponse.json(page);
    }
    const allPages = await db.select().from(footerPages);
    return NextResponse.json(allPages);
  } catch (error) {
    console.error("Error fetching footer pages:", error);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const [page] = await db.insert(footerPages).values(body).returning();
    return NextResponse.json(page);
  } catch (error) {
    console.error("Error creating footer page:", error);
    return NextResponse.json({ error: "Failed to create footer page" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...data } = body;
    const [updated] = await db.update(footerPages).set(data).where(eq(footerPages.id, id)).returning();
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating footer page:", error);
    return NextResponse.json({ error: "Failed to update footer page" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = Number(searchParams.get("id"));
    await db.delete(footerPages).where(eq(footerPages.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting footer page:", error);
    return NextResponse.json({ error: "Failed to delete footer page" }, { status: 500 });
  }
}
