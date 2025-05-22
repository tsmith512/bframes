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

<h3 id="t1h"></h3>
<img id="t1i" />
<p id="t1d">Loading...</p>
<pre id="t1c">Loading...</pre>

<script>
  const t1t = '5s';
  document.getElementById('t1i').setAttribute('src', `https://${root}/${id}/thumbnails/thumbnail.jpg?time=${t1t}&height=720`);

  document.getElementById('t1h').innerText = `${id} at ${t1t}`;

  // What is in this thumbnail? Uses @cf/microsoft/resnet-50
  (async () => {
    const t1cData = await fetch(`/api/ai/thumbnail?id=${id}&time=${t1t}&mode=detect`).then(r => r.json());
    document.getElementById('t1c').innerText = JSON.stringify(t1cData, null, 2);
  })();

  // Describe the scene. Uses @cf/unum/uform-gen2-qwen-500m
  (async () => {
    const t1cData = await fetch(`/api/ai/thumbnail?id=${id}&time=${t1t}&mode=describe`).then(r => r.json());
    document.getElementById('t1d').innerText = t1cData.description;
  })();

</script>


<h3 id="t2h"></h3>
<img id="t2i" />
<p id="t2d">Loading...</p>
<pre id="t2c">Loading...</pre>

<script>
  const t2t = '45s';
  document.getElementById('t2i').setAttribute('src', `https://${root}/${id}/thumbnails/thumbnail.jpg?time=${t2t}&height=720`);

  document.getElementById('t2h').innerText = `${id} at ${t2t}`;

  // What is in this thumbnail? Uses @cf/microsoft/resnet-50
  (async () => {
    const t2cData = await fetch(`/api/ai/thumbnail?id=${id}&time=${t2t}&mode=detect`).then(r => r.json());
    document.getElementById('t2c').innerText = JSON.stringify(t2cData, null, 2);
  })();

  // Describe the scene. Uses @cf/unum/uform-gen2-qwen-500m
  (async () => {
    const t2cData = await fetch(`/api/ai/thumbnail?id=${id}&time=${t2t}&mode=describe`).then(r => r.json());
    document.getElementById('t2d').innerText = t2cData.description;
  })();

</script>
