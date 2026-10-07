const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx9Jy-5VioYqVX5X7wcQUer8_zXbH9tWY4hCkQOYv9pdiD-xcXpDkIdKTlNafIzr2zNBA/exec';
const PROXY_CALLBACK = 'wallcb00000000000000000000000000000000';

export async function onRequest({request}) {
  if (!['GET', 'POST'].includes(request.method)) {
    return new Response('Method not allowed', {status: 405, headers: {Allow: 'GET, POST'}});
  }

  const incoming = new URL(request.url);
  const upstreamUrl = new URL(APPS_SCRIPT_URL);
  upstreamUrl.search = incoming.search;
  const incomingCallback = incoming.searchParams.get('callback');
  if (request.method === 'GET' && !incomingCallback) upstreamUrl.searchParams.set('callback', PROXY_CALLBACK);
  const init = {method: request.method, redirect: 'follow'};

  if (request.method === 'POST') {
    init.body = await request.arrayBuffer();
    const contentType = request.headers.get('content-type');
    if (contentType) init.headers = {'content-type': contentType};
  }

  try {
    const upstream = await fetch(upstreamUrl, init);
    if (request.method === 'GET' && !incomingCallback) {
      const source = await upstream.text();
      const prefix = `${PROXY_CALLBACK}(`;
      if (!source.startsWith(prefix) || !source.endsWith(');')) throw new Error('Invalid backend response');
      const payload = source.slice(prefix.length, -2);
      JSON.parse(payload);
      return new Response(payload, {status: upstream.status, headers: {'cache-control': 'no-store', 'content-type': 'application/json; charset=utf-8', 'x-content-type-options': 'nosniff'}});
    }
    const headers = new Headers(upstream.headers);
    headers.set('cache-control', 'no-store');
    headers.set('x-content-type-options', 'nosniff');
    return new Response(upstream.body, {status: upstream.status, headers});
  } catch {
    return new Response('Backend unavailable', {status: 502, headers: {'cache-control': 'no-store'}});
  }
}
