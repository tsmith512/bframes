---
title: Frame-by-Frame
bookHidden: true
---
<!--
framecount f0d0daaf74f8e281b76db57070a955e6
ski 6e3cfe476a24ad9d2d74897f184134dd
better ski 7866395952ee227294a83ae70af23b43
-->

# Frame-by-Frame Navigation

Most web-based players do not have native support for navigating to frames by
index. However, Stream encoded videos have a consistent framerate, allowing
frames to be paged by their time. One simple way to achieve this:

{{< raw >}}
<div style="position: relative; padding-top: 56.25%;">
  <iframe
    src="https://customer-igynxd2rwhmuoxw8.cloudflarestream.com/7866395952ee227294a83ae70af23b43/iframe?preload=auto&poster=https%3A%2F%2Fcustomer-igynxd2rwhmuoxw8.cloudflarestream.com%2F7866395952ee227294a83ae70af23b43%2Fthumbnails%2Fthumbnail.jpg%3Ftime%3D%26height%3D600"
    loading="lazy"
    style="border: none; position: absolute; top: 0; left: 0; height: 100%; width: 100%;"
    allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
    allowfullscreen="true"
    id="player"
  ></iframe>
</div>

<script src="https://embed.cloudflarestream.com/embed/sdk.latest.js"></script>

<p>
  <button data-skip="-10">&larr; 10 Frames</button>
  <button data-skip="-1">Previous Frame</button>
  <button data-skip="1">Next Frame</button>
  <button data-skip="10">10 Frames &rarr;</button>
</p>

<script>
  const player = Stream(document.getElementById('player'));
  const fps = 30;

  document.querySelectorAll('button').forEach(el => el.addEventListener('click', (e) => {
    e.preventDefault();

    // What are we seeing now?
    const nowS = player.currentTime;
    const nowF = Math.floor(nowS * fps);

    // Apply the button's frame advance/backup
    const nextF = nowF + parseInt(e.target.dataset.skip);

    // Given next frame: divide by framerate, add 10ms and round up --> new time
    const nextS = (Math.ceil((nextF / fps) * 1000) + 10) / 1000;

    // Reset player time and report
    player.currentTime = nextS;
    console.log(`Frame ${nowF} (${nowS}s) --> ${nextF} (${nextS}s)`);
  }));

  document.addEventListener('load', () => {
    player.play().then(player.pause);
  })
</script>
{{< / raw >}}
