import { getUsdPln } from "@/lib/nbp";

export async function GET() {
  const data = await getUsdPln();
  return Response.json(data);
}
