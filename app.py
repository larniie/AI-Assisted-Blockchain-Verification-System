from flask import Flask, request, jsonify
from blockchain import Blockchain
from utils import hash_certificate

app = Flask(__name__)
blockchain = Blockchain()


@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    return response


@app.route('/issue', methods=['OPTIONS'])
@app.route('/verify', methods=['OPTIONS'])
@app.route('/chain', methods=['OPTIONS'])
def options_handler():
    return ('', 204)


@app.route('/issue', methods=['POST'])
def issue_certificate():
    data = request.get_json(silent=True) or {}
    certificate_text = data.get("certificate")

    try:
        cert_hash = hash_certificate(certificate_text)
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400

    was_added = blockchain.add_certificate(cert_hash)
    if not was_added:
        return jsonify({
            "message": "Certificate already exists",
            "certificate_hash": cert_hash
        }), 200

    block = blockchain.mine_pending_certificates()

    return jsonify({
        "message": "Certificate issued and stored on blockchain",
        "certificate_hash": cert_hash,
        "block_index": block["index"] if block else None
    }), 201


@app.route('/verify', methods=['POST'])
def verify_certificate():
    data = request.get_json(silent=True) or {}
    certificate_text = data.get("certificate")

    try:
        cert_hash = hash_certificate(certificate_text)
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400

    if not blockchain.is_valid():
        return jsonify({
            "valid": False,
            "explanation": "Blockchain integrity check failed. Data may have been tampered with."
        }), 500

    if blockchain.certificate_exists(cert_hash):
        return jsonify({
            "valid": True,
            "explanation": "This certificate exists on the blockchain and has not been altered."
        })

    return jsonify({
        "valid": False,
        "explanation": "Certificate not found. It may be fake or altered."
    })


@app.route('/chain', methods=['GET'])
def full_chain():
    return jsonify({
        "length": len(blockchain.chain),
        "is_valid": blockchain.is_valid(),
        "chain": blockchain.chain,
        "pending_certificates": blockchain.pending_certificates
    })


if __name__ == "__main__":
    from waitress import serve
    serve(app, host="0.0.0.0", port=5000)