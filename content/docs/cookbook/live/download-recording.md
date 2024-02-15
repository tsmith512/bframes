---
title: Download Recordings
---

# Downloading Recordings of Broadcasts

## Stitch a long recording into a file locally

{{< hint danger >}}
This is a billable operation and counts as minutes of video delivered.
{{</hint>}}

Long-running Live broadcasts can be replayed via HLS/DASH, but may not be available
as an MP4 Download directly. However, those manifests can be used to "stitch"
together the MP4 locally. Both [FFMPEG]({{< ref "/docs/cookbook/ffmpeg/download" >}})
and [YT-DLP](https://github.com/yt-dlp/yt-dlp) will do this. YT-DLP is a little
more friendly and has built in Stream support.

```
yt-dlp -N 40 https://customer-<CODE>.cloudflarestream.com/<VIDEO_ID>/manifest/video.m3u8
```

The `-N` option enables parallel segment downloads to process faster.
