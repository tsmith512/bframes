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
{{< /raw >}}

Inspect it when the player pauses to get an array of `start` and `end` times
for segments of the video that that were watched. These can be visualized or
collected to monitor usage. Fiddle with the player above and see the watched
ranges populate in the progress bar.

{{< raw >}}
<script src="https://embed.cloudflarestream.com/embed/sdk.latest.js"></script>
<script>
  const player = Stream(document.getElementById('stream-player'));
  const watchedBar = document.getElementById('watched');

  player.addEventListener('pause', () => {
    // Clear out what's in there already
    watchedBar.innerHTML = '';

    // Loop through the specific range items
    for (const range of player.played.ranges) {
      const block = document.createElement('div');
      // Start time as a percentage of the video diration
      block.style.left = `${(range.start / player.duration) * 100}%`;

      // Duration remaining after end time, as a percentage of total duration
      block.style.right = `${100 - ((range.end / player.duration) * 100)}%`;

      watchedBar.appendChild(block);
    };
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
</style>
