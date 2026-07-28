const encoder = new TextEncoder()
// Cloudflare Workers supports PBKDF2 iteration counts up to 100,000.
const passwordIterations = 100_000

export const bytesToHex = (bytes: Uint8Array) =>
  Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')

export const hexToBytes = (hex: string) => {
  if (!/^[a-f0-9]+$/i.test(hex) || hex.length % 2 !== 0) {
    throw new Error('Invalid hex value')
  }
  return new Uint8Array(hex.match(/.{2}/g)!.map((byte) => Number.parseInt(byte, 16)))
}

export const sha256 = async (value: string) =>
  bytesToHex(new Uint8Array(await crypto.subtle.digest('SHA-256', encoder.encode(value))))

export const randomToken = (byteLength = 32) => {
  const bytes = crypto.getRandomValues(new Uint8Array(byteLength))
  return bytesToHex(bytes)
}

export const hashPassword = async (password: string, saltHex?: string) => {
  const salt = saltHex ? hexToBytes(saltHex) : crypto.getRandomValues(new Uint8Array(16))
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  )
  const derived = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      hash: 'SHA-256',
      salt,
      iterations: passwordIterations,
    },
    key,
    256,
  )
  return {
    salt: bytesToHex(salt),
    hash: bytesToHex(new Uint8Array(derived)),
  }
}

export const safeEqual = (left: string, right: string) => {
  if (left.length !== right.length) return false
  let difference = 0
  for (let index = 0; index < left.length; index += 1) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index)
  }
  return difference === 0
}

export const verifyPassword = async (
  password: string,
  salt: string,
  expectedHash: string,
) => {
  const candidate = await hashPassword(password, salt)
  return safeEqual(candidate.hash, expectedHash)
}
