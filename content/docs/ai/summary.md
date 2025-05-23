---
title: Caption Summary
---

# Caption Summaries

## Pick a Video

<form>
  <table>
    <tr>
      <th>Video</th>
      <td>
        <select id="source">
          <option value="0">Caption intro sample (15 seconds)</option>
          <option value="1">Spark plug (3 minutes)</option>
          <option value="2">BEER (7 minutes)</option>
          <option value="3">Car Shopping and Repair Diary (33 minutes)</option>
        </select>
      </td>
    </tr>
    <tr>
      <th></th>
      <td>
        <button id="go">Summarize</button>
      </td>
    </tr>
  </table>
</form>

## Samples

<p id="headline" style="font-weight:bold">Make a selection above.</p>

<div style="position: relative; padding-top: 56.25%;">
  <iframe
    src=""
    loading="lazy"
    style="border: none; position: absolute; top: 0; left: 0; height: 100%; width: 100%;"
    allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
    allowfullscreen="true"
  ></iframe>
</div>

### bart-whatever

<p id="bart" class="output"></p>

### llama-3.3-70b-instruct-fp8-fast

<p id="llama" class="output"></pre>

<script>
  const root = 'customer-igynxd2rwhmuoxw8.cloudflarestream.com';

  const source = document.getElementById('source');
  const go = document.getElementById('go');

  const headline = document.getElementById('headline');
  const bart = document.getElementById('bart');
  const llama = document.getElementById('llama');

  go.addEventListener('click', (e) => {
    e.preventDefault();

    const id = source.value;
    const streamId = [
      '541de0f2ce24dd64f849bfa961ba62b2',
      'c552052c7e1e2adf94013dbb3a176596',
      '21174bb695d2736e46ad3fbad3cb2723',
      '4d74d0d2cc215ec2a5b7a1f0f4813d19',
    ][id];

    document.querySelector('iframe').setAttribute('src', `https://${root}/${streamId}/iframe`);

    headline.innerText = `Video ${id} Summary`;

    // image.setAttribute('src', `https://${root}/${id}/thumbnails/thumbnail.jpg?time=${time}&height=720`);

    bart.innerText = 'Loading...';
    llama.innerText = 'Loading...';

    // Describe the scene. Uses @cf/unum/uform-gen2-qwen-500m
    (async () => {
      const data = await fetch(`/api/ai/summary?id=${id}&model=bart&mode=describe`).then(r => r.json());
      bart.innerText = data.summary;
    })();

    // What is in this frame? Uses @cf/microsoft/resnet-50
    (async () => {
      const data = await fetch(`/api/ai/summary?id=${id}&model=llama&mode=detect`).then(r => r.json());
      llama.innerText = data.response;
    })();
  });
</script>

## Worker Code

This page sends a video ID and timestamp to a Pages Function, which pulls the
same thumbnail displayed in the sample and runs it through Workers AI:

``` js

  const url = `https://cloudflarestream.com/${id}/thumbnails/thumbnail.jpg?height=720&time=${time}`;

  const image = await fetch(url);

  if (!image.ok) {
    return new Response(`Stream error: ${image.statusText}`, { status: 500 });
  }

  let content;

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
``
