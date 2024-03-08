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

  const skippable = searchParams.get('skippable') ? true : false;
  const preroll = searchParams.get('pre') ? true : false;
  const midroll = searchParams.get('mid') ?? false;
  const postroll = searchParams.get('post') ? true : false;

  // Make our ad skippable or not
  const adVast = `https://bframes.tsmith.com/api/ads/getVast${skippable ? '?skippable=true' : ''}`;


  // Collect the ad units we'll use
  const adUnits: string[] = [];

  const generateAdUnit = (url, time, label) => `
    <vmap:AdBreak timeOffset="${time}" breakType="linear" breakId="${label}">
    <vmap:AdSource id="${label}-ad-1" allowMultipleAds="false" followRedirects="true">
      <vmap:AdTagURI templateType="vast3">
        <![CDATA[${url}]]>
      </vmap:AdTagURI>
    </vmap:AdSource>
    </vmap:AdBreak>
  `;

  if (preroll) {
    adUnits.push(generateAdUnit(adVast, 'start', 'preroll'));
  }
  if (midroll !== false) {
    adUnits.push(generateAdUnit(adVast, midroll, 'mid'));
  }
  if (postroll) {
    adUnits.push(generateAdUnit(adVast, 'end', 'postroll'));
  }

  const vmapOutput =
`<?xml version="1.0" encoding="UTF-8"?>
<vmap:VMAP xmlns:vmap="http://www.iab.net/videosuite/vmap" version="1.0">
  ${adUnits.join('\n\n')}
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
