import { describe, expect, it } from 'vitest'
import { hashPassword, safeEqual, sha256, verifyPassword } from '../src/crypto'

describe('auth crypto', () => {
  it('hashes and verifies a password without storing the original', async () => {
    const result = await hashPassword('eine-sichere-passphrase')
    expect(result.hash).not.toContain('passphrase')
    await expect(
      verifyPassword('eine-sichere-passphrase', result.salt, result.hash),
    ).resolves.toBe(true)
    await expect(
      verifyPassword('falsche-passphrase', result.salt, result.hash),
    ).resolves.toBe(false)
  })

  it('creates stable SHA-256 digests and constant-time comparisons', async () => {
    await expect(sha256('FIT2026')).resolves.toBe(
      'be9f2d08740ce40f966c5998997be76cda4c78f26e615d2fd07ac7484890c731',
    )
    expect(safeEqual('abcd', 'abcd')).toBe(true)
    expect(safeEqual('abcd', 'abce')).toBe(false)
  })
})
