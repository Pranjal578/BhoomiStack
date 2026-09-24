// Cloudflare Pages Function: Reverse Proxy for /api/* requests to backend
interface Env {
  BACKEND_URL?: string;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const backendBase = context.env.BACKEND_URL;

  // If BACKEND_URL is not set in Cloudflare Pages environment variables, return helpful configuration hint
  if (!backendBase) {
    return new Response(
      JSON.stringify({
        error: 'BACKEND_URL environment variable is not configured in Cloudflare Pages.',
        hint: 'Set BACKEND_URL in Cloudflare Pages Settings > Environment Variables (e.g., https://api.yourdomain.com or your Render/Tunnel URL).',
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  const incomingUrl = new URL(context.request.url);
  // Target URL keeps the same pathname and search params: e.g. /api/v1/parcels?limit=10
  const targetUrl = new URL(incomingUrl.pathname + incomingUrl.search, backendBase);

  const requestHeaders = new Headers(context.request.headers);
  requestHeaders.set('Host', new URL(backendBase).host);
  requestHeaders.set('X-Forwarded-Host', incomingUrl.host);
  requestHeaders.set('X-Forwarded-Proto', incomingUrl.protocol.replace(':', ''));

  const fetchOptions: RequestInit = {
    method: context.request.method,
    headers: requestHeaders,
    redirect: 'follow',
  };

  // Only pass body for non-GET/HEAD methods
  if (!['GET', 'HEAD'].includes(context.request.method)) {
    fetchOptions.body = context.request.body;
    // @ts-expect-error duplex required for streaming bodies in Cloudflare Workers / Node
    fetchOptions.duplex = 'half';
  }

  try {
    const upstreamResponse = await fetch(targetUrl.toString(), fetchOptions);
    const responseHeaders = new Headers(upstreamResponse.headers);

    // Ensure CORS headers are friendly if needed
    responseHeaders.set('Access-Control-Allow-Origin', '*');
    responseHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    responseHeaders.set('Access-Control-Allow-Headers', '*');

    return new Response(upstreamResponse.body, {
      status: upstreamResponse.status,
      statusText: upstreamResponse.statusText,
      headers: responseHeaders,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(
      JSON.stringify({
        error: 'Failed to reach backend service',
        targetUrl: targetUrl.toString(),
        details: message,
      }),
      {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
