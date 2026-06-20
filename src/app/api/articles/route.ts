import { NextResponse } from "next/server";
import { db } from "@/db";
import { articles } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const limit = searchParams.get("limit");

    if (id) {
      const [article] = await db.select().from(articles).where(eq(articles.id, Number(id)));
      return NextResponse.json(article);
    }

    const allArticles = await db.select().from(articles)
      .where(eq(articles.isPublished, true))
      .orderBy(desc(articles.publishedAt))
      .limit(limit ? Number(limit) : 100);
    return NextResponse.json(allArticles);
  } catch (error) {
    console.error("Error fetching articles:", error);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const [article] = await db.insert(articles).values(body).returning();
    return NextResponse.json(article);
  } catch (error) {
    console.error("Error creating article:", error);
    return NextResponse.json({ error: "Failed to create article" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...data } = body;
    const [updated] = await db.update(articles).set(data).where(eq(articles.id, id)).returning();
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating article:", error);
    return NextResponse.json({ error: "Failed to update article" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = Number(searchParams.get("id"));
    await db.delete(articles).where(eq(articles.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting article:", error);
    return NextResponse.json({ error: "Failed to delete article" }, { status: 500 });
  }
}
