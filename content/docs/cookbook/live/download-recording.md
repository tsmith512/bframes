---
title: Download Recordings
---

# Downloading Recordings of Broadcasts

## Stitch a long recording into a file locally

{{< hint danger >}}
This is a billable operation and counts as minutes of video delivered.
{{</hint>}}

Long-running Live broadcasts can be replayed via HLS/DASH, but may not be available
as an [MP4 Download](https://developers.cloudflare.com/stream/stream-live/download-stream-live-videos/)
directly. However, those manifests can be used to "stitch" together the MP4
locally. Both [FFMPEG]({{< ref "/docs/cookbook/ffmpeg/download" >}})
and [YT-DLP](https://github.com/yt-dlp/yt-dlp) will do this.

## Using YT-DLP for Simple Downloads

**YT-DLP** is more user-friendly, has built in Stream support, and can parallelize
the operation to make it much faster.

```
yt-dlp -N 40 https://customer-<CODE>.cloudflarestream.com/<VIDEO_ID>/watch
```

- The `-N` option enables parallel segment downloads to process faster.

## Using FFMPEG for Advanced Cases

**FFMPEG** can do this too, with options to modify or re-encode the video in the
process. On the other hand, it does _not_ fetch segments in parallel so these
operations can be much slower.

```
ffmpeg -i "https://customer-<CODE>.cloudflarestream.com/<VIDEO_ID>/manifest/video.m3u8" -acodec copy -vcodec copy output.mp4
```

**To download only part of a video**, provide a start time and duration. This is
a workaround to achieve long clips from live recordings.
_([Just need a short clip?]({{< ref clipping.md >}}))_

_Download ten minutes from a given manifest, starting thirty minutes in:_

```
# Fast - Stream Copy from DASH Manifest
ffmpeg -ss 00:30:00 -t 00:10:00 -i "https://customer-<CODE>.cloudflarestream.com/<VIDEO_ID>/manifest/video.mpd" -c copy output.mp4

# Precise - Transcoding from HLS Manifest
ffmpeg -i "https://customer-<CODE>.cloudflarestream.com/<VIDEO_ID>/manifest/video.m3u8" -ss 00:30:00 -t 00:10:00 -acodec aac -vcodec libx264 output.mp4
```

- Start time: `-ss HH:MM:SS` specifies how far to seek into the manifest before recording
- Duration: `-t HH:MM:SS` specifies how long the output should be

There are some gotchas when [Seeking with FFMPEG](http://trac.ffmpeg.org/wiki/Seeking).
Specifying the `-ss` seek before the input performs a much faster input seek.

FFMPEG seems to drop either the audio or video track when seeking and doing a
stream copy from the middle of an HLS manifest. Thus the two options:

1. Stream copy and input seek from the DASH manifest is much faster, but if the
   clip occurs in the middle of a GOP/keyframe interval, the initial frames
   could be corrupted until the next keyframe.
2. Output seek and transcoding from the HLS manifest is much slower, but ensures
   audio and video start simultaneously in a good state.

**To download only the audio** from a video, copy the audio but discard the video:

```
ffmpeg.exe -i "https://customer-CODE.cloudflarestream.com/VIDEO_ID/manifest/video.m3u8" -vn -acodec copy output.m4a
```

This will copy the audio as-is and skip the video (`-vn`). This isn't appropriate
for an HLS manifest with multiple audio tracks or if the audio and video lengths
are different.
