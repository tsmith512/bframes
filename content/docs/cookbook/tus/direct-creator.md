---
title: Direct Creator Uploads
---

# Using Direct Creator Uploads with TUS

{{< hint warning >}}
This is a working draft but needs some polish before being added to official docs.
{{< / hint >}}

Use [Direct Creator Uploads](https://developers.cloudflare.com/stream/uploading-videos/direct-creator-uploads/)
for a user to send a video to Stream directly on your behalf. If their uploads
will be 200mb or more, or they need support for resumable uploads, use this in
combination with TUS.

**Canonical Documentation:**

- https://developers.cloudflare.com/stream/uploading-videos/direct-creator-uploads/
- https://developers.cloudflare.com/stream/uploading-videos/resumable-uploads/

At a high level, the implementation is two parts, like with a standard direct
upload:

- A Worker or server-side / origin application makes the initial, authenticated
  API request to Stream to provision the upload URL. _But enabling it for TUS._
- The end-user side performs an unauthenticated upload directly to that endpoint.

## Your Worker or Server Side

This work needs to make an API call to Stream, so it needs to be made privately,
not on an end-user device. Here's an example:

``` js
import * as fs from "fs";
import * as tus from "tus-js-client";

// Specify location of file you would like to upload below
var path = "/mnt/c/Users/TaylorSmith/Desktop/TEMP/aus-mobile.mp4";
var file = fs.createReadStream(path);
var size = fs.statSync(path).size;
var mediaId = "";

// THIS PART RUNS ON THE SERVER

const provisionEndpoint = "https://api.cloudflare.com/client/v4/accounts/ACCOUNT_TAG/stream?direct_user=true";
const options = {
  method: 'POST',
  headers: {
    Authorization: "Bearer MY_API_KEY",
    "Upload-Creator": "creator_id_if_applicable",
    "Tus-Resumable": "1.0.0",
    "Upload-Length": size,
    "Upload-Metadata":
      `maxdurationseconds ${btoa('600')}, name ${btoa('upload.mp4')},watermark ${btoa('71e39ae7cb66cce2301f5b221abe1e69')}`
  },
};
console.log(`Upload-Metadata header: ${options.headers["Upload-Metadata"]}\n`);

// Provision the Direct Creator Upload URL with Stream:
const res = await fetch(provisionEndpoint, options);

if (!res.ok) {
  console.log(`Request failed ${res.status}\n`);
  console.log(await res.text());
  process.exit();
}

const uploadEndpoint = res.headers.get('Location');

console.log(`End user should upload to: ${uploadEndpoint}`);

// Get them that location. This is the hostname you sent me in your last email.
```

In short, making a request:

- To `https://api.cloudflare.com/client/v4/accounts/ACCOUNT_TAG/stream?direct_user=true`
- With at least the `"Tus-Resumable": "1.0.0"` header

will return an HTTP 204 response with a `Location` header, which the end-user
can run a TUS upload to.

## End-user / Creator Side



``` js
import * as fs from "fs";
import * as tus from "tus-js-client";

// Specify location of file you would like to upload below
var path = "/mnt/c/Users/TaylorSmith/Desktop/TEMP/aus-mobile.mp4";
var file = fs.createReadStream(path);
var size = fs.statSync(path).size;

const uploadEndpoint = '<PLACEHOLDER_FROM_SERVER>';

// THIS PART RUNS ON THE CLIENT

const uploadOptions = {
  endpoint: uploadEndpoint, // This is the `Location` header from above
  chunkSize: 50 * 1024 * 1024, // Required a minimum chunk size of 5 MB. Here we use 50 MB.
  retryDelays: [0, 3000, 5000, 10000, 20000], // Indicates to tus-js-client the delays after which it will retry if the upload fails.
  uploadSize: size,
  onError: function (error) {
    throw error;
  },
  onProgress: function (bytesUploaded, bytesTotal) {
    var percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2);
    console.log(bytesUploaded, bytesTotal, percentage + "%");
  },
  onSuccess: function () {
    console.log("Upload finished");
  },
  onAfterResponse: function (req, res) {
    return new Promise((resolve) => {
      var mediaIdHeader = res.getHeader("stream-media-id");
      if (mediaIdHeader) {
        mediaId = mediaIdHeader;
      }
      resolve();
    });
  },
};

const upload = new tus.Upload(file, uploadOptions);
upload.start();
```

This example is using `tus-js-client` in a simple Node.js script. There are other
TUS implementations in other languages that can be used as well.
