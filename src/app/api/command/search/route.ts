import { auth } from "@/auth";
import { searchTasksForPalette } from "@/lib/tasks-data";
import { NextResponse, type NextRequest } from "next/server";

const MAX_Q = 120;

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const raw = req.nextUrl.searchParams.get("q") ?? "";
  const q = raw.trim();
  if (q.length > MAX_Q) {
    return NextResponse.json({ error: "Query too long" }, { status: 400 });
  }

  const tasks = await searchTasksForPalette(session.user.id, q, 8);
  return NextResponse.json({ tasks });
}
