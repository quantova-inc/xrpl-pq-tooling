# XLS draft: Qstamp post quantum evidence anchor memo

Status  Draft
Category  Ecosystem
Author  Quantova Inc

## Abstract

A convention for writing a post quantum commitment to an off chain record into an XRP Ledger transaction Memo, so that a third party can later prove the record existed in one exact form at a ledger close time, without the record itself reaching the ledger.

## Motivation

Regulated firms and AI agent operators need durable evidence that a record existed and was not altered. The XRP Ledger already carries arbitrary Memos on any transaction. This convention fixes one memo type so that wallets, explorers and auditors recognise a Qstamp anchor and verify it the same way everywhere.

## Specification

For a record R, a 16 byte random salt s, the sending account A and a record kind K, the fingerprint and commitment are

```
fingerprint = SHA3-256(s || R)
commitment  = KECCAK-256(fingerprint || utf8(A) || 0x00 || utf8(K))
```

The commitment is written into a Memo on any valid transaction from account A.

```
MemoType   = hex(ascii("qstamp/pq-evidence/1"))
MemoData   = hex(commitment)        // the 32 byte commitment, uppercase hex
MemoFormat = hex(ascii("application/vnd.qstamp.anchor"))
```

A reader recognises the anchor by MemoType and reads the 32 byte commitment from MemoData.

## Verification

A verifier holding R, s, A and K recomputes the commitment and checks that a transaction from A carries a Qstamp memo with that MemoData, at or before the ledger close time of interest.

## Rationale

The commitment binds the fingerprint to the account and the record kind, so the same fingerprint anchored by two accounts yields two distinct commitments. SHA3-256 and KECCAK-256 both retain about 128 bits of security against a quantum search. The record stays off ledger, so the data is private and the cost is one memo per anchor.

## Security considerations

The record never leaves the application. The anchor proves existence and integrity at a time. It does not prove correctness of the record or authority to create it.
