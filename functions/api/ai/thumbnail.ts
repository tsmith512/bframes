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
    'Access-Control-Allow-Origin': request?.headers.get('origin') ?? '*',
    'Access-Control-Allow-Methods': '*',
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Allow-Credentials': 'true',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: new Headers(corsHeaders),
    });
  }

  const { searchParams } = new URL(request.url);

  const id = searchParams.get('id');
  const time = searchParams.get('time');
  const mode = searchParams.get('mode');

  if (id === null || time === null || mode === null) {
    return new Response('id, time, mode parameters all required', { status: 400 });
  }

  const url = `https://cloudflarestream.com/${id}/thumbnails/thumbnail.jpg?height=720&time=${time}`;

  const image = await fetch(url);

  if (!image.ok) {
    return new Response(`Stream error: ${image.statusText}`, { status: 500 });
  }

  let content;

  switch (mode) {
    case "detect":
      content = await env.AI.run(
        "@cf/microsoft/resnet-50",
        {
          image: [... new Uint8Array(await image.arrayBuffer()) ],
        }
      );
      break;

    case "describe":
      content = await env.AI.run(
        "@cf/unum/uform-gen2-qwen-500m",
        {
          image: [... new Uint8Array(await image.arrayBuffer()) ],
          prompt: "Describe the setting and content of this image. If there are any people, describe what they are wearing.",
          max_tokens: 256,
        }
      );

      break;
  }

  return new Response(JSON.stringify(content, null, 2));
}
