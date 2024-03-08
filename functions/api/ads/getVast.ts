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

  const adVideo = `https://customer-igynxd2rwhmuoxw8.cloudflarestream.com/a81eb4ccd00a0d4e559a21f397692bef`;
  const skippable = searchParams.get('skippable') ? '00:00:10.000' : false;

  const vastOutput =
`<VAST version="3.0">
  <Ad>
    <InLine>
      <AdSystem>2.0</AdSystem>
      <AdTitle>Test Advertisement</AdTitle>
      <Impression/>
      <Creatives>
        <Creative>
          <Linear ${(skippable) ? ('skipoffset="' + skippable + '"') : ''}>
            <Duration>00:00:15</Duration>
            <TrackingEvents>
              <Tracking event="start">https://example.com/pixel.gif</Tracking>
              <Tracking event="firstQuartile">https://example.com/pixel.gif</Tracking>
              <Tracking event="midpoint">https://example.com/pixel.gif</Tracking>
              <Tracking event="thirdQuartile">https://example.com/pixel.gif</Tracking>
              <Tracking event="complete">https://example.com/pixel.gif</Tracking>
              <Tracking event="pause">https://example.com/pixel.gif</Tracking>
              <Tracking event="mute">https://example.com/pixel.gif</Tracking>
              <Tracking event="fullscreen">https://example.com/pixel.gif</Tracking>
            </TrackingEvents>
            <VideoClicks>
              <ClickThrough>https://tsmith.com/</ClickThrough>
              <ClickTracking>
                <![CDATA[https://example.com/pixel.gif?r=[REGULATIONS]&gdpr=[GDPRCONSENT]&pu=[PAGEURL]&da=[DEVICEUA]]]>
              </ClickTracking>
            </VideoClicks>
            <MediaFiles>
              <MediaFile delivery="progressive" type="video/mp4" width="1920" height="1080" scalable="true" maintainAspectRatio="true">
                <![CDATA[${adVideo}/downloads/default.mp4]]>
              </MediaFile>
              <MediaFile delivery="streaming" width="1920" height="1080" type="application/x-mpegURL" minBitrate="150" maxBitrate="300" scalable="true" maintainAspectRatio="true">
                <![CDATA[${adVideo}/manifest/video.m3u8]]>
              </MediaFile>
              <MediaFile delivery="streaming" width="1920" height="1080" type="application/dash+xml" minBitrate="150" maxBitrate="300" scalable="true" maintainAspectRatio="true">
                <![CDATA[${adVideo}/manifest/video.mpd]]>
              </MediaFile>
            </MediaFiles>
          </Linear>
        </Creative>
      </Creatives>
    </InLine>
  </Ad>
</VAST>`;

  return new Response(vastOutput, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'max-age=0, no-cache, must-revalidate',
      ...corsHeaders
    },
  });
}
