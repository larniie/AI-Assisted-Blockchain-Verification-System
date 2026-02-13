import hashlib


def hash_certificate(certificate_data):
    normalized = normalize_certificate_text(certificate_data)
    return hashlib.sha256(normalized.encode()).hexdigest()


def normalize_certificate_text(certificate_data):
    if not isinstance(certificate_data, str):
        raise ValueError("Certificate must be a string")

    normalized = " ".join(certificate_data.strip().split())
    if not normalized:
        raise ValueError("Certificate cannot be empty")

    return normalized