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

  if (request.method === 'GET') {
    return new Response('Please POST SRT content in the request body.', { status: 405 });
  }

  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
      }
    })
  }

  const input = await request.text();

  const output = srtToVtt(input);

  return new Response(output, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'text/vtt',
      'Cache-Control': 'max-age=0, no-cache, must-revalidate',
    }
  });
}

/**
 * Convert a single SRT cue to a VTT cue, with some limited sanitation
 *
 * @param input (string) A single SRT cue
 * @returns (string) A matching VTT cue
 */
const convertCue = (input: string): string => {
  // EXAMPLES:

  // 1
  // 00:00:03,395 --> 00:00:06,728
  // Captain's Log, Stardate 44286.5.

  // 2
  // 00:00:06,765 --> 00:00:09,165
  // The <i>Enterprise</i> is conducting
  // a security survey

  const [number, time, ...content] = input.split('\n');

  // @TODO: Validate cue number?
  const newNumber = number;

  // @TODO: Validate timestamp?
  const newTime = time
    // Milliseconds should be noted with a period, not comma
    .replace(/(\d\d:\d\d:\d\d),(\d\d\d)/g, '$1.$2')
    // @TODO: Remove coordinates for now
    .replace(/[XY][12]:.*/g, '')
  ;

  const newContent = content
    // @TODO: Eliminate newlines (spec suggestion but sometimes breaks editorially desired?)
    .join(' ')
    // Remove HTML tags that aren't <i> <b> or <u>
    .replace(/<\/?[^ibu/][^>]*>/gi, '')
    // Convert {ibu} syntax to HTML tag
    .replace(/\{([ibu])\}/g, '<$1>')
    .replace(/\{\/([ibu])\}/g, '</$1>')
  ;

  return [newNumber, newTime, newContent].join('\n');
};

/**
 * Take an SRT text track and convert it to VTT
 *
 * @param input (string) an SRT text track
 * @returns (string) the converted VTT text track
 */
const srtToVtt = (input: string): string => {
  // Get input, trim leading/trailing whitepace, and remove carriage returns
  const srt = input.trim().replace(/\r+/g, '');

  // Split the cue stack
  const srtCues = srt.split('\n\n');

  const vttCues = srtCues.map(cue => convertCue(cue))
  return ['WEBVTT FILE', ...vttCues].join('\n\n');
};
