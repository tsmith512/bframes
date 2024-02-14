---
title: Broadcast
weight: 5
---

# Broadcasting with FFMPEG

## Render a Clock as a Test Signal

``` powershell

.\ffmpeg.exe -re -f lavfi -i color=color=black:size=1280x720:r=30 `
  -f lavfi -i anullsrc=channel_layout=stereo:sample_rate=44100 `
  -vf 'drawtext=fontfile=/Windows/fonts/ARIALNB.TTF:fontsize=128:fontcolor=white:text="%{localtime}":x=(w-text_w)/2:y=(h-text_h)/2' `
  -codec:v libx264 -s:v 1920x1080 -codec:a aac -b:a 128k -f flv `
  rtmps://live.cloudflare.com:443/live/RTMPS_STREAM_KEY_HERE

```

If you get a `fontconfig` "file not found" error, confirm the `fontfile` path exists.
