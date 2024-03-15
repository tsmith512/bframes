---
title: Clipping
bookHidden: true
---

# Live Instant Clipping

## Start a Live Broadcast

{{< liveOnDemandControls >}}

{{< liveOnDemandPlayer >}}

## Get the Preview Manifest

Get the _video ID_ currently being played and request a short preview manifest.
This page [uses a Worker](https://github.com/tsmith512/bframes/blob/trunk/functions/api/liveOnDemand/status.ts)
to make two Stream API calls: one to confirm that the live input is connected
and a second to find the current recording.

<pre id="preview-manifest-url"></pre>
<button id="preview-manifest">Fetch Preview Manifest</button>
<script>
  document.getElementById('preview-manifest').addEventListener('click', async (e) => {
    e.preventDefault();
    const status = await fetch('/api/liveOnDemand/status');
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

{{< raw >}}
<script src="https://cdn.jsdelivr.net/npm/hls.js@1"></script>
<video controls id="preview-video"></video>
<br /><button id="preview-playback">Load Preview Video</button>
<br />Start time: <input type="number" id="preview-start" /> <button id="preview-time-capture">Get from Player</button>
<br />Clip duration: <input type="number" id="preview-duration" value="60" />
<br />Clip URL: <button id="preview-make-clip">Generate</button>
<pre id="clip-base-url"></pre>
<script>
  const video = document.getElementById('preview-video');
  // FIRST IDEA: MODIFY THE XHR OBJECT
  const xhrModify = (xhr, url) => {
    // @TODO: THIS NEVER EXECUTES...??
    xhr.loadend = function () {
      console.log(xhr);
      const x = xhr.getResponseHeader('clip-start-seconds');
      if (x) { console.log(x)}
      console.log(xhr.readyState);
    }
    // @TODO: THIS NEVER EXECUTES --> so req's aren't being aborted... either?
    xhr.abort = function () {
      console.log(xhr);
      const x = xhr.getResponseHeader('clip-start-seconds');
      if (x) { console.log(x)}
      console.log(xhr.readyState);
    }
    // @TODO: THIS FIRES FOR ALL MANIFEST/SEG REQS BUT READYSTATE IS ALWAYS 1...
    // AND NEVER ADVANCES...
    xhr.onreadystatechange = function () {
      console.log(xhr.readyState);
      if (xhr.readyState === xhr.HEADERS_RECEIVED) {
        console.log(url);
        console.log(xhr.status);
        const clipStart = xhr.getResponseHeader('clip-start-seconds');
        console.log(clipStart);
      }
    };
  };

  // SECOND IDEA: OVERRIDE THE PLAYLIST LOADER CLASS TO INSPECT IT ON SUCCESS
  class pLoader extends Hls.DefaultConfig.loader {
    constructor(config) {
      super(config);
      var load = this.load.bind(this);
      this.load = function (context, config, callbacks) {
        if (context.type == 'manifest') {
          var onSuccess = callbacks.onSuccess;
          callbacks.onSuccess = function (response, stats, context, networkDetails) {
            // @TODO: THIS IS NOT A RESPONSE OBJECT, THERE ARE NO HEADERS HERE
            console.log(response);
            console.log(context);
            console.log(networkDetails);
            // @TODO: ^^ This isn't in the default example from the docs, but it
            // is a fourth argument passed to this handler and it is the XHR
            // and it DOES advance to ReadyState 4...
            console.log(networkDetails.getResponseHeader('clip-start-seconds'))
            // @TODO: ^^ This does exist but is blocked from client-side usage
            // by CORS.
            onSuccess(response, stats, context);
          };
        }
        load(context, config, callbacks);
      };
    }
  }

  const hls = new Hls({
    xhrSetup: xhrModify,
    pLoader: pLoader,
  });

  const previewButton = document.getElementById('preview-playback');
  const previewTimeCapture = document.getElementById('preview-time-capture');
  const previewStart = document.getElementById('preview-start');
  const previewDuration = document.getElementById('preview-duration');
  const previewGenerateUrl = document.getElementById('preview-make-clip');
  const clipBaseUrl = document.getElementById('clip-base-url');

  previewButton.addEventListener('click', (e) => {
    e.preventDefault();
    if (window?.currentVideoUrl) {
      const videoSrc = window.currentVideoUrl + '/manifest/video.m3u8?duration=3m';
      previewButton.disabled = true;
      if (Hls.isSupported()) {
        hls.loadSource(videoSrc);
        hls.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = videoSrc;
      }
    } else {
      console.log('Fetch the preview manifest first');
    }
  });

  previewTimeCapture.addEventListener('click', (e) => {
    e.preventDefault();
    previewStart.value = Math.floor(video.currentTime);
  });

  previewGenerateUrl.addEventListener('click', (e) => {
    if (!previewStart.value) {
      clipBaseUrl.innerText = 'Need a start time';
      return;
    } else if (!previewDuration.value || parseInt(previewDuration.value) > 60) {
      clipBaseUrl.innerText = 'Need a preview duration set and no more than 60 seconds';
      return;
    } else if (!window.currentVideoUrl) {
      clipBaseUrl.innerText = 'Fetch preview manifest and start playback.';
      return;
    }
    const url = `${window.currentVideoUrl}/manifest/clip.m3u8?time=${previewStart.value}s&duration=${previewDuration.value}s`;

    clipBaseUrl.innerText = url;
  });

</script>
{{< /raw >}}
