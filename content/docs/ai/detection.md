---
title: Content Detection
---

# Content Detection using Thumbnails API

Stream offers [Thumbnails](https://developers.cloudflare.com/stream/viewing-videos/displaying-thumbnails/) of videos that have been uploaded.

## Pick a Video

<form>
  <table>
    <tr>
      <th>Video ID</th>
      <td>
        <select id="source">
          <option value="1a4b351e369ffe3cd3956b601a531c57">Halloween drone &amp; timelapse</option>
          <option value="b0a8b8df880936de8aa0533442accf82">Streaming Left 4 Dead 2 multiplayer</option>
          <option value="30b87aa298d574589d2d4a3b784ace80">Conference report video diary</option>
          <option value="4d74d0d2cc215ec2a5b7a1f0f4813d19">Car shopping &amp; repair video diary</option>
        </select>
      </td>
    </tr>
    <tr>
      <th>Timestamp</th>
      <td>
        <input id="timestamp" type="text" value="5s" />
        <br /><em>Examples: 1s, 5s, 3m</em>
      </td>
    </tr>
    <tr>
      <th></th>
      <td>
        <button id="go">Analyze</button>
      </td>
    </tr>
  </table>
</form>

## Sample Thumbnails

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
