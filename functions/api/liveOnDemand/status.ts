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

  const apiAuthHeaders = {
      'Authorization': `Bearer ${env.STREAM_API_TOKEN}`,
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: new Headers(corsHeaders),
    });
  }

  const inputUrl = `https://api.cloudflare.com/client/v4/accounts/${env.STREAM_ACCT_ID}/stream/live_inputs/${env.LIVE_ON_DEMAND_INPUT}`;
  const inputDetails = await fetch(inputUrl, { headers: apiAuthHeaders });

  if (!inputDetails.ok) {
    return new Response('Upstream API error when fetching input details', { status: 500 });
  }

  const inputState = await inputDetails.json();

  const recordingsUrl = `${inputUrl}/videos`;
  const recordingsDetails = await fetch(recordingsUrl, { headers: apiAuthHeaders });

  if (!recordingsDetails.ok) {
    return new Response('Upstream API error when fetching recordings history', { status: 500 });
  }

  const recordings = await recordingsDetails.json();

  const currentRecording = recordings.result.find(r => r.status.state === 'live-inprogress');

  const payload = {
    input: inputState.result.uid,
    state: inputState.result.status.current.state,
    stateSince: inputState.result.status.current.statusEnteredAt,
    current: currentRecording ? currentRecording.uid : false,
  }


  return new Response(JSON.stringify(payload), {
    headers: { 'content-type': 'application/json'}
  });

}
