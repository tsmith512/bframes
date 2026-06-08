---
title: Transformations
weight: 400
bookCollapseSection: true
---

# Transformations

Media Transformations brings the magic of Image Transformations to short-form
videos, allowing customers to dynamically manipulate and optimize video files
from their existing storage. Media Transforamtions is currently in beta.

See **[Media Transformations](https://developers.cloudflare.com/stream/transform-videos/)** on Cloudflare Developer Documentation.

{{< hint info >}}
Tutotials, notes, and workarounds here are offered as experimental suggestions.
Customer input and eventual feature pairity with Image Transformations will
shape the direction of the beta.
{{< / hint >}}

## Examples

This is an original HD video that weighs nearly 30MB:

<video controls>
  <source src="https://pub-9cf4bfca6e924401bd4ac87ca9174da6.r2.dev/aus-mobile.mp4" />
</video>

```
https://pub-9cf4bfca6e924401bd4ac87ca9174da6.r2.dev/aus-mobile.mp4
```

With a simple width adjustment, this file can be right-sized for this layout, resulting in an optimized video of less than 4MB:

<video controls>
  <source src="https://bframes.tsmith.net/cdn-cgi/media/width=740/https://pub-9cf4bfca6e924401bd4ac87ca9174da6.r2.dev/aus-mobile.mp4" />
</video>

```
https://bframes.tsmith.net/cdn-cgi/media/width=740/https://pub-9cf4bfca6e924401bd4ac87ca9174da6.r2.dev/aus-mobile.mp4
```
