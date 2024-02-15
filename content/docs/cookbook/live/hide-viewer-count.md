---
title: Hide Viewer Count
---

# Hiding the Live Viewer Count

We have a _temporary_ workaround to support this --- you can add a query argument
to the iframe URL to hide the viewer count. Add `?liveViewerCount=false` to the
end of the iframe URL to hide it.

{{< hint warning >}}
These data are still publicly available! In the future, we'll make this a
configuration change instead.
{{</ hint >}}


Example: `https://customer-igynxd2rwhmuoxw8.cloudflarestream.com/97cb28a3b77b4494b088bf4830886b14/iframe?liveViewerCount=false`
