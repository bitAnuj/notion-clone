interface Env {
  LIVEBLOCKS_SECRET_KEY: string;
  ASSETS: { fetch: typeof fetch };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/api/liveblocks-auth" && request.method === "POST") {
      return handleLiveblocksAuth(request, env);
    }

    // Everything else: serve the built website files
    return env.ASSETS.fetch(request);
  },
};

async function handleLiveblocksAuth(
  request: Request,
  env: Env
): Promise<Response> {
  let body: { userId?: string; userName?: string } = {};

  try {
    body = await request.json();
  } catch {
    // no body sent, that's fine, we'll use defaults
  }

  const userId = body.userId || crypto.randomUUID();
  const userName = body.userName || "Anonymous";

  const response = await fetch("https://api.liveblocks.io/v2/authorize-user", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.LIVEBLOCKS_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userId,
      userInfo: { name: userName },
      // Every page (a "room") this user opens, they can read and write.
      // This is intentionally permissive since anyone with your app's
      // link is treated as a collaborator for now.
      permissions: {
        "*": ["room:write"],
      },
    }),
  });

  const result = await response.text();

  return new Response(result, {
    status: response.status,
    headers: { "Content-Type": "application/json" },
  });
}
