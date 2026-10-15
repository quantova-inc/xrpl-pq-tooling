import { keccak_256, sha3_256 } from '@noble/hashes/sha3.js';

export const MEMO_TYPE = 'qstamp/pq-evidence/1';
export const MEMO_FORMAT = 'application/vnd.qstamp.anchor';

const hex = (b: Uint8Array): string => Buffer.from(b).toString('hex').toUpperCase();
const asciiHex = (s: string): string => Buffer.from(s, 'ascii').toString('hex').toUpperCase();

export interface XrplMemo {
  Memo: { MemoType: string; MemoData: string; MemoFormat: string };
}

export function fingerprint(salt: Uint8Array, record: Uint8Array): Uint8Array {
  if (salt.length !== 16) {
    throw new Error('salt must be 16 bytes');
  }
  const input = new Uint8Array(salt.length + record.length);
  input.set(salt);
  input.set(record, salt.length);
  return sha3_256(input);
}

export function commitment(
  fingerprintBytes: Uint8Array,
  account: string,
  kind: string,
): Uint8Array {
  if (fingerprintBytes.length !== 32) {
    throw new Error('fingerprint must be 32 bytes');
  }
  const accountBytes = new TextEncoder().encode(account);
  const kindBytes = new TextEncoder().encode(kind);
  const input = new Uint8Array(32 + accountBytes.length + 1 + kindBytes.length);
  let o = 0;
  input.set(fingerprintBytes, o);
  o += 32;
  input.set(accountBytes, o);
  o += accountBytes.length;
  input[o] = 0x00;
  o += 1;
  input.set(kindBytes, o);
  return keccak_256(input);
}

export function anchorMemo(commitmentBytes: Uint8Array): XrplMemo {
  if (commitmentBytes.length !== 32) {
    throw new Error('commitment must be 32 bytes');
  }
  return {
    Memo: {
      MemoType: asciiHex(MEMO_TYPE),
      MemoData: hex(commitmentBytes),
      MemoFormat: asciiHex(MEMO_FORMAT),
    },
  };
}

export function readAnchor(memo: XrplMemo): Uint8Array | null {
  const m = memo.Memo;
  if (!m || Buffer.from(m.MemoType, 'hex').toString('ascii') !== MEMO_TYPE) {
    return null;
  }
  const data = Buffer.from(m.MemoData, 'hex');
  return data.length === 32 ? Uint8Array.from(data) : null;
}
