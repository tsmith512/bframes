---
title: Signed URLs
---

# Signed URLs

{{< hint info >}}
Review the "[Secure Your Stream](https://developers.cloudflare.com/stream/viewing-videos/securing-your-stream/#option-2-generating-signed-tokens-without-calling-the-token-endpoint)"
page in Cloudflare Stream Developer Docs for full info.
{{< / hint >}}

Signed URLs are authenticated URLs to play protected videos.
They are one-off links generated _within your own application_ using a signing
key you can get from Stream.

## Overview

``` mermaid
  sequenceDiagram

  actor Admin
  actor User
  participant Worker as Worker/Server
  participant Stream

  Admin ->> Stream: Upload video
  Admin ->> Stream: Require Signed URL on video
  Admin ->> Stream: Request signing key
  Stream -->> Admin: Generate and return signing key

  Admin ->> Worker: Create App/Worker with signing key

  User ->>+ Worker: Request video
  Worker ->> Worker: Confirm access
  Worker -->>- User: Generate and return signed URL
  User ->> Stream: Fetch content with specific URL
  Stream -->> User: Allow video playback
```

Storing the signing key in a Worker and creating signed URLs _there_ eliminates
the need to make Cloudflare API calls each time and also prevents leaking the
signing key (or API tokens) to an end-user's computer.

## Demo

This video should not load:

<div style="position: relative; padding-top: 56.25%;">
  <iframe
    id="player_iframe"
    src="https://customer-igynxd2rwhmuoxw8.cloudflarestream.com/ce800be43a9772f4bb02f35b860fb516/iframe"
    loading="lazy"
    style="border: none; position: absolute; top: 0; left: 0; height: 100%; width: 100%;"
    allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
    allowfullscreen="true"
  ></iframe>
</div>

The video at `https://customer-igynxd2rwhmuoxw8.cloudflarestream.com/ce800be43a9772f4bb02f35b860fb516/iframe`
requires signed URLs to be viewed. Replacing that video ID in the URL with a signed
URL token will make it playable.

This form can send a Video ID to a Worker that will generate a signed URL for a
video using my signing key. Give it a try.

<div>
  <form>
    <p>Video ID:</p>
    <input type="text" id="video_id" value="ce800be43a9772f4bb02f35b860fb516" />
    <input type="submit" id="submit" value="Generate" />
    <p>Worker Results:</p>
    <pre id="output" style="word-wrap: break-word; overflow-x: hidden; white-space: break-spaces;"></pre>
    <p id="explainer"></p>
  </form>

  <script>
    document.getElementById('submit').addEventListener('click', async (e) => {
      e.preventDefault();

      const response = await fetch('/api/getSignedURL', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({video_id: document.getElementById('video_id').value}),
      });

      if (response.ok) {
        const output = await response.json();
        const newSrc = `https://customer-igynxd2rwhmuoxw8.cloudflarestream.com/${output.token}/iframe`;

        document.getElementById('player_iframe').src = newSrc;
        document.getElementById('output').innerText = `>> TOKEN:\n${output.token}\n\n>> NEW EMBED SOURCE:\n${newSrc}`;
        document.getElementById('explainer').innerText = `Player embed code has been updated with the signed token. Look at the player again, it should be working now.`;
      } else {
        document.getElementById('explainer').innerText = 'Could not get a signed token; this demo may be broken.';
      }

    });
  </script>
</div>

[Read the code.](https://github.com/tsmith512/bframes/blob/trunk/functions/api/getSignedURL.ts) It's a "Pages Function," but it's just a Worker script within
this repository.
