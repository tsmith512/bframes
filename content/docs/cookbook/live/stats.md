---
title: Input Stats
bookHidden: true
---

# Live Input Stats and Diagnostics

When a live input is connected and broadcasting, certain debug information is
available via a status websocket. First, let's get a broadcast running:

{{< liveOnDemandControls >}}

{{< liveOnDemandPlayer >}}

_Video playback may take up to 30 seconds to be available once started here._

## Connecting to the Debug Websocket

<pre id="data" />

Using the RTMP key, open a websocket connection to this endpoint:

{{< raw >}}
<script>
const dataEl = document.getElementById('data');
const key = 'c0b90bd2e507cd8b4666d4ff5417cbbak18ddc08c7ece443a6e1f0bb968f9138a';
const x = new WebSocket(`wss://live-status.videodelivery.net/websocket/source/${key}/status`);
x.addEventListener('message', (e) => {
  const data = JSON.parse(e.data)
  dataEl.innerText = JSON.stringify(data, null, 2);
});
</script>
{{< / raw >}}

## WIP

- What is the `history` object that occasionally appears here? It has a key that
  is neither the Input nor Video ID
- Can we remove that?
- Can we make this accessible by Input ID instead of RTMP key?
- @TODO: Cycle this live input
