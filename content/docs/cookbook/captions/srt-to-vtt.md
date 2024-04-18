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

const convertCue = (input) => {
  // EXAMPLES:

  // 1
  // 00:00:03,395 --> 00:00:06,728
  // Captain's Log, Stardate 44286.5.

  // 2
  // 00:00:06,765 --> 00:00:09,165
  // The <i>Enterprise</i> is conducting
  // a security survey

  let [number, time, ...content] = input.split('\n');

  // @TODO: Validate cue number?

  // @TODO: Validate timestamp?
  time = time
    // Milliseconds should be noted with a period, not comma
    .replace(/(\d\d:\d\d:\d\d),(\d\d\d)/g, '$1.$2')
    // @TODO: Remove coordinates for now
    .replace(/[XY][12]:.*/g, '')
  ;

  content = content
    // @TODO: Eliminate newlines (spec suggestion but sometimes breaks editorially desired?)
    .join(' ')
    // Remove HTML tags that aren't <i> <b> or <u>
    .replace(/<\/?[^ibu/][^>]*>/gi, '')
    // Convert {ibu} syntax to HTML tag
    .replace(/\{([ibu])\}/g, '<$1>')
    .replace(/\{\/([ibu])\}/g, '</$1>')
  ;

  return [number, time, content].join('\n');
};

const srtToVtt = (input) => {
  // Get input, trim leading/trailing whitepace, and remove carriage returns
  const srt = input.trim().replace(/\r+/g, '');

  // Split the cue stack
  const srtCues = srt.split('\n\n');

  const vttCues = srtCues.map(cue => convertCue(cue))
  return ['WEBVTT FILE', ...vttCues].join('\n\n');
};

srtEl.addEventListener('change', (event) => {
  vttEl.value = srtToVtt(event.target.value);
});

// Run once on example content
vttEl.value = srtToVtt(srtEl.value);
</script>

## Acknowledgements

- https://github.com/imshaikot/srt-webvtt
- https://www.webvtt.org/
- https://github.com/silviapfeiffer/silviapfeiffer.github.io/blob/master/index.html
- https://www.loc.gov/preservation/digital/formats/fdd/fdd000569.shtml?loclr=blogsig
- https://www.w3.org/TR/webvtt1/
- https://docs.lokalise.com/en/articles/5365539-subrip-srt#h_8a44b1b142
