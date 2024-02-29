---
title: Using VAST Tags
---

# VAST Tags Playback

The Stream Player supports VAST tags by passing the VAST URI as the `ad-url`
query argument in the embed code. See the
`ad-url=https%3A%2F%2Fbframes.tsmith.com%2Fapi%2Fvast%2FgetVast%3Fskippable%3Dtrue` at the end of the `src` attribute.

{{< raw >}}
<div style="position: relative; padding-top: 56.25%;">
  <iframe
    src="https://customer-igynxd2rwhmuoxw8.cloudflarestream.com/46c8b7f480d410840758c1cb14a72e47/iframe?poster=https%3A%2F%2Fcustomer-igynxd2rwhmuoxw8.cloudflarestream.com%2F46c8b7f480d410840758c1cb14a72e47%2Fthumbnails%2Fthumbnail.jpg%3Ftime%3D%26height%3D600&ad-url=https%3A%2F%2Fbframes.tsmith.com%2Fapi%2Fvast%2FgetVast%3Fskippable%3Dtrue"
    loading="lazy"
    style="border: none; position: absolute; top: 0; left: 0; height: 100%; width: 100%;"
    allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
    allowfullscreen="true"
    id="player"
  ></iframe>
</div>
{{< / raw >}}

This simple ad is a 15 second preroll with the option to skip at 10 seconds. The
ad will play when the user clicks play, but the poster image will show until then.
Clicking on the player while the ad is playing directs the user to the ad's
clickthrough page.
