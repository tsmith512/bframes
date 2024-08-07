---
title: Generating Tokens
---

# Generating Tokens

{{< hint danger >}}
Do not create signed URLs or send your signing key to client-side code. This
page is for experimenting. Creating Signed URLs should be done in a Worker or
server-side application to protect the signing key.
{{</hint>}}


## Step 1: Get a signing Token

Provision a signing token from Stream to create signed URLs in your app or server
application.

```
curl --request POST \
  "https://api.cloudflare.com/client/v4/accounts/{account_id}/stream/keys" \
  --header "Authorization: Bearer <API_TOKEN>"
```

The response will include the key's ID as well as the key in PEM and JWK format.
_(The `pem` and `jwk` properties here have been truncated; they will be long.)_

```
{
  "result": {
    "id": "8f926b2b01f383510025a78a4dcbf6a",
    "pem": "LS0tLS1CRUdJTiBSU0EgUFJJVkFURSBLRVktLS0tLQpNSUlFcEFJQk...",
    "jwk": "eyJ1c2UiOiJzaWciLCJrdHkiOiJSU0EiLCJraWQiOiI4ZjkyNmIyYj...",
    "created": "2021-06-15T21:06:54.763937286Z"
  },
  "success": true,
  "errors": [],
  "messages": []
}
```

## Step 2: Creating a Signed URL

Signed URLs are just signed JWT payloads. When creating a Signed URL, specify
the video, any access restrictions, and effective time ranges, and sign the
token with the key. This can be done in several ways, but here's one way.


<table>
  <tr>
    <th>Key ID</th>
    <td>
      <input type="text" id="kid" value="" />
    </td>
  </tr>
  <tr>
    <th>Key JWK</th>
    <td>
      <textarea id="jwk" class="output"></textarea>
      <br /><em>Paste your entire <code>jwk</code> property from the <code>keys</code> endpoint. It will not leave this browser. <strong>Never provide your JWK to client-side code.</strong></em>
    </td>
  </tr>
  <tr>
    <th>Video ID</th>
    <td>
      <input type="text" id="sub" value="" />
      <br /><em>Will be used in the JWT as the "Subject" (<code>sub</code>)</em>
    </td>
  </tr>
  <tr>
    <th>Expiration</th>
    <td>
      <input type="number" id="exp" />
      <br /><em>Provided as a Unix/epoch timestamp</em>
      <br /><button id="expHalfHour">Now + 30 Minutes</button>
    </td>
  </tr>
  <tr>
    <th>Access Rules</th>
    <td>
      <textarea id="accessRules" class="output"></textarea>
      <br /><em>If provided, must be a JSON payload.</em>
      <br />Valid? <em id="rulesValid">Yes</em>
    </td>
  </tr>
</table>

<textarea id="outputEl" class="output"></textarea>

<script>
  kidEl = document.getElementById('kid');
  jwkEl = document.getElementById('jwk');
  subEl = document.getElementById('sub');
  expEl = document.getElementById('exp');
  expHalfHourBtn = document.getElementById('expHalfHour');
  accessRulesEl = document.getElementById('accessRules');
  accessRulesValidEl = document.getElementById('rulesValid');
  outputEl = document.getElementById('outputEl');

  const validateAccessRules = () => {
    let value = false;

    if (!accessRulesEl.value) {
      // It's empty, which is fine.
      return true;
    }

    try {
      JSON.parse(accessRulesEl.value);
      value = true;
    } catch (err) {
      value = false;
    }

    return value;
  }

  const validateJWK = () => {
    // For now, just see if it isn't empty
    return (jwkEl.value.length > 0);
  };

  expHalfHourBtn.addEventListener('click', (event) => {
    event.preventDefault;
    const now = new Date().getTime() / 1000;
    expEl.value = Math.ceil(now) + (30 * 60);
  });

  accessRulesEl.addEventListener('change', (event) => {
    if (validateAccessRules()) {
      accessRulesValidEl.innerText = 'Yes';
    } else {
      accessRulesValidEl.innerText = 'No';
    }
  });
</script>

{{< raw >}}
<script>
  const generateSignedURL = async () => {
    const encoder = new TextEncoder();

    const headers = {
      "alg": "RS256",
      "kid": kidEl.value,
    };

    const data = {
      "sub": subEl.value,
      "kid": kidEl.value,
      "exp": expEl.value,
    };

    if (accessRulesEl.value && validateAccessRules()) {
      data.accessRules = accessRulesEl.value;
    };

    const token = `${objectToBase64url(headers)}.${objectToBase64url(data)}`;
    const jwk = JSON.parse(atob(jwkEl.value));

    const key = await crypto.subtle.importKey(
      "jwk", jwk,
      {
        name: 'RSASSA-PKCS1-v1_5',
        hash: 'SHA-256',
      },
      false, [ "sign" ]
    );

    const signature = await crypto.subtle.sign(
      { name: 'RSASSA-PKCS1-v1_5' }, key,
      encoder.encode(token)
    );

    const signedToken = `${token}.${arrayBufferToBase64Url(signature)}`;

    outputEl.value = signedToken;
  };

  // Utilities functions
  const arrayBufferToBase64Url = (buffer) => {
    return btoa(String.fromCharCode(...new Uint8Array(buffer)))
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
  };

  const objectToBase64url = (payload) => {
    return arrayBufferToBase64Url(
      new TextEncoder().encode(JSON.stringify(payload)),
    );
  };

</script>
{{< / raw >}}

<script>
  [subEl, kidEl, expEl, accessRulesEl].forEach((el) => {
    el.addEventListener('change', (e) => {
      if (validateAccessRules() && validateJWK()) {
        // generateSignedURL();
      }
    });
  });

  expHalfHourBtn.addEventListener('click', (event) => {
    event.preventDefault();
    generateSignedURL();
  });

</script>
