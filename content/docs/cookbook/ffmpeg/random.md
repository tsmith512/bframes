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
