---
title: "HLS.js"
---

# HLS.js

{{< raw >}}
<script src="https://cdn.jsdelivr.net/npm/hls.js@1"></script>
<video controls id="video"></video>
<script>
  var video = document.getElementById('video');
  var videoSrc = 'https://customer-igynxd2rwhmuoxw8.cloudflarestream.com/6fc1827b329cf8d79dbae8f661786235/manifest/video.m3u8';
  if (Hls.isSupported()) {
    var hls = new Hls();
    hls.loadSource(videoSrc);
    hls.attachMedia(video);
  }
  // HLS.js is not supported on platforms that do not have Media Source
  // Extensions (MSE) enabled.
  //
  // When the browser has built-in HLS support (check using `canPlayType`),
  // we can provide an HLS manifest (i.e. .m3u8 URL) directly to the video
  // element through the `src` property. This is using the built-in support
  // of the plain video element, without using HLS.js.
  //
  // Note: it would be more normal to wait on the 'canplay' event below however
  // on Safari (where you are most likely to find built-in HLS support) the
  // video.src URL must be on the user-driven white-list before a 'canplay'
  // event will be emitted; the last video event that can be reliably
  // listened-for when the URL is not on the white-list is 'loadedmetadata'.
  else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = videoSrc;
  }
</script>
{{< /raw >}}

## Implementation Notes

### Media Retries

{{< hint warning >}}

HLS.js _will not_ attempt to retry downloading a segment in the case of an error,
even an error that may be transient or incendental.

{{< /hint >}}

See [HLS.js Docs on Fatal Error Recovery](https://github.com/video-dev/hls.js/blob/master/docs/API.md#fatal-error-recovery)
and their example player code's implementaiton of
[automatic error recovery](https://github.com/video-dev/hls.js/blob/master/demo/main.js#L1065-L1093).
In short, any interrupted segment download will cause HLS.js to _stop_ and require
the user to manually restart playback unless you do something like this in an
error handler:

``` js
hls.on(Hls.Events.ERROR, function (event, data) {
  if (data.fatal) {
    switch (data.type) {
      case Hls.ErrorTypes.MEDIA_ERROR:
        console.log('fatal media error encountered, try to recover');
        hls.recoverMediaError();
        break;
      case Hls.ErrorTypes.NETWORK_ERROR:
        console.error('fatal network error encountered', data);
        // In the case of a network error (timeout, failed download, etc)
        // Immediately trying to restart loading could cause loop loading.

        // Consider modifying loading policies to best fit your asset and network
        // conditions (manifestLoadPolicy, playlistLoadPolicy, fragLoadPolicy).

        // Consider using a counter or something to try recoverMediaError() on a
        // limited basis.
        break;
      default:
        // cannot recover
        hls.destroy();
        break;
    }
  }
});
```

The `recoverMediaError()` method is a shorthand to detatch and reattach the media
element. The [demo code](https://github.com/video-dev/hls.js/blob/master/demo/main.js#L1065-L1093)
also includes a `swapAudioCodec()` attempt to recover.

Taking the above example and adding in logic to make additional attempts using
the `swapAudioCodec()` method and/or by waiting 3 seconds.

``` typescript
hls.on(Hls.Events.ERROR, function(event, data) {
  if (data.fatal) {
    switch (data.type) {
      case Hls.ErrorTypes.MEDIA_ERROR:
        const now = performance.now();
        if (
          !recoverDecodingErrorDate ||
          now - recoverDecodingErrorDate > 3000
        ) {
          recoverDecodingErrorDate = now;
          hls.recoverMediaError();
        } else {
          if (
            !recoverSwapAudioCodecDate ||
            now - recoverSwapAudioCodecDate > 3000
          ) {
            recoverSwapAudioCodecDate = now;
            hls.swapAudioCodec();
            hls.recoverMediaError();
          }
        }
        break;

      // ...
```

Consider also checking/tweaking the [default `LoadPolicy` values](https://github.com/video-dev/hls.js/blob/master/docs/API.md#fragloadpolicy--keyloadpolicy--certloadpolicy--playlistloadpolicy--manifestloadpolicy--steeringmanifestloadpolicy) for your use-case.
