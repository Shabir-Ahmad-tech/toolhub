'use client'

import { useState, useCallback, useMemo, useRef } from 'react'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { CopyButton } from '@/components/ui/CopyButton'
import { StatCard } from '@/components/ui/StatCard'
import {
  Copy,
  Check,
  Download,
  ToggleLeft,
  ToggleRight,
  Hash,
  Keyboard,
  Info,
  Settings,
  Eye,
  EyeOff,
  Layers,
  UploadCloud,
  FileText,
  Trash2
} from 'lucide-react'

// ==========================================
// PURE TYPESCRIPT CRYPTOGRAPHIC IMPLEMENTATION
// ==========================================

export type HashAlgo = 'md5' | 'sha1' | 'sha256' | 'sha512';

// Pure TS MD5 implementation on Uint8Array
export function md5Bytes(msgBytes: Uint8Array): Uint8Array {
  const rotateLeft = (x: number, n: number) => (x << n) | (x >>> (32 - n));

  const origLen = msgBytes.length * 8;
  const bytes = Array.from(msgBytes);
  bytes.push(0x80);
  while (bytes.length % 64 !== 56) bytes.push(0);
  for (let i = 0; i < 8; i++) bytes.push((origLen >>> (i * 8)) & 0xff);

  const K = [
    0xd76aa478, 0xe8c7b756, 0x242070db, 0xc1bdceee, 0xf57c0faf, 0x4787c62a, 0xa8304613, 0xfd469501,
    0x698098d8, 0x8b44f7af, 0xffff5bb1, 0x895cd7be, 0x6b901122, 0xfd987193, 0xa679438e, 0x49b40821,
    0xf61e2562, 0xc040b340, 0x265e5a51, 0xe9b6c7aa, 0xd62f105d, 0x02441453, 0xd8a1e681, 0xe7d3fbc8,
    0x21e1cde6, 0xc33707d6, 0xf4d50d87, 0x455a14ed, 0xa9e3e905, 0xfcefa3f8, 0x676f02d9, 0x8d2a4c8a,
    0xfffa3942, 0x8771f681, 0x6d9d6122, 0xfde5380c, 0xa4beea44, 0x4bdecfa9, 0xf6bb4b60, 0xbebfbc70,
    0x289b7ec6, 0xeaa127fa, 0xd4ef3085, 0x04881d05, 0xd9d4d039, 0xe6db99e5, 0x1fa27cf8, 0xc4ac5665,
    0xf4292244, 0x432aff97, 0xab9423a7, 0xfc93a039, 0x655b59c3, 0x8f0ccc92, 0xffeff47d, 0x85845dd1,
    0x6fa87e4f, 0xfe2ce6e0, 0xa3014314, 0x4e0811a1, 0xf7537e82, 0xbd3af235, 0x2ad7d2bb, 0xeb86d391
  ];
  const S = [
    7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
    5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
    4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
    6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21
  ];

  let a0 = 0x67452301, b0 = 0xefcdab89, c0 = 0x98badcfe, d0 = 0x10325476;

  for (let i = 0; i < bytes.length; i += 64) {
    const M: number[] = [];
    for (let j = 0; j < 16; j++) {
      M[j] = bytes[i + j * 4] | (bytes[i + j * 4 + 1] << 8) | (bytes[i + j * 4 + 2] << 16) | (bytes[i + j * 4 + 3] << 24);
    }
    let A = a0, B = b0, C = c0, D = d0;
    for (let j = 0; j < 64; j++) {
      let F: number, g: number;
      if (j < 16) { F = (B & C) | (~B & D); g = j; }
      else if (j < 32) { F = (D & B) | (~D & C); g = (5 * j + 1) % 16; }
      else if (j < 48) { F = B ^ C ^ D; g = (3 * j + 5) % 16; }
      else { F = C ^ (B | ~D); g = (7 * j) % 16; }
      F = (F + A + K[j] + M[g]) & 0xffffffff;
      A = D; D = C; C = B; B = (B + rotateLeft(F, S[j])) & 0xffffffff;
    }
    a0 = (a0 + A) & 0xffffffff; b0 = (b0 + B) & 0xffffffff; c0 = (c0 + C) & 0xffffffff; d0 = (d0 + D) & 0xffffffff;
  }

  const result = new Uint8Array(16);
  const view = new DataView(result.buffer);
  const swap = (n: number) => ((n << 24) | ((n & 0xff00) << 8) | ((n >> 8) & 0xff00) | (n >>> 24)) >>> 0;
  view.setUint32(0, swap(a0), false);
  view.setUint32(4, swap(b0), false);
  view.setUint32(8, swap(c0), false);
  view.setUint32(12, swap(d0), false);
  return result;
}

// Pure TS SHA-1 implementation on Uint8Array
export function sha1Bytes(msgBytes: Uint8Array): Uint8Array {
  const l = msgBytes.length;
  const n = ((l + 8) >> 6) + 1;
  const words = new Uint32Array(n * 16);
  for (let i = 0; i < l; i++) {
    words[i >> 2] |= msgBytes[i] << (24 - (i % 4) * 8);
  }
  words[l >> 2] |= 0x80 << (24 - (l % 4) * 8);
  words[n * 16 - 1] = l * 8;

  let h0 = 0x67452301;
  let h1 = 0xEFCDAB89;
  let h2 = 0x98BADCFE;
  let h3 = 0x10325476;
  let h4 = 0xC3D2E1F0;

  const w = new Uint32Array(80);

  for (let i = 0; i < words.length; i += 16) {
    for (let t = 0; t < 16; t++) {
      w[t] = words[i + t];
    }
    for (let t = 16; t < 80; t++) {
      const val = w[t - 3] ^ w[t - 8] ^ w[t - 14] ^ w[t - 16];
      w[t] = (val << 1) | (val >>> 31);
    }

    let a = h0;
    let b = h1;
    let c = h2;
    let d = h3;
    let e = h4;

    for (let t = 0; t < 80; t++) {
      let f = 0;
      let k = 0;
      if (t < 20) {
        f = (b & c) | ((~b) & d);
        k = 0x5A827999;
      } else if (t < 40) {
        f = b ^ c ^ d;
        k = 0x6ED9EBA1;
      } else if (t < 60) {
        f = (b & c) | (b & d) | (c & d);
        k = 0x8F1BBCDC;
      } else {
        f = b ^ c ^ d;
        k = 0xCA62C1D6;
      }

      const temp = (((a << 5) | (a >>> 27)) + f + e + k + w[t]) | 0;
      e = d;
      d = c;
      c = (b << 30) | (b >>> 2);
      b = a;
      a = temp;
    }

    h0 = (h0 + a) | 0;
    h1 = (h1 + b) | 0;
    h2 = (h2 + c) | 0;
    h3 = (h3 + d) | 0;
    h4 = (h4 + e) | 0;
  }

  const result = new Uint8Array(20);
  const view = new DataView(result.buffer);
  view.setUint32(0, h0, false);
  view.setUint32(4, h1, false);
  view.setUint32(8, h2, false);
  view.setUint32(12, h3, false);
  view.setUint32(16, h4, false);
  return result;
}

// Pure TS SHA-256 implementation on Uint8Array
export function sha256Bytes(msgBytes: Uint8Array): Uint8Array {
  const l = msgBytes.length;
  const n = ((l + 8) >> 6) + 1;
  const words = new Uint32Array(n * 16);
  for (let i = 0; i < l; i++) {
    words[i >> 2] |= msgBytes[i] << (24 - (i % 4) * 8);
  }
  words[l >> 2] |= 0x80 << (24 - (l % 4) * 8);
  words[n * 16 - 1] = l * 8;

  let h0 = 0x6a09e667;
  let h1 = 0xbb67ae85;
  let h2 = 0x3c6ef372;
  let h3 = 0xa54ff53a;
  let h4 = 0x510e527f;
  let h5 = 0x9b05688c;
  let h6 = 0x1f83d9ab;
  let h7 = 0x5be0cd19;

  const k = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];

  const w = new Uint32Array(64);

  for (let i = 0; i < words.length; i += 16) {
    for (let t = 0; t < 16; t++) {
      w[t] = words[i + t];
    }
    for (let t = 16; t < 64; t++) {
      const s0 = ((w[t - 15] >>> 7) | (w[t - 15] << 25)) ^ ((w[t - 18] >>> 18) | (w[t - 15] << 14)) ^ (w[t - 15] >>> 3);
      const s1 = ((w[t - 2] >>> 17) | (w[t - 2] << 15)) ^ ((w[t - 2] >>> 19) | (w[t - 2] << 13)) ^ (w[t - 2] >>> 10);
      w[t] = (w[t - 16] + s0 + w[t - 7] + s1) | 0;
    }

    let s_a = h0;
    let s_b = h1;
    let s_c = h2;
    let s_d = h3;
    let s_e = h4;
    let s_f = h5;
    let s_g = h6;
    let s_h = h7;

    for (let t = 0; t < 64; t++) {
      const S1 = ((s_e >>> 6) | (s_e << 26)) ^ ((s_e >>> 11) | (s_e << 21)) ^ ((s_e >>> 25) | (s_e << 7));
      const ch = (s_e & s_f) ^ ((~s_e) & s_g);
      const temp1 = (s_h + S1 + ch + k[t] + w[t]) | 0;
      const S0 = ((s_a >>> 2) | (s_a << 30)) ^ ((s_a >>> 13) | (s_a << 19)) ^ ((s_a >>> 22) | (s_a << 10));
      const maj = (s_a & s_b) ^ (s_a & s_c) ^ (s_b & s_c);
      const temp2 = (S0 + maj) | 0;

      s_h = s_g;
      s_g = s_f;
      s_f = s_e;
      s_e = (s_d + temp1) | 0;
      s_d = s_c;
      s_c = s_b;
      s_b = s_a;
      s_a = (temp1 + temp2) | 0;
    }

    h0 = (h0 + s_a) | 0;
    h1 = (h1 + s_b) | 0;
    h2 = (h2 + s_c) | 0;
    h3 = (h3 + s_d) | 0;
    h4 = (h4 + s_e) | 0;
    h5 = (h5 + s_f) | 0;
    h6 = (h6 + s_g) | 0;
    h7 = (h7 + s_h) | 0;
  }

  const result = new Uint8Array(32);
  const view = new DataView(result.buffer);
  view.setUint32(0, h0, false);
  view.setUint32(4, h1, false);
  view.setUint32(8, h2, false);
  view.setUint32(12, h3, false);
  view.setUint32(16, h4, false);
  view.setUint32(20, h5, false);
  view.setUint32(24, h6, false);
  view.setUint32(28, h7, false);
  return result;
}

// Pure TS SHA-512 implementation on Uint8Array
export function sha512Bytes(msgBytes: Uint8Array): Uint8Array {
  const l = msgBytes.length;
  const remainder = l % 128;
  const paddingSize = remainder < 112 ? 112 - remainder : 240 - remainder;
  const totalLength = l + paddingSize + 16;
  const padded = new Uint8Array(totalLength);
  padded.set(msgBytes);
  padded[l] = 0x80;

  const lenBits = BigInt(l) * BigInt('8');
  for (let i = 0; i < 8; i++) {
    padded[totalLength - 1 - i] = Number((lenBits >> (BigInt(i) * BigInt('8'))) & BigInt('255'));
  }

  const view = new DataView(padded.buffer);
  const N = totalLength / 128;

  let h0 = BigInt('0x6a09e667f3bcc908');
  let h1 = BigInt('0xbb67ae8584caa73b');
  let h2 = BigInt('0x3c6ef372fe94f82b');
  let h3 = BigInt('0xa54ff53a5f1d36f1');
  let h4 = BigInt('0x510e527fade682d1');
  let h5 = BigInt('0x9b05688c2b3e6c1f');
  let h6 = BigInt('0x1f83d9abfb41bd6b');
  let h7 = BigInt('0x5be0cd19137e2179');

  const k = [
    BigInt('0x428a2f98d728ae22'), BigInt('0x7137449123ef657a'), BigInt('0xb5c0fbcfec4d3b2f'), BigInt('0xe9b5dba58189dbbc'),
    BigInt('0x3956c25bf348b538'), BigInt('0x59f111f1b605d019'), BigInt('0x923f82a4af194f9b'), BigInt('0xab1c5ed5da6d8118'),
    BigInt('0xd807aa98a3030242'), BigInt('0x12835b0145706fbe'), BigInt('0x243185be4ee4b28c'), BigInt('0x550c7dc3d5ffb4e2'),
    BigInt('0x72be5d74f27b896f'), BigInt('0x80deb1fe3b1696b1'), BigInt('0x9bdc06a725c71235'), BigInt('0xc19bf174cf692694'),
    BigInt('0xe49b69c19ef14ad2'), BigInt('0xefbe4786384f25e3'), BigInt('0x0fc19dc68b8cd5b5'), BigInt('0x240ca1cc77ac9c65'),
    BigInt('0x2de92c6f592b0275'), BigInt('0x4a7484aa6ea6e483'), BigInt('0x5cb0a9dcbd41fbd4'), BigInt('0x76f988da831153b5'),
    BigInt('0x983e5152ee66dfab'), BigInt('0xa831c66d2db43210'), BigInt('0xb00327c898fb213f'), BigInt('0xbf597fc7beef0ee4'),
    BigInt('0xc6e00bf33da88fc2'), BigInt('0xd5a79147930aa725'), BigInt('0x06ca6351e003826f'), BigInt('0x142929670a0e6e70'),
    BigInt('0x27b70a8546d22ffc'), BigInt('0x2e1b21385c26c926'), BigInt('0x4d2c6dfc5ac42aed'), BigInt('0x53380d139d95b3df'),
    BigInt('0x650a73548baf63de'), BigInt('0x766a0abb3c77b2a8'), BigInt('0x81c2c92e47edaee6'), BigInt('0x92722c851482353b'),
    BigInt('0xa2bfe8a14cf10364'), BigInt('0xa81a664bbc423001'), BigInt('0xc24b8b70d0f89791'), BigInt('0xc76c51a30654be30'),
    BigInt('0xd192e819d6ef5218'), BigInt('0xd69906245565a910'), BigInt('0xf40e35855771202a'), BigInt('0x106aa07032bbd1b8'),
    BigInt('0x19a4c116b8d2d0c8'), BigInt('0x1e376c085141ab53'), BigInt('0x2748774cdf8eeb99'), BigInt('0x34b0bcb5e19b48a8'),
    BigInt('0x391c0cb3c5c95a63'), BigInt('0x4ed8aa4ae3418acb'), BigInt('0x5b9cca4f7763e373'), BigInt('0x682e6ff3d6b2b8a3'),
    BigInt('0x748f82ee5defb2fc'), BigInt('0x78a5636f43172f60'), BigInt('0x84c87814a1f0ab72'), BigInt('0x8cc702081a6439ec'),
    BigInt('0x90befffa23631e28'), BigInt('0xa4506cebde82bde9'), BigInt('0xbef9a3f7b2c67915'), BigInt('0xc67178f2e372532b'),
    BigInt('0xca273eceea26619c'), BigInt('0xd186b8c721c0c207'), BigInt('0xeada7dd6cde0eb1e'), BigInt('0xf57d4f7fee6ed178'),
    BigInt('0x06f067aa72176fba'), BigInt('0x0a637dc5a2c898a6'), BigInt('0x113f9804bef90dae'), BigInt('0x1b710b35131c471b'),
    BigInt('0x28db77f523047d84'), BigInt('0x32caab7b40c72493'), BigInt('0x3c9ebe0a15c9bebc'), BigInt('0x431d67c49c100d4c'),
    BigInt('0x4cc5d4becb3e42b6'), BigInt('0x597f299cfc657e2a'), BigInt('0x5fcb6fab3ad6faec'), BigInt('0x6c44198c4a475817')
  ];

  const w = new BigUint64Array(80);
  const mask = BigInt('0xffffffffffffffff');
  const rotr = (x: bigint, n: bigint) => ((x >> n) | (x << (BigInt('64') - n))) & mask;

  for (let i = 0; i < N; i++) {
    for (let t = 0; t < 16; t++) {
      w[t] = view.getBigUint64(i * 128 + t * 8, false);
    }
    for (let t = 16; t < 80; t++) {
      const s0 = rotr(w[t - 15], BigInt('1')) ^ rotr(w[t - 15], BigInt('8')) ^ (w[t - 15] >> BigInt('7'));
      const s1 = rotr(w[t - 2], BigInt('19')) ^ rotr(w[t - 2], BigInt('61')) ^ (w[t - 2] >> BigInt('6'));
      w[t] = (w[t - 16] + s0 + w[t - 7] + s1) & mask;
    }

    let a = h0;
    let b = h1;
    let c = h2;
    let d = h3;
    let e = h4;
    let f = h5;
    let g = h6;
    let h = h7;

    for (let t = 0; t < 80; t++) {
      const S1 = rotr(e, BigInt('14')) ^ rotr(e, BigInt('18')) ^ rotr(e, BigInt('41'));
      const ch = (e & f) ^ ((~e) & g);
      const temp1 = (h + S1 + ch + k[t] + w[t]) & mask;
      const S0 = rotr(a, BigInt('28')) ^ rotr(a, BigInt('34')) ^ rotr(a, BigInt('39'));
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) & mask;

      h = g;
      g = f;
      f = e;
      e = (d + temp1) & mask;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) & mask;
    }

    h0 = (h0 + a) & mask;
    h1 = (h1 + b) & mask;
    h2 = (h2 + c) & mask;
    h3 = (h3 + d) & mask;
    h4 = (h4 + e) & mask;
    h5 = (h5 + f) & mask;
    h6 = (h6 + g) & mask;
    h7 = (h7 + h) & mask;
  }

  const result = new Uint8Array(64);
  const rView = new DataView(result.buffer);
  rView.setBigUint64(0, h0, false);
  rView.setBigUint64(8, h1, false);
  rView.setBigUint64(16, h2, false);
  rView.setBigUint64(24, h3, false);
  rView.setBigUint64(32, h4, false);
  rView.setBigUint64(40, h5, false);
  rView.setBigUint64(48, h6, false);
  rView.setBigUint64(56, h7, false);
  return result;
}

export function hashBytes(algo: HashAlgo, bytes: Uint8Array): Uint8Array {
  switch (algo) {
    case 'md5': return md5Bytes(bytes);
    case 'sha1': return sha1Bytes(bytes);
    case 'sha256': return sha256Bytes(bytes);
    case 'sha512': return sha512Bytes(bytes);
  }
}

// Convert bytes to hex string
export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

// Public API wrapper functions
export function md5(message: string): string {
  return bytesToHex(md5Bytes(new TextEncoder().encode(message)));
}

export function sha1(message: string): string {
  return bytesToHex(sha1Bytes(new TextEncoder().encode(message)));
}

export function sha256(message: string): string {
  return bytesToHex(sha256Bytes(new TextEncoder().encode(message)));
}

export function sha512(message: string): string {
  return bytesToHex(sha512Bytes(new TextEncoder().encode(message)));
}

export function hmac(algo: HashAlgo, keyStr: string, messageStr: string): string {
  const encoder = new TextEncoder();
  let key = encoder.encode(keyStr);
  const message = encoder.encode(messageStr);

  const blockSize = algo === 'sha512' ? 128 : 64;
  if (key.length > blockSize) {
    key = hashBytes(algo, key) as any;
  }
  if (key.length < blockSize) {
    const paddedKey = new Uint8Array(blockSize);
    paddedKey.set(key);
    key = paddedKey as any;
  }

  const ipad = new Uint8Array(blockSize);
  const opad = new Uint8Array(blockSize);
  for (let i = 0; i < blockSize; i++) {
    ipad[i] = key[i] ^ 0x36;
    opad[i] = key[i] ^ 0x5c;
  }

  const innerMsg = new Uint8Array(blockSize + message.length);
  innerMsg.set(ipad, 0);
  innerMsg.set(message, blockSize);
  const innerHash = hashBytes(algo, innerMsg);

  const outerMsg = new Uint8Array(blockSize + innerHash.length);
  outerMsg.set(opad, 0);
  outerMsg.set(innerHash, blockSize);
  const outerHash = hashBytes(algo, outerMsg);

  return bytesToHex(outerHash);
}

// HMAC on bytes (for file hashing)
function hmacBytes(algo: HashAlgo, keyStr: string, msgBytes: Uint8Array): string {
  const encoder = new TextEncoder();
  let key = encoder.encode(keyStr);

  const blockSize = algo === 'sha512' ? 128 : 64;
  if (key.length > blockSize) {
    key = hashBytes(algo, key);
  }
  if (key.length < blockSize) {
    const paddedKey = new Uint8Array(blockSize);
    paddedKey.set(key);
    key = paddedKey;
  }

  const ipad = new Uint8Array(blockSize);
  const opad = new Uint8Array(blockSize);
  for (let i = 0; i < blockSize; i++) {
    ipad[i] = key[i] ^ 0x36;
    opad[i] = key[i] ^ 0x5c;
  }

  const innerMsg = new Uint8Array(blockSize + msgBytes.length);
  innerMsg.set(ipad, 0);
  innerMsg.set(msgBytes, blockSize);
  const innerHash = hashBytes(algo, innerMsg);

  const outerMsg = new Uint8Array(blockSize + innerHash.length);
  outerMsg.set(opad, 0);
  outerMsg.set(innerHash, blockSize);
  const outerHash = hashBytes(algo, outerMsg);

  return bytesToHex(outerHash);
}

// ==========================================
// CLIENT COMPONENT
// ==========================================

const PRO_LIMIT = false; // hardcoded false until auth is wired up
const FREE_LIMIT_BATCH_LINES = 5;

interface BatchRow {
  line: string;
  md5: string;
  sha1: string;
  sha256: string;
  sha512: string;
  hmacMd5: string;
  hmacSha1: string;
  hmacSha256: string;
  hmacSha512: string;
}

interface FileHashResult {
  md5: string;
  sha1: string;
  sha256: string;
  sha512: string;
  hmacMd5: string;
  hmacSha1: string;
  hmacSha256: string;
  hmacSha512: string;
}

export default function HashGeneratorClient() {
  const [input, setInput] = useState<string>('Hello, World!')
  const [batchMode, setBatchMode] = useState<boolean>(false)
  const [hmacKey, setHmacKey] = useState<string>('secret-key')
  const [showHmacKey, setShowHmacKey] = useState<boolean>(true)
  const [visibleCols, setVisibleCols] = useState<Record<string, boolean>>({
    md5: true,
    sha1: false,
    sha256: true,
    sha512: false,
    hmacMd5: false,
    hmacSha1: false,
    hmacSha256: true,
    hmacSha512: false,
  })

  // File hashing state
  const [hashFile, setHashFile] = useState<File | null>(null)
  const [hashFileResults, setHashFileResults] = useState<FileHashResult | null>(null)
  const [isHashingFile, setIsHashingFile] = useState(false)
  const [hashFileDragActive, setHashFileDragActive] = useState(false)
  const [hashFileError, setHashFileError] = useState<string | null>(null)
  const hashFileInputRef = useRef<HTMLInputElement>(null)

  // Custom cell copy feedback state
  const [copiedCell, setCopiedCell] = useState<{ rowIndex: number; colKey: string } | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = (message: string) => {
    setToastMessage(message)
    setTimeout(() => setToastMessage(null), 3000)
  }

  const hasHmacKey = hmacKey.trim().length > 0

  // Calculate hashes for single mode
  const singleHashes = useMemo(() => {
    if (batchMode) return null
    const base = {
      md5: md5(input),
      sha1: sha1(input),
      sha256: sha256(input),
      sha512: sha512(input),
    }
    const hmacBase = hasHmacKey ? {
      hmacMd5: hmac('md5', hmacKey, input),
      hmacSha1: hmac('sha1', hmacKey, input),
      hmacSha256: hmac('sha256', hmacKey, input),
      hmacSha512: hmac('sha512', hmacKey, input),
    } : {
      hmacMd5: '',
      hmacSha1: '',
      hmacSha256: '',
      hmacSha512: '',
    }
    return { ...base, ...hmacBase }
  }, [input, batchMode, hmacKey, hasHmacKey])

  // Split input for batch mode
  const batchLines = useMemo(() => {
    return input.split('\n')
  }, [input])

  // Calculate hashes for batch lines
  const batchHashes = useMemo(() => {
    if (!batchMode) return []
    const linesToProcess = PRO_LIMIT ? batchLines : batchLines.slice(0, FREE_LIMIT_BATCH_LINES)

    return linesToProcess.map((line): BatchRow => ({
      line,
      md5: md5(line),
      sha1: sha1(line),
      sha256: sha256(line),
      sha512: sha512(line),
      hmacMd5: hasHmacKey ? hmac('md5', hmacKey, line) : '',
      hmacSha1: hasHmacKey ? hmac('sha1', hmacKey, line) : '',
      hmacSha256: hasHmacKey ? hmac('sha256', hmacKey, line) : '',
      hmacSha512: hasHmacKey ? hmac('sha512', hmacKey, line) : '',
    }))
  }, [batchLines, batchMode, hmacKey, hasHmacKey])

  // Stats calculation
  const stats = useMemo(() => {
    const chars = input.length
    const lines = batchLines.length
    const words = input.trim() === '' ? 0 : input.trim().split(/\s+/).length
    return { chars, lines, words }
  }, [input, batchLines])

  // Copy cell value in batch table
  const copyCell = useCallback((text: string, rowIndex: number, colKey: string) => {
    navigator.clipboard.writeText(text)
    setCopiedCell({ rowIndex, colKey })
    setTimeout(() => setCopiedCell(null), 2000)
  }, [])

  // Copy all hashes in single mode
  const copyAllHashes = () => {
    if (!singleHashes) return
    const lines = [
      `MD5: ${singleHashes.md5}`,
      `SHA-1: ${singleHashes.sha1}`,
      `SHA-256: ${singleHashes.sha256}`,
      `SHA-512: ${singleHashes.sha512}`,
    ]
    if (hasHmacKey) {
      lines.push(`---`)
      lines.push(`HMAC-MD5: ${singleHashes.hmacMd5}`)
      lines.push(`HMAC-SHA1: ${singleHashes.hmacSha1}`)
      lines.push(`HMAC-SHA256: ${singleHashes.hmacSha256}`)
      lines.push(`HMAC-SHA512: ${singleHashes.hmacSha512}`)
    }
    navigator.clipboard.writeText(lines.join('\n'))
    showToast('All hashes copied to clipboard!')
  }

  // File hashing handlers
  const handleHashFile = (file: File) => {
    setHashFileError(null)
    setHashFile(null)
    setHashFileResults(null)
    setIsHashingFile(true)

    const reader = new FileReader()
    reader.onload = () => {
      const arrayBuffer = reader.result as ArrayBuffer
      const bytes = new Uint8Array(arrayBuffer)

      const results: FileHashResult = {
        md5: bytesToHex(md5Bytes(bytes)),
        sha1: bytesToHex(sha1Bytes(bytes)),
        sha256: bytesToHex(sha256Bytes(bytes)),
        sha512: bytesToHex(sha512Bytes(bytes)),
        hmacMd5: hasHmacKey ? hmacBytes('md5', hmacKey, bytes) : '',
        hmacSha1: hasHmacKey ? hmacBytes('sha1', hmacKey, bytes) : '',
        hmacSha256: hasHmacKey ? hmacBytes('sha256', hmacKey, bytes) : '',
        hmacSha512: hasHmacKey ? hmacBytes('sha512', hmacKey, bytes) : '',
      }

      setHashFile(file)
      setHashFileResults(results)
      setIsHashingFile(false)
    }

    reader.onerror = () => {
      setHashFileError('Error reading file.')
      setIsHashingFile(false)
    }

    reader.readAsArrayBuffer(file)
  }

  const handleHashFileDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setHashFileDragActive(true)
    } else if (e.type === "dragleave") {
      setHashFileDragActive(false)
    }
  }

  const handleHashFileDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setHashFileDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleHashFile(e.dataTransfer.files[0])
    }
  }

  const handleHashFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleHashFile(e.target.files[0])
    }
  }

  const clearHashFile = () => {
    setHashFile(null)
    setHashFileResults(null)
    setHashFileError(null)
    if (hashFileInputRef.current) {
      hashFileInputRef.current.value = ''
    }
  }

  // Export batch CSV
  const exportCSV = () => {
    if (!batchMode || batchHashes.length === 0) return

    const headers = ['Line Index', 'Input Line']
    const colsKeys: string[] = []

    if (visibleCols.md5) { headers.push('MD5'); colsKeys.push('md5') }
    if (visibleCols.sha1) { headers.push('SHA-1'); colsKeys.push('sha1') }
    if (visibleCols.sha256) { headers.push('SHA-256'); colsKeys.push('sha256') }
    if (visibleCols.sha512) { headers.push('SHA-512'); colsKeys.push('sha512') }
    if (visibleCols.hmacMd5) { headers.push('HMAC-MD5'); colsKeys.push('hmacMd5') }
    if (visibleCols.hmacSha1) { headers.push('HMAC-SHA1'); colsKeys.push('hmacSha1') }
    if (visibleCols.hmacSha256) { headers.push('HMAC-SHA256'); colsKeys.push('hmacSha256') }
    if (visibleCols.hmacSha512) { headers.push('HMAC-SHA512'); colsKeys.push('hmacSha512') }

    const escapeCsv = (str: string) => `"${str.replace(/"/g, '""')}"`

    let csvContent = headers.join(',') + '\n'

    batchHashes.forEach((row, idx) => {
      const lineData = [
        String(idx + 1),
        escapeCsv(row.line),
        ...colsKeys.map(key => (row as any)[key])
      ]
      csvContent += lineData.join(',') + '\n'
    })

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `hash-generator-batch-${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    if (batchLines.length > FREE_LIMIT_BATCH_LINES) {
      showToast(`Exported first ${FREE_LIMIT_BATCH_LINES} rows! Upgrade to Pro for unlimited exports.`)
    } else {
      showToast('Exported CSV successfully!')
    }
  }

  const toggleCol = (key: string) => {
    setVisibleCols(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const truncateMiddle = (str: string, len = 8) => {
    if (str.length <= len * 2 + 3) return str
    return `${str.slice(0, len)}...${str.slice(-len)}`
  }

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
  }

  // SEO Content and FAQ
  const hashFaq = [
    {
      question: 'What is the difference between MD5, SHA-1, SHA-256, and SHA-512?',
      answer: 'MD5 produces a 128-bit hash, SHA-1 produces 160-bit, SHA-256 produces 256-bit, and SHA-512 produces 512-bit output. SHA-256 and SHA-512 are more secure and collision-resistant, while MD5 and SHA-1 are deprecated for cryptographic signatures but still useful for checksums and non-security applications.'
    },
    {
      question: 'What is HMAC and when should I use it?',
      answer: 'HMAC (Hash-based Message Authentication Code) combines a cryptographic hash with a secret key. It provides both integrity verification and authentication. Use HMAC for API request signing, webhook verification, and any scenario where you need to verify the source of a message.'
    },
    {
      question: 'Are my inputs secure when generating hashes?',
      answer: 'Yes. All hash generation happens client-side in your browser using pure TypeScript implementations. No data is sent to servers, and no inputs leave your device. This ensures complete privacy for sensitive strings, passwords, or any content you hash.'
    },
    {
      question: 'What is a collision attack and which algorithms are vulnerable?',
      answer: 'A collision attack finds two different inputs producing the same hash. MD5 and SHA-1 are both vulnerable to collision attacks, making them unsuitable for digital signatures or certificates. SHA-256 and SHA-512 remain collision-resistant for current practical purposes.'
    },
    {
      question: 'Can I hash binary data like files with this tool?',
      answer: 'Yes. Drag and drop a file onto the file hashing area below and this tool will compute MD5, SHA-1, SHA-256, SHA-512, and HMAC hashes of the file contents using FileReader with ArrayBuffer. All processing happens client-side with no uploads to any server.'
    }
  ]

  const hashSeo = (
    <div className="space-y-4">
      <h2 className="text-lg font-heading font-bold text-[#F9F9F9]">Generate Cryptographic Hashes in Your Browser</h2>
      <h3 className="text-sm font-heading font-bold text-[#F9F9F9]">What It Is</h3>
      <p>
        A cryptographic hash function takes an input (text, password, or data) and produces a fixed-size string of characters called a digest or hash. The same input always generates the same hash, but even a tiny change in the input produces a completely different hash. This tool computes MD5, SHA-1, SHA-256, SHA-512, and HMAC hashes entirely in your browser with no server uploads.
      </p>
      <h3 className="text-sm font-heading font-bold text-[#F9F9F9]">How It Works</h3>
      <p>
        Each algorithm breaks the input into fixed-size blocks and processes them through a series of bitwise operations, logical functions, and modular additions. MD5 uses Merkle-Damgard construction with 64 rounds. SHA-1 uses 80 rounds with a 160-bit buffer. SHA-256 and SHA-512 use 64 and 80 rounds respectively with larger state buffers. HMAC wraps any hash algorithm with a secret key, XORing the key with fixed padding constants before and after the core hash operation. All implementations here are pure TypeScript running client-side.
      </p>
      <h3 className="text-sm font-heading font-bold text-[#F9F9F9]">Worked Example</h3>
      <p>
        Input the text &quot;Hello, World!&quot; into the tool. MD5 produces &quot;65a8e27d8879283831b664bd8b7f0ad4&quot; (32 hex chars, 128 bits). SHA-256 produces &quot;dffd6021bb2bd5b0af676290809ec3a53191dd81c7f70a4b28688a362182986f&quot; (64 hex chars, 256 bits). Notice that &quot;hello, World!&quot; (lowercase h) produces a completely different hash, demonstrating the avalanche effect a single character change causes in the output.
      </p>
      <h3 className="text-sm font-heading font-bold text-[#F9F9F9]">Common Mistakes</h3>
      <p>
        Using MD5 or SHA-1 for security-sensitive contexts like password storage, digital signatures, or certificate validation is dangerous because collision attacks against both are practical. Another mistake is confusing HMAC with plain hashing: HMAC requires a secret key and provides authentication, not just integrity. Finally, forgetting that hash output encoding matters: hex encoding is the most common but base64 is more compact; mixing them up during comparison will give false negatives.
      </p>
    </div>
  )

  return (
    <ToolLayout
      title="Hash Generator"
      description="Generate secure cryptographic hashes simultaneously including MD5, SHA-1, SHA-256, SHA-512, and HMAC keys. Supports single text or multi-line batch execution and file hashing."
      toolSlug="hash-generator"
      faq={hashFaq}
      seoContent={hashSeo}
    >
      <div className="space-y-6">
        {/* Toggle Mode */}
        <div className="flex items-center justify-between p-4 border border-[#333333] bg-[#000000]">
          <div className="flex items-center gap-3">
            <Layers className="w-5 h-5 text-[#00FF41]" />
            <div>
              <h3 className="font-bold text-[#F9F9F9] text-sm sm:text-base">Batch Hashing Mode</h3>
              <p className="text-xs text-[#888888]">Hash each line of text separately in a side-by-side table.</p>
            </div>
          </div>
          <button
            onClick={() => setBatchMode(!batchMode)}
            className="flex items-center text-[#00FF41] focus:outline-none transition-colors duration-200"
            aria-label="Toggle batch mode"
          >
            {batchMode ? (
              <ToggleRight className="w-12 h-8 text-[#00FF41]" />
            ) : (
              <ToggleLeft className="w-12 h-8 text-[#888888]" />
            )}
          </button>
        </div>

        {/* Input Text Area */}
        <div>
          <label className="block text-sm font-bold text-[#F9F9F9] mb-2">
            {batchMode ? 'Input Text (Enter one item per line)' : 'Input Text'}
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={5}
            placeholder={batchMode ? 'line one\nline two\nline three' : 'Enter text to hash here...'}
            className="w-full px-4 py-3 border border-[#333333] bg-[#000000] text-[#F9F9F9] font-mono text-sm"
          />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          <StatCard label="Characters" value={stats.chars} color="blue" />
          <StatCard label="Lines" value={stats.lines} color="indigo" />
          <StatCard label="Words" value={stats.words} color="slate" />
        </div>

        {/* File Hashing -- Drag & Drop */}
        <div className="border border-[#333333] bg-[#000000] p-4">
          <div className="flex items-center gap-2 mb-3">
            <UploadCloud className="w-4 h-4 text-[#00FF41]" />
            <h3 className="text-sm font-bold text-[#F9F9F9]">File Hashing</h3>
          </div>

          {!hashFile && !isHashingFile && (
            <div
              onDragEnter={handleHashFileDrag}
              onDragOver={handleHashFileDrag}
              onDragLeave={handleHashFileDrag}
              onDrop={handleHashFileDrop}
              onClick={() => hashFileInputRef.current?.click()}
              className={`flex flex-col items-center justify-center border-2 border-dashed p-6 cursor-pointer transition-none ${
                hashFileDragActive
                  ? 'border-[#00FF41] bg-[#000000]'
                  : 'border-[#444444] hover:border-[#F9F9F9] bg-[#000000]'
              }`}
            >
              <input
                ref={hashFileInputRef}
                type="file"
                onChange={handleHashFileChange}
                className="hidden"
              />
              <UploadCloud className="w-8 h-8 text-[#555555] mb-2" />
              <p className="text-xs font-mono text-[#F9F9F9] text-center">{'>'} DRAG & DROP FILE HERE, OR CLICK TO BROWSE</p>
              <p className="text-[10px] font-mono text-[#555555] mt-1 text-center">
                Any file type - hashed client-side via ArrayBuffer
              </p>
            </div>
          )}

          {isHashingFile && (
            <div className="flex flex-col items-center justify-center py-8 border border-[#333333] bg-[#000000]">
              <div className="w-8 h-8 border-2 border-t-transparent border-[#F9F9F9] mb-2" style={{ animation: 'spin 1s linear infinite' }} />
              <p className="text-xs font-mono text-[#666666]">{'>'} HASHING FILE...</p>
            </div>
          )}

          {hashFileError && (
            <div className="p-3 border border-[#F9F9F9] bg-[#000000]">
              <p className="text-xs font-mono text-[#F9F9F9]">{'>'} ERROR</p>
              <p className="text-[10px] font-mono mt-0.5 text-[#888888]">{hashFileError}</p>
            </div>
          )}

          {hashFile && hashFileResults && (
            <div className="space-y-3">
              {/* File Info Row */}
              <div className="flex items-center justify-between p-3 border border-[#333333] bg-[#000000]">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="w-4 h-4 text-[#888888] flex-shrink-0" />
                  <span className="text-xs font-mono text-[#F9F9F9] truncate max-w-[180px]">{hashFile.name}</span>
                  <span className="text-[10px] font-mono text-[#555555]">({formatBytes(hashFile.size)})</span>
                </div>
                <button
                  type="button"
                  onClick={clearHashFile}
                  className="p-1 text-[#555555] hover:text-[#F9F9F9]"
                  title="Remove file"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* File Hash Results */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="flex items-center justify-between p-3 border border-[#333333] bg-[#000000]">
                  <div>
                    <span className="text-[10px] font-bold text-[#F9F9F9] uppercase">MD5</span>
                    <p className="font-mono text-[10px] text-[#888888] break-all select-all mt-0.5">{hashFileResults.md5}</p>
                  </div>
                  <CopyButton text={hashFileResults.md5} label="" className="flex-shrink-0 ml-2" />
                </div>
                <div className="flex items-center justify-between p-3 border border-[#333333] bg-[#000000]">
                  <div>
                    <span className="text-[10px] font-bold text-[#F9F9F9] uppercase">SHA-1</span>
                    <p className="font-mono text-[10px] text-[#888888] break-all select-all mt-0.5">{hashFileResults.sha1}</p>
                  </div>
                  <CopyButton text={hashFileResults.sha1} label="" className="flex-shrink-0 ml-2" />
                </div>
                <div className="flex items-center justify-between p-3 border border-[#333333] bg-[#000000]">
                  <div>
                    <span className="text-[10px] font-bold text-[#F9F9F9] uppercase">SHA-256</span>
                    <p className="font-mono text-[10px] text-[#888888] break-all select-all mt-0.5">{hashFileResults.sha256}</p>
                  </div>
                  <CopyButton text={hashFileResults.sha256} label="" className="flex-shrink-0 ml-2" />
                </div>
                <div className="flex items-center justify-between p-3 border border-[#333333] bg-[#000000]">
                  <div>
                    <span className="text-[10px] font-bold text-[#F9F9F9] uppercase">SHA-512</span>
                    <p className="font-mono text-[10px] text-[#888888] break-all select-all mt-0.5">{hashFileResults.sha512}</p>
                  </div>
                  <CopyButton text={hashFileResults.sha512} label="" className="flex-shrink-0 ml-2" />
                </div>
                {hasHmacKey && (
                  <>
                    <div className="flex items-center justify-between p-3 border border-[#333333] bg-[#000000]">
                      <div>
                        <span className="text-[10px] font-bold text-[#00FF41] uppercase">HMAC-MD5</span>
                        <p className="font-mono text-[10px] text-[#888888] break-all select-all mt-0.5">{hashFileResults.hmacMd5}</p>
                      </div>
                      <CopyButton text={hashFileResults.hmacMd5} label="" className="flex-shrink-0 ml-2" />
                    </div>
                    <div className="flex items-center justify-between p-3 border border-[#333333] bg-[#000000]">
                      <div>
                        <span className="text-[10px] font-bold text-[#00FF41] uppercase">HMAC-SHA1</span>
                        <p className="font-mono text-[10px] text-[#888888] break-all select-all mt-0.5">{hashFileResults.hmacSha1}</p>
                      </div>
                      <CopyButton text={hashFileResults.hmacSha1} label="" className="flex-shrink-0 ml-2" />
                    </div>
                    <div className="flex items-center justify-between p-3 border border-[#333333] bg-[#000000]">
                      <div>
                        <span className="text-[10px] font-bold text-[#00FF41] uppercase">HMAC-SHA256</span>
                        <p className="font-mono text-[10px] text-[#888888] break-all select-all mt-0.5">{hashFileResults.hmacSha256}</p>
                      </div>
                      <CopyButton text={hashFileResults.hmacSha256} label="" className="flex-shrink-0 ml-2" />
                    </div>
                    <div className="flex items-center justify-between p-3 border border-[#333333] bg-[#000000]">
                      <div>
                        <span className="text-[10px] font-bold text-[#00FF41] uppercase">HMAC-SHA512</span>
                        <p className="font-mono text-[10px] text-[#888888] break-all select-all mt-0.5">{hashFileResults.hmacSha512}</p>
                      </div>
                      <CopyButton text={hashFileResults.hmacSha512} label="" className="flex-shrink-0 ml-2" />
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Single Mode Output */}
        {!batchMode && singleHashes && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#F9F9F9]">Generated Hashes</h3>
              <button
                type="button"
                onClick={copyAllHashes}
                className="terminal-btn"
              >
                [<span className="green-chevron">&gt;</span> COPY ALL]
              </button>
            </div>

            <div className="space-y-4">
              {/* MD5 */}
              <div className="p-4 border border-[#333333] bg-[#000000] flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#F9F9F9]">MD5</span>
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-red-100 text-[#FF4444]">128-bit</span>
                  </div>
                  <div className="font-mono text-xs text-[#888888] break-all select-all pr-2">
                    {singleHashes.md5 || <span className="italic text-[#888888]">Empty Input</span>}
                  </div>
                </div>
                <CopyButton text={singleHashes.md5} label="Copy MD5" className="self-end md:self-center" />
              </div>

              {/* SHA-1 */}
              <div className="p-4 border border-[#333333] bg-[#000000] flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#F9F9F9]">SHA-1</span>
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-yellow-100 text-yellow-700">160-bit</span>
                  </div>
                  <div className="font-mono text-xs text-[#888888] break-all select-all pr-2">
                    {singleHashes.sha1 || <span className="italic text-[#888888]">Empty Input</span>}
                  </div>
                </div>
                <CopyButton text={singleHashes.sha1} label="Copy SHA-1" className="self-end md:self-center" />
              </div>

              {/* SHA-256 */}
              <div className="p-4 border border-[#333333] bg-[#000000] flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#F9F9F9]">SHA-256</span>
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-green-100 text-[#00FF41]">256-bit</span>
                  </div>
                  <div className="font-mono text-xs text-[#888888] break-all select-all pr-2">
                    {singleHashes.sha256 || <span className="italic text-[#888888]">Empty Input</span>}
                  </div>
                </div>
                <CopyButton text={singleHashes.sha256} label="Copy SHA-256" className="self-end md:self-center" />
              </div>

              {/* SHA-512 */}
              <div className="p-4 border border-[#333333] bg-[#000000] flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#F9F9F9]">SHA-512</span>
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-100 text-[#00FF41]">512-bit</span>
                  </div>
                  <div className="font-mono text-xs text-[#888888] break-all select-all pr-2">
                    {singleHashes.sha512 || <span className="italic text-[#888888]">Empty Input</span>}
                  </div>
                </div>
                <CopyButton text={singleHashes.sha512} label="Copy SHA-512" className="self-end md:self-center" />
              </div>

              {/* HMAC Section -- shows all 4 HMAC variants when a key is provided */}
              {hasHmacKey && (
                <div className="p-4 border border-[#333333] bg-[#000000] space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#F9F9F9]">HMAC Hashes</span>
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-purple-100 text-[#a78bfa]">Keyed Hash</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {showHmacKey && (
                        <div className="flex items-center bg-[#000000] border border-[#333333] px-3 py-1.5">
                          <span className="text-[10px] font-bold text-[#888888] uppercase tracking-wider mr-2">Key:</span>
                          <input
                            type="text"
                            value={hmacKey}
                            onChange={(e) => setHmacKey(e.target.value)}
                            placeholder="Enter key..."
                            className="bg-transparent text-xs font-mono text-[#F9F9F9] outline-none w-28 sm:w-36 border-none p-0"
                          />
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => setShowHmacKey(!showHmacKey)}
                        className="p-1.5 text-[#555555] hover:text-[#00FF41] transition-none"
                        title={showHmacKey ? 'Hide key field' : 'Show key field'}
                      >
                        {showHmacKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {/* HMAC-MD5 */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-t border-[#333333] pt-3">
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-[#00FF41] uppercase">HMAC-MD5</span>
                        <p className="font-mono text-xs text-[#888888] break-all select-all pr-2">
                          {singleHashes.hmacMd5 || <span className="italic text-[#888888]">Empty Input</span>}
                        </p>
                      </div>
                      <CopyButton text={singleHashes.hmacMd5} label="Copy HMAC-MD5" className="self-end md:self-center flex-shrink-0" />
                    </div>

                    {/* HMAC-SHA1 */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-[#00FF41] uppercase">HMAC-SHA1</span>
                        <p className="font-mono text-xs text-[#888888] break-all select-all pr-2">
                          {singleHashes.hmacSha1 || <span className="italic text-[#888888]">Empty Input</span>}
                        </p>
                      </div>
                      <CopyButton text={singleHashes.hmacSha1} label="Copy HMAC-SHA1" className="self-end md:self-center flex-shrink-0" />
                    </div>

                    {/* HMAC-SHA256 */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-[#00FF41] uppercase">HMAC-SHA256</span>
                        <p className="font-mono text-xs text-[#888888] break-all select-all pr-2">
                          {singleHashes.hmacSha256 || <span className="italic text-[#888888]">Empty Input</span>}
                        </p>
                      </div>
                      <CopyButton text={singleHashes.hmacSha256} label="Copy HMAC-SHA256" className="self-end md:self-center flex-shrink-0" />
                    </div>

                    {/* HMAC-SHA512 */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-[#00FF41] uppercase">HMAC-SHA512</span>
                        <p className="font-mono text-xs text-[#888888] break-all select-all pr-2">
                          {singleHashes.hmacSha512 || <span className="italic text-[#888888]">Empty Input</span>}
                        </p>
                      </div>
                      <CopyButton text={singleHashes.hmacSha512} label="Copy HMAC-SHA512" className="self-end md:self-center flex-shrink-0" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Batch Mode View */}
        {batchMode && (
          <div className="space-y-6">
            <div className="p-4 border border-[#333333] bg-[#000000] space-y-4">
              <h3 className="text-sm font-bold text-[#F9F9F9] flex items-center gap-2">
                <Settings className="w-4 h-4 text-[#888888]" />
                Batch Hashing Configuration
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* HMAC Key */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-bold text-[#888888] uppercase tracking-wider">HMAC Key</label>
                    <button
                      type="button"
                      onClick={() => setShowHmacKey(!showHmacKey)}
                      className="p-1 text-[#555555] hover:text-[#00FF41] transition-none"
                      title={showHmacKey ? 'Hide key field' : 'Show key field'}
                    >
                      {showHmacKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {showHmacKey && (
                    <input
                      type="text"
                      value={hmacKey}
                      onChange={(e) => setHmacKey(e.target.value)}
                      placeholder="Enter secret key..."
                      className="w-full px-3 py-2 border border-[#333333] bg-[#000000] text-[#F9F9F9] font-mono text-sm"
                    />
                  )}
                </div>
              </div>

              {/* Column Selectors */}
              <div className="pt-2">
                <label className="block text-xs font-bold text-[#888888] uppercase tracking-wider mb-2">Columns to Display</label>
                <div className="flex flex-wrap gap-3">
                  <label className="inline-flex items-center gap-2 text-xs font-bold text-[#F9F9F9] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={visibleCols.md5}
                      onChange={() => toggleCol('md5')}
                      className="border-[#333333] text-[#00FF41]"
                    />
                    <span className="uppercase">MD5</span>
                  </label>
                  <label className="inline-flex items-center gap-2 text-xs font-bold text-[#F9F9F9] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={visibleCols.sha1}
                      onChange={() => toggleCol('sha1')}
                      className="border-[#333333] text-[#00FF41]"
                    />
                    <span className="uppercase">SHA-1</span>
                  </label>
                  <label className="inline-flex items-center gap-2 text-xs font-bold text-[#F9F9F9] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={visibleCols.sha256}
                      onChange={() => toggleCol('sha256')}
                      className="border-[#333333] text-[#00FF41]"
                    />
                    <span className="uppercase">SHA-256</span>
                  </label>
                  <label className="inline-flex items-center gap-2 text-xs font-bold text-[#F9F9F9] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={visibleCols.sha512}
                      onChange={() => toggleCol('sha512')}
                      className="border-[#333333] text-[#00FF41]"
                    />
                    <span className="uppercase">SHA-512</span>
                  </label>
                  {hasHmacKey && (
                    <>
                      <label className="inline-flex items-center gap-2 text-xs font-bold text-[#00FF41] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={visibleCols.hmacMd5}
                          onChange={() => toggleCol('hmacMd5')}
                          className="border-[#333333] text-[#00FF41]"
                        />
                        <span className="uppercase">HMAC-MD5</span>
                      </label>
                      <label className="inline-flex items-center gap-2 text-xs font-bold text-[#00FF41] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={visibleCols.hmacSha1}
                          onChange={() => toggleCol('hmacSha1')}
                          className="border-[#333333] text-[#00FF41]"
                        />
                        <span className="uppercase">HMAC-SHA1</span>
                      </label>
                      <label className="inline-flex items-center gap-2 text-xs font-bold text-[#00FF41] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={visibleCols.hmacSha256}
                          onChange={() => toggleCol('hmacSha256')}
                          className="border-[#333333] text-[#00FF41]"
                        />
                        <span className="uppercase">HMAC-SHA256</span>
                      </label>
                      <label className="inline-flex items-center gap-2 text-xs font-bold text-[#00FF41] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={visibleCols.hmacSha512}
                          onChange={() => toggleCol('hmacSha512')}
                          className="border-[#333333] text-[#00FF41]"
                        />
                        <span className="uppercase">HMAC-SHA512</span>
                      </label>
                    </>
                  )}
                </div>
              </div>

              {/* Export Panel */}
              <div className="pt-2 flex justify-between items-center flex-wrap gap-3 border-t border-[#333333]">
                <p className="text-xs text-[#888888]">
                  {batchLines.length > FREE_LIMIT_BATCH_LINES ? (
                    <span className="text-[#00FF41] font-bold">
                      -- Showing first {FREE_LIMIT_BATCH_LINES} rows under free plan
                    </span>
                  ) : (
                    <span>Processing {batchLines.length} line(s)</span>
                  )}
                </p>

                <div className="flex gap-2">
                  <button
                    onClick={exportCSV}
                    className="terminal-btn"
                  >
                    [<span className="green-chevron">&gt;</span> EXPORT CSV]
                  </button>
                  {toastMessage && (
                    <div className="text-xs text-[#00FF41] bg-[#000000] border border-[#333333] px-2.5 py-1.5 self-center animate-fade-in">
                      {toastMessage}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Results Table */}
            {batchHashes.length > 0 && (
              <div className="border border-[#333333] overflow-hidden bg-[#000000]">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead>
                      <tr className="bg-[#000000] border-b border-[#333333]">
                        <th className="p-3 text-xs font-bold text-[#888888] uppercase tracking-wider w-20">Line #</th>
                        <th className="p-3 text-xs font-bold text-[#888888] uppercase tracking-wider min-w-[150px]">Input Line</th>
                        {visibleCols.md5 && <th className="p-3 text-xs font-bold text-[#888888] uppercase tracking-wider">MD5</th>}
                        {visibleCols.sha1 && <th className="p-3 text-xs font-bold text-[#888888] uppercase tracking-wider">SHA-1</th>}
                        {visibleCols.sha256 && <th className="p-3 text-xs font-bold text-[#888888] uppercase tracking-wider">SHA-256</th>}
                        {visibleCols.sha512 && <th className="p-3 text-xs font-bold text-[#888888] uppercase tracking-wider">SHA-512</th>}
                        {visibleCols.hmacMd5 && <th className="p-3 text-xs font-bold text-[#00FF41] uppercase tracking-wider">HMAC-MD5</th>}
                        {visibleCols.hmacSha1 && <th className="p-3 text-xs font-bold text-[#00FF41] uppercase tracking-wider">HMAC-SHA1</th>}
                        {visibleCols.hmacSha256 && <th className="p-3 text-xs font-bold text-[#00FF41] uppercase tracking-wider">HMAC-SHA256</th>}
                        {visibleCols.hmacSha512 && <th className="p-3 text-xs font-bold text-[#00FF41] uppercase tracking-wider">HMAC-SHA512</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-150 font-mono text-xs">
                      {batchHashes.map((row, rowIndex) => (
                        <tr key={rowIndex} className="hover:bg-[#000000] transition-colors">
                          <td className="p-3 font-bold text-[#888888]">{rowIndex + 1}</td>
                          <td className="p-3 font-sans max-w-[200px] truncate text-[#F9F9F9]" title={row.line}>
                            {row.line || <span className="italic text-[#888888] font-mono text-xs">empty line</span>}
                          </td>

                          {/* MD5 Cell */}
                          {visibleCols.md5 && (
                            <td className="p-3">
                              <div className="flex items-center gap-2 group justify-between">
                                <span className="text-[#F9F9F9] pr-1 select-all">
                                  {truncateMiddle(row.md5)}
                                </span>
                                <button
                                  onClick={() => copyCell(row.md5, rowIndex, 'md5')}
                                  className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-1 text-[#888888] hover:text-[#00FF41] transition-opacity bg-[#000000] hover:bg-[#000000] cursor-pointer"
                                  title="Copy hash"
                                >
                                  {copiedCell?.rowIndex === rowIndex && copiedCell?.colKey === 'md5' ? (
                                    <Check className="w-3.5 h-3.5 text-[#00FF41]" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </div>
                            </td>
                          )}

                          {/* SHA-1 Cell */}
                          {visibleCols.sha1 && (
                            <td className="p-3">
                              <div className="flex items-center gap-2 group justify-between">
                                <span className="text-[#F9F9F9] pr-1 select-all">
                                  {truncateMiddle(row.sha1)}
                                </span>
                                <button
                                  onClick={() => copyCell(row.sha1, rowIndex, 'sha1')}
                                  className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-1 text-[#888888] hover:text-[#00FF41] transition-opacity bg-[#000000] hover:bg-[#000000] cursor-pointer"
                                  title="Copy hash"
                                >
                                  {copiedCell?.rowIndex === rowIndex && copiedCell?.colKey === 'sha1' ? (
                                    <Check className="w-3.5 h-3.5 text-[#00FF41]" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </div>
                            </td>
                          )}

                          {/* SHA-256 Cell */}
                          {visibleCols.sha256 && (
                            <td className="p-3">
                              <div className="flex items-center gap-2 group justify-between">
                                <span className="text-[#F9F9F9] pr-1 select-all">
                                  {truncateMiddle(row.sha256)}
                                </span>
                                <button
                                  onClick={() => copyCell(row.sha256, rowIndex, 'sha256')}
                                  className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-1 text-[#888888] hover:text-[#00FF41] transition-opacity bg-[#000000] hover:bg-[#000000] cursor-pointer"
                                  title="Copy hash"
                                >
                                  {copiedCell?.rowIndex === rowIndex && copiedCell?.colKey === 'sha256' ? (
                                    <Check className="w-3.5 h-3.5 text-[#00FF41]" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </div>
                            </td>
                          )}

                          {/* SHA-512 Cell */}
                          {visibleCols.sha512 && (
                            <td className="p-3">
                              <div className="flex items-center gap-2 group justify-between">
                                <span className="text-[#F9F9F9] pr-1 select-all">
                                  {truncateMiddle(row.sha512)}
                                </span>
                                <button
                                  onClick={() => copyCell(row.sha512, rowIndex, 'sha512')}
                                  className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-1 text-[#888888] hover:text-[#00FF41] transition-opacity bg-[#000000] hover:bg-[#000000] cursor-pointer"
                                  title="Copy hash"
                                >
                                  {copiedCell?.rowIndex === rowIndex && copiedCell?.colKey === 'sha512' ? (
                                    <Check className="w-3.5 h-3.5 text-[#00FF41]" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </div>
                            </td>
                          )}

                          {/* HMAC-MD5 Cell */}
                          {visibleCols.hmacMd5 && (
                            <td className="p-3">
                              <div className="flex items-center gap-2 group justify-between">
                                <span className="text-[#00FF41] pr-1 select-all">
                                  {truncateMiddle(row.hmacMd5)}
                                </span>
                                <button
                                  onClick={() => copyCell(row.hmacMd5, rowIndex, 'hmacMd5')}
                                  className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-1 text-[#888888] hover:text-[#00FF41] transition-opacity bg-[#000000] hover:bg-[#000000] cursor-pointer"
                                  title="Copy HMAC-MD5"
                                >
                                  {copiedCell?.rowIndex === rowIndex && copiedCell?.colKey === 'hmacMd5' ? (
                                    <Check className="w-3.5 h-3.5 text-[#00FF41]" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </div>
                            </td>
                          )}

                          {/* HMAC-SHA1 Cell */}
                          {visibleCols.hmacSha1 && (
                            <td className="p-3">
                              <div className="flex items-center gap-2 group justify-between">
                                <span className="text-[#00FF41] pr-1 select-all">
                                  {truncateMiddle(row.hmacSha1)}
                                </span>
                                <button
                                  onClick={() => copyCell(row.hmacSha1, rowIndex, 'hmacSha1')}
                                  className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-1 text-[#888888] hover:text-[#00FF41] transition-opacity bg-[#000000] hover:bg-[#000000] cursor-pointer"
                                  title="Copy HMAC-SHA1"
                                >
                                  {copiedCell?.rowIndex === rowIndex && copiedCell?.colKey === 'hmacSha1' ? (
                                    <Check className="w-3.5 h-3.5 text-[#00FF41]" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </div>
                            </td>
                          )}

                          {/* HMAC-SHA256 Cell */}
                          {visibleCols.hmacSha256 && (
                            <td className="p-3">
                              <div className="flex items-center gap-2 group justify-between">
                                <span className="text-[#00FF41] pr-1 select-all">
                                  {truncateMiddle(row.hmacSha256)}
                                </span>
                                <button
                                  onClick={() => copyCell(row.hmacSha256, rowIndex, 'hmacSha256')}
                                  className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-1 text-[#888888] hover:text-[#00FF41] transition-opacity bg-[#000000] hover:bg-[#000000] cursor-pointer"
                                  title="Copy HMAC-SHA256"
                                >
                                  {copiedCell?.rowIndex === rowIndex && copiedCell?.colKey === 'hmacSha256' ? (
                                    <Check className="w-3.5 h-3.5 text-[#00FF41]" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </div>
                            </td>
                          )}

                          {/* HMAC-SHA512 Cell */}
                          {visibleCols.hmacSha512 && (
                            <td className="p-3">
                              <div className="flex items-center gap-2 group justify-between">
                                <span className="text-[#00FF41] pr-1 select-all">
                                  {truncateMiddle(row.hmacSha512)}
                                </span>
                                <button
                                  onClick={() => copyCell(row.hmacSha512, rowIndex, 'hmacSha512')}
                                  className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-1 text-[#888888] hover:text-[#00FF41] transition-opacity bg-[#000000] hover:bg-[#000000] cursor-pointer"
                                  title="Copy HMAC-SHA512"
                                >
                                  {copiedCell?.rowIndex === rowIndex && copiedCell?.colKey === 'hmacSha512' ? (
                                    <Check className="w-3.5 h-3.5 text-[#00FF41]" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}

                      {/* Free Limit Warning Row inside Table */}
                      {!PRO_LIMIT && batchLines.length > FREE_LIMIT_BATCH_LINES && (
                        <tr className="bg-amber-500/5">
                          <td colSpan={2 + Object.values(visibleCols).filter(Boolean).length} className="p-4 font-sans text-center text-xs text-[#00FF41] font-bold">
                            Only showing the first {FREE_LIMIT_BATCH_LINES} lines of {batchLines.length}. Upgrade to Pro to process the remaining {batchLines.length - FREE_LIMIT_BATCH_LINES} lines simultaneously.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
