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

``` mermaid
  sequenceDiagram

  participant User
  participant YourServer
  participant Stream

  User -->> User: Wants to upload a video
  User -->> YourServer: Send upload intent and file size
  YourServer -->> Stream: Create Direct Creator TUS Upload
  Stream -->> YourServer: Return TUS URL
  YourServer -->> User: Return TUS URL
  User -->> Stream: TUS Upload file to TUS URL
```

## Your Worker or Server Side

This part needs to make an API call to Stream, so it needs to be made privately,
not on an end-user device. Here's an example:

``` js
// Example for how to provision an upload of a file stored locally. Likely, you
// will not have this and may need to pass the file size to the script that
// provisions the upload.
import * as fs from "fs";
var path = "/mnt/c/Users/TaylorSmith/Desktop/TEMP/aus-mobile.mp4";
var file = fs.createReadStream(path);
var size = fs.statSync(path).size;

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
- With the `"Tus-Resumable": "1.0.0"` and `Upload-Length` headers

will return an HTTP 201 response with a `Location` header, which the end-user
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

## A Working Example

This reference implementation shows how to make a Cloudflare API request to get
a creator upload URL for TUS. This is a demonsration only. Do not implement this
browser-side because that would expose your API credentials.

### 1. User wants to upload a file

In your application, your user intends to upload a file. They'll pick a file:

<input type="file" id="file" />

In your application's call to your API/backend, include the file size.

### 2. Your server/Worker makes a TUS Upload URL

<table>
  <tr>
    <th>File Size</th>
    <td>
      <input type="number" id="bytes" value="" disabled />
      <br />
      <p>
        The initial request to get an upload URL requires a file size, but not
        the actual file.
      </p>
    </td>
  </tr>
  <tr>
    <th>Account ID/Tag</th>
    <td>
      <input type="text" id="acct" value="" />
    </td>
  </tr>
  <tr>
    <th>Cloudflare API Key</th>
    <td>
      <input type="text" id="key" value="" />
      <br /><em>Paste your API key here. It will be submitted to Cloudflare directly, not sent to me. However, <strong>never ever provide your API to client-side code,</strong> this is a functional example for reference only.</em>
    </td>
  </tr>
  <tr>
    <th>Options</th>
    <td>
      <p>
        Check the list of <a href="https://developers.cloudflare.com/stream/uploading-videos/resumable-uploads/#supported-options-in-upload-metadata">supported options for Upload-Metadata</a>. For this example, a few will be hardcoded.
      </p>
      <ul>
        <li>Maximum Duration: 1 hour</li>
        <li>Name: Example Upload</li>
      </ul>
    </td>
  </tr>
  <tr>
    <th>Submit</th>
    <td>
      <button id="getTusDCUpload">Request Direct Upload TUS Endpoint</button>
    </td>
  </tr>
  <tr>
    <th>Response</th>
    <td>
      <p>
        On success, this request will return an HTTP 201 response with a `Location`
        header. Your application should send this URL to your end-user's client. This
        will be their upload destination.
      </p>
      <textarea class="output" id="location"></textarea>
    </td>
  </tr>
</table>

{{< raw >}}
<script>
  fileEl = document.getElementById('file');
  bytesEl = document.getElementById('bytes');
  acctEl = document.getElementById('acct');
  keyEl = document.getElementById('key');
  responseEl = document.getElementById('location');

  fileEl.addEventListener('change', e => {
    console.log('running')
    bytesEl.value = e.target.files[0].size;
  });

  document.getElementById('getTusDCUpload')?.addEventListener('click', async (e) => {
    e.preventDefault();

    const provisionEndpoint =
      `https://api.cloudflare.com/client/v4/accounts/${acctEl.value}/stream?direct_user=true`;
    const options = {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${keyEl.value}`,
        "Tus-Resumable": "1.0.0",
        "Upload-Length": bytesEl.value,
        "Upload-Metadata":
          `maxdurationseconds ${btoa('3600')}, name ${btoa('Example Upload')}`,
      },
    };

    // Provision the Direct Creator Upload URL with Stream:
    const res = await fetch(provisionEndpoint, options);

    if (!res.ok) {
      responseEl.value = (`Request failed ${res.status}\n`);
      return;
    }

    uploadEndpoint = res.headers.get('Location');

    console.log(`End user should upload to: ${uploadEndpoint}`);
    responseEl.value = uploadEndpoint;

    // Populate the part 2 fields.
    document.getElementById('pt2filename').value = `${fileEl.files[0].name}`;
    document.getElementById('pt2location').value = `${uploadEndpoint}`;
  });

</script>
{{< / raw >}}

### 3. Your End-user Uploads Directly

In your response to the end-user, include that Location header value so they can
upload the file to it directly. In this demo, we've selected the file already:

<table>
  <tr>
    <th>Established Inputs</th>
    <td>
      <p>
        <label>Selected File: <br /><input type="text" id="pt2filename" value="" disabled /></label>
      </p>
      <p>
        <label>Location: <br /><input type="text" id="pt2location" value="" disabled /></label>
      </p>
    </td>
  </tr>
  <tr>
    <th>Direct Upload</th>
    <td>
      <button id="doTusUpload">Upload</button>
    </td>
  </tr>
  <tr>
    <th>Progress and Updates</th>
    <td>
      <p>
        <code>tus-js-client</code> does not provide a UI, but does throw many
        events. Uppy offers some prebuilt UI tools.
      </p>
      <textarea class="output" id="pt2progress"></textarea>
    </td>
  </tr>
</table>

{{< raw >}}
<script src="https://cdn.jsdelivr.net/npm/tus-js-client@latest/dist/tus.min.js"></script>

<script>
  const pt2locationEl = document.getElementById('pt2location');
  const pt2progressEl = document.getElementById('pt2progress');

  document.getElementById('doTusUpload').addEventListener('click', async (e) => {
    e.preventDefault();

    // For determining the video id.
    let mediaId = false;

    const uploadOptions = {
      endpoint: pt2locationEl.value,
      // ^ This is the `Location` header from above
      chunkSize: 50 * 1024 * 1024,
      // ^ Required a minimum chunk size of 5 MB.
      retryDelays: [0, 3000, 5000, 10000, 20000],
      // ^ Delays after which it will retry if the upload fails.
      onError: function (error) {
        pt2progressEl.value += `\n\nError: ${error}`;
        throw error;
      },
      onProgress: function (bytesUploaded, bytesTotal) {
        const percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2);
        pt2progressEl.value += `\n\nUpload Progress: ${percentage}`;
      },
      onSuccess: function () {
        pt2progressEl.value += `\n\nUpload completed.`;
        pt2progressEl.value += `\n\nVideo ID: ${mediaId}.`;
      },

      // One way to get the video ID from one of the TUS requests.
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

    const upload = new tus.Upload(fileEl.files[0], uploadOptions);
    upload.start();
  });
</script>
{{< / raw >}}
