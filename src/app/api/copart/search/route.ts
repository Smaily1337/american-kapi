import { searchCopart } from "@/lib/copart";
import { parseFilters } from "@/lib/filter";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const raw: Record<string, string> = {};
  url.searchParams.forEach((value, key) => {
    raw[key] = value;
  });
  const filters = parseFilters(raw);
  try {
    const result = await searchCopart(filters);
    return Response.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Copart error";
    return Response.json({ error: message }, { status: 502 });
  }
}
