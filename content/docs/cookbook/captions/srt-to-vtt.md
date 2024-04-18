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

/**
 * @param utf8str
 * @returns string
 */
const toVTT = (utf8str) => utf8str
  .replace(/\{\\([ibu])\}/g, '</$1>')
  .replace(/\{\\([ibu])1\}/g, '<$1>')
  .replace(/\{([ibu])\}/g, '<$1>')
  .replace(/\{\/([ibu])\}/g, '</$1>')
  .replace(/(\d\d:\d\d:\d\d),(\d\d\d)/g, '$1.$2')
  .concat('\r\n\r\n');
/**
 * @param resource
 * @returns Promise<string>
 */
const toWebVTT = async (input) => {
  // if (!(FileReader)) {
  //   throw (new Error(`${moduleName}: No FileReader constructor found`));
  // }
  if (!TextDecoder) {
    throw (new Error(`${moduleName}: No TextDecoder constructor found`));
  }
  // if (!(resource instanceof Blob)) {
  //   throw new Error(`${moduleName}: Expecting resource to be a Blob but something else found.`);
  // }
  let text;
  const vttString = 'WEBVTT FILE\r\n\r\n'; // leading text
  try {
    text = vttString.concat(toVTT(srtEl.value));
  } catch (e) {
    // const buffer = await blobToBufferOrString(resource, 'buffer');
    const decode = new TextDecoder('utf-8').decode(input);
    text = vttString.concat(toVTT(decode));
  }
  return text;
};

srtEl.addEventListener('change', async (event) => {
  vttEl.value = await toWebVTT(event.target.value);
});
</script>
