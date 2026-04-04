import { NextResponse } from "next/server";

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

export async function GET(req: Request) {
  const url = new URL(req.url);
  const query = url.searchParams.get("q");

  let results = services;
  if (query) {
    const q = query.toLowerCase();
    results = services.filter(s =>
      s.description.toLowerCase().includes(q) ||
      s.endpoint.toLowerCase().includes(q) ||
      s.agentId.toLowerCase().includes(q)
    );
  }

  return NextResponse.json({ services: results, total: results.length });
}

export async function POST(req: Request) {
  const body = await req.json() as Partial<RegistryEntry>;

  if (!body.agentId || !body.endpoint || !body.price || !body.baseUrl) {
    return NextResponse.json({ error: "Missing required fields: agentId, endpoint, price, baseUrl" }, { status: 400 });
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

  return NextResponse.json({ success: true, registered: entry });
}
