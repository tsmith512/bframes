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

  // const { searchParams } = new URL(request.url);

  // const id = searchParams.get('id');
  // const lang = searchParams.get('lang') ?? 'en';

  // if (id === null) {
  //   return new Response('id, lang parameters required', { status: 400 });
  // }

  const url = `https://customer-igynxd2rwhmuoxw8.cloudflarestream.com/c552052c7e1e2adf94013dbb3a176596/text/en.vtt?p=eyJ0eXBlIjoiZmlsZSIsInZpZGVvSUQiOiJjNTUyMDUyYzdlMWUyYWRmOTQwMTNkYmIzYTE3NjU5NiIsIm93bmVySUQiOjM0MjA5Mjc1LCJjcmVhdG9ySUQiOiJyb3V0ZW5vdGZvdW5kLmNvbSIsInRyYWNrIjoiNDI4Yjc5NWY2ZTQyNDNjZjZjMzk4ODA5MmMwY2IxZjMiLCJyZW5kaXRpb24iOiI4MDc5NzEyNjUiLCJtdXhpbmciOiI4NjIzMzA4MzkifQ&s=w7_Dj8KHwp49wr_Cim8PwrUyJVxrwqTDqsKdwqIyXHs5wo_CgsKdw6scQsKLwprDvAw`;

		const captions = await fetch(url).then(res => res.text(), res => `Could not fetch captions: ${res.status} ${res.statusText}`);

		const [meta, ...stack] = captions.split('\n\n');
		const plaintext = stack.reduce((acc, cue) => {
		  const [id, time, ...text] = cue.split('\n');
		  return acc.concat(' ', text.join(' '));
		}, '');

    // This wasn't a summary as much as a repetition of the first couple sentences.
    // const summary = await env.AI.run('@cf/facebook/bart-large-cnn', {
    //   input_text: plaintext,
    //   max_length: 512,
    // });

    const messages = [
      {role: 'system', content: 'Summarize this video transcript'},
      {role: 'user', content: plaintext},
    ];

    const summary = await env.AI.run("@cf/meta/llama-3.3-70b-instruct-fp8-fast",
      {
        messages,
        stream: false,
        max_tokens: 256,
      }
    );

  return new Response(JSON.stringify(summary, null, 2));
}
