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

<pre id="data"></pre>

Using the RTMP key, open a websocket connection to this endpoint:

{{< raw >}}
<script>
const dataEl = document.getElementById('data');
const key = 'a85b21d55760d84181ceb577be4bc9ack168a3653a2f0394437b7c021cb198414';
const x = new WebSocket(`wss://live-status.videodelivery.net/websocket/source/${key}/status`);
x.addEventListener('message', (e) => {
  const data = JSON.parse(e.data)
  dataEl.innerText = JSON.stringify(data, null, 2);
});
</script>
{{< / raw >}}

## WIP

The top-level object will always contain a key with the live input ID. Some
messages will include keys for updates on live _output_ IDs, if defined to
observe their connection status.

- TBD `history` object
- Can we make this accessible using a non-broadcast secret?
- @TODO: Cycle this live input
