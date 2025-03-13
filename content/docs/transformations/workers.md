---
title: Workers Support
weight: 1
---

# Media Transformations from Workers

{{< hint info >}}
Last updated 3/12
{{< / hint >}}

Currently, Media Transformations are not directly supported from Workers, either
using bindings, or via the `fetch()` API. However, a Worker _can_ return a fetch
to the Media Transformation service directly --- but it may need to do so via a
separate hostname.

## Workaround Overviews

Example scenario where a URL on the frontend cannot be changed:

- Example URL used in the `video src` attribute: <br/> `https://example.com/video/coffee.mp4?width=500`
- Location of the video storage: <br/> `https://pub-9cf4bfca6e924401bd4ac87ca9174da6.r2.dev/coffee.mp4`

Deploy a Worker to trigger based on that path and rewrite the URL:

``` js
  const url = new URL(request.url);

  // Where my originals live
  const storage = 'https://pub-9cf4bfca6e924401bd4ac87ca9174da6.r2.dev';

  // Remove the first slash and the "video" prefix
  const file = url.pathname.substring(1).split('/');
    // ['', 'video', 'coffee.mp4']
  file.shift();
    // ['coffee.mp4']

  // Get width from query param or use default
  const width = url.searchParams.get('width') ?? 400;

  // Reconstruct Media Transformations URL on a new hostname:
  const dest = `https://alt.example.com/cdn-cgi/media/width=${width}/${storage}/${file.join('/')}`;

  // Return the fetch() call
  return fetch(dest);
}
```
