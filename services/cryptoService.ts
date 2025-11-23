// --- Utils ---
const buffToB64 = (buff: ArrayBuffer): string => btoa(String.fromCharCode(...new Uint8Array(buff)));
const b64ToBuff = (b64: string): Uint8Array => Uint8Array.from(atob(b64), c => c.charCodeAt(0));

// --- AES ---
// We use PBKDF2 to derive a key from a user password, then AES-GCM
const getAesKey = async (password: string, salt: Uint8Array) => {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );
  return window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000,
      hash: "SHA-256"
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
};

export const encryptAES = async (text: string, password: string): Promise<string> => {
  try {
    const salt = window.crypto.getRandomValues(new Uint8Array(16));
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const key = await getAesKey(password, salt);
    const enc = new TextEncoder();
    
    const encrypted = await window.crypto.subtle.encrypt(
      { name: "AES-GCM", iv: iv },
      key,
      enc.encode(text)
    );

    // Pack Salt + IV + Ciphertext
    const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
    combined.set(salt);
    combined.set(iv, salt.length);
    combined.set(new Uint8Array(encrypted), salt.length + iv.length);

    return buffToB64(combined.buffer);
  } catch (e) {
    throw new Error("AES Encryption failed");
  }
};

export const decryptAES = async (b64Cipher: string, password: string): Promise<string> => {
  try {
    const combined = b64ToBuff(b64Cipher);
    const salt = combined.slice(0, 16);
    const iv = combined.slice(16, 28);
    const data = combined.slice(28);

    const key = await getAesKey(password, salt);
    
    const decrypted = await window.crypto.subtle.decrypt(
      { name: "AES-GCM", iv: iv },
      key,
      data
    );

    return new TextDecoder().decode(decrypted);
  } catch (e) {
    throw new Error("Invalid password or corrupted data");
  }
};

// --- RSA ---
export const generateRSAKeys = async () => {
  const keyPair = await window.crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true,
    ["encrypt", "decrypt"]
  );

  const pubExport = await window.crypto.subtle.exportKey("spki", keyPair.publicKey);
  const privExport = await window.crypto.subtle.exportKey("pkcs8", keyPair.privateKey);

  return {
    publicKey: buffToB64(pubExport),
    privateKey: buffToB64(privExport)
  };
};

const importKey = async (pemB64: string, type: "public" | "private") => {
  const binary = b64ToBuff(pemB64);
  return window.crypto.subtle.importKey(
    type === "public" ? "spki" : "pkcs8",
    binary,
    { name: "RSA-OAEP", hash: "SHA-256" },
    false,
    type === "public" ? ["encrypt"] : ["decrypt"]
  );
};

export const encryptRSA = async (text: string, publicKeyB64: string): Promise<string> => {
  try {
    const key = await importKey(publicKeyB64, "public");
    const enc = new TextEncoder();
    const encoded = await window.crypto.subtle.encrypt(
      { name: "RSA-OAEP" },
      key,
      enc.encode(text)
    );
    return buffToB64(encoded);
  } catch (e) {
    throw new Error("RSA Encryption failed. Key valid?");
  }
};

export const decryptRSA = async (b64Cipher: string, privateKeyB64: string): Promise<string> => {
  try {
    const key = await importKey(privateKeyB64, "private");
    const binary = b64ToBuff(b64Cipher);
    const decrypted = await window.crypto.subtle.decrypt(
      { name: "RSA-OAEP" },
      key,
      binary
    );
    return new TextDecoder().decode(decrypted);
  } catch (e) {
    throw new Error("RSA Decryption failed. Key valid?");
  }
};