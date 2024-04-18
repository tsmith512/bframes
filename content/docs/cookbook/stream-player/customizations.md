---
title: Customizations
---

# Player Customizations

There are a few options for customizing the built-in player.

## Primary Color

Change color of the play button and seek bar:

{{< raw >}}
<div style="position: relative; padding-top: 56.25%;">
  <iframe
    src="https://customer-igynxd2rwhmuoxw8.cloudflarestream.com/46c8b7f480d410840758c1cb14a72e47/iframe?poster=https%3A%2F%2Fcustomer-igynxd2rwhmuoxw8.cloudflarestream.com%2F46c8b7f480d410840758c1cb14a72e47%2Fthumbnails%2Fthumbnail.jpg%3Ftime%3D%26height%3D600"
    loading="lazy"
    style="border: none; position: absolute; top: 0; left: 0; height: 100%; width: 100%;"
    allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
    allowfullscreen="true"
    id="player"
  ></iframe>
</div>

<p>
  Change player primary color: <input type="color" id="color" /> <button id="set">Set</button>
</p>

<script>
  document.getElementById('set').addEventListener('click', (e) => {
    e.preventDefault();
    const newColor = document.getElementById('color').value;
    const newSrc =
      `https://customer-igynxd2rwhmuoxw8.cloudflarestream.com/46c8b7f480d410840758c1cb14a72e47` +
      /* --> */ `/iframe?primaryColor=${encodeURIComponent(newColor)}` +
      `&poster=https%3A%2F%2Fcustomer-igynxd2rwhmuoxw8.cloudflarestream.com%2F46c8b7f480d410840758c1cb14a72e47%2Fthumbnails%2Fthumbnail.jpg%3Ftime%3D%26height%3D600`;

    document.getElementById('player').src = newSrc;
  });
</script>
{{< / raw >}}

## Video and Channel Details

[Extra details](https://developers.cloudflare.com/stream/edit-videos/player-enhancements/)
can be added to each video:

- Title (separate from the video name/title shown in the Dashboard)
- Logo
- Share Link
- Channel Link

Each of these are specified for the entropy mobile video example, shown above.
The Cloudflare Player displays these values by default: interact with the player
to see my signature (linked) and video title on the left, and a share link button
on the top right.

These values can also be fetched to display with other players or contexts. Look
for the `publicDetails` property of this object:

{{< raw >}}
<pre id='details-data'></pre>

<script>
  fetch('https://customer-igynxd2rwhmuoxw8.cloudflarestream.com/46c8b7f480d410840758c1cb14a72e47/metadata/playerEnhancementInfo.json')
  .then(async (response) => {
    if (response.ok) {
      // This object contains the properties
      const data = await response.json();
      // Re-stringify it for formatting
      document.getElementById('details-data').innerText = JSON.stringify(data, null, 2);
    }
  });
</script>
{{< / raw >}}
