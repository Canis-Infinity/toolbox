const backendApiBaseUrl =
  process.env.BACKEND_API_BASE_URL?.replace(/\/$/, "") ??
  "https://api.iistw.com";
const toolUsageEndpoint = `${backendApiBaseUrl}/api/tool-usage`;

async function proxyToolUsage(requestInit?: RequestInit) {
  try {
    const response = await fetch(toolUsageEndpoint, {
      ...requestInit,
      cache: "no-store"
    });
    const body = await response.text();

    return new Response(body, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("Content-Type") ?? "application/json"
      }
    });
  } catch {
    return Response.json({ message: "Tool usage service unavailable" }, { status: 503 });
  }
}

export async function GET() {
  return proxyToolUsage();
}

export async function POST(request: Request) {
  return proxyToolUsage({
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: await request.text()
  });
}
