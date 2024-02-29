---
title: VAST Custom Publishing
draft: true
---

# Publishing Custom Ads with VAST

<input type="checkbox" id="skippable" /> Skippable?
<br /><button id="generate">Generate</button>

<pre id="vast"></pre>

<script>
  const skippable = document.getElementById('skippable');

  document.getElementById('generate').addEventListener('click', (e) => {
    e.preventDefault();

    let vastURI = 'https://bframes.tsmith.com/api/vast/getVast?';

    if (skippable.checked) {
      vastURI += 'skippable=true';
    }

    fetch(vastURI)
    .then(async (r) => {
      const el = document.getElementById('vast');
      if (r.ok) {
        const xml = await r.text();
        vast.innerText = xml;
      } else {
        vast.innerText = `${r.status}: ${r.statusText}`;
      }
    });
  });
</script>

## References

- [Digital Video Ad Serving Template (VAST) Spec](https://iabtechlab.com/standards/vast/), IAB
- [Build your own VAST 3.0 response XML](https://aws.amazon.com/blogs/media/build-your-own-vast-3-0-response-xml-to-test-with-aws-elemental-mediatailor/), AWS
- [Create a custom VAST XML ad tag (Web Player)](https://docs.jwplayer.com/players/docs/create-a-custom-vast-xml-ad-tag), JWPlayer
- [Creating Your Own VAST 3.0 Response XML](https://www.broadpeak.io/creating-your-own-vast-3-0-response-xml/), Broadpeak
