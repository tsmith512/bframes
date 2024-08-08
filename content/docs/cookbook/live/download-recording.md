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
ffmpeg -i "https://customer-<CODE>.cloudflarestream.com/<VIDEO_ID>/manifest/video.m3u8" -ss 00:30:00 -t 00:10:00 -acodec aac -vcodec libx264 output.mp4
```

- Start time: `-ss HH:MM:SS` specifies how far to seek into the manifest before recording
- Duration: `-t HH:MM:SS` specifies how long the output should be

There are some gotchas when [Seeking with FFMPEG](http://trac.ffmpeg.org/wiki/Seeking).
Specifying the `-ss` seek before the input performs a much faster input seek, but
seems to cause either the audio or video track to be discarded from the output.
Instead, this demo specifies the seek on the _output_ side, which is slower (input
still has to be processed), but it retains both tracks.

_Also,_ when doing a simple `-c copy` stream copy, I kept losing either audio or
video when pulling from HLS. Further, if the timestamp was not a keyframe
boundary, it led to audio starting before the video. To retain both tracks,
ensure audio and video start at the same time, and support splitting a GOP, I
had to transcode. This is a slow operation, unfortunately. I'll keep testing.

**To download only the audio** from a video, copy the audio but discard the video:

```
ffmpeg.exe -i "https://customer-CODE.cloudflarestream.com/VIDEO_ID/manifest/video.m3u8" -vn -acodec copy output.m4a
```

This will copy the audio as-is and skip the video (`-vn`). This isn't appropriate
for an HLS manifest with multiple audio tracks or if the audio and video lengths
are different.
