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

  // THIS IS AN ARRAY INDEX NOT A VIDEO ID for this experiment
  const id = searchParams.get('id');

  const model = searchParams.get('model');

  if (id === null || model === null) {
    return new Response('id, model parameters required', { status: 400 });
  }

  const videos = [
    // Caption intro sample (15 seconds)
    'https://customer-igynxd2rwhmuoxw8.cloudflarestream.com/541de0f2ce24dd64f849bfa961ba62b2/text/en.vtt?p=eyJ0eXBlIjoiZmlsZSIsInZpZGVvSUQiOiI1NDFkZTBmMmNlMjRkZDY0Zjg0OWJmYTk2MWJhNjJiMiIsIm93bmVySUQiOjM0MjA5Mjc1LCJjcmVhdG9ySUQiOiJzdHJlYW0iLCJ0cmFjayI6IjUwMzUxNzYwMjI0YTE3NjI1NjRmMTgzYTE2ODYyZDJjIiwicmVuZGl0aW9uIjoiOTExMTM0OTQ2IiwibXV4aW5nIjoiOTY2MzQ0ODgxIn0&s=wrUxwoXDjcKRwr5kNsK2wopPBxPCnQ1ZBMOUw5XCgwl8NjTDgg4Ow5xmZMO6w5I',
    // Spark plug (3 minutes)
    'https://customer-igynxd2rwhmuoxw8.cloudflarestream.com/c552052c7e1e2adf94013dbb3a176596/text/en.vtt?p=eyJ0eXBlIjoiZmlsZSIsInZpZGVvSUQiOiJjNTUyMDUyYzdlMWUyYWRmOTQwMTNkYmIzYTE3NjU5NiIsIm93bmVySUQiOjM0MjA5Mjc1LCJjcmVhdG9ySUQiOiJyb3V0ZW5vdGZvdW5kLmNvbSIsInRyYWNrIjoiNDI4Yjc5NWY2ZTQyNDNjZjZjMzk4ODA5MmMwY2IxZjMiLCJyZW5kaXRpb24iOiI4MDc5NzEyNjUiLCJtdXhpbmciOiI4NjIzMzA4MzkifQ&s=w7_Dj8KHwp49wr_Cim8PwrUyJVxrwqTDqsKdwqIyXHs5wo_CgsKdw6scQsKLwprDvAw',
    // BEER (7 minutes)
    'https://customer-igynxd2rwhmuoxw8.cloudflarestream.com/21174bb695d2736e46ad3fbad3cb2723/text/en.vtt?p=eyJ0eXBlIjoiZmlsZSIsInZpZGVvSUQiOiIyMTE3NGJiNjk1ZDI3MzZlNDZhZDNmYmFkM2NiMjcyMyIsIm93bmVySUQiOjM0MjA5Mjc1LCJjcmVhdG9ySUQiOiJwZXJzb25hbCIsInRyYWNrIjoiYThkZmNlZDMyMDBmNDM2YWViZWVjOWY1OTY4NTRkMzIiLCJyZW5kaXRpb24iOiIxMDc2NDI5MjYxIiwibXV4aW5nIjoiMTEzMjgxODE2NiJ9&s=wrrCucO2w54zw5w8QMOWwpkXB8OFwpwJOWbDssOGenAkwpVlLSPDgE1GSsKtwpg',
    // TQ4 Diary (33 minutes)
    'https://customer-igynxd2rwhmuoxw8.cloudflarestream.com/4d74d0d2cc215ec2a5b7a1f0f4813d19/text/en.vtt?p=eyJ0eXBlIjoiZmlsZSIsInZpZGVvSUQiOiI0ZDc0ZDBkMmNjMjE1ZWMyYTViN2ExZjBmNDgxM2QxOSIsIm93bmVySUQiOjM0MjA5Mjc1LCJjcmVhdG9ySUQiOiJyb3V0ZW5vdGZvdW5kLmNvbSIsInRyYWNrIjoiZGY2NjlmMzc1NTE1OTJjZTAyN2UxZDhmMTI0NmQxMTQiLCJyZW5kaXRpb24iOiI1NzAwNTc0MjMiLCJtdXhpbmciOiI3NDQ0MzUyNzIifQ&s=WsKJNXA-w77DlMOUKR5hwpfChiHCllbDmVF9wqPCh8KqZMKrBFfCm8Okc0tnYg',
  ];

  const url = videos[parseInt(id)] ?? null;

  const captions = await fetch(url).then(res => res.text(), res => `Could not fetch captions: ${res.status} ${res.statusText}`);

  // Pull and concatenate the text portion of all the cues
  const [meta, ...stack] = captions.split('\n\n');
  const plaintext = stack.reduce((acc, cue) => {
    const [id, time, ...text] = cue.split('\n');
    return acc.concat(' ', text.join(' '));
  }, '');

  let summary;

  switch (model) {
    case "bart":
      summary = await env.AI.run('@cf/facebook/bart-large-cnn', {
        input_text: plaintext,
        max_length: 512,
      });
      break;
    case "llama":
      const messages = [
        {role: 'system', content: 'Summarize this video transcript'},
        {role: 'user', content: plaintext},
      ];

      summary = await env.AI.run("@cf/meta/llama-3.3-70b-instruct-fp8-fast",
        {
          messages,
          stream: false,
          max_tokens: 256,
        }
      );
      break;
  }

  return new Response(JSON.stringify(summary, null, 2));
}
