---
title: Signed URLs
---

# Signed URLs

{{< hint info >}}
Review the "[Secure Your Stream](https://developers.cloudflare.com/stream/viewing-videos/securing-your-stream/#option-2-generating-signed-tokens-without-calling-the-token-endpoint)"
page in Cloudflare Stream Developer Docs for full info.
{{< / hint >}}

Signed URLs are a mechanism to use authenticated URLs for accessing video playback
and assets. They can be used to generate one-off links _within your own application_
to play protected content without making Cloudflare API calls for eache event.

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

This form can send a Video ID to a Worker that will create and return a signed URL
token on a video. Storing the key in a Worker and signing URLs there eliminates
the need to make Cloudflare API calls while also preventing leaking the signing
key to an end-user's computer.

Give it a try.

<div>
  <form>
    <p>Video ID:</p>
    <input type="text" id="video_id" value="ce800be43a9772f4bb02f35b860fb516" />
    <input type="submit" id="submit" value="Generate" />
    <p>Worker Results:</p>
    <pre id="output"></pre>
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
        document.getElementById('output').innerText = `Token: ${output.token}\n\nNew embed source: ${newSrc}`;
        document.getElementById('explainer').innerText = `Player embed code updated with the signed token. Look again at the player.`;
      } else {
        document.getElementById('explainer').innerText = 'Could not get a signed token; this demo may be broken.';
      }

    });
  </script>
</div>