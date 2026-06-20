import { NextResponse } from "next/server";
import { db } from "@/db";
import { siteSettings } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");
    const category = searchParams.get("category");

    if (key) {
      const [setting] = await db.select().from(siteSettings).where(eq(siteSettings.key, key));
      return NextResponse.json(setting);
    }
    if (category) {
      const settings = await db.select().from(siteSettings).where(eq(siteSettings.category, category));
      return NextResponse.json(settings);
    }
    const allSettings = await db.select().from(siteSettings);
    return NextResponse.json(allSettings);
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const [setting] = await db.insert(siteSettings).values(body).returning();
    return NextResponse.json(setting);
  } catch (error) {
    console.error("Error creating setting:", error);
    return NextResponse.json({ error: "Failed to create setting" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, key, ...data } = body;

    if (id) {
      const [updated] = await db.update(siteSettings).set(data).where(eq(siteSettings.id, id)).returning();
      return NextResponse.json(updated);
    }
    // Upsert by key
    const existing = await db.select().from(siteSettings).where(eq(siteSettings.key, key));
    if (existing.length > 0) {
      const [updated] = await db.update(siteSettings).set(data).where(eq(siteSettings.key, key)).returning();
      return NextResponse.json(updated);
    }
    const [created] = await db.insert(siteSettings).values({ key, ...data }).returning();
    return NextResponse.json(created);
  } catch (error) {
    console.error("Error updating setting:", error);
    return NextResponse.json({ error: "Failed to update setting" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = Number(searchParams.get("id"));
    await db.delete(siteSettings).where(eq(siteSettings.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting setting:", error);
    return NextResponse.json({ error: "Failed to delete setting" }, { status: 500 });
  }
}
