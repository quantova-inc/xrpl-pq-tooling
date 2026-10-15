# Quantova post quantum evidence anchors for the XRP Ledger

Open source tooling from Quantova Inc for anchoring a post quantum commitment to an off chain record in an XRP Ledger transaction memo.

## Contents

- `spec/XLS-draft-qstamp-pq-evidence-anchor.md` is the memo format draft for the XRP Ledger standards process.
- `src/xrpl-anchor.ts` builds the commitment and the memo and reads it back.
- `test/xrpl-anchor.test.ts` covers the adapter with round trip and rejection tests.

## Test

```
npm install
npm test
```

## Design notes

A record never reaches the ledger. A salted SHA3 256 fingerprint is bound to the sending account and the record kind, and only the 32 byte commitment is written in the memo. SHA3 256 and KECCAK 256 both retain about 128 bits of security against a quantum search.

## License

Apache 2.0 or MIT.
