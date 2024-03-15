---
title: VAST/VMAP Building
draft: false
---

# Publishing Custom Ads with VAST and VMAP

Here is a super rudimentary builder to create a VAST or VMAP payload with a
sample video ad. It shows how to use an HLS or DASH manifest as the `MediaFile`
component of a single VAST ad unit, then how to reference VAST units in a VMAP
playlist.

<form>
  <table>
    <tr>
      <th>
        <input type="radio" name="type" value="vast" checked /> VAST
      </th>
      <td>
        Single Ad
      </td>
    </tr>
    <tr>
      <th></th>
      <td>
        <input type="checkbox" name="vast-skippable" /> Skippable?
      </td>
    </tr>
    <tr>
      <th>
        <input type="radio" name="type" value="vmap" checked /> VMAP
      </th>
      <td>
        Multiple Ads
      </td>
    </tr>
    <tr>
      <th></th>
      <td>
        <input type="checkbox" name="vmap-skippable" /> Skippable?
      </td>
    </tr>
    <tr>
      <th></th>
      <td>
        <input type="checkbox" name="vmap-preroll" /> Preroll?
        <br /><input type="checkbox" name="vmap-postroll" /> Postroll?
      </td>
    </tr>
    </tr>
    <tr>
      <th></th>
      <td>
        <input type="checkbox" name="vmap-mid" /> During playback?
        <br />Start offset: <input type="text" name="vmap-mid-timing" placeholder="HH:MM:SS" pattern="\d{2}:\d{2}:\d{2}" />
      </td>
    </tr>
  </table>
</form>

<style>
  input:invalid {
    background-color: #FCC;
  }
</style>

<pre id="vast"></pre>

<script>
  const skippable = document.getElementById('skippable');

  const update = (e) => {
    e.preventDefault();

    const form = document.forms[0];
    console.log(form.elements);

    let adURI = ['https://bframes.tsmith.com/api/ads/'];

    switch (form.type.value) {
      case 'vast':
        adURI.push('getVast');
        if (form.elements['vast-skippable'].checked) {
          adURI.push('skippable=true');
        }
        break;
      case 'vmap':
        adURI.push('getVmap');
        if (form.elements['vmap-skippable'].checked) {
          adURI.push('skippable=true');
        }
        if (form.elements['vmap-preroll'].checked) {
          adURI.push('pre=true');
        }
        if (form.elements['vmap-postroll'].checked) {
          adURI.push('post=true');
        }
        if (form.elements['vmap-mid'].checked) {
          adURI.push('mid=' + encodeURIComponent(form.elements['vmap-mid-timing'].value));
        }
        break;
    }

    const finalAdURI = adURI[0] + adURI[1] + '?' + adURI.slice(2).join('&');

    fetch(finalAdURI)
    .then(async (r) => {
      const el = document.getElementById('vast');
      if (r.ok) {
        const xml = await r.text();
        vast.innerText = xml;
      } else {
        vast.innerText = `${r.status}: ${r.statusText}`;
      }
    });
  };

  document
    .querySelectorAll('input[type="radio"], input[type="checkbox"]')
    .forEach(e => e.addEventListener('change', update));

  update();

</script>

## References

- [Digital Video Ad Serving Template (VAST) Spec](https://iabtechlab.com/standards/vast/), IAB
- [Digital Video Multiple Ad Playlist (VMAP) Spec](https://iabtechlab.com/standards/video-multiple-ad-playlist-vmap/), IAB
- [Build your own VAST 3.0 response XML](https://aws.amazon.com/blogs/media/build-your-own-vast-3-0-response-xml-to-test-with-aws-elemental-mediatailor/), AWS
- [Create a custom VAST XML ad tag (Web Player)](https://docs.jwplayer.com/players/docs/create-a-custom-vast-xml-ad-tag), JWPlayer
- [Creating Your Own VAST 3.0 Response XML](https://www.broadpeak.io/creating-your-own-vast-3-0-response-xml/), Broadpeak
