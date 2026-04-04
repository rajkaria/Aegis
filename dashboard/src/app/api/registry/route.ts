import { NextResponse } from "next/server";
import { corsHeaders } from "@/lib/cors";

export const dynamic = "force-dynamic";

interface RegistryEntry {
  agentId: string;
  endpoint: string;
  price: string;
  token: string;
  description: string;
  baseUrl: string;
  registeredAt: string;
}

// In-memory registry seeded with demo services
let services: RegistryEntry[] = [
  { agentId: "data-miner", endpoint: "/scrape", price: "0.001", token: "SOL", description: "Web scraping service", baseUrl: "http://localhost:4001", registeredAt: new Date().toISOString() },
  { agentId: "analyst", endpoint: "/analyze", price: "0.005", token: "SOL", description: "AI-powered data analysis", baseUrl: "http://localhost:4002", registeredAt: new Date().toISOString() },
];

export async function OPTIONS() {
  return corsHeaders(new NextResponse(null, { status: 204 }));
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const query = url.searchParams.get("q");
  const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "50"), 100);
  const offset = parseInt(url.searchParams.get("offset") ?? "0");

  let results = services;
  if (query) {
    const q = query.toLowerCase();
    results = services.filter(s =>
      s.description.toLowerCase().includes(q) ||
      s.endpoint.toLowerCase().includes(q) ||
      s.agentId.toLowerCase().includes(q)
    );
  }

  const paginated = results.slice(offset, offset + limit);

  return corsHeaders(NextResponse.json({
    services: paginated,
    total: results.length,
    pagination: {
      total: results.length,
      limit,
      offset,
      hasMore: offset + limit < results.length,
    },
  }));
}

export async function POST(req: Request) {
  const body = await req.json() as Partial<RegistryEntry>;

  if (!body.agentId || !body.endpoint || !body.price || !body.baseUrl) {
    return corsHeaders(NextResponse.json({ error: "Missing required fields: agentId, endpoint, price, baseUrl" }, { status: 400 }));
  }

  services = services.filter(s => !(s.agentId === body.agentId && s.endpoint === body.endpoint));

  const entry: RegistryEntry = {
    agentId: body.agentId,
    endpoint: body.endpoint,
    price: body.price,
    token: body.token ?? "SOL",
    description: body.description ?? body.endpoint,
    baseUrl: body.baseUrl,
    registeredAt: new Date().toISOString(),
  };
  services.push(entry);

  return corsHeaders(NextResponse.json({ success: true, registered: entry }));
}
