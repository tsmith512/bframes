---
title: Caption Converter
---

# SRT to VTT Cpations Converter

Stream supports the VTT caption/subtitle format, but it is easy to conver SRT
files. This utility can help.

## Converter

**SRT Input**

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

<button id="generate">Generate</button>

**Converted VTT Output**

<textarea class="output" id="vtt-out"></textarea>

<a id="save" class="hidden">Save to File</a>


<script>
const srtEl = document.getElementById('srt-in');
const vttEl = document.getElementById('vtt-out');
const genBtn = document.getElementById('generate');
const saveLink = document.getElementById('save');

const srtToVtt = async (input) => {
  return await fetch('{{< HUGO_API_HOST >}}/api/convertSRT', {
    method: 'POST',
    body: input,
  })
  .then(response => response.text());
};

genBtn.addEventListener('click', async (event) => {
  event.preventDefault();
  vttEl.value = await srtToVtt(srtEl.value);

  const outFile = new File([vttEl.value], 'subtitles.vtt', { type: 'text/vtt' });
  const fileUrl = window.URL.createObjectURL(outFile);
  saveLink.href = fileUrl;
  saveLink.download = 'subtitles.vtt';
  saveLink.classList.remove('hidden');
});

</script>

## Current Limitations

- No error reporting
- Cue coordinate markers are split out
- Bold, underline, and italic markers are retains, but `<font>` tags are removed

## Acknowledgements

There were a few different scripts floating around that each handled this job
differently. I combined several of them:

### Tools Adapted

- [imshaikot/srt-webvtt](https://github.com/imshaikot/srt-webvtt)
- [The converter](https://github.com/silviapfeiffer/silviapfeiffer.github.io/blob/master/index.html) on [webvtt.org](https://www.webvtt.org/)
- [faizath/srt2vtt.js](https://github.com/faizath/srt2vtt.js/blob/main/srt2vtt.js)

### Supporting Documentation

- https://www.loc.gov/preservation/digital/formats/fdd/fdd000569.shtml?loclr=blogsig
- https://www.w3.org/TR/webvtt1/
- https://docs.lokalise.com/en/articles/5365539-subrip-srt#h_8a44b1b142
