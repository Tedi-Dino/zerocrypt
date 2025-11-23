export enum EncryptionMethod {
  NONE = 'NONE',
  AES = 'AES',
  RSA = 'RSA'
}

export enum AppMode {
  ENCODE = 'ENCODE',
  DECODE = 'DECODE'
}

export interface ProcessingResult {
  success: boolean;
  data?: string;
  error?: string;
}

export interface RSAKeyPair {
  publicKey: string;
  privateKey: string;
}