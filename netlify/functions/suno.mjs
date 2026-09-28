// Proxy to SunoAPI.org. Each user supplies their own API key from the page,
// sent in the X-Suno-Key header. The key is forwarded, never stored.

const BASE_URL = 'https://api.sunoapi.org';

// Only these actions can be called from the browser.
const ACTIONS = {
  generate: { method: 'POST', path: '/api/v1/generate' },
  extend: { method: 'POST', path: '/api/v1/generate/extend' },
  lyrics: { method: 'POST', path: '/api/v1/lyrics' },
  musicStatus: { method: 'GET', path: '/api/v1/generate/record-info' },
  lyricsStatus: { method: 'GET', path: '/api/v1/lyrics/record-info' },
  credits: { method: 'GET', path: '/api/v1/generate/credit' },
};

const json = (status, body) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });

async function callSuno(apiKey, method, path, { query, body } = {}) {
  const url = new URL(BASE_URL + path);
  for (const [k, v] of Object.entries(query || {})) {
    if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v);
  }
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({ code: res.status, msg: res.statusText }));
  return { status: res.status, data };
}

export default async (req, context) => {
  const apiKey = (req.headers.get('x-suno-key') || '').trim();
  if (!apiKey) {
    return json(401, { code: 401, msg: 'Enter your SunoAPI key to continue.' });
  }

  const url = new URL(req.url);
  const action = url.searchParams.get('action');
  const spec = ACTIONS[action];
  if (!spec) return json(400, { code: 400, msg: `Unknown action "${action}"` });

  try {
    if (spec.method === 'GET') {
      const query = { taskId: url.searchParams.get('taskId') || undefined };
      let result = await callSuno(apiKey, 'GET', spec.path, { query });
      // Some accounts expose the balance under a different path.
      if (action === 'credits' && result.data?.code !== 200) {
        result = await callSuno(apiKey, 'GET', '/api/v1/account/subscription/remain');
      }
      return json(200, result.data);
    }

    if (req.method !== 'POST') return json(405, { code: 405, msg: 'Use POST' });
    const body = await req.json().catch(() => ({}));

    // Suno requires a callback URL; point it at our no-op receiver.
    const siteUrl = process.env.URL || url.origin;
    body.callBackUrl = `${siteUrl}/.netlify/functions/suno-callback`;

    const result = await callSuno(apiKey, 'POST', spec.path, { body });
    return json(200, result.data);
  } catch (err) {
    return json(502, { code: 502, msg: `Could not reach SunoAPI: ${err.message}` });
  }
};
