---
title: Time Ranges
---

# Time Ranges

The [Player API](https://developers.cloudflare.com/stream/viewing-videos/using-the-stream-player/using-the-player-api/)
exposes a `played` property of `TimeRanges` on the `Player` object.
It tracks what pieces of a video have been watched within a session.

{{< raw >}}
<div style="position: relative; padding-top: 56.25%;">
  <iframe
    src="https://customer-igynxd2rwhmuoxw8.cloudflarestream.com/46c8b7f480d410840758c1cb14a72e47/iframe?poster=https%3A%2F%2Fcustomer-igynxd2rwhmuoxw8.cloudflarestream.com%2F46c8b7f480d410840758c1cb14a72e47%2Fthumbnails%2Fthumbnail.jpg%3Ftime%3D%26height%3D600"
    loading="lazy"
    style="border: none; position: absolute; top: 0; left: 0; height: 100%; width: 100%;"
    allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
    allowfullscreen="true"
    id="stream-player"
  ></iframe>
</div>

<div id="watched"></div>

<div id="completed">Watched fully? <span id="completed-yesno">Not yet.</span></div>
{{< /raw >}}

Inspect its `length` property to see how many parts have been watched. The
`start()` and `end()` methods return the bounds of each watched piece. Segments
will be merged as they overlap. This can be visualized to monitor usage or
totaled to see if someone has watched an entire video. Fiddle with the player
above and see the watched ranges populate in the progress bar. Watch the whole
thing and the  This technique could be
implemented with any player that implements time ranges.

{{< hint info >}}
The `ranges` property included by the Stream Player is not a standard property
of the `TimeRange API`, which is why this example doesn't use it.
{{< / hint >}}

{{< raw >}}
<script src="https://embed.cloudflarestream.com/embed/sdk.latest.js"></script>
<script>
  const player = Stream(document.getElementById('stream-player'));
  const watchedBar = document.getElementById('watched');
  const yesno = document.getElementById('completed-yesno');

  player.addEventListener('timeupdate', () => {
    // Clear out what's in there already
    watchedBar.innerHTML = '';

    // Loop through the specific range items
    for (let i = 0; i < player.played.length; i++) {
      const block = document.createElement('div');
      // Start time as a percentage of the video diration
      block.style.left =
        `${(player.played.start(i) / player.duration) * 100}%`;

      // Duration remaining after end time, as a percentage of total duration
      block.style.right =
        `${100 - ((player.played.end(i) / player.duration) * 100)}%`;

      watchedBar.appendChild(block);
    };

    if (
      player.played.length === 1 && /* Is there only one watched piece? */
      player.played.end(0) - player.played.start(0) === player.duration
    ) {
      yesno.innerText = 'Yep!';
      yesno.classList.add('yes');
    }
  });
</script>
{{< /raw >}}

<style>
  #watched {
    position: relative;
    background: #eee;
    height: 2rem;
    width: 100%;
    margin: 2rem 0;
  }

  #watched div {
    position: absolute;
    background: #088288;
    height: 100%;
  }

  #completed-yesno {
    font-weight: bold;
  }

  #completed-yesno.yes {
    color: #11aa44;
  }
</style>
