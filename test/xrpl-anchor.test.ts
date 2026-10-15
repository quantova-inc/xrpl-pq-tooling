import { describe, expect, it } from 'vitest';
import { anchorMemo, commitment, fingerprint, MEMO_TYPE, readAnchor } from '../src/xrpl-anchor.ts';

const salt = Uint8Array.from({ length: 16 }, (_, i) => i);
const record = new TextEncoder().encode('agent decision 42');
const account = 'rPT1Sjq2YGrBMTttX4GZHjKu9dyfzbpAYe';

describe('xrpl qstamp anchor', () => {
  it('fingerprint rejects a salt that is not 16 bytes', () => {
    expect(() => fingerprint(new Uint8Array(15), record)).toThrow();
  });

  it('builds a memo that round trips the commitment', () => {
    const fp = fingerprint(salt, record);
    const c = commitment(fp, account, 'qstamp');
    const memo = anchorMemo(c);
    expect(Buffer.from(memo.Memo.MemoType, 'hex').toString('ascii')).toBe(MEMO_TYPE);
    expect(memo.Memo.MemoData).toBe(Buffer.from(c).toString('hex').toUpperCase());
    expect(readAnchor(memo)).toEqual(c);
  });

  it('memo fields are uppercase hex as the XRPL requires', () => {
    const memo = anchorMemo(new Uint8Array(32).fill(0xab));
    for (const v of [memo.Memo.MemoType, memo.Memo.MemoData, memo.Memo.MemoFormat]) {
      expect(v).toMatch(/^[0-9A-F]+$/);
    }
  });

  it('distinct accounts do not collide on the same record', () => {
    const fp = fingerprint(salt, record);
    const a = commitment(fp, 'rAAA11111111111111111111111111111', 'qstamp');
    const b = commitment(fp, 'rBBB22222222222222222222222222222', 'qstamp');
    expect(Buffer.from(a).equals(Buffer.from(b))).toBe(false);
  });

  it('readAnchor rejects a foreign memo', () => {
    const foreign = { Memo: { MemoType: Buffer.from('other/type').toString('hex').toUpperCase(), MemoData: '00', MemoFormat: '00' } };
    expect(readAnchor(foreign)).toBeNull();
  });

  it('rejects a commitment that is not 32 bytes', () => {
    expect(() => anchorMemo(new Uint8Array(31))).toThrow();
  });
});
