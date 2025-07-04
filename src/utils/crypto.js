// src/utils/crypto.js
// 前端消息加密与签名工具

// base64 编码/解码
export function arrayBufferToBase64(buffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}
export function base64ToArrayBuffer(base64) {
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

// 生成 AES 密钥和 IV
export async function generateAesKeyIv() {
  const key = await window.crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
  const iv = window.crypto.getRandomValues(new Uint8Array(12)); // 96bit IV
  return { key, iv };
}

// AES 加密
export async function aesEncrypt(plainText, key, iv) {
  const enc = new TextEncoder();
  const data = enc.encode(plainText);
  const cipherBuffer = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    data
  );
  return cipherBuffer;
}

// 解密：用AES密钥解密消息内容
export async function aesDecrypt(ciphertextBase64, key, ivBase64) {
  const ciphertext = base64ToArrayBuffer(ciphertextBase64);
  const iv = base64ToArrayBuffer(ivBase64);
  const plainBuffer = await window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    ciphertext
  );
  return new TextDecoder().decode(plainBuffer);
}

// 用 RSA 公钥加密 AES 密钥
export async function rsaEncryptAesKey(aesKey, publicKeyPem) {
  // 1. 导入公钥
  const key = await importRsaPublicKey(publicKeyPem);
  // 2. 导出 AES 密钥原始数据
  const rawAes = await window.crypto.subtle.exportKey('raw', aesKey);
  // 3. 用公钥加密
  const encrypted = await window.crypto.subtle.encrypt(
    { name: 'RSA-OAEP' },
    key,
    rawAes
  );
  return encrypted;
}

// 用于解密的RSA私钥导入（RSA-OAEP）
export async function importRsaPrivateKeyForDecrypt(pem) {
  const b64 = pem.replace(/-----[^-]+-----/g, '').replace(/\s+/g, '');
  const der = base64ToArrayBuffer(b64);
  return window.crypto.subtle.importKey(
    'pkcs8',
    der,
    { name: 'RSA-OAEP', hash: 'SHA-256' },
    true,
    ['decrypt']
  );
}

// 解密：用RSA私钥解密AES密钥
export async function rsaDecryptAesKey(encryptedKeyBase64, privateKeyPem) {
  try {
    const key = await importRsaPrivateKeyForDecrypt(privateKeyPem);
    const encryptedKey = base64ToArrayBuffer(encryptedKeyBase64);
    const rawAes = await window.crypto.subtle.decrypt(
      { name: 'RSA-OAEP' },
      key,
      encryptedKey
    );
    return await window.crypto.subtle.importKey(
      'raw',
      rawAes,
      { name: 'AES-GCM', length: 256 },
      false,
      ['decrypt']
    );
  } catch (err) {
    throw err;
  }
}

// 用 RSA 私钥签名（修正：签名算法应与密钥用途匹配）
export async function signMessage(plainText, privateKeyPem) {
  // 用于签名的私钥应用 RSASSA-PKCS1-v1_5 算法导入
  const key = await importRsaPrivateKeyForSign(privateKeyPem);
  const enc = new TextEncoder();
  const data = enc.encode(plainText);
  const signature = await window.crypto.subtle.sign(
    { name: 'RSASSA-PKCS1-v1_5' },
    key,
    data
  );
  return signature;
}

// 用于签名的RSA私钥导入（RSASSA-PKCS1-v1_5）
export async function importRsaPrivateKeyForSign(pem) {
  const b64 = pem.replace(/-----[^-]+-----/g, '').replace(/\s+/g, '');
  const der = base64ToArrayBuffer(b64);
  return window.crypto.subtle.importKey(
    'pkcs8',
    der,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    true,
    ['sign']
  );
}

// PEM -> CryptoKey 导入
export async function importRsaPublicKey(pem) {
  // 去掉头尾
  const b64 = pem.replace(/-----[^-]+-----/g, '').replace(/\s+/g, '');
  const der = base64ToArrayBuffer(b64);
  return window.crypto.subtle.importKey(
    'spki',
    der,
    { name: 'RSA-OAEP', hash: 'SHA-256' },
    true,
    ['encrypt']
  );
}

// 组合加密与签名操作
export async function encryptAndSignMessage({
  plainText,
  receiverPublicKeyPem,
  senderPrivateKeyPem
}) {
  // 1. 生成 AES 密钥和 IV
  const { key: aesKey, iv } = await generateAesKeyIv();
  // 2. AES 加密消息内容
  const cipherBuffer = await aesEncrypt(plainText, aesKey, iv);
  // 3. 用对方公钥加密 AES 密钥
  const encryptedAesKey = await rsaEncryptAesKey(aesKey, receiverPublicKeyPem);
  // 4. 用自己私钥签名明文
  const signature = await signMessage(plainText, senderPrivateKeyPem);
  // 5. base64 编码
  return {
    ciphertext: arrayBufferToBase64(cipherBuffer),
    encrypted_key: arrayBufferToBase64(encryptedAesKey),
    iv: arrayBufferToBase64(iv),
    signature: arrayBufferToBase64(signature)
  };
}

// 检查公私钥是否配对
export async function checkKeyPair(privateKeyPem, publicKeyPem) {
  try {
    const testData = new TextEncoder().encode("test123" + Math.random());
    const privateKey = await window.crypto.subtle.importKey(
      'pkcs8',
      (() => { const b64 = privateKeyPem.replace(/-----[^-]+-----/g, '').replace(/\s+/g, ''); return Uint8Array.from(atob(b64), c => c.charCodeAt(0)); })(),
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const publicKey = await window.crypto.subtle.importKey(
      'spki',
      (() => { const b64 = publicKeyPem.replace(/-----[^-]+-----/g, '').replace(/\s+/g, ''); return Uint8Array.from(atob(b64), c => c.charCodeAt(0)); })(),
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
      false,
      ['verify']
    );
    const signature = await window.crypto.subtle.sign(
      { name: 'RSASSA-PKCS1-v1_5' },
      privateKey,
      testData
    );
    const valid = await window.crypto.subtle.verify(
      { name: 'RSASSA-PKCS1-v1_5' },
      publicKey,
      signature,
      testData
    );
    return valid;
  } catch {
    return false;
  }
}
