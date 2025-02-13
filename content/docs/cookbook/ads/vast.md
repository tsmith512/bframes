---
title: Using Ad Tags
---

# Using Ad Tags

The Cloudflare Stream player supports VAST and VMAP by passing the ad server's
URL as the `ad-url` query argument in the embed code.

{{< hint warning >}}
Ad blockers may prevent the Cloudflare Stream player from parsing VAST and VMAP
inventories.
{{< /hint >}}

# Digital Video Ad Serving Template (VAST)

A VAST describes a single ad, how it is loaded and played, where it leads, and
how it is measured. The following example plays a single pre-roll ad.

Notice the
`ad-url=https%3A%2F%2Fbframes.tsmith.com%2Fapi%2Fads%2FgetVast%3Fskippable%3Dtrue` at the end of the `src` attribute.

{{< raw >}}
<div style="position: relative; padding-top: 56.25%;">
  <iframe
    src="https://customer-igynxd2rwhmuoxw8.cloudflarestream.com/46c8b7f480d410840758c1cb14a72e47/iframe?poster=https%3A%2F%2Fcustomer-igynxd2rwhmuoxw8.cloudflarestream.com%2F46c8b7f480d410840758c1cb14a72e47%2Fthumbnails%2Fthumbnail.jpg%3Ftime%3D%26height%3D600&ad-url=https%3A%2F%2Fbframes.tsmith.com%2Fapi%2Fads%2FgetVast%3Fskippable%3Dtrue"
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

## Video Multiple Ad Playlist (VMAP)

A VMAP describes multiple ads and how they will all be timed within the content.
Each individual ad unit described can be a VAST. This example plays skippable ads
at preroll, 15 seconds into the video content, and postroll. The VMAP manifest
refers to the same VAST ad unit used above.

Notice the
`ad-url=https%3A%2F%2Fbframes.tsmith.com%2Fapi%2Fads%2FgetVmap`... at the end of the `src` attribute.


{{< raw >}}
<div style="position: relative; padding-top: 56.25%;">
  <iframe
    src="https://customer-igynxd2rwhmuoxw8.cloudflarestream.com/46c8b7f480d410840758c1cb14a72e47/iframe?poster=https%3A%2F%2Fcustomer-igynxd2rwhmuoxw8.cloudflarestream.com%2F46c8b7f480d410840758c1cb14a72e47%2Fthumbnails%2Fthumbnail.jpg%3Ftime%3D%26height%3D600&ad-url=https%3A%2F%2Fbframes.tsmith.com%2Fapi%2Fads%2FgetVmap%3Fpre%3Dtrue%26mid%3D00%3A00%3A15%26post%3Dtrue%26skippable%3Dtrue"
    loading="lazy"
    style="border: none; position: absolute; top: 0; left: 0; height: 100%; width: 100%;"
    allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
    allowfullscreen="true"
    id="player"
  ></iframe>
</div>
{{< / raw >}}
