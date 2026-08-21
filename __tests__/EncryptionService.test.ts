import { EncryptionService } from '../src/services/EncryptionService';

describe('EncryptionService', () => {
  it('should generate valid Curve25519 keypairs', () => {
    const keyPair = EncryptionService.generateKeyPair();
    expect(keyPair.publicKey).toBeDefined();
    expect(keyPair.secretKey).toBeDefined();
    expect(typeof keyPair.publicKey).toBe('string');
    expect(typeof keyPair.secretKey).toBe('string');
    expect(keyPair.publicKey.length).toBeGreaterThan(20);
  });

  it('should generate a 3-part hex fingerprint from public key', () => {
    const keyPair = EncryptionService.generateKeyPair();
    const fingerprint = EncryptionService.getFingerprint(keyPair.publicKey);
    expect(fingerprint).toMatch(/^[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}$/);
  });

  it('should successfully encrypt and decrypt offline message payloads', () => {
    const alice = EncryptionService.generateKeyPair();
    const bob = EncryptionService.generateKeyPair();

    const plainText = 'Direct radio wave packet over WiFi: Zero Internet!';

    // Alice encrypts for Bob
    const encrypted = EncryptionService.encrypt(
      plainText,
      bob.publicKey,
      alice.secretKey,
    );

    expect(encrypted.ciphertext).toBeDefined();
    expect(encrypted.nonce).toBeDefined();
    expect(encrypted.ciphertext).not.toEqual(plainText);

    // Bob decrypts from Alice
    const decrypted = EncryptionService.decrypt(
      encrypted.ciphertext,
      encrypted.nonce,
      alice.publicKey,
      bob.secretKey,
    );

    expect(decrypted).toEqual(plainText);
  });

  it('should fail decryption if wrong key is used', () => {
    const alice = EncryptionService.generateKeyPair();
    const bob = EncryptionService.generateKeyPair();
    const eve = EncryptionService.generateKeyPair();

    const plainText = 'Top secret offline broadcast';

    const encrypted = EncryptionService.encrypt(
      plainText,
      bob.publicKey,
      alice.secretKey,
    );

    // Eve attempts to decrypt with her secret key
    const decrypted = EncryptionService.decrypt(
      encrypted.ciphertext,
      encrypted.nonce,
      alice.publicKey,
      eve.secretKey,
    );

    expect(decrypted).toBeNull();
  });
});
