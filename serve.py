#!/usr/bin/env python3
"""Serve the production site locally, including its /api relay."""

from argparse import ArgumentParser
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import urlsplit
from urllib.request import Request, urlopen
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
        target = BACKEND_URL + (("?" + incoming.query) if incoming.query else "")
        body = None
        headers = {}
        if self.command == "POST":
            body = self.rfile.read(int(self.headers.get("Content-Length", "0")))
            if content_type := self.headers.get("Content-Type"):
                headers["Content-Type"] = content_type
        request = Request(target, data=body, headers=headers, method=self.command)
        try:
            response = urlopen(request, timeout=25)
        except HTTPError as error:
            response = error
        except URLError:
            self.send_error(502, "Backend unavailable")
            return
        payload = response.read()
        self.send_response(response.status)
        self.send_header("Content-Type", response.headers.get("Content-Type", "application/javascript; charset=utf-8"))
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
