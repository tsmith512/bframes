---
title: Content Detection
---

# Content Detection using Thumbnails API

Stream offers [Thumbnails](https://developers.cloudflare.com/stream/viewing-videos/displaying-thumbnails/) of videos that have been uploaded.

## Pick a Video

(TBD: Well, i'm hardcoding a test here.)

{{< raw >}}
<script>
  const root = 'customer-igynxd2rwhmuoxw8.cloudflarestream.com';
  const id = '1a4b351e369ffe3cd3956b601a531c57';
  const duration = 240; //seconds
</script>
{{< / raw >}}

## Sample Thumbnails

{{< raw >}}
<img id="t1i" />
<pre id="t1c">Loading...</pre>
<p id="t1d">Loading...</p>

<script>
  const t1t = '5s';
  document.getElementById('t1i').setAttribute('src', `https://${root}/${id}/thumbnails/thumbnail.jpg?time=${t1t}&height=720`);

  (async () => {
    const t1cData = await fetch(`/api/ai/thumbnail?id=${id}&time=${t1t}&mode=detect`).then(r => r.json());
    document.getElementById('t1c').innerText = t1cData;
  })();

  (async () => {
    const t1cData = await fetch(`/api/ai/thumbnail?id=${id}&time=${t1t}&mode=describe`).then(r => r.json());
    document.getElementById('t1d').innerText = t1cData.description;
  })();

</script>
{{< / raw >}}
