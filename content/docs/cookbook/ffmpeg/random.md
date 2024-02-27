---
title: Random Snippets
---

# Random FFMPEG Snippets

## Advanced Webcam Settings for Windows

```
.\ffmpeg.exe -f dshow -show_video_device_dialog true -i video="Brio 101"
```

Use this to open a camera settings panel that will allow manual config of webcam
exposure settings. Helps if you sit in front of a window and the auto-exposure
swings a lot. Replace the camera model name with whatever yours is called.

## Combine Separate Audio and Video

```
ffmpeg.exe -i .\VIDEO.MOV -i .\AUDIO.mp3 -map 0:v
 -map 1:a -t 66 -c:v libx264 -c:a aac output.mp4
```

The `-t` flag will set a duration on the output; set it to the lesser of either
input stream.

## Text Overlay on a Video

_Building on the above_ to bring in separate audio and video, with an overlay. This
produced (and credited!) the "piano over the entropy mobile" video in use on some
example pages in this repo.

```
ffmpeg.exe -i .\DSC_2741.MOV `
-i .\723975__universfield__smooth-piano-for-documentaries.mp3 `
-filter_complex "[0:v]drawtext='fontfile=/Windows/Fonts/ARIALNB.TTF:text=Audio\: Smooth Piano for Documentaries by UNIVERSFIELD on freesound.org:fontcolor=white:fontsize=32:x=(w-text_w):y=(h-text_h)'[out]"  `
-map '[out]:v' -map 1:a -t 66 `
-c:v libx264 -c:a aac `
mobile-overlay.mp4
```

I had trouble with this command exiting without producing output. Check that the
`fontfile` you reference exists and that you quote the right parts of your filter
`-filter_complex "[input]drawtext='...:its options, dont quote text but\: escape colons:...'[output]"`
