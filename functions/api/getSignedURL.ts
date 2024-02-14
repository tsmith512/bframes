export async function onRequest(context) {
  // Contents of context object
  const {
    request, // same as existing Worker API
    env, // same as existing Worker API
    params, // if filename includes [id] or [[path]]
    waitUntil, // same as ctx.waitUntil in existing Worker API
    passThroughOnException, // same as ctx.passThroughOnException in existing Worker API
    next, // used for middleware or to fetch assets
    data, // arbitrary space for passing data between middlewares
  } = context;

  return new Response('Hello World', {
    status: 200,
    headers: {
      'Cache-Control': 'max-age=0, no-cache, must-revalidate',
    }
  });
}

/**
 * Generate a signed URL to watch a protected video.
 *
 * Requires environment vars SIGNED_URL_KEY_ID and SIGNED_URL_KEY_JWK.
 *
 * @param id Video ID to generate the Signed URL for
 * @returns
 */
const getVodSignedURL = async (id: string): Promise<string | false> => {
  // Six hours from now, as a Unix Timestamp
  const expiry = (new Date().getTime() / 1000) + (6 * 60 * 60);

  const encoder = new TextEncoder();

  const headers = {
    "alg": "RS256",
    // KEY ID:
    "kid": process.env.SIGNED_URL_KEY_ID
  };

  const data = {
    "sub": id,
    "exp": expiry,
    "accessRules": [
      {
        "type": "any",
        "action": "allow"
      }
    ]
  };

  const payloadHeaders =
    Buffer.from(JSON.stringify(headers), 'utf-8').toString('base64url')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  const payloadData =
    Buffer.from(JSON.stringify(data), 'utf-8').toString('base64url')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  const token = `${payloadHeaders}.${payloadData}`;
  const jwk = JSON.parse(atob(process.env.SIGNED_URL_KEY_JWK as string));

  const key = await crypto.subtle.importKey(
    "jwk", jwk,
    {
      name: 'RSASSA-PKCS1-v1_5',
      hash: 'SHA-256',
    },
    false, [ "sign" ],
  );

  const signature = await crypto.subtle.sign(
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256'},
    key,
    encoder.encode(token)
  );

  const signatureData =
  btoa(uint8ToUrlBase64(new Uint8Array(signature)))
  // Buffer.from(JSON.stringify(signature), 'utf-8').toString('base64url')
  .replace(/=/g, '')
  .replace(/\+/g, '-')
  .replace(/\//g, '_');


  const signedToken = `${token}.${signatureData}`;

  return signedToken;
};

const uint8ToUrlBase64 = (uint8:any) => {
  let bin = '';
  uint8.forEach(function(code:any ) {
      bin += String.fromCharCode(code);
  });
  return bin;
}
