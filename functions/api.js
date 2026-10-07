const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx9Jy-5VioYqVX5X7wcQUer8_zXbH9tWY4hCkQOYv9pdiD-xcXpDkIdKTlNafIzr2zNBA/exec';

export async function onRequest({request}) {
  if (!['GET', 'POST'].includes(request.method)) {
    return new Response('Method not allowed', {status: 405, headers: {Allow: 'GET, POST'}});
  }

  const incoming = new URL(request.url);
  const upstreamUrl = new URL(APPS_SCRIPT_URL);
  upstreamUrl.search = incoming.search;
  const init = {method: request.method, redirect: 'follow'};

  if (request.method === 'POST') {
    init.body = await request.arrayBuffer();
    const contentType = request.headers.get('content-type');
    if (contentType) init.headers = {'content-type': contentType};
  }

  try {
    const upstream = await fetch(upstreamUrl, init);
    const headers = new Headers(upstream.headers);
    headers.set('cache-control', 'no-store');
    headers.set('x-content-type-options', 'nosniff');
    return new Response(upstream.body, {status: upstream.status, headers});
  } catch {
    return new Response('Backend unavailable', {status: 502, headers: {'cache-control': 'no-store'}});
  }
}
