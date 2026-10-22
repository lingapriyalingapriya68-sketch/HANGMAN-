import http.server
import socketserver
import webbrowser
import os
import sys

PORT = 8000

class CustomHTTPHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Enable caching-free live development
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        super().end_headers()

def main():
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    handler = CustomHTTPHandler

    try:
        with socketserver.TCPServer(("", PORT), handler) as httpd:
            url = f"http://localhost:{PORT}"
            print("=" * 50)
            print(f"  Hangman Web Game Server running at: {url}")
            print("  Press Ctrl+C to stop the server.")
            print("=" * 50)
            webbrowser.open(url)
            httpd.serve_forever()
    except OSError:
        # Port might be in use, try port 8080
        fallback_port = 8080
        try:
            with socketserver.TCPServer(("", fallback_port), handler) as httpd:
                url = f"http://localhost:{fallback_port}"
                print("=" * 50)
                print(f"  Hangman Web Game Server running at: {url}")
                print("  Press Ctrl+C to stop the server.")
                print("=" * 50)
                webbrowser.open(url)
                httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped.")
            sys.exit(0)
    except KeyboardInterrupt:
        print("\nServer stopped.")
        sys.exit(0)

if __name__ == "__main__":
    main()
