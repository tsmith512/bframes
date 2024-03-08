---
title: Thumbnails
---

# Thumbnails API

Chck the [official docs](https://developers.cloudflare.com/stream/viewing-videos/displaying-thumbnails/)
for full usage notes, but you can get a static image from a video by loading from
`https://customer-CODE.cloudflarestream.com/VIDEO_ID/thumbnails/thumbnail.FORMAT?OPTIONS`
like this:

{{< raw >}}
<img src="https://customer-igynxd2rwhmuoxw8.cloudflarestream.com/46c8b7f480d410840758c1cb14a72e47/thumbnails/thumbnail.jpg?time=3s&height=240" />
{{< / raw >}}

It can be cropped:

{{< raw >}}
<img src="https://customer-igynxd2rwhmuoxw8.cloudflarestream.com/46c8b7f480d410840758c1cb14a72e47/thumbnails/thumbnail.jpg?time=3s&height=240&width=240&fit=crop" />
{{< / raw >}}

And even animated:

{{< raw >}}
<img src="https://customer-igynxd2rwhmuoxw8.cloudflarestream.com/46c8b7f480d410840758c1cb14a72e47/thumbnails/thumbnail.gif?time=3s&height=240&width=240&fit=crop&duration=5s" />
{{< / raw >}}

See the docs for more.

## Cloudflare Images

Using the Stream Thumbnails API as a source when using Cloudflare Images unlocks
[even more options](https://developers.cloudflare.com/images/transform-images/transform-via-url/#options).

Try using `https://YOUR_WEBSITE/cdn-cgi/image/CF_IMAGES_OPTIONS/STREAM_THUMBNAIL`,
but make sure to use an

<img id="sample-a" />
<pre id="sample-a-url"></pre>
<script>
  const stream_frame = 'https://customer-igynxd2rwhmuoxw8.cloudflarestream.com/46c8b7f480d410840758c1cb14a72e47/thumbnails/thumbnail.jpg?time=5s&height=720';
  const options = 'blur=25,contrast=2';
  const images_url = `https://bframes.tsmith.com/cdn-cgi/image/${options}/${encodeURIComponent(stream_frame)}`;
  document.getElementById('sample-a').src = images_url;
  document.getElementById('sample-a-url').innerText = images_url;
</script>
