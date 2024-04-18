---
title: SRT to VTT
---

# SRT to VTT Conversion

Stream supports the VTT caption/subtitle format, but it is easy to conver SRT
files:

<textarea class="input" id="srt-in">
1
00:02:17,440 --> 00:02:20,375
Senator, we're making
our <b>final</b> approach into {u}Coruscant{/u}.

2
00:02:20,476 --> 00:02:22,501
{b}Very good, {i}Lieutenant{/i}{/b}.

3
00:02:24,948 --> 00:02:26,247 X1:201 X2:516 Y1:397 Y2:423
<font color="#fbff1c">Whose side is time on?</font>

4
00:02:36,389 --> 00:02:39,290 X1:203 X2:511 Y1:359 Y2:431
v

5
00:02:41,000 --> 00:02:43,295
[speaks Icelandic]

6
00:02:45,000 --> 00:02:48,295
[man 3] <i>♪The admiral
begins his expedition♪</i>
</textarea>
<textarea class="output" id="vtt-out"></textarea>

<script>
const srtEl = document.getElementById('srt-in');
const vttEl = document.getElementById('vtt-out');

const srtToVtt = async (input) => {
  return await fetch('{{< HUGO_API_HOST >}}/api/convertSRT', {
    method: 'POST',
    body: input,
  })
  .then(response => response.text());
};

srtEl.addEventListener('change', async (event) => {
  vttEl.value = await srtToVtt(event.target.value);
});

// Run once on example content
(async () => {vttEl.value = await srtToVtt(srtEl.value);})()
</script>

## Acknowledgements

- https://github.com/imshaikot/srt-webvtt
- https://www.webvtt.org/
- https://github.com/silviapfeiffer/silviapfeiffer.github.io/blob/master/index.html
- https://www.loc.gov/preservation/digital/formats/fdd/fdd000569.shtml?loclr=blogsig
- https://www.w3.org/TR/webvtt1/
- https://docs.lokalise.com/en/articles/5365539-subrip-srt#h_8a44b1b142
