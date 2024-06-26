---
title: "Shaka Player"
---

# Shaka Player

{{< raw >}}
<script src="https://cdn.jsdelivr.net/npm/shaka-player@4.5.0/dist/shaka-player.compiled.min.js"></script>
<link href="https://cdn.jsdelivr.net/npm/shaka-player@4.5.0/dist/controls.min.css" rel="stylesheet">
<video id="video" controls></video>
<script>
  const manifestUri =
      'https://customer-igynxd2rwhmuoxw8.cloudflarestream.com/6fc1827b329cf8d79dbae8f661786235/manifest/video.m3u8';

  function initApp() {
    // Install built-in polyfills to patch browser incompatibilities.
    shaka.polyfill.installAll();

    // Check to see if the browser supports the basic APIs Shaka needs.
    if (shaka.Player.isBrowserSupported()) {
      // Everything looks good!
      initPlayer();
    } else {
      // This browser does not have the minimum set of APIs we need.
      console.error('Browser not supported!');
    }
  }

  async function initPlayer() {
    // Create a Player instance.
    const video = document.getElementById('video');
    const player = new shaka.Player(video);

    // Attach player to the window to make it easy to access in the JS console.
    window.player = player;

    // Listen for error events.
    player.addEventListener('error', onErrorEvent);

    // Try to load a manifest.
    // This is an asynchronous process.
    try {
      await player.load(manifestUri);
      // This runs if the asynchronous load is successful.
      console.log('The video has now been loaded!');
    } catch (e) {
      // onError is executed if the asynchronous load fails.
      onError(e);
    }
  }

  function onErrorEvent(event) {
    // Extract the shaka.util.Error object from the event.
    onError(event.detail);
  }

  function onError(error) {
    // Log the error.
    console.error('Error code', error.code, 'object', error);
  }

  document.addEventListener('DOMContentLoaded', initApp);
</script>
{{< /raw >}}
