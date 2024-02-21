---
title: "Chromecast"
---

# Chromecast Player

{{< hint info >}}
Due to Google Chromecast limitations, Chromecast does not support audio and video
delivered separately. To avoid potential issues with playback, we recommend using
DASH, instead of HLS, which is a Chromecast supported use case.
{{< /hint >}}

This code snippet added to the receiver app will allow the player to use either
the HLS or DASH manifest as needed on the web, but force a Chromecast to swap
to the DASH manifest on the fly.

``` js
// In Chromecast Receiver App, always swap to DASH
const playerManager = context.getPlayerManager();

playerManager.setMessageInterceptor(
  cast.framework.messages.MessageType.LOAD,
  (loadRequestData) => {
    if (loadRequestData.media.contentId) {
      loadRequestData.media.contentId = loadRequestData.media.contentId.replace(
        "m3u8",
        "mpd"
      );
    } else {
      loadRequestData.media.contentUrl =
        loadRequestData.media.contentUrl.replace("m3u8", "mpd");
    }
    loadRequestData.media.contentType = "application/dash+xml";

    return loadRequestData;
  }
);
```
