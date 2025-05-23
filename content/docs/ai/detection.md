---
title: Content Detection
---

# Content Detection using Thumbnails API

Stream offers [Thumbnails](https://developers.cloudflare.com/stream/viewing-videos/displaying-thumbnails/) of videos that have been uploaded.

These thumbnails can be run through AI inference models in a Worker.

## Pick a Video

<form>
  <table>
    <tr>
      <th>Video ID</th>
      <td>
        <select id="source">
          <option value="1a4b351e369ffe3cd3956b601a531c57">Halloween (4 min)</option>
          <option value="b0a8b8df880936de8aa0533442accf82">Streaming Left 4 Dead 2 (1.2 hours)</option>
          <option value="30b87aa298d574589d2d4a3b784ace80">Conference report (9 min)</option>
          <option value="4d74d0d2cc215ec2a5b7a1f0f4813d19">Car shopping &amp; repair (33 min)</option>
          <option value="c552052c7e1e2adf94013dbb3a176596">Spark wire arc (1.4 min)</option>
        </select>
      </td>
    </tr>
    <tr>
      <th>Timestamp</th>
      <td>
        <input id="timestamp" type="text" value="5s" />
        <br /><em>Fomat: 1s, 5s, 3m</em>
      </td>
    </tr>
    <tr>
      <th></th>
      <td>
        <button id="go">Analyze</button>
        <br /><em>Currently no error handling if request is past video duration!</em>
      </td>
    </tr>
  </table>
</form>

## Samples

<p id="headline" style="font-weight:bold">Make a selection above.</p>
<img id="image" />
<p id="description" class="output"></p>
<pre id="content" class="output"></pre>

<script>
  const root = 'customer-igynxd2rwhmuoxw8.cloudflarestream.com';

  const source = document.getElementById('source');
  const timestamp = document.getElementById('timestamp');
  const go = document.getElementById('go');

  const headline = document.getElementById('headline');
  const image = document.getElementById('image');
  const description = document.getElementById('description');
  const content = document.getElementById('content');

  go.addEventListener('click', (e) => {
    e.preventDefault();

    const id = source.value;
    const time = timestamp.value;
    headline.innerText = `${id} at ${time}`;

    image.setAttribute('src', `https://${root}/${id}/thumbnails/thumbnail.jpg?time=${time}&height=720`);

    description.innerText = 'Loading...';
    content.innerText = 'Loading...';

    // Describe the scene. Uses @cf/unum/uform-gen2-qwen-500m
    (async () => {
      const data = await fetch(`/api/ai/thumbnail?id=${id}&time=${time}&mode=describe`).then(r => r.json());
      description.innerText = data.description;
    })();

    // What is in this frame? Uses @cf/microsoft/resnet-50
    (async () => {
      const data = await fetch(`/api/ai/thumbnail?id=${id}&time=${time}&mode=detect`).then(r => r.json());
      content.innerText = JSON.stringify(data, null, 2);
    })();
  });
</script>

## Worker Code

This page sends a video ID and timestamp to a Pages Function, which pulls the
same thumbnail displayed in the sample and runs it through Workers AI:

``` js
// Grab the thumbnail from Stream
const url = `https://cloudflarestream.com/${id}/thumbnails/thumbnail.jpg?height=720&time=${time}`;
const image = await fetch(url);

if (!image.ok) {
  return new Response(`Stream error: ${image.statusText}`, { status: 500 });
}

let content;

// Send the image to the requested model, then return the response:
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
```
