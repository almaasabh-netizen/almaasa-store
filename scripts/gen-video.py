#!/usr/bin/env python3
"""Generate video with fal.ai from the terminal (no MCP).

Usage:
  export FAL_KEY="xxxx:yyyy"           # your fal.ai key (never commit it)
  python3 scripts/gen-video.py "a cinematic shot of a perfume bottle on marble"
  python3 scripts/gen-video.py "product spins slowly" --image ./public/item.jpg
  python3 scripts/gen-video.py "..." --model fal-ai/kling-video/v2/master/text-to-video

Text-to-video uses Kling v2 master by default; passing --image switches to the
image-to-video model automatically unless you override --model.
"""
import argparse
import json
import os
import sys
import time
import urllib.request
import urllib.error

QUEUE = "https://queue.fal.run"
DEFAULT_T2V = "fal-ai/kling-video/v2/master/text-to-video"
DEFAULT_I2V = "fal-ai/kling-video/v2/master/image-to-video"


def req(url, method="GET", token=None, body=None):
    data = json.dumps(body).encode() if body is not None else None
    r = urllib.request.Request(url, data=data, method=method)
    r.add_header("Authorization", f"Key {token}")
    r.add_header("Content-Type", "application/json")
    try:
        with urllib.request.urlopen(r) as resp:
            return json.load(resp)
    except urllib.error.HTTPError as e:
        sys.exit(f"HTTP {e.code}: {e.read().decode(errors='replace')}")


def upload_image(path, token):
    """Upload a local image to fal storage, return its URL."""
    name = os.path.basename(path)
    init = req(f"{QUEUE.replace('queue.', 'rest.')}/storage/upload/initiate",
               "POST", token, {"file_name": name, "content_type": "image/jpeg"})
    put = urllib.request.Request(init["upload_url"], data=open(path, "rb").read(), method="PUT")
    put.add_header("Content-Type", "image/jpeg")
    urllib.request.urlopen(put)
    return init["file_url"]


def main():
    p = argparse.ArgumentParser()
    p.add_argument("prompt", help="text description of the video")
    p.add_argument("--image", help="local path or URL for image-to-video")
    p.add_argument("--model", help="fal model id (overrides default)")
    p.add_argument("--duration", default="5", help="seconds (model dependent)")
    p.add_argument("--out", default="video.mp4", help="output file")
    args = p.parse_args()

    token = os.environ.get("FAL_KEY")
    if not token:
        sys.exit("Set FAL_KEY first:  export FAL_KEY='id:secret'")

    payload = {"prompt": args.prompt, "duration": args.duration}
    if args.image:
        model = args.model or DEFAULT_I2V
        img = args.image if args.image.startswith("http") else upload_image(args.image, token)
        payload["image_url"] = img
    else:
        model = args.model or DEFAULT_T2V

    print(f"→ model: {model}")
    job = req(f"{QUEUE}/{model}", "POST", token, payload)
    status_url = job["status_url"]
    resp_url = job["response_url"]

    print("→ generating", end="", flush=True)
    while True:
        st = req(status_url, "GET", token)
        if st.get("status") == "COMPLETED":
            break
        if st.get("status") == "FAILED":
            sys.exit(f"\nfailed: {json.dumps(st)}")
        print(".", end="", flush=True)
        time.sleep(5)

    result = req(resp_url, "GET", token)
    video_url = result.get("video", {}).get("url") or result.get("video_url")
    if not video_url:
        sys.exit(f"\nno video in result: {json.dumps(result)[:500]}")

    print(f"\n→ downloading {video_url}")
    urllib.request.urlretrieve(video_url, args.out)
    print(f"✓ saved to {args.out}")


if __name__ == "__main__":
    main()
