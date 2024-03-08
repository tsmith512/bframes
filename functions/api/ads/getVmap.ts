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

  const { searchParams } = new URL(request.url);

  const adVast = `https://bframes.tsmith.com/api/ads/getVast?skippable=true`;

  const vmapOutput =
`<?xml version="1.0" encoding="UTF-8"?>
<vmap:VMAP xmlns:vmap="http://www.iab.net/videosuite/vmap" version="1.0">
  <vmap:AdBreak timeOffset="start" breakType="linear" breakId="preroll">
  <vmap:AdSource id="preroll-ad-1" allowMultipleAds="false" followRedirects="true">
    <vmap:AdTagURI templateType="vast3">
      <![CDATA[${adVast}]]>
    </vmap:AdTagURI>
  </vmap:AdSource>
  </vmap:AdBreak>

  <vmap:AdBreak timeOffset="00:00:15" breakType="linear" breakId="midroll">
  <vmap:AdSource id="midroll-ad-1" allowMultipleAds="false" followRedirects="true">
    <vmap:AdTagURI templateType="vast3">
      <![CDATA[${adVast}]]>
    </vmap:AdTagURI>
  </vmap:AdSource>
  </vmap:AdBreak>

  <vmap:AdBreak timeOffset="end" breakType="linear" breakId="postroll">
  <vmap:AdSource id="postroll-ad-1" allowMultipleAds="false" followRedirects="true">
    <vmap:AdTagURI templateType="vast3">
      <![CDATA[${adVast}]]>
    </vmap:AdTagURI>
  </vmap:AdSource>
  </vmap:AdBreak>
</vmap:VMAP>
`;

  return new Response(vmapOutput, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'max-age=0, no-cache, must-revalidate',
      ...corsHeaders
    },
  });
}
