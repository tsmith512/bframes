---
title: Clipping
bookHidden: true
---

# Live Instant Clipping

## Start a Live Broadcast

{{< liveOnDemandControls >}}

{{< liveOnDemandPlayer >}}

_Playback can take up to a minute to start once requested,_ and this feature is
best demonstrated at least a few minutes into the broadcast.

## Get the Preview Manifest

Get the _video ID_ of the current broadcast and request a short preview manifest.
This page [uses a Worker](https://github.com/tsmith512/bframes/blob/trunk/functions/api/liveOnDemand/status.ts)
to make two Stream API calls:

1. Confirm that the live input is connected
2. Get the current video ID which will be used for the clip

<textarea class="output" id="preview-manifest-url" rows="4"></textarea>
<button id="preview-manifest">Fetch Preview Manifest</button>
<script>
  document.getElementById('preview-manifest').addEventListener('click', async (e) => {
    e.preventDefault();
    const status = await fetch('{{< HUGO_API_HOST >}}/api/liveOnDemand/status');
    if (status.ok) {
      const data = await status.json();
      if (data.state !== 'connected') {
        console.log('Live broadcast not currently running.');
        document.getElementById('preview-manifest-url').innerText =
          'Live broadcast not currently running / available.';
        return false;
      }
      console.log(`Live input ${data.input} recording to ${data.current}.`);
      // Stash this for the next script
      window.currentVideo = data.current;
      window.currentVideoUrl =
        `https://customer-igynxd2rwhmuoxw8.cloudflarestream.com/${data.current}`;
      document.getElementById('preview-manifest-url').innerText =
        `${window.currentVideoUrl}/manifest/video.m3u8?duration=3m`;
    }
  });
</script>

## Use Preview to Select Start and Duration

Lots of implementation options for this. Here's one way to do it: use HLS.js to
play the preview clip and let a user pick a start time and duration.

<script src="https://cdn.jsdelivr.net/npm/hls.js@1"></script>
<video controls id="preview-video"></video>

<table>
  <tr>
    <th><button id="preview-playback">Load Preview Video</button></th>
    <td>
      Play the preview manifest generated above.
    </td>
  </tr>
  <tr>
    <th>Preview Offset</th>
    <td>
      <input type="number" id="preview-offset" disabled />
      <br /><em>Seconds into the broadcast when the preview starts</em>
    </td>
  </tr>
  <tr>
    <th>Clip Start Time</th>
    <td>
      <input type="number" id="preview-start" />
      <button id="preview-time-capture">Get from Player</button>
      <br /><em>Seconds into the preview to start the clip</em>
    </td>
  </tr>
  <tr>
    <th>Clip Duration</th>
    <td>
      <input type="number" id="preview-duration" value="60" />
      <br /><em>Up to 60 seconds</em>
    </td>
  </tr>
  <tr>
    <th><button id="preview-make-clip">Generate Clip URL</button></th>
    <td>
      <textarea id="clip-base-url" rows="6" class="output"></textarea>
    </td>
  </tr>
</table>

<script>
  const previewButton = document.getElementById('preview-playback');
  const previewOffset = document.getElementById('preview-offset');
  const previewTimeCapture = document.getElementById('preview-time-capture');
  const previewStart = document.getElementById('preview-start');
  const previewDuration = document.getElementById('preview-duration');
  const previewGenerateUrl = document.getElementById('preview-make-clip');
  const clipBaseUrl = document.getElementById('clip-base-url');
</script>

{{< raw >}}
<script>
  const video = document.getElementById('preview-video');

  // Override the pLoader (playlist loader) to modify the handler for
  // receiving the manifest and grab the header there.
  class pLoader extends Hls.DefaultConfig.loader {
    constructor(config) {
      super(config);
      var load = this.load.bind(this);
      this.load = function (context, config, callbacks) {
        if (context.type == 'manifest') {
          var onSuccess = callbacks.onSuccess;
          // copy the existing onSuccess handler so we can fire it later.

          callbacks.onSuccess = function (response, stats, context, networkDetails) {
            // The fourth argument here is undocumented in HLS.js but contains
            // the response object for the manifest fetch, which gives us headers:

            window.currentPreviewStart =
              parseInt(networkDetails.getResponseHeader('clip-start-seconds'));
            // Save the start time of the preview manifest

            previewOffset.value = window.currentPreviewStart;
            // Put the value in our text field example

            onSuccess(response, stats, context);
            // And fire the exisint success handler.
          };
        }
        load(context, config, callbacks);
      };
    }
  }

  const hls = new Hls({
    pLoader: pLoader,
  });

  // Start playback of the preview manifest:
  previewButton.addEventListener('click', (e) => {
    e.preventDefault();
    if (window?.currentVideoUrl) {
      const videoSrc = window.currentVideoUrl + '/manifest/video.m3u8?duration=3m';
      if (Hls.isSupported()) {
        hls.loadSource(videoSrc);
        hls.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = videoSrc;
      }
    } else {
      alert('Fetch the preview manifest first');
    }
  });

  // Grab the time into the preview where the user is, fill in the form
  previewTimeCapture.addEventListener('click', (e) => {
    e.preventDefault();
    previewStart.value = Math.floor(video.currentTime);
  });

  // Generate the clip URL. We'll need the video ID, the offset of the preview
  // and the time into the preview where the user marked.
  previewGenerateUrl.addEventListener('click', (e) => {
    if (!previewStart.value) {
      alert('Need a start time');
      return;
    } else if (!previewDuration.value || parseInt(previewDuration.value) > 60) {
      alert('Need a preview duration set and no more than 60 seconds');
      return;
    } else if (!window.currentVideoUrl) {
      alert('Fetch preview manifest and start playback.');
      return;
    }

    window.clipUrl =
      `${window.currentVideoUrl}/manifest/clip.m3u8` +
      `?time=${parseInt(previewStart.value) + window.currentPreviewStart}s` +
      `&duration=${previewDuration.value}s`;

    clipBaseUrl.innerText = window.clipUrl;
  });
</script>
{{< /raw >}}

## Watch the Clip

{{< raw >}}
<video controls id="clip-video"></video>
<br /><button id="clip-start">Play Clip</button>

<script>
  const videoClip = document.getElementById('clip-video');

  const hlsClip = new Hls();

  document.getElementById('clip-start').addEventListener('click', (e) => {
    e.preventDefault();
    if (!window?.clipUrl) {
      alert('Generate a clip above first');
      return;
    }

    if (Hls.isSupported()) {
      hlsClip.loadSource(window.clipUrl);
      hlsClip.attachMedia(videoClip);
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      videoClip.src = window.clipUrl;
    }
  });
</script>
{{< /raw >}}

## Download the MP4

You can also download an MP4 of the clip.

<textarea class="output" id="clip-download-url" rows="4"></textarea>
<button id="clip-download-url-generate">Generate Download URL</button>

<p>
  <a id="clip-download-link" href="javascript:alert('Build a clip first.')">Download MP4</a>
</p>

{{< raw >}}
<script>
  document.getElementById('clip-download-url-generate').addEventListener('click', (e) => {
    e.preventDefault();
    if (!window?.clipUrl) {
      alert('Generate a clip above first');
      return;
    }

    const downloadUrl =
      `${window.currentVideoUrl}/clip.mp4` +
      `?time=${parseInt(previewStart.value) + window.currentPreviewStart}s` +
      `&duration=${previewDuration.value}s` +
      `&filename=clip-test-${previewDuration.value}s.mp4`;

    document.getElementById('clip-download-url').innerText = downloadUrl;
    document.getElementById('clip-download-link').href = downloadUrl;
  });
</script>
{{< / raw >}}

---

# Scratchwork

## Trouble Reading the Header

{{< hint danger >}}
Things that did not work:
{{< /hint >}}

- Using the `xhrSetup` property in `new Hls()` to add a callback to the loader's
  `onreadystatechange` event wherein we could read the header from the manifest
  request.
  - This didn't work because `onreadystatechange` was only ever called for
    `READY_STATE` of 0, and not again.
  - Similarly, the `loadend` and `abort` events were never fired either.

``` js
// DO NOT COPY. This was attempted but did not work.
const xhrModify = (xhr, url) => {
  // THIS NEVER EXECUTES
  xhr.loadend = function () {
    console.log(xhr);
  }
  // THIS NEVER EXECUTES
  xhr.abort = function () {
    console.log(xhr);
  }
  // THIS FIRES FOR ALL MANIFEST/SEG REQS BUT READYSTATE IS ALWAYS 1
  // AND NEVER ADVANCES...
  xhr.onreadystatechange = function () {
    if (xhr.readyState === xhr.HEADERS_RECEIVED) {
      console.log(url);
      console.log(xhr.status);
      const clipStart = xhr.getResponseHeader('clip-start-seconds');
      console.log(clipStart);
    }
  };
};

const hls = new Hls({
  xhrSetup: xhrModify,
});
```


- Using `fetch()` to load the manifest manually, which makes getting the header
  easy. Then using `response.blob()` and `URL.createObjectURL` to pass the fetched
  content directly to HLS.js
  - This didn't work because the manifest contains relaive links to ABR playlists
    and media segments. The `blob:` URL has a different host/path structure so
    all those subsequent requests were 404.

``` js
// DO NOT COPY. This was attempted but did not work.

const videoSrc = window.currentVideoUrl + '/manifest/video.m3u8?duration=3m';
const response = await fetch(videoSrc);

window.currentPreviewStart =
  parseInt(response.headers.get('clip-start-seconds'));
// Save the start time of the preview manifest

const manifestBlob = await response.blob();
const manifestBlobUrl = URL.createObjectURL(manifestBlob);
// THIS WORKS TO LOAD THE PRIMARY MANIFEST BUT BECAUSE THE ABR PLAYLISTS AND
// MEDIA SEGMENTS THEREIN ARE RELATIVE LINKS, NONE OF THEM LOAD.

if (Hls.isSupported()) {
  hls.loadSource(manifestBlobUrl);
  hls.attachMedia(video);
} else if (video.canPlayType('application/vnd.apple.mpegurl')) {
  video.src = manifestBlobUrl;
}
```
