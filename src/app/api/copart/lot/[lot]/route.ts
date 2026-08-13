import { getCopartLot } from "@/lib/copart";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(
  _request: Request,
  context: { params: Promise<{ lot: string }> },
) {
  const { lot } = await context.params;
  try {
    const car = await getCopartLot(lot);
    if (!car) return Response.json({ error: "Lot not found" }, { status: 404 });
    return Response.json(car);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Copart error";
    return Response.json({ error: message }, { status: 502 });
  }
}
