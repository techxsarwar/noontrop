import nacl from 'tweetnacl';
import {
  encodeBase64,
  decodeBase64,
  encodeUTF8,
  decodeUTF8,
} from 'tweetnacl-util';

export interface KeyPair {
  publicKey: string; // Base64
  secretKey: string; // Base64
}

export interface EncryptedPackage {
  ciphertext: string; // Base64
  nonce: string; // Base64
}

export class EncryptionService {
  /**
   * Generates a new x25519 Curve25519 keypair for authenticated offline encryption.
   */
  static generateKeyPair(): KeyPair {
    const keyPair = nacl.box.keyPair();
    return {
      publicKey: encodeBase64(keyPair.publicKey),
      secretKey: encodeBase64(keyPair.secretKey),
    };
  }

  /**
   * Generates a human-readable peer fingerprint from public key (e.g., "7F2A-99B1-40D8")
   */
  static getFingerprint(publicKeyBase64: string): string {
    try {
      const bytes = decodeBase64(publicKeyBase64);
      const hex = Array.from(bytes.slice(0, 6))
        .map(b => b.toString(16).padStart(2, '0').toUpperCase())
        .join('');
      return `${hex.slice(0, 4)}-${hex.slice(4, 8)}-${hex.slice(8, 12)}`;
    } catch {
      return 'PEER-OFFLINE';
    }
  }

  /**
   * Encrypts plaintext message for a specific peer's public key using sender's secret key.
   */
  static encrypt(
    plainText: string,
    recipientPublicKeyBase64: string,
    senderSecretKeyBase64: string,
  ): EncryptedPackage {
    const nonce = nacl.randomBytes(nacl.box.nonceLength);
    const messageUint8 = decodeUTF8(plainText);
    const recipientPubKeyUint8 = decodeBase64(recipientPublicKeyBase64);
    const senderSecretKeyUint8 = decodeBase64(senderSecretKeyBase64);

    const encrypted = nacl.box(
      messageUint8,
      nonce,
      recipientPubKeyUint8,
      senderSecretKeyUint8,
    );

    return {
      ciphertext: encodeBase64(encrypted),
      nonce: encodeBase64(nonce),
    };
  }

  /**
   * Decrypts ciphertext message from a peer's public key using recipient's secret key.
   */
  static decrypt(
    ciphertextBase64: string,
    nonceBase64: string,
    senderPublicKeyBase64: string,
    recipientSecretKeyBase64: string,
  ): string | null {
    try {
      const ciphertextUint8 = decodeBase64(ciphertextBase64);
      const nonceUint8 = decodeBase64(nonceBase64);
      const senderPubKeyUint8 = decodeBase64(senderPublicKeyBase64);
      const recipientSecretKeyUint8 = decodeBase64(recipientSecretKeyBase64);

      const decrypted = nacl.box.open(
        ciphertextUint8,
        nonceUint8,
        senderPubKeyUint8,
        recipientSecretKeyUint8,
      );

      if (!decrypted) {
        return null;
      }

      return encodeUTF8(decrypted);
    } catch (e) {
      console.warn('Decryption failed:', e);
      return null;
    }
  }
}
