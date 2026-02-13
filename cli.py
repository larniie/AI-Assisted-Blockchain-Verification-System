import argparse
import json
import urllib.error
import urllib.request


def post_json(url, payload):
    request = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    try:
        with urllib.request.urlopen(request, timeout=10) as response:
            body = response.read().decode("utf-8")
            return response.status, json.loads(body)
    except urllib.error.HTTPError as exc:
        body = exc.read().decode("utf-8")
        try:
            return exc.code, json.loads(body)
        except json.JSONDecodeError:
            return exc.code, {"error": body}
    except urllib.error.URLError as exc:
        return 0, {"error": f"Could not reach server: {exc}"}


def get_json(url):
    request = urllib.request.Request(url, method="GET")
    try:
        with urllib.request.urlopen(request, timeout=10) as response:
            body = response.read().decode("utf-8")
            return response.status, json.loads(body)
    except urllib.error.HTTPError as exc:
        body = exc.read().decode("utf-8")
        try:
            return exc.code, json.loads(body)
        except json.JSONDecodeError:
            return exc.code, {"error": body}
    except urllib.error.URLError as exc:
        return 0, {"error": f"Could not reach server: {exc}"}


def main():
    parser = argparse.ArgumentParser(
        description="Shell CLI for certificate issue/verify actions"
    )
    parser.add_argument(
        "--base-url",
        default="http://127.0.0.1:5000",
        help="Backend base URL (default: http://127.0.0.1:5000)",
    )

    subparsers = parser.add_subparsers(dest="command", required=True)

    issue_parser = subparsers.add_parser("issue", help="Issue a certificate")
    issue_parser.add_argument("certificate", help="Certificate text")

    verify_parser = subparsers.add_parser("verify", help="Verify a certificate")
    verify_parser.add_argument("certificate", help="Certificate text")

    subparsers.add_parser("chain", help="Show blockchain state")

    args = parser.parse_args()

    if args.command == "issue":
        status, data = post_json(
            f"{args.base_url}/issue", {"certificate": args.certificate}
        )
    elif args.command == "verify":
        status, data = post_json(
            f"{args.base_url}/verify", {"certificate": args.certificate}
        )
    else:
        status, data = get_json(f"{args.base_url}/chain")

    print(f"status={status}")
    print(json.dumps(data, indent=2))


if __name__ == "__main__":
    main()
