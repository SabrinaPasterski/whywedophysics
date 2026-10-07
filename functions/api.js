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
  const init = {method: request.method, redirect: request.method === 'POST' ? 'manual' : 'follow'};

  if (request.method === 'POST') {
    init.body = await request.arrayBuffer();
    const contentType = request.headers.get('content-type');
    if (contentType) init.headers = {'content-type': contentType};
  }

  const retryWall = request.method === 'GET' && incoming.searchParams.get('action') === 'wall';
  for (let attempt = 0; attempt < (retryWall ? 2 : 1); attempt++) {
  try {
    const attemptInit = retryWall ? {...init, signal: AbortSignal.timeout(8000)} : init;
    let upstream = await fetch(upstreamUrl, attemptInit);
    if (retryWall && !upstream.ok) throw new Error('Wall backend unavailable');
    if (request.method === 'POST' && upstream.status >= 300 && upstream.status < 400) {
      const location = upstream.headers.get('location');
      if (!location) throw new Error('Missing backend redirect');
      const resultUrl = new URL(location);
      if (resultUrl.protocol !== 'https:' || resultUrl.hostname !== 'script.googleusercontent.com') {
        throw new Error('Invalid backend redirect');
      }
      upstream = await fetch(resultUrl, {method: 'GET', redirect: 'follow'});
    }
    if (request.method === 'GET' && (!incomingCallback || retryWall)) {
      const source = await upstream.text();
      const prefix = `${incomingCallback || PROXY_CALLBACK}(`;
      if (!source.startsWith(prefix) || !source.endsWith(');')) throw new Error('Invalid backend response');
      const payload = source.slice(prefix.length, -2);
      JSON.parse(payload);
      return new Response(incomingCallback ? source : payload, {status: upstream.status, headers: {'cache-control': 'no-store', 'content-type': incomingCallback ? 'application/javascript; charset=utf-8' : 'application/json; charset=utf-8', 'x-content-type-options': 'nosniff'}});
    }
    const headers = new Headers(upstream.headers);
    headers.set('cache-control', 'no-store');
    headers.set('x-content-type-options', 'nosniff');
    return new Response(upstream.body, {status: upstream.status, headers});
  } catch {
    if (retryWall && attempt === 0) continue;
    return new Response('Backend unavailable', {status: 502, headers: {'cache-control': 'no-store'}});
  }
  }
}
