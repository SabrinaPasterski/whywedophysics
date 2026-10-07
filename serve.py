#!/usr/bin/env python3
"""Serve the production site locally, including its /api relay."""

from argparse import ArgumentParser
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit
from urllib.request import Request, urlopen
import json
import re


ROOT = Path(__file__).resolve().parent
DIST = ROOT / "dist"
FUNCTION_SOURCE = ROOT / "functions" / "api.js"


def backend_url():
    source = FUNCTION_SOURCE.read_text(encoding="utf-8")
    match = re.search(r"APPS_SCRIPT_URL\s*=\s*['\"]([^'\"]+)['\"]", source)
    if not match:
        raise RuntimeError("Could not find APPS_SCRIPT_URL in functions/api.js")
    return match.group(1)


BACKEND_URL = backend_url()
PROXY_CALLBACK = "wallcb00000000000000000000000000000000"


class PreviewHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(DIST), **kwargs)

    def do_GET(self):
        if urlsplit(self.path).path == "/api":
            self.proxy_api()
            return
        super().do_GET()

    def do_POST(self):
        if urlsplit(self.path).path != "/api":
            self.send_error(405, "Method not allowed")
            return
        self.proxy_api()

    def proxy_api(self):
        incoming = urlsplit(self.path)
        params = parse_qsl(incoming.query, keep_blank_values=True)
        incoming_callback = next((value for key, value in params if key == "callback"), "")
        if self.command == "GET" and not incoming_callback:
            params.append(("callback", PROXY_CALLBACK))
        upstream = urlsplit(BACKEND_URL)
        target = urlunsplit((upstream.scheme, upstream.netloc, upstream.path, urlencode(params), ""))
        body = None
        headers = {}
        if self.command == "POST":
            body = self.rfile.read(int(self.headers.get("Content-Length", "0")))
            if content_type := self.headers.get("Content-Type"):
                headers["Content-Type"] = content_type
        request = Request(target, data=body, headers=headers, method=self.command)
        retry_wall = self.command == "GET" and next((value for key, value in params if key == "action"), "") == "wall"
        for attempt in range(2 if retry_wall else 1):
            try:
                try:
                    response = urlopen(request, timeout=8 if retry_wall else 25)
                except HTTPError as error:
                    response = error
                with response:
                    status = response.status
                    if retry_wall and not 200 <= status < 300:
                        raise URLError("Wall backend unavailable")
                    payload = response.read()
                    content_type = response.headers.get("Content-Type", "application/javascript; charset=utf-8")
                if self.command == "GET" and (not incoming_callback or retry_wall):
                    prefix = f"{incoming_callback or PROXY_CALLBACK}(".encode()
                    if not payload.startswith(prefix) or not payload.endswith(b");"):
                        raise ValueError("Invalid backend response")
                    decoded = payload[len(prefix):-2]
                    json.loads(decoded)
                    if not incoming_callback:
                        payload = decoded
                        content_type = "application/json; charset=utf-8"
                break
            except (URLError, TimeoutError, OSError, ValueError):
                if retry_wall and attempt == 0:
                    continue
                payload = b'Backend unavailable'
                self.send_response(502)
                self.send_header("Content-Type", "text/plain; charset=utf-8")
                self.send_header("Cache-Control", "no-store")
                self.send_header("Content-Length", str(len(payload)))
                self.end_headers()
                self.wfile.write(payload)
                return
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Length", str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)


def main():
    parser = ArgumentParser()
    parser.add_argument("--port", type=int, default=8768)
    args = parser.parse_args()
    server = ThreadingHTTPServer(("127.0.0.1", args.port), PreviewHandler)
    print(f"Preview: http://127.0.0.1:{args.port}", flush=True)
    server.serve_forever()


if __name__ == "__main__":
    main()
