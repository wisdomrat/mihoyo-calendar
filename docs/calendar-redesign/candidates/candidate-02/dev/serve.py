"""本地静态服务器（截图用）：所有响应带 no-store，避免 headless 浏览器启发式缓存旧 JS/CSS。
用法：python dev/serve.mjs 的等价物 -> python dev/serve.py [port] [root]"""
import http.server
import os
import sys

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8765
ROOT = os.path.abspath(sys.argv[2]) if len(sys.argv) > 2 else os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'prototype-v2')


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=ROOT, **kw)

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

    def log_message(self, *a):
        pass


print(f'serving {ROOT} on :{PORT} (no-store)')
http.server.ThreadingHTTPServer(('0.0.0.0', PORT), Handler).serve_forever()
