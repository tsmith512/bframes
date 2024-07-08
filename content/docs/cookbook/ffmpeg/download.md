---
title: Downloading
---

# Downloading with FFMPEG

See _[Download Recording]({{< ref "/docs/cookbook/live/download-recording" >}})_ for more
on this.

## Download Audio Only from HLS

```
ffmpeg.exe -i "https://customer-CODE.cloudflarestream.com/VIDEO_ID/manifest/video.m3u8" -vn -acodec copy output.m4a
```

This will copy the audio as-is and skip the video (`-vn`). This isn't appropriate
for an HLS manifest with multiple audio tracks or if the audio and video lengths
are different.
