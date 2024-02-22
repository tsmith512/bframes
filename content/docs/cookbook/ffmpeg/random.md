---
title: Random Snippets
---

# Random FFMPEG Snippets

## Advanced Webcam Settings for Windows

``` powershell
.\ffmpeg.exe -f dshow -show_video_device_dialog true -i video="Brio 101"
```

Use this to open a camera settings panel that will allow manual config of webcam
exposure settings. Helps if you sit in front of a window and the auto-exposure
swings a lot. Replace the camera model name with whatever yours is called.

## Combine Separate Audio and Video

``` powershell
ffmpeg.exe -i .\VIDEO.MOV -i .\AUDIO.mp3 -map 0:v
 -map 1:a -t 66 -c:v libx264 -c:a aac output.mp4
```

The `-t` flag will set a duration on the output; set it to the lesser of either
input stream.
