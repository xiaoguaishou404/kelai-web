import type { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const AI_BASE_URL =
  (process.env.AI_BASE_URL ?? process.env.DASHSCOPE_BASE_URL)?.replace(/\/+$/, "") ??
  "https://api.deepseek.com";
const AI_API_KEY = process.env.AI_API_KEY ?? process.env.DASHSCOPE_API_KEY;
const PAGE_AGENT_MODEL = process.env.PAGE_AGENT_MODEL ?? "deepseek-chat";
const CONFIGURED_MAX_STEPS = Number(process.env.PAGE_AGENT_MAX_STEPS);
const PAGE_AGENT_MAX_STEPS =
  Number.isFinite(CONFIGURED_MAX_STEPS) && CONFIGURED_MAX_STEPS >= 20
    ? Math.floor(CONFIGURED_MAX_STEPS)
    : Number.MAX_SAFE_INTEGER;
const MAX_REQUEST_BYTES = 1_000_000;

function errorResponse(message: string, status: number) {
  return Response.json({ error: { message, type: "ai_proxy_error" } }, { status });
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  if (path.join("/") !== "config") return errorResponse("接口不存在", 404);
  return Response.json(
    {
      configured: Boolean(AI_API_KEY),
      model: PAGE_AGENT_MODEL,
      maxSteps: PAGE_AGENT_MAX_STEPS,
    },
    { headers: { "cache-control": "no-store" } },
  );
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  if (path.join("/") !== "chat/completions") return errorResponse("接口不存在", 404);
  const origin = request.headers.get("origin");
  if (origin) {
    try {
      if (new URL(origin).host !== request.nextUrl.host) return errorResponse("不允许跨站调用 AI 服务", 403);
    } catch {
      return errorResponse("请求来源无效", 403);
    }
  }

  if (!AI_API_KEY) return errorResponse("AI 服务未配置，请在服务端设置 AI_API_KEY", 503);

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_REQUEST_BYTES) return errorResponse("请求内容过大", 413);

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return errorResponse("请求内容不是有效 JSON", 400);
  }

  delete body.api_key;
  delete body.apiKey;
  body.model = PAGE_AGENT_MODEL;

  try {
    const upstream = await fetch(`${AI_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AI_API_KEY}`,
        "Content-Type": "application/json",
        Accept: request.headers.get("accept") ?? "application/json",
      },
      body: JSON.stringify(body),
      signal: AbortSignal.any([request.signal, AbortSignal.timeout(60_000)]),
      cache: "no-store",
    });

    return new Response(upstream.body, {
      status: upstream.status,
      headers: {
        "Content-Type": upstream.headers.get("content-type") ?? "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    const timeout = error instanceof Error && error.name === "TimeoutError";
    return errorResponse(timeout ? "AI 服务响应超时" : "AI 服务暂时不可用", timeout ? 504 : 502);
  }
}
