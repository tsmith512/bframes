export async function onRequest(context) {
  // Contents of context object
  const {
    request, // same as existing Worker API
    env, // same as existing Worker API
    params, // if filename includes [id] or [[path]]
    waitUntil, // same as ctx.waitUntil in existing Worker API
    passThroughOnException, // same as ctx.passThroughOnException in existing Worker API
    next, // used for middleware or to fetch assets
    data, // arbitrary space for passing data between middlewares
  } = context;

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': '*',
    'Access-Control-Allow-Headers': '*',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: new Headers(corsHeaders),
    });
  }

  if (request.method !== 'POST') {
    return new Response('Method not allowed, must OPTIONS or POST', {
      status: 405,
    })
  }

  // @TODO: It would be better to check Stream's API to see if this is going
  // rather than ask the box that runs it...
  const response = await fetch(env.LIVE_ON_DEMAND_ENDPOINT);

  if (!response.ok) {
    return new Response('Upstream API error querying LiveOnDemand endpoint', {status: 500});
  }

  const state: {active: boolean} = await response.json();

  if (state.active) {
    return new Response('LiveOnDemand is already running.', {status: 200});
  }

  const start = await fetch(env.LIVE_ON_DEMAND_ENDPOINT, {
    method: 'POST',
    body: JSON.stringify({ active: true }),
  });

  if (start.ok) {
    return new Response('LiveOnDemand started', {status: 200});
  } else {
    return new Response('Could not start LiveOnDemand', {status: 500});
  }
}
