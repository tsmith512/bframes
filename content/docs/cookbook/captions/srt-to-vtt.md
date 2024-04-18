---
title: SRT to VTT
---

# SRT to VTT Conversion

Stream supports the VTT caption/subtitle format, but it is easy to conver SRT
files:

<textarea class="input" id="srt-in"></textarea>
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

srtEl.addEventListener('change', async (event) => {
  // Get input, trim leading/trailing whitepace, and remove carriage returns
  const srt = event.target.value.trim().replace(/\r+/g, '');

  // Split the cue stack
  const srtCues = srt.split('\n\n');

  const vttCues = srtCues.map(cue => convertCue(cue))
  vttEl.value = ['WEBVTT FILE', ...vttCues].join('\n\n');
});
</script>

## Acknowledgements

- https://github.com/imshaikot/srt-webvtt
- https://www.webvtt.org/
- https://github.com/silviapfeiffer/silviapfeiffer.github.io/blob/master/index.html
- https://www.loc.gov/preservation/digital/formats/fdd/fdd000569.shtml?loclr=blogsig
- https://www.w3.org/TR/webvtt1/
