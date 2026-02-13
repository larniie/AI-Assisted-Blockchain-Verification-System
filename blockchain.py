import hashlib
import json
from time import time


class Blockchain:

    def __init__(self):
        self.chain = []
        self.pending_certificates = []
        self.create_block(certificate_hashes=[], previous_hash='1')

    def create_block(self, certificate_hashes, previous_hash):
        block = {
            'index': len(self.chain) + 1,
            'timestamp': time(),
            'certificate_hashes': certificate_hashes,
            'previous_hash': previous_hash
        }

        block['hash'] = self.hash(block)
        self.chain.append(block)
        return block

    def add_certificate(self, certificate_hash):
        if self.certificate_exists(certificate_hash):
            return False
        self.pending_certificates.append(certificate_hash)
        return True

    def mine_pending_certificates(self):
        if not self.pending_certificates:
            return None

        previous_hash = self.chain[-1]['hash']
        block = self.create_block(
            certificate_hashes=self.pending_certificates.copy(),
            previous_hash=previous_hash
        )
        self.pending_certificates.clear()
        return block

    def certificate_exists(self, certificate_hash):
        for block in self.chain:
            if certificate_hash in block['certificate_hashes']:
                return True
        return certificate_hash in self.pending_certificates

    def hash(self, block):
        encoded_block = json.dumps(block, sort_keys=True).encode()
        return hashlib.sha256(encoded_block).hexdigest()

    def is_valid(self):
        for i in range(1, len(self.chain)):
            previous = self.chain[i - 1]
            current = self.chain[i]

            if current['previous_hash'] != previous['hash']:
                return False

            recalculated_hash = self.hash({
                'index': current['index'],
                'timestamp': current['timestamp'],
                'certificate_hashes': current['certificate_hashes'],
                'previous_hash': current['previous_hash']
            })
            if current['hash'] != recalculated_hash:
                return False
        return True